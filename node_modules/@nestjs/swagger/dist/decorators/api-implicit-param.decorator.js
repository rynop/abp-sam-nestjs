"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const helpers_1 = require("./helpers");
const initialMetadata = {
    name: '',
    required: true
};
exports.ApiImplicitParam = (metadata) => {
    const param = {
        name: lodash_1.isNil(metadata.name) ? initialMetadata.name : metadata.name,
        in: 'path',
        description: metadata.description,
        required: metadata.required,
        type: metadata.type,
        enum: undefined
    };
    if (metadata.enum) {
        param.type = String;
        param.enum = metadata.enum;
    }
    return helpers_1.createParamDecorator(param, initialMetadata);
};
