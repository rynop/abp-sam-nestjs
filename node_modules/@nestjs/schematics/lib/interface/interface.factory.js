"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const name_parser_1 = require("../../utils/name.parser");
const source_root_helpers_1 = require("../../utils/source-root.helpers");
function main(options) {
    options = transform(options);
    return schematics_1.chain([source_root_helpers_1.mergeSourceRoot(options), schematics_1.mergeWith(generate(options))]);
}
exports.main = main;
function transform(options) {
    const target = Object.assign({}, options);
    if (!target.name) {
        throw new schematics_1.SchematicsException('Option (name) is required.');
    }
    const location = new name_parser_1.NameParser().parse(target);
    target.name = core_1.strings.dasherize(location.name);
    target.path = core_1.strings.dasherize(location.path);
    target.path = target.flat
        ? target.path
        : core_1.join(target.path, target.name);
    return target;
}
function generate(options) {
    return (context) => schematics_1.apply(schematics_1.url('./files'), [
        schematics_1.template(Object.assign({}, core_1.strings, options)),
        schematics_1.move(options.path),
    ])(context);
}
