import { IsString } from 'class-validator';

export class createMovieDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}

export class editMovieDto {
  @IsString()
  id: string;
  
  @IsString()
  name: string;

  @IsString()
  description: string;
}
