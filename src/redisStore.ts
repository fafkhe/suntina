import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RedisStore {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async cacheMovie(slug: string, data) {
    let target = `m-${String(slug)}`;

    await this.cacheManager.set(
      target,
      JSON.stringify(data),
      1000 * 60 * 60 * 24,
    );
  }

  async getMovie(slug: string) {
    try {
      let target = `m-${String(slug)}`;

      return JSON.parse(String(await this.cacheManager.get(target)));
    } catch (error) {
      return null;
    }
  }

  async getSingleMovieFromCache(slug: string) {
    try {
      let thisMovie = await this.getMovie(slug);

      if (!thisMovie) {
        const url = `http://localhost:4000/m/${slug}`;
        const x = await fetch(url);
        const data = await x.json();
        console.log(data, 'data');

        if (data == 'not found') {
          throw new NotFoundException('not found');
        }

        await this.cacheMovie(slug, data);

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
      console.log(error, 'error');
      return new InternalServerErrorException("oops, this one's on us");
    }
  }

  async readSingleUserFromCache(id: number): Promise<User | null> {
    try {
      let target = `user-${String(id)}`;

      let thisUser = (await this.cacheManager.get(target)) as User;

      if (!thisUser) {
        thisUser = await this.userRepo.findOne({
          where: {
            id,
          },
        });
        if (thisUser) await this.cacheManager.set(target, thisUser, 600 * 1000);
      }

      return thisUser;
    } catch (error) {
      return null;
    }
  }
}
