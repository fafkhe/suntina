import { IsString,IsNumber } from 'class-validator';

export class singleMovieDto {
  @IsNumber()
  id: number;
}
