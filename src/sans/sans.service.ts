import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createSansDto } from './dtos/createSans.dto';
import { Ticket } from 'src/entities/ticket.entity';
import { Saloon } from 'src/entities/saloon.entity';
import { Movie } from 'src/entities/movie.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SansService {
  constructor(
    @InjectRepository(Saloon) private saloonRepo: Repository<Saloon>,
    @InjectRepository(Ticket) private TicketRepo: Repository<Ticket>,
    @InjectRepository(Movie) private MovieRepo: Repository<Movie>,
    private dataSource: DataSource,
  ) {
    console.log('8888');
    console.log(DataSource);
    dataSource.manager.query(`
    create table if not exists sans ( 
      id SERIAL PRIMARY KEY, 
      saloon_id integer,
      movie_id integer, 
      start_t TIMESTAMPTZ, 
      end_t TIMESTAMPTZ
    );`);
  }

  async createSans(data: createSansDto) {
    console.log(DataSource, '/////././');

    const thisSaloon = await this.saloonRepo.findOne({
      where: {
        id: data.saloon_id,
      },
    });

    const thisMovie = await this.MovieRepo.findOne({
      where: {
        id: data.movie_id,
      },
    });

    if (!thisSaloon || !thisMovie)
      throw new BadRequestException('please sure that data is correct!!');
    const existingSans = await this.dataSource.manager.query(
      'SELECT * FROM public.sans WHERE (public.sans.saloon_id = $3) AND ((public.sans.start_t <= $1 AND public.sans.end_t >= $1) OR (public.sans.start_t <= $2 AND public.sans.end_t >= $2))',
      [data.start_t, data.end_t, data.saloon_id],
    );

    if (existingSans.length !== 0)
      throw new BadRequestException(
        'this saloon is already occupied at the selected hour!! ',
      );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [{ nextval }] = await this.dataSource.manager.query(
        `SELECT nextval('public.sans_id_seq');`,
      );
      console.log(nextval, 'xxxxx');
      console.log('avale try');
      await queryRunner.manager.query(
        `INSERT INTO sans (id,saloon_id, movie_id, start_t, end_t)
            values ($5 ,$1, $2, $3, $4);`,
        [data.saloon_id, data.movie_id, data.start_t, data.end_t, nextval],
      );

      for (let i = 1; i <= thisSaloon.numOfSeat; i++) {
        await this.dataSource.manager.query(
          `INSERT INTO ticket (user_id, user_name, sans_id, seatnumber, is_taken) values ($1, $2, $3, $4, $5);`,
          ['', '', nextval, i, false],
        );
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
      return { msg: 'sans created' };
    }
  }
}
