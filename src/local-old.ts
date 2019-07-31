import { config } from 'dotenv';
config();

import * as fs from 'fs';

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from '@nestjs/common/services/logger.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

const port = process.env.LISTEN_PORT || 8081;
const logger = new Logger('Main', true);

const openAPIOpts = new DocumentBuilder()
  .setTitle('sample-api')
  .setDescription('api')
  .setVersion('1.0')
  .setBasePath('v1')
  .setSchemes('https')
  .build();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  // const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');
  // app.disable('x-powered-by');
  app.useGlobalPipes(new ValidationPipe());
  const doc = SwaggerModule.createDocument(app, openAPIOpts);
  fs.writeFileSync(
    __dirname + '/../docs/openAPI/openAPI.json',
    JSON.stringify(doc, null, 2),
  );
  SwaggerModule.setup('openapi', app, doc);

  await app.listen(port, () => logger.log(`Server listening on port ${port}`));
}
bootstrap();
