import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthAdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const requester = request.requester;

    console.log(requester);
    if (!requester || !requester.id) return false;

    const thisUser = await this.authService.findById(requester.id);

    if (!thisUser) return false;

    if (thisUser.role != 'admin') return false;
    request.me = thisUser;

    return true;
  }
}
