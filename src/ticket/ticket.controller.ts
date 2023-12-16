import { Body, Controller, Post, UseGuards, Get, Query } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { reserveTicketDto } from './dtos/reserve-ticket.dto';
import { AuthGuard } from 'src/auth/gaurds/auth.gaurd';
import { User } from 'src/entities/user.entity';
import { Me } from '../decorators/me.decoratos';
import { ticketQueryDto } from './dtos/ticketQuery.dto';

@Controller('ticket')
export class TicketController {
  constructor(private ticketService: TicketService) {}

  @UseGuards(AuthGuard)
  @Post('/reserve')
  reserveTicket(@Body() body: reserveTicketDto, @Me() me: User) {
    return this.ticketService.reserveTicket(body, me);
  }
  
  @UseGuards(AuthGuard)
  @Get('/my-tickets')
  getMyTickets(@Me() me: User, @Query() query:ticketQueryDto ) {
    return this.ticketService.getMyTickets(me,query);
  }
}
