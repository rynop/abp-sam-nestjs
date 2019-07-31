"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const swagger_scanner_1 = require("./swagger-scanner");
class SwaggerModule {
    static createDocument(app, config, options = {}) {
        const swaggerScanner = new swagger_scanner_1.SwaggerScanner();
        const document = swaggerScanner.scanApplication(app, options.include || [], options.deepScanRoutes);
        return Object.assign({}, config, document, { swagger: '2.0' });
    }
    static setup(path, app, document, options) {
        const httpAdapter = app.getHttpAdapter();
        if (httpAdapter &&
            httpAdapter.constructor &&
            httpAdapter.constructor.name === 'FastifyAdapter') {
            return this.setupFastify(path, httpAdapter, document);
        }
        return this.setupExpress(path, app, document, options);
    }
    static setupExpress(path, app, document, options) {
        const httpAdapter = app.getHttpAdapter();
        const validatePath = (inputPath) => inputPath.charAt(0) !== '/' ? '/' + inputPath : inputPath;
        const finalPath = validatePath(path);
        const swaggerUi = load_package_util_1.loadPackage('swagger-ui-express', 'SwaggerModule', () => require('swagger-ui-express'));
        const swaggerHtml = swaggerUi.generateHTML(document, options);
        app.use(finalPath, swaggerUi.serveFiles(document, options));
        httpAdapter.get(finalPath, (req, res) => res.send(swaggerHtml));
        httpAdapter.get(finalPath + '-json', (req, res) => res.json(document));
    }
    static setupFastify(path, httpServer, document) {
        httpServer.register(load_package_util_1.loadPackage('fastify-swagger', 'SwaggerModule', () => require('fastify-swagger')), {
            swagger: document,
            exposeRoute: true,
            routePrefix: path,
            mode: 'static',
            specification: {
                document
            }
        });
    }
}
exports.SwaggerModule = SwaggerModule;
