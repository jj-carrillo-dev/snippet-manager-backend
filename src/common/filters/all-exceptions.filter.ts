import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Catches all unhandled exceptions and standardizes the response format.
 * This filter ensures a consistent JSON error structure for all API endpoints.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  /**
   * Main catch method for handling exceptions.
   * @param exception The unhandled exception object.
   * @param host Provides access to the arguments of the request handler.
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Determine the HTTP status code. If it's not an HttpException, default to 500.
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | object = 'Internal Server Error';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      // Correctly handle both string and object messages from NestJS exceptions.
      // NestJS can return a simple string or an object with a message property.
      message = (typeof exceptionResponse === 'object' && 'message' in exceptionResponse)
        ? (exceptionResponse as any).message
        : exceptionResponse as string;
    }

    // Handle database-specific errors with a specific code.
    // The code '23505' is a unique constraint violation error from PostgreSQL.
    if (typeof exception === 'object' && exception !== null && 'code' in exception && (exception as any).code === '23505') {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Email already exists',
      });
      return;
    }

    // Default response for all other unhandled errors.
    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}