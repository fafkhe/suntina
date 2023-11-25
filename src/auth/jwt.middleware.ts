import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';

interface requester {
  id: number;
  role: string;
  isMaster: boolean;
}

declare global {
  namespace Express {
    interface Request {
      requester?: requester;
      me?: User;
      isMaster: boolean;
    }
  }
}

@Injectable()
export class jwtAuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = req.headers.auth;
      

      if (!auth || typeof auth !== 'string') return next();

      const [bearer, token] = auth.split(' ');

      if (bearer != 'ut') return next();

      req.requester = this.jwtService.verify(token);
    } catch (error) {
      req.requester = null;
    }

    next();
  }
}