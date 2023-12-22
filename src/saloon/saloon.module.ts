import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaloonController } from './saloon.controller';
import { SaloonService } from './saloon.service';
import { jwtAuthMiddleware } from 'src/auth/jwt.middleware';
import { Saloon } from 'src/entities/saloon.entity';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/entities/user.entity';
import { RedisStore } from 'src/redisStore';


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
