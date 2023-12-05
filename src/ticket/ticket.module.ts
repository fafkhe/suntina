import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { Ticket } from 'src/entities/ticket.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketController } from './ticket.controller';
import { MiddlewareConsumer } from '@nestjs/common';
import { jwtAuthMiddleware } from 'src/auth/jwt.middleware';


@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(jwtAuthMiddleware).forRoutes('*');
  }
}
