import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log("*******************************1")
    console.log(request.requester,"/////////");

    const requester = request.requester;
    console.log("**************************2")
    console.log(requester);

    if (!requester || !requester.id) return false;

    const thisUser = await this.authService.findById(requester.id);

    if (!thisUser) return false;
    request.me = thisUser;

    return true;
  }
}
