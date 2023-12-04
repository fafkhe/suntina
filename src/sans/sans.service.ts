import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sans } from 'src/entities/sans.entity';
import { Repository } from 'typeorm';
import { createSansDto } from './dtos/createSans.dto';
import { Ticket } from 'src/entities/ticket.entity';
import { Saloon } from 'src/entities/saloon.entity';
import { Movie } from 'src/entities/movie.entity';

@Injectable()
export class SansService {
  constructor(
    @InjectRepository(Sans) private SansRepo: Repository<Sans>,
    @InjectRepository(Saloon) private saloonRepo: Repository<Saloon>,
    @InjectRepository(Ticket) private TicketRepo: Repository<Ticket>,
    @InjectRepository(Movie) private MovieRepo: Repository<Movie>,
  ) {}

  async createSans(data: createSansDto) {
    const thisSaloon = await this.saloonRepo.findOne({
      where: {
        id: data.saloonId,
      },
    });

    const thisMovie = await this.MovieRepo.findOne({
      where: {
        id: data.movieId,
      },
    });

    if (!thisSaloon || !thisMovie)
      throw new BadRequestException('please sure that data is correct!!');
    
    const newSans = this.SansRepo.create({
      movieId: data.movieId,
      saloonId: data.saloonId,
      start: data.start,
      end: data.end,
    });

    await this.SansRepo.save(newSans);

    return newSans;
  }
}
