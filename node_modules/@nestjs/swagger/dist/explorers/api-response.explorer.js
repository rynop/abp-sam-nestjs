"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const constants_1 = require("@nestjs/common/constants");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const lodash_1 = require("lodash");
const constants_2 = require("../constants");
const api_parameters_explorer_1 = require("./api-parameters.explorer");
exports.exploreGlobalApiResponseMetadata = (definitions, metatype) => {
    const responses = Reflect.getMetadata(constants_2.DECORATORS.API_RESPONSE, metatype);
    return responses
        ? {
            responses: mapResponsesToSwaggerResponses(responses, definitions)
        }
        : undefined;
};
exports.exploreApiResponseMetadata = (definitions, instance, prototype, method) => {
    const responses = Reflect.getMetadata(constants_2.DECORATORS.API_RESPONSE, method);
    if (responses) {
        return mapResponsesToSwaggerResponses(responses, definitions);
    }
    const status = getStatusCode(method);
    if (status) {
        return { [status]: { description: '' } };
    }
    return undefined;
};
const getStatusCode = method => {
    const status = Reflect.getMetadata(constants_1.HTTP_CODE_METADATA, method);
    if (status) {
        return status;
    }
    const requestMethod = Reflect.getMetadata(constants_1.METHOD_METADATA, method);
    switch (requestMethod) {
        case common_1.RequestMethod.POST:
            return common_1.HttpStatus.CREATED;
        default:
            return common_1.HttpStatus.OK;
    }
};
const omitParamType = param => lodash_1.omit(param, 'type');
const mapResponsesToSwaggerResponses = (responses, definitions) => lodash_1.mapValues(lodash_1.mapValues(responses, response => {
    const { type, isArray } = response;
    response = lodash_1.omit(response, ['isArray']);
    if (!type) {
        return response;
    }
    const defaultTypes = [String, Boolean, Number, Object, Array];
    if (!(shared_utils_1.isFunction(type) &&
        !defaultTypes.some(defaultType => defaultType === type))) {
        const metatype = type && shared_utils_1.isFunction(type) ? type.name : type;
        const swaggerType = api_parameters_explorer_1.mapTypesToSwaggerTypes(metatype);
        if (isArray) {
            return Object.assign({}, response, { schema: {
                    type: 'array',
                    items: {
                        type: swaggerType
                    }
                } });
        }
        return Object.assign({}, response, { schema: {
                type: swaggerType
            } });
    }
    const name = api_parameters_explorer_1.exploreModelDefinition(type, definitions);
    if (isArray) {
        return exports.toArrayResponseWithDefinition(response, name);
    }
    return exports.toResponseWithDefinition(response, name);
}), omitParamType);
exports.toArrayResponseWithDefinition = (response, name) => (Object.assign({}, response, { schema: {
        type: 'array',
        items: {
            $ref: `#/definitions/${name}`
        }
    } }));
exports.toResponseWithDefinition = (response, name) => (Object.assign({}, response, { schema: {
        $ref: `#/definitions/${name}`
    } }));
