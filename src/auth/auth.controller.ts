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
import { ApiResponse, ApiTags, ApiHeader } from '@nestjs/swagger';
import { apiResponseStepOneDto } from './dtos/authResponse.dto';
import { apiResponseSteptwoDto } from './dtos/authResponse.dto';
import { responseMeDto } from './dtos/response-me.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { editProfileDto } from './dtos/edit-profile.dto';
import { responseEditProfile } from './dtos/edit-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/step-one')
  @ApiResponse({
    status: 201,
    type: apiResponseStepOneDto,
  })
  auth_step_one(@Body() body: AuthStepOneDto) {
    return this.authService.authStepOne(body);
  }

  @ApiResponse({
    status: 201,
    type: apiResponseSteptwoDto,
  })
  @Post('/step-two')
  auth_step_two(@Body() body: AuthStepTwoDto) {
    return this.authService.authStepTwo(body);
  }

  @Serialize(responseMeDto)
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 201,
    type: responseEditProfile,
  })
  @Post('/edit/:id')
  editProfile(@Param('id') id: string, @Body() body: editProfileDto) {
    return this.authService.editprofile(+id, body);
  }

  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 201,
    type: responseMeDto,
  })
  @Serialize(responseMeDto)
  @Get('/me')
  me(@Me() me: User) {
    console.log('me is called');
    return me;
  }
}
