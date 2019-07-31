"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const helpers_1 = require("./helpers");
const initialMetadata = {
    name: '',
    required: true
};
const getCollectionFormatOrDefault = (metadata, defaultValue) => lodash_1.isNil(metadata.collectionFormat) ? defaultValue : metadata.collectionFormat;
exports.ApiImplicitQuery = (metadata) => {
    const param = {
        name: lodash_1.isNil(metadata.name) ? initialMetadata.name : metadata.name,
        in: 'query',
        description: metadata.description,
        required: metadata.required,
        type: metadata.type,
        enum: undefined,
        items: undefined,
        collectionFormat: undefined
    };
    if (metadata.enum) {
        param.type = String;
        param.enum = metadata.enum;
    }
    if (metadata.isArray) {
        param.type = Array;
        if (metadata.enum) {
            param.items = {
                type: 'String',
                enum: metadata.enum
            };
            param.collectionFormat = getCollectionFormatOrDefault(metadata, 'multi');
        }
        else {
            param.collectionFormat = getCollectionFormatOrDefault(metadata, 'csv');
            param.items = {
                type: metadata.type
            };
        }
    }
    return helpers_1.createParamDecorator(param, initialMetadata);
};
