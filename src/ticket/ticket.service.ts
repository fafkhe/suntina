import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from 'src/entities/ticket.entity';
import { User } from 'src/entities/user.entity';
import { reserveTicketDto } from './dtos/reserve-ticket.dto';
import { Sans } from 'src/entities/sans.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
    @InjectRepository(Sans) private sansRepo: Repository<Sans>,
    // @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {
    this.dataSource.manager.query(`
      ALTER TABLE public.ticket DROP CONSTRAINT IF EXISTS price_check;
      ALTER TABLE public.ticket ADD CONSTRAINT price_check CHECK (price>0);
    `);
  }

  async reserveTicket(data: reserveTicketDto, me: User) {
    const thisSans = await this.sansRepo.findOne({
      where: {
        id: data.sansId,
      },
    });

    if (!thisSans || new Date(thisSans.start_t).getTime() > Date.now()) {
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

        console.log(result, 'result');

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
      console.log(e.message);
      await queryRunner.rollbackTransaction();
      if (e.message.includes('balance_check')) {
        throw new BadRequestException(
          'not enough balance, please charge your account and try again later',
        );
      }
      await queryRunner.release();

      throw e;
      // return e;
    }
  }
}
