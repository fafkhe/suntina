import { Module } from '@nestjs/common';
import { Movie } from '../entities/movie.entity';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiddlewareConsumer } from '@nestjs/common';
import { jwtAuthMiddleware } from '../auth/jwt.middleware';
import { User } from '../entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { RedisStore } from '../redisStore';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, User])],
  controllers: [MovieController],
  providers: [MovieService, AuthService, RedisStore],
})
export class MovieModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(jwtAuthMiddleware).forRoutes('*');
  }
}
