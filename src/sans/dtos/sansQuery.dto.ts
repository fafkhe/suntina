import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { IsString } from 'class-validator';

export class SansQueryDto {
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  page: number;


  @IsOptional()
  name: string;

  @IsOptional()
  limit: number;
}


