import { IsNumber } from "class-validator";

export class accountDto {

  @IsNumber()
   balance: number;
  
 }