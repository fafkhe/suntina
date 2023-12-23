import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { Ticket } from '../entities/ticket.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketController } from './ticket.controller';
import { MiddlewareConsumer } from '@nestjs/common';
import { jwtAuthMiddleware } from '../auth/jwt.middleware';
import { User } from '../entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { Sans } from '../entities/sans.entity';
import { RedisStore } from '../redisStore';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, User, Sans])],
  controllers: [TicketController],
  providers: [TicketService, AuthService, RedisStore],
})
export class TicketModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(jwtAuthMiddleware).forRoutes('*');
  }
}
