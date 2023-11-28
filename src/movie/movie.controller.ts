import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { createMovieDto } from './dtos/movie.dto';
import { AuthAdminGuard } from 'src/auth/gaurds/auth-admin.gaurd';
import { MovieQueryDto } from './dtos/movieQuery';
import { get } from 'http';
import { param } from 'jquery';

@Controller('movie')
export class MovieController {
  constructor(private movieService: MovieService) {}

  @UseGuards(AuthAdminGuard)
  @Post('create')
  createMovie(@Body() body: createMovieDto) {
    return this.movieService.createMovie(body);
  }

  @Get('getAll')
  getAllMovies(@Query() query: MovieQueryDto) {
    return this.movieService.AllMovies(query);
  }

  @Get('single/:id')
  getSingleMovie(@Param('id') id: string) {
    return this.movieService.singleMovie(id)
  }
}
