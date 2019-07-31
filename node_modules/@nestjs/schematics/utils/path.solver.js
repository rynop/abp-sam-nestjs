"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
class PathSolver {
    constructor() { }
    relative(from, to) {
        const placeholder = '/placeholder';
        const relativeDir = core_1.relative(core_1.dirname((placeholder + from)), core_1.dirname((placeholder + to)));
        return (relativeDir.startsWith('.')
            ? relativeDir
            : './' + relativeDir).concat(relativeDir.length === 0 ? core_1.basename(to) : '/' + core_1.basename(to));
    }
}
exports.PathSolver = PathSolver;
