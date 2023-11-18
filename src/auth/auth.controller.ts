import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { AuthStepOneDto } from './dtos/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('step-one')
  auth_step_one(@Body() body: AuthStepOneDto) {
    return this.authService.authStepOne(body)
  }
}
