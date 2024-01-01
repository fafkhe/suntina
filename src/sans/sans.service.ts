import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createSansDto } from './dtos/createSans.dto';
import { Ticket } from '../entities/ticket.entity';
import { Saloon } from '../entities/saloon.entity';
import { Movie } from '../entities/movie.entity';
import { DataSource } from 'typeorm';
import { SansQueryDto } from './dtos/sansQuery.dto';
import { Sans } from '../entities/sans.entity';
import { DataProcessLayer } from '../dpl';

@Injectable()
export class SansService {
  constructor(
    @InjectRepository(Saloon) private saloonRepo: Repository<Saloon>,
    @InjectRepository(Ticket) private TicketRepo: Repository<Ticket>,
    @InjectRepository(Movie) private MovieRepo: Repository<Movie>,
    @InjectRepository(Sans) private sansRepo: Repository<Sans>,
    private dataSource: DataSource,
    private DPL: DataProcessLayer,
  ) {
    this.dataSource.manager.query(`
      ALTER TABLE public.sans DROP CONSTRAINT IF EXISTS date_check;
    `);
  }

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
      throw new BadRequestException('please make sure that data is correct!!');

    const existingSans = await this.dataSource.manager.query(
      `SELECT * FROM public.sans WHERE (public.sans.saloon_id = $3)
       AND ((public.sans.end_t BETWEEN $1 AND $2) 
        OR (public.sans.start_t BETWEEN $1 AND $2)
        OR ($1 >= public.sans.start_t AND $2 <= public.sans.end_t)
        OR ($1 <= public.sans.start_t AND $2 >= public.sans.end_t))`,

      [data.start_t, data.end_t, data.saloon_id],
    );

    console.log(existingSans);

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

      const result = await queryRunner.manager.query(
        `INSERT INTO public.sans (id,saloon_id, movie_id, start_t, end_t)
         values ($5, $1, $2, $3, $4)
         RETURNING id, saloon_id, movie_id, start_t, end_t;`,
        [data.saloon_id, data.movie_id, data.start_t, data.end_t, nextval],
      );

      console.log(result, 'result is here ');

      for (let i = 1; i <= thisSaloon.numOfSeat; i++) {
        await this.dataSource.manager.query(
          `INSERT INTO public.ticket (user_id, user_name, sans_id, seatnumber, is_taken, price) values ($1, $2, $3, $4, $5, $6);`,
          [0, '', nextval, i, false, 50],
        );
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();
      return result;
    } catch (e) {
      console.log(e, 'eror');

      if (e.message.includes('date_check'))
        throw new BadRequestException('fix your date and try again later');

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw e;
    }
  }

  async getAllSanses(data: SansQueryDto) {
    const page = data.page || 0;
    const limit = data.limit || 10;
    const name = data.name || '';

    const sanses = await this.dataSource.manager.query(
      `SELECT s.id as id, s.movie_id as movie_id, s.saloon_id as saloon_id, s.start_t as start_t, s.end_t as end_t, m.slug as movie_slug
        FROM public.sans s
        JOIN public.movie m
        ON s.movie_id = m.id
        WHERE (s.movie_id in (SELECT id FROM public.movie WHERE name LIKE $3)) AND (s.start_t > Now())
        ORDER BY s.start_t OFFSET $1 ROWS FETCH NEXT $2 ROWS ONLY`,
      [page * limit, limit, `%${name}%`],
    );

    return Promise.all(sanses.map((sans) => this.DPL.convertSans(sans)));
  }

  async getSans(id: number) {
    const [thisSans] = await this.dataSource.manager.query(
      `SELECT s.id as id, s.movie_id as movie_id, s.saloon_id as saloon_id, s.start_t as start_t, s.end_t as end_t, m.slug as movie_slug
        FROM SANS s
        JOIN MOVIE m
        ON s.movie_id = m.id
        WHERE s.id = $1 AND s.start_t > Now()`,
      [id],
    );

    console.log(thisSans, "salam man singlesansam")
    
    console.log(id,"//////////////////////////////////////////////////")


    if (!thisSans) throw new NotFoundException('not found');

    if (new Date(thisSans.start_t).getTime() < Date.now())
      throw new BadRequestException('this sans has deprecated!');

    return this.DPL.convertSans(thisSans);
  }

  async SansesByMovie(id: number, query: SansQueryDto) {
    const movie = await this.MovieRepo.findOne({
      where: { id: id },
    });

    if (!movie)
      throw new BadRequestException('there is no movie with this id!!');

    const take = query.limit || 10;
    const skip = query.page || 0;

    const sanses = await this.sansRepo.find({
      where: {
        movie_id: id,
      },
    });

    const [result] = await this.sansRepo.findAndCount({
      where: { movie_id: id },
      take: take,
      skip: skip,
    });

    for (let i = 0; i < sanses.length; i++) {
      if (new Date(sanses[i].start_t).getTime() < Date.now()) {
        throw new BadRequestException('sans is deprecated');
      }
    }

    return Promise.all(result.map((sans) => this.DPL.convertSans(sans)));
  }
}
