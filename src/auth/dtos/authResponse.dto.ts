import { ApiProperty } from '@nestjs/swagger';

export class apiResponseStepOneDto {
  @ApiProperty()
  statusCode: number;
  @ApiProperty()
  msg: string;
}

export class apiResponseSteptwoDto {
  @ApiProperty()
  token: string;
}
