import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class AuthStepOneDto {
  @IsString()
  name: string;

  @IsString()
  email: string;
}

export class AuthStepTwoDto {
  @IsString()
  email: string;

  @IsString()
  code: number;
}
