import { IsNumber, IsOptional, IsString, isString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

export class AuthStepOneDto {
  @ApiProperty()
  @IsString()
  email: string;
}

export class AuthStepTwoDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  code: string;
}
