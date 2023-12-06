import { Module } from '@nestjs/common';
import { SansService } from './sans.service';
import { SansController } from './sans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiddlewareConsumer } from '@nestjs/common';
import { jwtAuthMiddleware } from 'src/auth/jwt.middleware';
import { Saloon } from 'src/entities/saloon.entity';
import { Ticket } from 'src/entities/ticket.entity';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/entities/user.entity';
import { Movie } from 'src/entities/movie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,Saloon,Ticket,Movie])],
  controllers: [SansController],
  providers: [SansService, AuthService],
})
export class SansModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(jwtAuthMiddleware).forRoutes('*');
  }
}
