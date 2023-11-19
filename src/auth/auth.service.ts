import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { AuthStepOneDto, AuthStepTwoDto } from './dtos/auth.dto';
import { sendEmail } from 'src/mailer/mailer';
import { validateEmail } from './utils/validateEmail';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
  ) {}

  #generateNumericString(length: number): string {
    const res = Array.from({ length }).reduce((acc) => {
      return acc + String(Math.floor(Math.random() * 9));
      return acc + '1';
    }, '');
    return String(res);
  }



  async authStepOne(data: AuthStepOneDto) {
    const code = this.#generateNumericString(4);
    await this.cacheManager.set(`auth-${data.email}`, code, 180 * 1000);

    const isEmailCorrect = validateEmail(data.email);
    if (!isEmailCorrect)
      throw new BadRequestException('your email is incorrect !!!');

    sendEmail(data.email, code);
    return 'we will send verification code to your email.';
  }

  async authStepTwo(data: AuthStepTwoDto) {
    const theCode = await this.cacheManager.get(`auth-${data.email}`); 

    if (!theCode || theCode !== data.code) 
      throw new BadRequestException("the provided code doesnt match")
    
    let thisUser = await this.userRepo.findOne({
      where: {
        email: data.email,
      },
    });
    if (!thisUser) {
      thisUser = this.userRepo.create({ ...data });
      await this.userRepo.save(thisUser); 
    }
  }
}
