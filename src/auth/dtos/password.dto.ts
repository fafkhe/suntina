import { IsString, IsNumber, isString } from 'class-validator';

export class resetPassword_stepOne_dto {
  @IsString()
  email: string;
}

export class resetPassword_stepTwo_dto {
  @IsString()
  email: string;

  @IsString()
  code: string;
}

export class resetPassword_stepThree_dto {
  @IsString()
  email: string;

  @IsString()
  code: string;

  @IsString()
  password: string;
}
