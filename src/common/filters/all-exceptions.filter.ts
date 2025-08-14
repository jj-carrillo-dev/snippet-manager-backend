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

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal Server Error';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      // Check if the response is an object with a 'message' key (like default NestJS errors)
      message = (typeof exceptionResponse === 'object' && 'message' in exceptionResponse)
        ? (exceptionResponse as any).message
        : exceptionResponse as string;
    }

    // Handle database-specific errors with code property on the exception object
    if (typeof exception === 'object' && exception !== null && 'code' in exception && (exception as any).code === '23505') {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Email already exists',
      });
      return;
    }

    // Default response for all other errors
    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}