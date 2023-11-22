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
import { editProfileDto } from './dtos/edit-profile.dto';
import { craeteAdminDto } from './dtos/createAdmin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
  ) {}

  #generateNumericString(length: number): string {
    const res = Array.from({ length }).reduce((acc) => {
      return acc + '1';
      return acc + String(Math.floor(Math.random() * 9));
    }, '');
    return String(res);
  }

  #generateToken({ id, role, isMaster }) {
    return this.jwtService.sign({ id, role, isMaster });
  }

  async #readSingleUserFromCache(id: number): Promise<User | null> {
    try {
      let target = `user-${String(id)}`;

      let thisUser = (await this.cacheManager.get(target)) as User;

      if (!thisUser) {
        thisUser = await this.userRepo.findOne({
          where: {
            id,
          },
        });
        if (thisUser) await this.cacheManager.set(target, thisUser, 600 * 1000);
      }

      return thisUser;
    } catch (error) {
      return null;
    }
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
      throw new BadRequestException('the provided code doesnt match');

    let thisUser = await this.userRepo.findOne({
      where: {
        email: data.email,
      },
    });
    if (!thisUser) {
      thisUser = this.userRepo.create({ ...data });
      await this.userRepo.save(thisUser);
    }
    const token = this.#generateToken({
      id: thisUser.id,
      role: thisUser.role,
      isMaster: thisUser.isMaster,
    });
    console.log('can you see me?????im here', token); //


    return { token };
  }

  async findById(id: number) {
    const thisUser = await this.#readSingleUserFromCache(id);
    console.log(thisUser, 'thisUser');
    if (!thisUser)
      throw new BadRequestException('there is no user with this ID!!');
    return thisUser;
  }

  async editprofile(id: number, data: editProfileDto) {
    const thisUser = await this.userRepo.findOne({
      where: {
        id: data.id,
      },
    });

    const newUser = await this.userRepo.save({ id, ...data });4
    this.cacheManager.del(`user-${String(id)}`);

    return 'ok';
  }

  async createAdmin(data: craeteAdminDto) {
    if (!data.email || !data.role) {
      throw new BadRequestException('bad input');
    }

    const thisAdmin = this.userRepo.create({
      email: data.email,
      role: data.role,
    });

    await this.userRepo.save(thisAdmin);

    return 'ok';
  }

  async auth_admin_step_one(data: AuthStepOneDto) {
    const code = this.#generateNumericString(4);
    await this.cacheManager.set(`auth-${data.email}`, code, 180 * 1000);
    // console.log('code', code);

    const thisAdmin = await this.userRepo.findOne({
      where: {
        email: data.email,
      },
    });

    if (!thisAdmin) {
      throw new BadRequestException('admin is not exist!!');
    }

    if (thisAdmin.role !== 'admin')
      throw new BadRequestException('forbiden!!!');

    if (data) {
      sendEmail(data.email, code);
    }

    return 'we will send the code to your gmail account!';
  }
  async auth_admin_step_two(data: AuthStepTwoDto) {
    const theCode = await this.cacheManager.get(`auth-${data.email}`);
    if (!theCode || theCode !== data.code)
      throw new BadRequestException('the provided code doesnt match');

    let thisAdmin = await this.userRepo.findOne({
      where: {
        email: data.email,
      },
    });

    const token = this.#generateToken({
      id: thisAdmin.id,
      role: thisAdmin.role,
      isMaster: thisAdmin.isMaster,
    });

    this.cacheManager.del(`auth-${data.email}`);

    return {
      token,
    };
  }
}
