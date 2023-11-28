import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from 'src/entities/movie.entity';
import { Repository } from 'typeorm';
import { createMovieDto } from './dtos/movie.dto';
import { MovieQueryDto } from './dtos/movieQuery';

@Injectable()
export class MovieService {
  constructor(@InjectRepository(Movie) private MovieRepo: Repository<Movie>) {}

  async createMovie(data: createMovieDto) {
    const newMovie = this.MovieRepo.create({
      name: data.name,
      description: data.description,
    });

    await this.MovieRepo.save(newMovie);

    return newMovie;
  }

  async AllMovies(data: MovieQueryDto) {
    const name = data.name || '';
    return this.MovieRepo.manager.query(
      'SELECT * FROM public.movie WHERE LOWER(public.movie.name) LIKE $1 OFFSET $2 ROWS FETCH NEXT $3 ROWS ONLY',
      [`%${name}%`, data.limit, data.page],
    );
  }

  async singleMovie(id:string) {
    const thisMovie = await this.MovieRepo.findOne({
      where: {
        id: id
      }
    })

    return thisMovie;
  }
}
