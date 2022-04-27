/// <reference types="node" />
import { Transform } from 'stream';
import type { TransformOptions } from 'stream';
export declare type Matcher = string | RegExp;
export declare type Mapper = (line: string) => any;
export interface Options extends TransformOptions {
    maxLength?: number | undefined;
    skipOverflow?: boolean;
}
declare function split(matcher: Matcher, Mapper: Mapper, options?: Options): Transform;
declare function split(mapper: Mapper, options?: Options): Transform;
declare function split(matcher: Matcher, options?: Options): Transform;
declare function split(options?: Options): Transform;
export default split;
