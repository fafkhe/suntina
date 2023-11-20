import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class responseMeDto {
  @Expose()
  @ApiProperty()
  id: number;
  @ApiProperty()
  @Expose()
  name: string;
  @ApiProperty()
  @Expose()
  email: string;
}
