import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

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
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
    });
  }
}
