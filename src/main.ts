import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import 'dotenv/config';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);
  
  // Apply the global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Apply the global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Apply the global class serializer interceptor
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();