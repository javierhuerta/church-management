import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const requestId: string =
      (req.headers['x-request-id'] as string) ?? randomUUID();
    (req as Request & { requestId: string }).requestId = requestId;
    res.setHeader('x-request-id', requestId);

    const { method, url } = req;
    const isHealth = url.startsWith('/api/health');
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          const status = res.statusCode;
          const message = `${method} ${url} ${status} +${ms}ms [${requestId}]`;
          if (isHealth) {
            this.logger.debug(message);
          } else {
            this.logger.log(message);
          }
        },
        error: () => {
          const ms = Date.now() - start;
          // Error logging is handled by AllExceptionsFilter
          this.logger.warn(`${method} ${url} ERR +${ms}ms [${requestId}]`);
        },
      }),
    );
  }
}
