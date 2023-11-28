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
import { createMovieDto, editMovieDto } from './dtos/movie.dto';
import { AuthAdminGuard } from 'src/auth/gaurds/auth-admin.gaurd';
import { MovieQueryDto } from './dtos/movieQuery';
import { get } from 'http';
import { param, post } from 'jquery';
import { Me } from 'src/decorators/me.decoratos';
import { User } from 'src/entities/user.entity';
import { AuthGuard } from 'src/auth/gaurds/auth.gaurd';

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
    return this.movieService.singleMovie(id);
  }

  @UseGuards(AuthAdminGuard)
  @Post('edit')
  editMovie( @Body() body: editMovieDto) {
    return this.movieService.editMovie(body);
  }
}
