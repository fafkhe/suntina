import { IsString, IsNumber, isString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class editProfileDto {
  @IsString()
  name: string;
}

export class responseEditProfile {
  @ApiProperty()
  msg: 'ok';
}
