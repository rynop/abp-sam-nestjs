"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const decorators_1 = require("../decorators");
const index_1 = require("../index");
const is_uuid_1 = require("../utils/is-uuid");
let ParseUUIDPipe = class ParseUUIDPipe {
    constructor(options) {
        options = options || {};
        this.version = options.version;
        this.exceptionFactory =
            options.exceptionFactory || (error => new index_1.BadRequestException(error));
    }
    async transform(value, metadata) {
        if (!is_uuid_1.isUUID(value, this.version)) {
            throw this.exceptionFactory(`Validation failed (uuid v${this.version} is expected)`);
        }
        return value;
    }
};
ParseUUIDPipe = __decorate([
    index_1.Injectable(),
    __param(0, decorators_1.Optional()),
    __metadata("design:paramtypes", [Object])
], ParseUUIDPipe);
exports.ParseUUIDPipe = ParseUUIDPipe;
