import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from 'src/entities/movie.entity';
import { Repository } from 'typeorm';
import { createMovieDto } from './dtos/movie.dto';

@Injectable()
export class MovieService {
  constructor(@InjectRepository(Movie) private MovieRepo: Repository<Movie>) {}

  async createMovie(data: createMovieDto) {
    const newMovie =  this.MovieRepo.create({
      name: data.name,
      description: data.description,
    });

    await this.MovieRepo.save(newMovie)

    return newMovie;
  }
}
