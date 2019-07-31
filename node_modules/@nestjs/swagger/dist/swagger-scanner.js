"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@nestjs/common/constants");
const lodash_1 = require("lodash");
const swagger_explorer_1 = require("./swagger-explorer");
const swagger_transformer_1 = require("./swagger-transformer");
class SwaggerScanner {
    constructor() {
        this.explorer = new swagger_explorer_1.SwaggerExplorer();
        this.transfomer = new swagger_transformer_1.SwaggerTransformer();
    }
    scanApplication(app, includedModules, deepScanRoutes) {
        const { container } = app;
        const modules = this.getModules(container.getModules(), includedModules);
        const denormalizedPaths = modules.map(({ routes, metatype, relatedModules }) => {
            let allRoutes = new Map(routes);
            if (deepScanRoutes) {
                Array.from(relatedModules.values())
                    .filter(relatedModule => !container.isGlobalModule(relatedModule))
                    .map(({ routes: relatedModuleRoutes }) => relatedModuleRoutes)
                    .forEach(relatedModuleRoutes => {
                    allRoutes = new Map([...allRoutes, ...relatedModuleRoutes]);
                });
            }
            const path = metatype
                ? Reflect.getMetadata(constants_1.MODULE_PATH, metatype)
                : undefined;
            return this.scanModuleRoutes(allRoutes, path);
        });
        return Object.assign({}, this.transfomer.normalizePaths(lodash_1.flatten(denormalizedPaths)), { definitions: lodash_1.reduce(this.explorer.getModelsDefinitons(), lodash_1.extend) });
    }
    scanModuleRoutes(routes, modulePath) {
        const denormalizedArray = [...routes.values()].map(ctrl => this.explorer.exploreController(ctrl, modulePath));
        return lodash_1.flatten(denormalizedArray);
    }
    getModules(modulesContainer, include) {
        if (!include || lodash_1.isEmpty(include)) {
            return [...modulesContainer.values()];
        }
        return [...modulesContainer.values()].filter(({ metatype }) => include.some(item => item === metatype));
    }
}
exports.SwaggerScanner = SwaggerScanner;
