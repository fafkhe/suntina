import { IsString, IsNumber } from 'class-validator';

export class createSaloonDto {
  @IsString()
  name: string;

  @IsNumber()
  numOfSeat: number;

  @IsNumber()
  numOfseatPerRow: number;
}

export class EditSaloonDto {
  @IsNumber()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  numOfSeat: number;

  @IsNumber()
  numOfseatPerRow: number;
}