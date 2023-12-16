import { IsOptional, IsString } from 'class-validator';

export class ticketQueryDto {
  @IsOptional()
  limit: number;


  @IsOptional()
  page: number;

  @IsOptional()
  @IsString()
  sansId: string;
}
