import { ExecutionContext, Injectable, Optional } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeyService } from '../services/api-key.service';
import { extractApiKeyFromRequest } from './extract-api-key';
import { RequestWithUser } from '../../common/types/auth-request';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(@Optional() private readonly apiKeyService?: ApiKeyService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const rawApiKey = extractApiKeyFromRequest(req);

    if (rawApiKey && this.apiKeyService) {
      const authUser = await this.apiKeyService.validateRawKey(rawApiKey);
      if (authUser) {
        req.user = authUser;
        return true;
      }
    }

    return (await super.canActivate(context)) as boolean;
  }

  handleRequest<TUser = unknown>(
    _err: unknown,
    user: TUser | false,
  ): TUser | null {
    return user || null;
  }
}
