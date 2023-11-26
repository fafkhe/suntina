import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { MovieController } from './movie/movie.controller';
import { MovieService } from './movie/movie.service';
import { MovieModule } from './movie/movie.module';
import { Movie } from './entities/movie.entity';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';


config();


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User,Movie],
      synchronize: true,
    }),
    CacheModule.register({
      isGlobal: true,
      inject: [ConfigService],
      store: (): any =>
        redisStore({
          commandsQueueMaxLength: 10_000,
          socket: {
            host: process.env.REDIS_HOST,
            port: +process.env.REDIS_PORT,
          },
        }),
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    AuthModule,
    MovieModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
