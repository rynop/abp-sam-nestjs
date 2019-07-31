/**
 * Entry point for local development
 */
import { config } from 'dotenv';
config();

import * as fs from 'fs';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { bootstrap } from './app';

const port = process.env.LISTEN_PORT || 8081;

const openAPIOpts = new DocumentBuilder()
    .setTitle('sample-api')
    .setDescription('api')
    .setVersion('1.0')
    .setBasePath('v1')
    .setSchemes('https')
    .build();

async function startLocal() {
    const nestApp = await bootstrap();
    nestApp.app.enableCors();

    const doc = SwaggerModule.createDocument(nestApp.app, openAPIOpts);
    fs.writeFileSync(
        __dirname + '/../docs/openAPI/openAPI.json',
        JSON.stringify(doc, null, 2),
    );
    SwaggerModule.setup('openapi', nestApp.app, doc);

    nestApp.instance.listen(+port);
}

startLocal();