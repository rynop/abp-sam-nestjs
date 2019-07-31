import { ArgumentMetadata } from '../index';
import { PipeTransform } from '../interfaces/features/pipe-transform.interface';
export interface ParseUUIDPipeOptions {
    version?: '3' | '4' | '5';
    exceptionFactory?: (errors: string) => any;
}
export declare class ParseUUIDPipe implements PipeTransform<string> {
    private readonly version;
    protected exceptionFactory: (errors: string) => any;
    constructor(options?: ParseUUIDPipeOptions);
    transform(value: string, metadata: ArgumentMetadata): Promise<string>;
}
