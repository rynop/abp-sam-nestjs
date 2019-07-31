"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_enum_1 = require("@nestjs/common/enums/http-status.enum");
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const helpers_1 = require("./helpers");
exports.ApiResponse = (metadata) => {
    const [type, isArray] = helpers_1.getTypeIsArrayTuple(metadata.type, metadata.isArray);
    metadata.type = type;
    metadata.isArray = isArray;
    metadata.description = metadata.description ? metadata.description : '';
    const groupedMetadata = { [metadata.status]: lodash_1.omit(metadata, 'status') };
    return (target, key, descriptor) => {
        if (descriptor) {
            const responses = Reflect.getMetadata(constants_1.DECORATORS.API_RESPONSE, descriptor.value) || {};
            Reflect.defineMetadata(constants_1.DECORATORS.API_RESPONSE, Object.assign({}, responses, groupedMetadata), descriptor.value);
            return descriptor;
        }
        const responses = Reflect.getMetadata(constants_1.DECORATORS.API_RESPONSE, target) || {};
        Reflect.defineMetadata(constants_1.DECORATORS.API_RESPONSE, Object.assign({}, responses, groupedMetadata), target);
        return target;
    };
};
exports.ApiOkResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.OK }));
exports.ApiCreatedResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.CREATED }));
exports.ApiAcceptedResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.ACCEPTED }));
exports.ApiNoContentResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.NO_CONTENT }));
exports.ApiMovedPermanentlyResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.MOVED_PERMANENTLY }));
exports.ApiBadRequestResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.BAD_REQUEST }));
exports.ApiUnauthorizedResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.UNAUTHORIZED }));
exports.ApiTooManyRequestsResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.TOO_MANY_REQUESTS }));
exports.ApiNotFoundResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.NOT_FOUND }));
exports.ApiInternalServerErrorResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.INTERNAL_SERVER_ERROR }));
exports.ApiBadGatewayResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.BAD_GATEWAY }));
exports.ApiConflictResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.CONFLICT }));
exports.ApiForbiddenResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.FORBIDDEN }));
exports.ApiGatewayTimeoutResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.GATEWAY_TIMEOUT }));
exports.ApiGoneResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.GONE }));
exports.ApiMethodNotAllowedResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.METHOD_NOT_ALLOWED }));
exports.ApiNotAcceptableResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.NOT_ACCEPTABLE }));
exports.ApiNotImplementedResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.NOT_IMPLEMENTED }));
exports.ApiPayloadTooLargeResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.PAYLOAD_TOO_LARGE }));
exports.ApiRequestTimeoutResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.REQUEST_TIMEOUT }));
exports.ApiServiceUnavailableResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.SERVICE_UNAVAILABLE }));
exports.ApiUnprocessableEntityResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.UNPROCESSABLE_ENTITY }));
exports.ApiUnsupportedMediaTypeResponse = (metadata) => exports.ApiResponse(Object.assign({}, metadata, { status: http_status_enum_1.HttpStatus.UNSUPPORTED_MEDIA_TYPE }));
