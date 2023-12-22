import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { Ticket } from 'src/entities/ticket.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketController } from './ticket.controller';
import { MiddlewareConsumer } from '@nestjs/common';
import { jwtAuthMiddleware } from 'src/auth/jwt.middleware';
import { User } from 'src/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { Sans } from 'src/entities/sans.entity';
import { RedisStore } from 'src/redisStore';

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
