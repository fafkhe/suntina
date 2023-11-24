import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class responseAllUsers {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;
}
