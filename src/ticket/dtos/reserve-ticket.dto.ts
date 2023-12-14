import { IsString, IsArray, IsNumber ,ArrayNotEmpty } from 'class-validator';

export class reserveTicketDto {
  @IsArray()
  @ArrayNotEmpty()
  seatNumbers: number[];

  @IsNumber()
  sansId: number;
}
