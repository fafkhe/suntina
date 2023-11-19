import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class AuthStepOneDto {
  @IsString()
  email: string;

}

export class AuthStepTwoDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  code: number;
}
