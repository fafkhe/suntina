import { Module } from '@nestjs/common';
import { SansService } from './sans.service';
import { SansController } from './sans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiddlewareConsumer } from '@nestjs/common';
import { jwtAuthMiddleware } from '../auth/jwt.middleware';
import { Saloon } from '../entities/saloon.entity';
import { Ticket } from '../entities/ticket.entity';
import { AuthService } from '../auth/auth.service';
import { User } from '../entities/user.entity';
import { Movie } from '../entities/movie.entity';
import { Sans } from '../entities/sans.entity';
import { RedisStore } from '../redisStore';
import { DataProcessLayer } from '../dpl';

@Module({
  imports: [TypeOrmModule.forFeature([User, Saloon, Ticket, Movie, Sans])],
  controllers: [SansController],
  providers: [SansService, AuthService, RedisStore, DataProcessLayer],
})
export class SansModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(jwtAuthMiddleware).forRoutes('*');
  }
}
