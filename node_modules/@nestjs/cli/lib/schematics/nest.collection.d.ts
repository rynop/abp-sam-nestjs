import { AbstractRunner } from '../runners';
import { AbstractCollection } from './abstract.collection';
import { SchematicOption } from './schematic.option';
export interface Schematic {
    name: string;
    alias: string;
}
export declare class NestCollection extends AbstractCollection {
    private static schematics;
    constructor(runner: AbstractRunner);
    execute(name: string, options: SchematicOption[]): Promise<void>;
    static getSchematics(): Schematic[];
    private validate;
}
