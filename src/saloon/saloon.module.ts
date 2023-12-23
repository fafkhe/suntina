import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaloonController } from './saloon.controller';
import { SaloonService } from './saloon.service';
import { jwtAuthMiddleware } from '../auth/jwt.middleware';
import { Saloon } from '../entities/saloon.entity';
import { AuthService } from '../auth/auth.service';
import { User } from '../entities/user.entity';
import { RedisStore } from '../redisStore';


@Module({
  imports: [TypeOrmModule.forFeature([Saloon,User])],
  controllers: [SaloonController],
  providers: [SaloonService,AuthService,RedisStore],
})
export class SaloonModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(jwtAuthMiddleware).forRoutes('*');
  }
}
