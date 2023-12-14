import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { IsString } from 'class-validator';

export class SansQueryDto {

  @IsOptional()
  limit: number;


  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  page: number;
   
  

  @IsOptional()
  @IsString()
  name:string
}


