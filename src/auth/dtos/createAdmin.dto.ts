import { IsString } from "class-validator";
import { UserRole } from "../../entities/user.entity";
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';



export class craeteAdminDto {

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  role:UserRole;
  
 }