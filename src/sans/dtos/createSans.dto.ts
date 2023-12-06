import { IsString } from 'class-validator';

export class createSansDto {
  @IsString()
  movie_id: number;

  @IsString()
  saloon_id: number;

  @IsString()
  start_t: string;

  @IsString()
  end_t: string;
}
