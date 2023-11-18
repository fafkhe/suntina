import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';


export class AuthStepOneDto {
 
  @IsString()
  email: string;

  @IsString()
  name: string;

}

export class AuthStepTwoDto {
  @IsString()
  email: string;

  @IsString()
  code: number;
}
