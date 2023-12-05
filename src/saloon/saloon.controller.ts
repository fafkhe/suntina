import { AuthAdminGuard } from 'src/auth/gaurds/auth-admin.gaurd';
import { createSaloonDto } from './dtos/saloon.dto';
import { SaloonService } from './saloon.service';
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SaloonQueryDto } from './dtos/saloonQuery.dto';
import { EditSaloonDto } from './dtos/saloon.dto';

@Controller('saloon') 
export class SaloonController {
  constructor(private saloonService: SaloonService) {}

  @UseGuards(AuthAdminGuard)
  @Post('create')
  createSaloon(@Body() body: createSaloonDto) {
    return this.saloonService.createSaloon(body);
  }

  @UseGuards(AuthAdminGuard)
  @Get('getAll')
  getAllSaloon(@Query() query: SaloonQueryDto) {
    return this.saloonService.AllSaloons(query);
  }

  @Get('Single/:id')
  getSingleSaloon(@Param('id') id: number) {
    return this.saloonService.getSaloonById(id);
  }

  @Post('edit')
  editSaloon(@Body() body: EditSaloonDto) {
    return this.saloonService.editSaloon(body);
  }
}
