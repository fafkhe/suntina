import { Module } from '@nestjs/common';
import { Movie } from 'src/entities/movie.entity';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiddlewareConsumer } from '@nestjs/common';
import { jwtAuthMiddleware } from 'src/auth/jwt.middleware';
import { User } from 'src/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, User])],
  controllers: [MovieController],
  providers: [MovieService ,AuthService],
})
export class MovieModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(jwtAuthMiddleware).forRoutes('*');
  }
}
