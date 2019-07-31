"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const constants_1 = require("@nestjs/common/constants");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const metadata_scanner_1 = require("@nestjs/core/metadata-scanner");
const lodash_1 = require("lodash");
const pathToRegexp = require("path-to-regexp");
const api_consumes_explorer_1 = require("./explorers/api-consumes.explorer");
const api_exclude_endpoint_explorer_1 = require("./explorers/api-exclude-endpoint.explorer");
const api_operation_explorer_1 = require("./explorers/api-operation.explorer");
const api_parameters_explorer_1 = require("./explorers/api-parameters.explorer");
const api_produces_explorer_1 = require("./explorers/api-produces.explorer");
const api_response_explorer_1 = require("./explorers/api-response.explorer");
const api_security_explorer_1 = require("./explorers/api-security.explorer");
const api_use_tags_explorer_1 = require("./explorers/api-use-tags.explorer");
class SwaggerExplorer {
    constructor() {
        this.metadataScanner = new metadata_scanner_1.MetadataScanner();
        this.modelsDefinitions = [];
    }
    exploreController({ instance, metatype }, modulePath) {
        const prototype = Object.getPrototypeOf(instance);
        const explorersSchema = {
            root: [
                this.exploreRoutePathAndMethod,
                api_operation_explorer_1.exploreApiOperationMetadata,
                api_parameters_explorer_1.exploreApiParametersMetadata.bind(null, this.modelsDefinitions)
            ],
            produces: [api_produces_explorer_1.exploreApiProducesMetadata],
            consumes: [api_consumes_explorer_1.exploreApiConsumesMetadata],
            security: [api_security_explorer_1.exploreApiSecurityMetadata],
            tags: [api_use_tags_explorer_1.exploreApiUseTagsMetadata],
            responses: [api_response_explorer_1.exploreApiResponseMetadata.bind(null, this.modelsDefinitions)]
        };
        return this.generateDenormalizedDocument(metatype, prototype, instance, explorersSchema, modulePath);
    }
    getModelsDefinitons() {
        return this.modelsDefinitions;
    }
    generateDenormalizedDocument(metatype, prototype, instance, explorersSchema, modulePath) {
        let path = this.validateRoutePath(this.reflectControllerPath(metatype));
        if (modulePath) {
            path = this.validateRoutePath(modulePath + path);
        }
        const self = this;
        const globalMetadata = this.exploreGlobalMetadata(metatype);
        const denormalizedPaths = this.metadataScanner.scanFromPrototype(instance, prototype, name => {
            const targetCallback = prototype[name];
            const excludeEndpoint = api_exclude_endpoint_explorer_1.exploreApiExcludeEndpointMetadata(instance, prototype, targetCallback);
            if (excludeEndpoint && excludeEndpoint.disable) {
                return;
            }
            const methodMetadata = lodash_1.mapValues(explorersSchema, (explorers) => explorers.reduce((metadata, fn) => {
                const exploredMetadata = fn.call(self, instance, prototype, targetCallback, path);
                if (!exploredMetadata) {
                    return metadata;
                }
                if (!lodash_1.isArray(exploredMetadata)) {
                    return Object.assign({}, metadata, exploredMetadata);
                }
                return lodash_1.isArray(metadata)
                    ? [...metadata, ...exploredMetadata]
                    : exploredMetadata;
            }, {}));
            const mergedMethodMetadata = this.mergeMetadata(globalMetadata, lodash_1.omitBy(methodMetadata, lodash_1.isEmpty));
            this.assignDefaultMimeType(mergedMethodMetadata, 'produces');
            this.assignDefaultMimeType(mergedMethodMetadata, 'consumes');
            return Object.assign({ responses: {} }, globalMetadata, mergedMethodMetadata);
        });
        return denormalizedPaths;
    }
    exploreGlobalMetadata(metatype) {
        const globalExplorers = [
            api_produces_explorer_1.exploreGlobalApiProducesMetadata,
            api_use_tags_explorer_1.exploreGlobalApiUseTagsMetadata,
            api_consumes_explorer_1.exploreGlobalApiConsumesMetadata,
            api_security_explorer_1.exploreGlobalApiSecurityMetadata,
            api_response_explorer_1.exploreGlobalApiResponseMetadata.bind(null, this.modelsDefinitions)
        ];
        const globalMetadata = globalExplorers
            .map(explorer => explorer.call(explorer, metatype))
            .filter(val => !shared_utils_1.isUndefined(val))
            .reduce((curr, next) => (Object.assign({}, curr, next)), {});
        return globalMetadata;
    }
    exploreRoutePathAndMethod(instance, prototype, method, globalPath) {
        const routePath = Reflect.getMetadata(constants_1.PATH_METADATA, method);
        if (shared_utils_1.isUndefined(routePath)) {
            return undefined;
        }
        const requestMethod = Reflect.getMetadata(constants_1.METHOD_METADATA, method);
        const fullPath = globalPath + this.validateRoutePath(routePath);
        return {
            method: common_1.RequestMethod[requestMethod].toLowerCase(),
            path: fullPath === '' ? '/' : fullPath
        };
    }
    reflectControllerPath(metatype) {
        return Reflect.getMetadata(constants_1.PATH_METADATA, metatype);
    }
    validateRoutePath(path) {
        if (shared_utils_1.isUndefined(path)) {
            return '';
        }
        let pathWithParams = '';
        for (const item of pathToRegexp.parse(path)) {
            if (shared_utils_1.isString(item)) {
                pathWithParams += item;
            }
            else {
                pathWithParams += `${item.prefix}{${item.name}}`;
            }
        }
        return pathWithParams === '/' ? '' : shared_utils_1.validatePath(pathWithParams);
    }
    mergeMetadata(globalMetadata, methodMetadata) {
        return lodash_1.mapValues(methodMetadata, (value, key) => {
            if (!globalMetadata[key]) {
                return value;
            }
            const globalValue = globalMetadata[key];
            if (!lodash_1.isArray(globalValue)) {
                return Object.assign({}, globalValue, value);
            }
            return [...globalValue, ...value];
        });
    }
    assignDefaultMimeType(metadata, key) {
        if (metadata[key]) {
            return undefined;
        }
        const defaultMimeType = 'application/json';
        metadata[key] = [defaultMimeType];
    }
}
exports.SwaggerExplorer = SwaggerExplorer;
