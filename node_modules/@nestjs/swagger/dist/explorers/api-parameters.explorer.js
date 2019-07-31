"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@nestjs/common/constants");
const route_paramtypes_enum_1 = require("@nestjs/common/enums/route-paramtypes.enum");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const lodash_1 = require("lodash");
const constants_2 = require("../constants");
const api_consumes_explorer_1 = require("./api-consumes.explorer");
exports.exploreApiParametersMetadata = (definitions, instance, prototype, method) => {
    const implicitParameters = Reflect.getMetadata(constants_2.DECORATORS.API_PARAMETERS, method);
    const reflectedParameters = exploreApiReflectedParametersMetadata(instance, prototype, method);
    const noAnyImplicit = lodash_1.isNil(implicitParameters);
    if (noAnyImplicit && lodash_1.isNil(reflectedParameters)) {
        return undefined;
    }
    const allReflectedParameters = transformModelToProperties(reflectedParameters || []);
    const mergedParameters = noAnyImplicit
        ? allReflectedParameters
        : lodash_1.map(allReflectedParameters, item => lodash_1.assign(item, lodash_1.find(implicitParameters, ['name', item.name])));
    const unionParameters = noAnyImplicit
        ? mergedParameters
        : lodash_1.unionWith(mergedParameters, implicitParameters, (arrVal, othVal) => {
            return arrVal.name === othVal.name && arrVal.in === othVal.in;
        });
    const paramsWithDefinitions = mapModelsToDefinitons(unionParameters, definitions);
    const parameters = mapParametersTypes(paramsWithDefinitions);
    return parameters ? { parameters } : undefined;
};
const DEFAULT_PARAM_TOKEN = '_';
const exploreApiReflectedParametersMetadata = (instance, prototype, method) => {
    const types = Reflect.getMetadata(constants_1.PARAMTYPES_METADATA, instance, method.name);
    const parametersMetadata = Reflect.getMetadata(constants_1.ROUTE_ARGS_METADATA, instance.constructor, method.name) || {};
    const parametersWithType = lodash_1.mapValues(parametersMetadata, param => ({
        type: types[param.index],
        name: param.data,
        required: true
    }));
    const consumes = api_consumes_explorer_1.exploreApiConsumesMetadata(instance, prototype, method);
    const parameters = lodash_1.omitBy(lodash_1.mapValues(parametersWithType, (val, key) => (Object.assign({}, val, { in: mapParamType(key, consumes) }))), val => val.in === DEFAULT_PARAM_TOKEN || (val.name && val.in === 'body'));
    return !lodash_1.isEmpty(parameters) ? parameters : undefined;
};
const exploreModelProperties = prototype => {
    const props = Reflect.getMetadata(constants_2.DECORATORS.API_MODEL_PROPERTIES_ARRAY, prototype) || [];
    return props
        .filter(lodash_1.isString)
        .filter(prop => prop.charAt(0) === ':' && !shared_utils_1.isFunction(prototype[prop]))
        .map(prop => prop.slice(1));
};
const isBodyParameter = param => param.in === 'body';
const transformModelToProperties = reflectedParameters => {
    return lodash_1.flatMap(reflectedParameters, (param) => {
        if (!param || param.type === Object) {
            return undefined;
        }
        const { prototype } = param.type;
        if (param.name) {
            return param;
        }
        if (isBodyParameter(param)) {
            const name = param.type && shared_utils_1.isFunction(param.type) ? param.type.name : param.type;
            return Object.assign({}, param, { name });
        }
        const modelProperties = exploreModelProperties(prototype);
        return modelProperties.map(key => {
            const reflectedParam = Reflect.getMetadata(constants_2.DECORATORS.API_MODEL_PROPERTIES, prototype, key) ||
                {};
            return Object.assign({}, param, reflectedParam, { name: key });
        });
    }).filter(lodash_1.identity);
};
const transformToArrayModelProperty = (metadata, key, type) => {
    const model = Object.assign({}, metadata, { name: key, type: 'array', items: Object.assign({}, type) });
    if (metadata.enum !== undefined) {
        delete model.enum;
        model.items = Object.assign({}, model.items, { enum: metadata.enum });
    }
    return model;
};
exports.exploreModelDefinition = (type, definitions, existingNestedModelNames = []) => {
    const { prototype } = type;
    const modelProperties = exploreModelProperties(prototype);
    const propertiesWithType = modelProperties.map(key => {
        const metadata = Reflect.getMetadata(constants_2.DECORATORS.API_MODEL_PROPERTIES, prototype, key) ||
            {};
        const defaultTypes = [String, Boolean, Number, Object, Array];
        if (metadata.enum !== undefined) {
            metadata.enum = getEnumValues(metadata.enum);
        }
        const isNotDefaultType = shared_utils_1.isFunction(metadata.type) &&
            !defaultTypes.find(defaultType => defaultType === metadata.type);
        if (shared_utils_1.isFunction(metadata.type) && metadata.type.name == 'type') {
            metadata.type = metadata.type();
        }
        if (isNotDefaultType) {
            let nestedModelName = metadata.type.name;
            if (!lodash_1.includes(existingNestedModelNames, metadata.type.name)) {
                existingNestedModelNames.push(metadata.type.name);
                nestedModelName = exports.exploreModelDefinition(metadata.type, definitions, existingNestedModelNames);
            }
            const $ref = getDefinitionPath(metadata.type.name);
            if (metadata.isArray) {
                return transformToArrayModelProperty(metadata, key, { $ref });
            }
            const strippedMetadata = lodash_1.omit(metadata, [
                'type',
                'isArray',
                'collectionFormat',
                'required'
            ]);
            if (Object.keys(strippedMetadata).length === 0) {
                return { name: key, required: metadata.required, $ref };
            }
            return {
                name: key,
                required: metadata.required,
                title: nestedModelName,
                allOf: [{ $ref }, strippedMetadata]
            };
        }
        const metatype = metadata.type && shared_utils_1.isFunction(metadata.type)
            ? metadata.type.name
            : metadata.type;
        const swaggerType = exports.mapTypesToSwaggerTypes(metatype);
        const itemType = metadata.enum ? getEnumType(metadata.enum) : swaggerType;
        if (metadata.isArray) {
            return transformToArrayModelProperty(metadata, key, { type: itemType });
        }
        else if (swaggerType === 'array') {
            const defaultOnArray = 'string';
            return transformToArrayModelProperty(metadata, key, {
                type: defaultOnArray
            });
        }
        else {
            return Object.assign({}, metadata, { name: key, type: itemType });
        }
    });
    const typeDefinition = {
        type: 'object',
        properties: lodash_1.mapValues(lodash_1.keyBy(propertiesWithType, 'name'), property => lodash_1.omit(property, ['name', 'isArray', 'required']))
    };
    const typeDefinitionRequiredFields = propertiesWithType
        .filter(property => property.required != false)
        .map(property => property.name);
    if (typeDefinitionRequiredFields.length > 0) {
        typeDefinition['required'] = typeDefinitionRequiredFields;
    }
    definitions.push({
        [type.name]: typeDefinition
    });
    return type.name;
};
const formDataModelTransformation = type => {
    const { prototype } = type;
    if (!prototype) {
        return {};
    }
    const modelProperties = exploreModelProperties(prototype);
    const data = modelProperties.map(key => {
        const metadata = Reflect.getMetadata(constants_2.DECORATORS.API_MODEL_PROPERTIES, prototype, key) ||
            {};
        const defaultTypes = [String, Boolean, Number];
        if (defaultTypes.indexOf(metadata.type.name)) {
            return {
                name: key,
                type: metadata.type.name.toLowerCase(),
                required: metadata.required,
                in: 'formData'
            };
        }
    });
    return data;
};
const getEnumValues = (e) => {
    if (Array.isArray(e)) {
        return e;
    }
    if (typeof e !== 'object') {
        return [];
    }
    const values = [];
    const uniqueValues = {};
    for (const key in e) {
        const value = e[key];
        if (!uniqueValues.hasOwnProperty(value) &&
            !uniqueValues.hasOwnProperty(key)) {
            values.push(value);
            uniqueValues[value] = value;
        }
    }
    return values;
};
const getEnumType = (values) => {
    const hasString = values.filter(lodash_1.isString).length > 0;
    return hasString ? 'string' : 'number';
};
const mapParamType = (key, consumes) => {
    const keyPair = key.split(':');
    switch (Number(keyPair[0])) {
        case route_paramtypes_enum_1.RouteParamtypes.BODY: {
            const isFormData = ['multipart/form-data', 'application/x-www-form-urlencoded'].indexOf(lodash_1.head(consumes)) > -1;
            if (!lodash_1.isEmpty(consumes) && isFormData)
                return 'formData';
            return 'body';
        }
        case route_paramtypes_enum_1.RouteParamtypes.PARAM:
            return 'path';
        case route_paramtypes_enum_1.RouteParamtypes.QUERY:
            return 'query';
        case route_paramtypes_enum_1.RouteParamtypes.HEADERS:
            return 'header';
        default:
            return DEFAULT_PARAM_TOKEN;
    }
};
const hasSchemaDefinition = param => param.schema;
const omitParamType = param => lodash_1.omit(param, 'type');
const mapParametersTypes = parameters => parameters.map(param => {
    if (hasSchemaDefinition(param)) {
        return omitParamType(param);
    }
    const { type } = param;
    const paramWithStringType = lodash_1.pickBy(Object.assign({}, param, { type: type && shared_utils_1.isFunction(type)
            ? exports.mapTypesToSwaggerTypes(type.name)
            : exports.mapTypesToSwaggerTypes(type) }), lodash_1.negate(shared_utils_1.isUndefined));
    if (paramWithStringType.isArray) {
        return Object.assign({}, paramWithStringType, { type: 'array', items: {
                type: exports.mapTypesToSwaggerTypes(paramWithStringType.type)
            } });
    }
    return paramWithStringType;
});
exports.mapTypesToSwaggerTypes = (type) => {
    if (!(type && type.charAt)) {
        return '';
    }
    return type.charAt(0).toLowerCase() + type.slice(1);
};
const getDefinitionPath = modelName => `#/definitions/${modelName}`;
const mapModelsToDefinitons = (parameters, definitions) => {
    return parameters.map(param => {
        if (!isBodyParameter(param)) {
            return param;
        }
        const isFormData = param.in === 'formData';
        if (isFormData) {
            return formDataModelTransformation(param.type);
        }
        const defaultTypes = [String, Boolean, Number];
        if (shared_utils_1.isFunction(param.type) &&
            defaultTypes.some(defaultType => defaultType === param.type)) {
            return param;
        }
        const modelName = exports.exploreModelDefinition(param.type, definitions);
        const name = param.name ? param.name : modelName;
        const schema = {
            $ref: getDefinitionPath(modelName)
        };
        if (param.isArray) {
            return Object.assign({}, param, { name, schema: {
                    type: 'array',
                    items: schema
                } });
        }
        return Object.assign({}, param, { name,
            schema });
    });
};
