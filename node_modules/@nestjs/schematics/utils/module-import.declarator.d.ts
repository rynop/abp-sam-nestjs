import { DeclarationOptions } from './module.declarator';
import { PathSolver } from './path.solver';
export declare class ModuleImportDeclarator {
    private solver;
    constructor(solver?: PathSolver);
    declare(content: string, options: DeclarationOptions): string;
    private findImports;
    private findOtherLines;
    private buildLineToInsert;
    private computeRelativePath;
}
