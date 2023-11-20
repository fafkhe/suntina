import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist';

export class AuthStepOneDto {
  @ApiProperty()
  @IsString()
  email: string;
}

export class AuthStepTwoDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  code: number;
}
