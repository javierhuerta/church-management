import {
  Injectable,
  ExecutionContext,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeyService } from '../services/api-key.service';
import { extractApiKeyFromRequest } from './extract-api-key';
import { RequestWithUser } from '../../common/types/auth-request';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(@Optional() private readonly apiKeyService?: ApiKeyService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const rawApiKey = extractApiKeyFromRequest(req);

    if (rawApiKey && this.apiKeyService) {
      const authUser = await this.apiKeyService.validateRawKey(rawApiKey);
      if (!authUser) {
        throw new UnauthorizedException('Invalid or revoked API key');
      }
      req.user = authUser;
      return true;
    }

    return (await super.canActivate(context)) as boolean;
  }
}
