import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { IsString } from 'class-validator';

export class SaloonQueryDto {
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  page: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  limit: number;
}


