import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';

@Module({
  providers: [TicketService]
})
export class TicketModule {}
