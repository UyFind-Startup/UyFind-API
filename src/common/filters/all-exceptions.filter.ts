import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const body =
        typeof res === 'string'
          ? { statusCode: status, message: res }
          : (res as Record<string, unknown>);
      response.status(status).json(body);
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.error(
        `[Prisma ${exception.code}] ${exception.message} meta=${JSON.stringify(exception.meta ?? {})}`,
      );
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      this.logger.error(`[Prisma validation] ${exception.message}`);
    } else if (exception instanceof Error) {
      this.logger.error(exception.stack ?? exception.message);
    } else {
      this.logger.error(String(exception));
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
