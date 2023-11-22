import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { IsString } from 'class-validator';

export class UserQueryDto {
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  page: number;

  @IsString()
  name: string;

  @IsOptional()
  limit: number;
}
