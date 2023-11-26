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


@Controller('movie')
export class MovieController {
  constructor(private movieService: MovieService) { }
  
  @UseGuards(AuthAdminGuard)
  @Post('create')
  createMovie(@Body() body:createMovieDto ) {
    return this.movieService.createMovie(body)
  }
}
