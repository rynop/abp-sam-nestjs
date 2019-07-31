"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const helpers_1 = require("./helpers");
exports.ApiModelProperty = (metadata = {}) => {
    const [type, isArray] = helpers_1.getTypeIsArrayTuple(metadata.type, metadata.isArray);
    return helpers_1.createPropertyDecorator(constants_1.DECORATORS.API_MODEL_PROPERTIES, Object.assign({}, metadata, { type,
        isArray }));
};
exports.ApiModelPropertyOptional = (metadata = {}) => exports.ApiModelProperty(Object.assign({}, metadata, { required: false }));
exports.ApiResponseModelProperty = (metadata = {}) => exports.ApiModelProperty(Object.assign({}, metadata));
