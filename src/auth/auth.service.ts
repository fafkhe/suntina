import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AuthStepOneDto, AuthStepTwoDto } from './dtos/auth.dto';
import { sendEmail } from '../mailer/mailer';
import { validateEmail } from './utils/validateEmail';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { editProfileDto } from './dtos/edit-profile.dto';
import { craeteAdminDto } from './dtos/createAdmin.dto';
import { UserQueryDto } from './dtos/UsersQuery.dto';
import { accountDto } from './dtos/account.dto';
import { DataSource } from 'typeorm';
import { RedisStore } from '../redisStore';
import {
  resetPassword_stepOne_dto,
  resetPassword_stepThree_dto,
  resetPassword_stepTwo_dto,
} from './dtos/password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
    private dataSource: DataSource,
    private redisStore: RedisStore,
  ) {
    this.dataSource.manager.query(`
      ALTER TABLE public.user DROP CONSTRAINT IF EXISTS balance_check;
      ALTER TABLE public.user ADD CONSTRAINT balance_check CHECK (balance>=0);
    `);
  }

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

  async authStepOne(data: AuthStepOneDto) {
    const code = this.#generateNumericString(4);
    await this.cacheManager.set(`auth-${data.email}`, code, 180 * 1000);

    const isEmailCorrect = validateEmail(data.email);
    if (!isEmailCorrect)
      throw new BadRequestException('your email is incorrect!');

    sendEmail(data.email, code);
    return {
      statusCode: 200,
      msg: 'we will send verification code to your email.',
    };
  }

  async authStepTwo(data: AuthStepTwoDto) {
    const theCode = await this.cacheManager.get(`auth-${data.email}`);

    if (!data.code) throw new BadRequestException('bad request');

    if (theCode !== data.code)
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

    this.cacheManager.del(`auth-${data.email}`);

    return { token };
  }

  async findById(id: number) {
    const thisUser = await this.redisStore.readSingleUserFromCache(id);

    if (!thisUser)
      throw new BadRequestException('there is no user with this ID!!');
    return thisUser;
  }

  async editprofile(id: number, data: editProfileDto) {
    const thisUser = await this.userRepo.findOne({
      where: {
        id: id,
      },
    });

    if (!thisUser.id) throw new BadRequestException('no such user found');

    await this.userRepo.save({ id, ...data });

    this.cacheManager.del(`user-${String(id)}`);

    return 'ok';
  }

  async AllUsers(data: UserQueryDto) {
    const name = data.name || '';
    return this.userRepo.manager.query(
      'SELECT * FROM public.user WHERE LOWER(public.user.name) LIKE $1 OFFSET $2 ROWS FETCH NEXT $3 ROWS ONLY',
      [`%${name}%`, data.limit, data.page],
    );
  }

  async createAdmin(data: craeteAdminDto) {
    try {
      if (!data.email || !data.role) {
        throw new BadRequestException('bad input');
      }

      const thisAdmin = this.userRepo.create({
        email: data.email,
        role: data.role,
      });

      await this.userRepo.save(thisAdmin);

      return 'ok';
    } catch (error) {
      if (
        error.message ==
        'duplicate key value violates unique constraint "UQ_e12875dfb3b1d92d7d7c5377e22"'
      )
        throw new BadRequestException('this admin already existed');
    }
  }
  detail: 'Key (email)=(jixerm4n@gmail.com) already exists.';

  async deleteAdmin(id: number) {
    const thisAdmin = await this.userRepo.findOne({
      where: {
        id: id,
      },
    });
    if (!thisAdmin) {
      throw new BadRequestException('there is no admin with this id!!');
    }

    await this.userRepo.delete({ id });

    await this.userRepo.save(thisAdmin);

    return 'ok';
  }

  async auth_admin_step_one(data: AuthStepOneDto) {
    const code = this.#generateNumericString(4);
    await this.cacheManager.set(`auth-${data.email}`, code, 180 * 1000);

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
    if (!data.code)
      throw new BadRequestException(
        'please make sure that you are prepare code',
      );

    if (theCode !== data.code)
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

  async addToaccount(me: User, data: accountDto) {
    await this.dataSource.manager.query(
      `UPDATE public.user
       SET balance = balance + $1 
       WHERE id = $2`,
      [data.balance, me.id],
    );

    return 'ok';
  }

  #generateCode(length: number): string {
    const res = Array.from({ length }).reduce((acc) => {
      return acc + String(Math.floor(Math.random() * 9));
      return acc + '1';
    }, '');
    return String(res);
  }

  async resetPass1(data: resetPassword_stepOne_dto) {
    //check if email exist in db.

    const thisUser = await this.userRepo.findOne({
      where: {
        email: data.email,
      },
    });


    //if email does not exist returning messsage "email does not exist please make sure your email is correct"

    if (!thisUser)
      throw new BadRequestException(
        'email doese not exist please make sure your email is correct',
      );

    //if email exist generate code and set it in redis.
    const code = this.#generateCode(4);
    await this.cacheManager.set(`pchr-${data.email}`, code, 180 * 1000);

    //send the code through email for user.

    sendEmail(data.email, code);
    return {
      statusCode: 200,
      msg: 'we will send a code to your email.',
    };
  }

  async resetPass2(data: resetPassword_stepTwo_dto) {
    const code = data.code;

    const thisUser = await this.userRepo.findOne({
      where: {
        email: data.email,
      },
    });

    if (!thisUser)
      throw new BadRequestException(
        'email doese not exist please make sure your email is correct',
      );

    const theCode = await this.cacheManager.get(`pchr-${data.email}`);
    console.log(typeof theCode, 'thecode');
    if (theCode !== code)
      throw new BadRequestException('the code is wrong, please try again!');

    await this.cacheManager.set(
      `permission-${data.email}`,
      theCode,
      180 * 1000,
    );

    
    return {
      statusCode: 200,
      msg: 'code is correct you can write your new password',
    };
  }
  
  async resetpass3(data:resetPassword_stepThree_dto) {

    //get code, email, new pass from user
    
    const permission = await this.cacheManager.get(`permission-${data.email}`);
  
    if (!permission)
      throw new BadRequestException('your time is over, please try again!');
    

    //save new pass in db.
  }
}
