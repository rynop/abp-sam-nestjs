"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const defaults_1 = require("../defaults");
function main(options) {
    return schematics_1.mergeWith(generate(transform(options)));
}
exports.main = main;
function transform(options) {
    const target = Object.assign({}, options);
    target.language =
        target.language !== undefined ? target.language : defaults_1.DEFAULT_LANGUAGE;
    target.collection =
        target.collection !== undefined ? target.collection : '@nestjs/schematics';
    return target;
}
function generate(options) {
    return schematics_1.apply(schematics_1.url(core_1.join('./files', options.language)), [
        schematics_1.template(Object.assign({}, core_1.strings, options)),
        schematics_1.move(options.project),
    ]);
}
