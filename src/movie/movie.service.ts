import {
  BadRequestException,
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from '../entities/movie.entity';
import { Repository } from 'typeorm';
import { createMovieDto, editMovieDto } from './dtos/movie.dto';
import { MovieQueryDto } from './dtos/movieQuery';
import { RedisStore } from '../redisStore';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie) private MovieRepo: Repository<Movie>,
    private redisStore: RedisStore,
  ) {}

  async createMovie(data: createMovieDto) {
    try {
      const newMovie = this.MovieRepo.create({
        name: data.name,
        slug: data.slug,
      });

      await this.MovieRepo.save(newMovie);
      return newMovie;
    } catch (error) {
      console.log(error);
    }
  }

  async AllMovies(data: MovieQueryDto) {
    const name = data.name || '';
    return this.MovieRepo.manager.query(
      'SELECT * FROM public.movie WHERE LOWER(public.movie.name) LIKE $1 OFFSET $2 ROWS FETCH NEXT $3 ROWS ONLY',
      [`%${name}%`, data.limit, data.page],
    );
  }

  async singleMovie(id: number) {
    const thisMovie = await this.MovieRepo.findOne({
      where: {
        id: id,
      },
    });

    if (!thisMovie) throw new NotFoundException('not found');

    const data = await this.redisStore.getSingleMovieFromCache(thisMovie.slug);

    return {
      ...thisMovie,
      data,
    };
  }

  async editMovie(data: editMovieDto) {
    const thisMovie = await this.MovieRepo.findOne({
      where: {
        id: data.id,
      },
    });
    if (!thisMovie) throw new BadRequestException('no such movie found!');

    await this.MovieRepo.save({ thisMovie, ...data });

    return 'ok';
  }
}
