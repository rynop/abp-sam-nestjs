"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const helpers_1 = require("./helpers");
const initialMetadata = {
    name: '',
    required: true,
    type: String
};
exports.ApiImplicitBody = (metadata) => {
    const [type, isArray] = helpers_1.getTypeIsArrayTuple(metadata.type, metadata.isArray);
    const param = {
        name: lodash_1.isNil(metadata.name) ? initialMetadata.name : metadata.name,
        in: 'body',
        description: metadata.description,
        required: metadata.required,
        type,
        isArray
    };
    return helpers_1.createParamDecorator(param, initialMetadata);
};
