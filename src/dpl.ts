import { Injectable } from '@nestjs/common';
import { RedisStore } from './redisStore';

@Injectable()
export class DataProcessLayer {
  constructor(private redisStore: RedisStore) {}

  async convertSans(thisSans) {
    const data = await this.redisStore.getSingleMovieFromCache(
      thisSans.movie_slug,
      );
      console.log("//////",data)

    return {
      id: thisSans.id,
      saloon_id: thisSans.saloon_id,
      start_t: thisSans.start_t,
      end_t: thisSans.end_t,
      movie: {
        id: thisSans.movie_id,
        movieslug: thisSans.movie_slug,
        ...data,
      },
    };
  }
}
