import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from '../entities/ticket.entity';
import { User } from '../entities/user.entity';
import { reserveTicketDto } from './dtos/reserve-ticket.dto';
import { Sans } from '../entities/sans.entity';
import { Repository, DataSource } from 'typeorm';
import { ticketQueryDto } from './dtos/ticketQuery.dto';
import { renderFile } from 'ejs';
import { join } from 'path';
import { create } from 'html-pdf';
import { CreateOptions } from 'html-pdf';
import { mkdirSync, createWriteStream, existsSync, createReadStream,readFileSync } from 'fs';
import { StreamableFile } from '@nestjs/common';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
    @InjectRepository(Sans) private sansRepo: Repository<Sans>,
    private dataSource: DataSource,
  ) {
    this.dataSource.manager.query(`
      ALTER TABLE public.ticket DROP CONSTRAINT IF EXISTS price_check;
      ALTER TABLE public.ticket ADD CONSTRAINT price_check CHECK (price>0);
    `);
  }

  #convertToTicketDTO(data) {
    return {
      id: data.id,
      user_id: data.user_id,
      user_name: data.user_name,
      sans_id: data.sans_id,
      seatnumber: data.seatnumber,
      price: data.price,
      sans: {
        id: data.sans_id,
        start: data.start_t,
        end: data.end_t,
      },
      saloon: {
        id: data.saloon_name,
      },
      user: {
        user_name: data.user_name,
      },

      movie: {
        movie_name: data.movie_name,
      },
    };
  }

  #preparePDF(path, tickets) {
    return new Promise((res, rej) => {
      const x = join(process.cwd(), '/views/ticket.template.ejs');
      renderFile(x, { tickets: tickets }, (err, html) => {
        if (err) return rej(err);
        const options = {
          format: 'A4',
          orientation: 'landscape',
        } as CreateOptions;
        const x = create(html, options);

        x.toStream((error, stream) => {
          if (error) return rej(error);

          stream
          .pipe(createWriteStream(path))
          .on('finish', () => {
            // ### TODO
            // scheduele a task to remove this file  
            // after 10 minutes
            res(null)
          })
          .on('error', rej);
        });
      });
    });
  }

  async pdf(query: ticketQueryDto, me: User) {
    const tickets = await this.dataSource.manager.query(
      `SELECT t.id as id, t.user_id as user_id, t.user_name as user_name,
       t.sans_id as sans_id, t.seatnumber as seatnumber, t.price as price, s.start_t,
       s.end_t, saloon.name as saloon_name, movie.name as movie_Name, u.name as user_name
       FROM public.ticket t
       JOIN public.sans s
       ON t.sans_id = s.id
       JOIN public.saloon saloon
       ON s.saloon_id = saloon.id
       JOIN public.movie movie
       ON s.movie_id = movie.id
       JOIN public.user u
       ON t.user_id = u.id 
       WHERE (t.sans_id = $1) AND (t.user_id = $2)`,
      [query.sansId, 1],
    );

    const tempPath = join(process.cwd(), '/public/temp');

    if (!existsSync(tempPath)) {
      mkdirSync(tempPath);
    }

    const fileName = `${new Date().getTime()}${Math.floor(
      Math.random() * 999,
    )}.pdf`;

    const path = join(tempPath, fileName);

    await this.#preparePDF(path, tickets);


    const file = createReadStream(path);

    return new StreamableFile(file);
  }

  async reserveTicket(data: reserveTicketDto, me: User) {
    const thisSans = await this.sansRepo.findOne({
      where: {
        id: data.sansId,
      },
    });

    if (!thisSans || new Date(thisSans.start_t).getTime() < Date.now()) {
      throw new BadRequestException('this sans is not exist');
    }

    const ticketQuantity = data.seatNumbers.length;

    const ticket = await this.ticketRepo.findOne({
      where: {
        sans_id: data.sansId,
      },
    });

    const ticketPrice = ticket.price;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (let i = 0; i < data.seatNumbers.length; i++) {
        const result = await queryRunner.manager.query(
          `UPDATE public.ticket
          SET user_id = $1, is_taken = true
          WHERE seatnumber = $2 AND is_taken = false`,
          [me.id, data.seatNumbers[i]],
        );


        if (result[1] === 0) {
          throw new BadRequestException(`seat already taken`);
        }
      }

      await queryRunner.manager.query(
        `UPDATE public.user
         SET balance = balance - $1
         WHERE id = $2 `,
        [ticketPrice * ticketQuantity, me.id],
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();
      return 'ok';
    } catch (e) {
      await queryRunner.rollbackTransaction();
      if (e.message.includes('balance_check')) {
        throw new BadRequestException(
          'not enough balance, please charge your account and try again later',
        );
      }
      await queryRunner.release();

      throw e;
    }
  }

  async getMyTickets(me: User, query: ticketQueryDto) {
    const take = query.limit || 10;
    const page = query.page || 0;

    const tickets = await this.dataSource.manager.query(
      `SELECT t.id as id, t.user_id as user_id, t.user_name as user_name,
       t.sans_id as sans_id, t.seatnumber as seatnumber, t.price as price, s.start_t,
       s.end_t, saloon.name as saloon_name, movie.name as movie_Name, u.name as user_name
       FROM public.ticket t
       JOIN public.sans s
       ON t.sans_id = s.id
       JOIN public.saloon saloon
       ON s.saloon_id = saloon.id
       JOIN public.movie movie
       ON s.movie_id = movie.id
       JOIN public.user u
       ON t.user_id = u.id 
       WHERE (t.sans_id = $1) AND (t.user_id = $2)`,
      [query.sansId, me.id],
    );


    return tickets.map(this.#convertToTicketDTO);
  }
}

