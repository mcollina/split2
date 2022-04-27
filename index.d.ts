/// <reference types="node" />
import { Transform } from 'stream';
import type { TransformOptions } from 'stream';
import { StringDecoder } from 'string_decoder';
declare const kLast: unique symbol;
declare const kDecoder: unique symbol;
export declare type Matcher = string | RegExp;
export declare type Mapper = (line: string) => any;
export interface Options extends TransformOptions {
    maxLength?: number | undefined;
    skipOverflow?: boolean;
}
export interface Split2Transform extends Transform {
    [kLast]: string;
    [kDecoder]: StringDecoder;
    matcher: Matcher;
    mapper: Mapper;
    maxLength: number;
    skipOverflow: boolean;
    overflow: boolean;
}
declare function split(matcher?: Matcher, mapper?: Mapper, options?: Options): Split2Transform;
export default split;
