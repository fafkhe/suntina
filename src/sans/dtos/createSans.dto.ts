import { IsString } from 'class-validator';

export class createSansDto {
  @IsString()
  movieId: string;

  @IsString()
  saloonid: number;

  @IsString()
  start: string;

  @IsString()
  end: string;
}
