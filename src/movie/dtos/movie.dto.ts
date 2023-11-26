import { IsString } from 'class-validator';

export class createMovieDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}
