import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';


@Injectable()
export class AuthMasterGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const requester = request.requester;

    if (!requester || !requester.id) return false;

    const thisUser = await this.authService.findById(requester.id);

    console.log(thisUser, 'thisuser');
    if (!thisUser || !thisUser.isMaster || thisUser.role !== 'admin')
      return false;

    request.me = thisUser;

    return true;
  }
}