import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createSansDto } from './dtos/createSans.dto';
import { Ticket } from 'src/entities/ticket.entity';
import { Saloon } from 'src/entities/saloon.entity';
import { Movie } from 'src/entities/movie.entity';
import { DataSource } from 'typeorm';
import { SansQueryDto } from './dtos/sansQuery.dto';
import e from 'express';

@Injectable()
export class SansService {
  constructor(
    @InjectRepository(Saloon) private saloonRepo: Repository<Saloon>,
    @InjectRepository(Ticket) private TicketRepo: Repository<Ticket>,
    @InjectRepository(Movie) private MovieRepo: Repository<Movie>,
    private dataSource: DataSource,
  ) {}

  async createSans(data: createSansDto) {
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

    const checkTime = new Date(data.start_t);
    checkTime.setHours(0, 0, 0, 0);

    if (checkTime.getTime() < Date.now())
      throw new BadRequestException('bad request');

    if (data.start_t >= data.end_t)
      throw new BadRequestException('please sure that data is correct!!');

    const existingSans = await this.dataSource.manager.query(
      `SELECT * FROM public.sans WHERE (public.sans.saloon_id = $3)
       AND ((public.sans.end_t BETWEEN $1 AND $2) 
        OR (public.sans.start_t BETWEEN $1 AND $2)
        OR ($1 >= public.sans.start_t AND $2 <= public.sans.end_t)
        OR ($1 <= public.sans.start_t AND $2 >= public.sans.end_t))`,

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
      console.log('avale try');
      const [{ nextval }] = await this.dataSource.manager.query(
        `SELECT nextval('public.sans_id_seq');`,
      );
      console.log(nextval);

      await queryRunner.manager.query(
        `INSERT INTO public.sans (id,saloon_id, movie_id, start_t, end_t)
            values ($5 ,$1, $2, $3, $4);`,
        [data.saloon_id, data.movie_id, data.start_t, data.end_t, nextval],
      );

      for (let i = 1; i <= thisSaloon.numOfSeat; i++) {
        await this.dataSource.manager.query(
          `INSERT INTO public.ticket (user_id, user_name, sans_id, seatnumber, is_taken) values ($1, $2, $3, $4, $5);`,
          ['', '', nextval, i, false],
        );
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e, 'eror');
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
      return { msg: 'sans created' };
    }
  }

  async getAllSanses(data: SansQueryDto) {
    const page = data.page || 0;
    const limit = data.limit || 10;
    const name = data.name || '';

    const sanses = await this.dataSource.manager.query(
      `SELECT s.id as id, s.movie_id as movie_id, s.saloon_id as saloon_id,
        m.name as name
        FROM public.sans s
        JOIN public.movie m
        ON s.movie_id = m.id
        WHERE (s.movie_id in (SELECT id FROM public.movie WHERE name LIKE $3)) AND (s.start_t > Now())
        ORDER BY s.start_t OFFSET $1 ROWS FETCH NEXT $2 ROWS ONLY`,
      [page * limit, limit, `%${name}%`],
    );

    if (sanses == 0) throw new BadRequestException('bad request');

    return sanses;
  }

  async getSans(id: number) {
    const sans = await this.dataSource.manager.query(
      `SELECT s.id as id, s.movie_id as movie_id, s.saloon_id as saloon_id,
        m.name as name
        FROM SANS s
        JOIN MOVIE m
        ON s.movie_id = m.id
        WHERE s.id = $1 `,
      [id],
    );

    if (sans == 0)
      throw new BadRequestException('there is no sans with this id');

    return sans;
  }
}
