import { Module } from '@nestjs/common';
import { SansService } from './sans.service';
import { SansController } from './sans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sans } from 'src/entities/sans.entity';
import { MiddlewareConsumer } from '@nestjs/common';
import { jwtAuthMiddleware } from 'src/auth/jwt.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Sans])],
  controllers: [SansController],
  providers: [SansService],
})
export class SansModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(jwtAuthMiddleware).forRoutes('*');
  }
}
