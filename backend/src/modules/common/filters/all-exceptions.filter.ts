import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request & { requestId?: string }>();
    const response = ctx.getResponse<Response>();

    const requestId = request.requestId ?? 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message =
          (exceptionResponse as { message?: string }).message ||
          exception.message;
        error =
          (exceptionResponse as { error?: string }).error || HttpStatus[status];
      } else {
        message = exception.message;
        error = HttpStatus[status];
      }

      // Expected HTTP errors logged at warn/debug — no stack needed
      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.warn(
          `HttpException ${status} ${request.method} ${request.url} [${requestId}]: ${message}`,
        );
      } else {
        this.logger.debug(
          `HttpException ${status} ${request.method} ${request.url} [${requestId}]: ${message}`,
        );
      }
    } else {
      // Unexpected errors: log at error level with stack
      const stack =
        exception instanceof Error ? exception.stack : String(exception);
      this.logger.error(
        `Unhandled exception ${request.method} ${request.url} [${requestId}]: ${String(exception)}`,
        stack,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
    });
  }
}
