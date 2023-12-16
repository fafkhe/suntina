import { IsString } from 'class-validator';

export class createMovieDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;
}

export class editMovieDto {
  @IsString()
  id: number;

  @IsString()
  name: string;

  @IsString()
  slug: string;
}
