import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { AuthStepOneDto } from './dtos/auth.dto';
import { sendEmail } from 'src/mailer/mailer';
import { validateEmail } from './utils/validateEmail';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  #generateNumericString(length: number): string {
    const res = Array.from({ length }).reduce((acc) => {
      return acc + String(Math.floor(Math.random() * 9));
      return acc + '1';
    }, '');
    return String(res);
  }

  async authStepOne(data: AuthStepOneDto) {
    const isEmailCorrect = validateEmail(data.email);
    if (!isEmailCorrect)
      throw new BadRequestException('your email is incorrect !!!');
    const code = this.#generateNumericString(4);

    sendEmail(data.email, code);
    return 'we will send verification code to your email.';
  }
}
