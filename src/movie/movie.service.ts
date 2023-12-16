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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie) private MovieRepo: Repository<Movie>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createMovie(data: createMovieDto) {
    const newMovie = this.MovieRepo.create({
      name: data.name,
      slug: data.slug,
    });

    await this.MovieRepo.save(newMovie);

    return newMovie;
  }

  async #readSingleMovieFromCache(slug: string) {
    try {
      let target = `m-${String(slug)}`;

      let x = await this.cacheManager.get(target);

      let thisMovie;

      if (x) {
        thisMovie = JSON.parse(x as string);
      }

      if (!thisMovie) {
        const url = `http://localhost:4000/m/${slug}`;
        const x = await fetch(url);
        const data = await x.json();

        console.log(data, 'data');

        console.log(data == 'not found');

        if (data == 'not found') {
          throw new NotFoundException('not found');
        }

        await this.cacheManager.set(
          target,
          JSON.stringify(data),
          1000 * 60 * 60 * 24,
        );
        thisMovie = data;
        console.log(`reading the movie with slug ${slug} from imdb`);
      } else {
        console.log(`reading the movie with slug ${slug} from redis`);
      }

      return thisMovie;
    } catch (error) {
      if (error.message == 'not found') {
        throw new NotFoundException('not found');
      }
      return new InternalServerErrorException("oops, this one's on us");
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

    const data = await this.#readSingleMovieFromCache(thisMovie.slug);

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
