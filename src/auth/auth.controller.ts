import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthStepOneDto } from './dtos/auth.dto';
import { AuthService } from './auth.service';
import { AuthStepTwoDto } from './dtos/auth.dto';
import { Me } from 'src/decorators/me.decoratos';
import { User } from 'src/entities/user.entity';
import { AuthGuard } from './gaurds/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/step-one')
  auth_step_one(@Body() body: AuthStepOneDto) {
    return this.authService.authStepOne(body);
  }

  @Post('/step-two')
  auth_step_two(@Body() body: AuthStepTwoDto) {
    return this.authService.authStepTwo(body);
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  me(@Me() me: User) {
    console.log("me is called")
    return me;
  }
}
