import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code: number = status;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resMessage = (exceptionResponse as any).message;
        message = Array.isArray(resMessage) 
          ? resMessage.join(', ') 
          : (resMessage || exception.message);
      } else {
        message = exception.message;
      }
      code = status;
    } else if (exception instanceof QueryFailedError) {
      if ((exception as any).code === '23505') {
        status = HttpStatus.CONFLICT;
        message = 'A record with these details already exists.';
      } else {
        message = 'Database query failed';
        status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      code = status;
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      message = 'Internal server error'; 
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
