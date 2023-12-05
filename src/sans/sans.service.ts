import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sans } from 'src/entities/sans.entity';
import { Repository } from 'typeorm';
import { createSansDto } from './dtos/createSans.dto';
import { Ticket } from 'src/entities/ticket.entity';
import { Saloon } from 'src/entities/saloon.entity';
import { Movie } from 'src/entities/movie.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SansService {
  constructor(
    @InjectRepository(Sans) private SansRepo: Repository<Sans>,
    @InjectRepository(Saloon) private saloonRepo: Repository<Saloon>,
    @InjectRepository(Ticket) private TicketRepo: Repository<Ticket>,
    @InjectRepository(Movie) private MovieRepo: Repository<Movie>,
    private dataSource: DataSource,
  ) {}

  async createSans(data: createSansDto) {
    // console.log(DataSource, '/////././');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const thisSaloon = await this.saloonRepo.findOne({
      where: {
        id: data.saloonid,
      },
    });

    const thisMovie = await this.MovieRepo.findOne({
      where: {
        id: data.movieId,
      },
    });

    if (!thisSaloon || !thisMovie)
      throw new BadRequestException('please sure that data is correct!!');

    const existingSans = await this.dataSource.manager.query(
      'SELECT * FROM public.sans WHERE (public.sans.saloonid = $3) AND ((public.sans.start < $1 AND public.sans.end > $1) OR (public.sans.start < $2 AND public.sans.end > $2))',
      [data.start, data.end, data.saloonid],
    );

    if (existingSans.length !== 0)
      throw new BadRequestException('this sans already exist');

    try {
      await queryRunner.manager.save(Sans, {
        movieId: data.movieId,
        saloonid: data.saloonid,
        start: data.start,
        end: data.end,
      });

      for (let i = 0; i < thisSaloon.numOfSeat; i++) {
        await queryRunner.manager.save(Ticket, {
          userId: '',
          userName: '',
          Seatnumber: i,
          sansId: 1,
          isTaken: false,
        });
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

  // await this.SansRepo.save(newSans);
}
