import { IsNumber, IsString } from 'class-validator';

export class createSansDto {
  @IsNumber()
  movie_id: number;

  @IsNumber()
  saloon_id: number;

  @IsString()
  start_t: string;

  @IsString()
  end_t: string;
}
