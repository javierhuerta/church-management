import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const config = app.get(ConfigService);

  const logLevel = config.get<string>('LOG_LEVEL', 'log');
  const levels: ('log' | 'error' | 'warn' | 'debug' | 'verbose')[] = [
    'error',
    'warn',
    'log',
    'debug',
    'verbose',
  ];
  const enabledLevels = levels.slice(
    0,
    levels.indexOf(logLevel as 'log' | 'error' | 'warn' | 'debug' | 'verbose') +
      1,
  );
  app.useLogger(enabledLevels);

  app.setGlobalPrefix('api');

  app.use(helmet());

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:5173'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Church Management API')
    .setDescription(
      'API para gestión de la Iglesia Adventista de Osorno Central',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
