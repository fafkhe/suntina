import { AuthAdminGuard } from '../auth/gaurds/auth-admin.gaurd';
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
import { SansQueryDto } from './dtos/sansQuery.dto';

@Controller('sans')
export class SansController {
  constructor(private sansService: SansService) {}

  @UseGuards(AuthAdminGuard)
  @Post('create')
  createSans(@Body() body: createSansDto) {
    return this.sansService.createSans(body);
  }

  @Get('get-all')
  getAllSans(@Query() query: SansQueryDto) {
    return this.sansService.getAllSanses(query);
  }

  @Get('/:id')
  getSingleSans(@Param('id') id: number) {
    return this.sansService.getSans(id);
  }

  @Get('/sansByMovie/:id')
  getSansByMovie(@Param('id') id: number,@Query() query: SansQueryDto) {
    return this.sansService.SansesByMovie(id, query);
  }
}
