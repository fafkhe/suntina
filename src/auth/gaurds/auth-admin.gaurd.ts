import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthAdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const requester = request.requester;

    console.log(requester,"////////////////////////////r");
    if (!requester || !requester.id || requester.role !== 'admin'|| !requester.isMaster ) return false;

    const thisUser = await this.authService.findById(requester.id);

    console.log(thisUser,"thisuser is here")

    if (!thisUser) return false;

    request.me = thisUser;

    return true;
  }
}
