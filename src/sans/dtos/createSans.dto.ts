import { IsString } from 'class-validator';

export class createSansDto {
  @IsString()
  movieId: string;

  @IsString()
  saloonId: string;

  @IsString()
  start: string;

  @IsString()
  end: string;
}
