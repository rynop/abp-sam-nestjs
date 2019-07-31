/**
 * Entry point for Lambda via API Gateway
 */
import {
    Context,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from 'aws-lambda';
import { NestApp, bootstrap } from './app';
import { proxy } from 'aws-serverless-fastify';

let cachedNestApp: NestApp;

// // NOTE: If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely
// // due to a compressed response (e.g. gzip) which has not been handled correctly
// // by aws-serverless-express and/or API Gateway. Add the necessary MIME types to
// // binaryMimeTypes below
const binaryMimeTypes: string[] = [
    // 'application/javascript',
    // 'application/json',
    // 'application/octet-stream',
    // 'application/xml',
    // 'font/eot',
    // 'font/opentype',
    // 'font/otf',
    // 'image/jpeg',
    // 'image/png',
    // 'image/svg+xml',
    // 'text/comma-separated-values',
    // 'text/css',
    // 'text/html',
    // 'text/javascript',
    // 'text/plain',
    // 'text/text',
    // 'text/xml',
];

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context,
): Promise<APIGatewayProxyResult> => {
    if (!cachedNestApp) {
        cachedNestApp = await bootstrap();
    }

    return await proxy(cachedNestApp.instance, event, context, binaryMimeTypes);
};
