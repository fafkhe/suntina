import { AuthAdminGuard } from 'src/auth/gaurds/auth-admin.gaurd';
import { createSansDto } from './dtos/createSans.dto';
import { SansService } from './sans.service';
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';

@Controller('sans')
export class SansController {
  constructor(private sansService: SansService) {}

  @UseGuards(AuthAdminGuard)
  @Post('create')
  createSans(@Body() body: createSansDto) {
    return this.sansService.createSans(body);
  }
}
