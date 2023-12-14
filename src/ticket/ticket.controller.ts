import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { reserveTicketDto } from './dtos/reserve-ticket.dto';
import { AuthGuard } from 'src/auth/gaurds/auth.gaurd';
import { User } from 'src/entities/user.entity';
import { Me } from '../decorators/me.decoratos';

@Controller('ticket')
export class TicketController {
  constructor(private ticketService: TicketService) {}

  @UseGuards(AuthGuard)
  @Post('/reserve')
  reserveTicket(@Body() body: reserveTicketDto, @Me() me: User) {
    return this.ticketService.reserveTicket(body, me);
  }
}
