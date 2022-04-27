/// <reference types="node" />
import stream = require('stream');
import type { TransformOptions } from 'stream';
declare namespace split {
    type Matcher = string | RegExp;
    type Mapper = (line: string) => any;
    interface Options extends TransformOptions {
        maxLength?: number | undefined;
        skipOverflow?: boolean;
    }
}
declare function split(matcher: split.Matcher, Mapper: split.Mapper, options?: split.Options): stream.Transform;
declare function split(mapper: split.Mapper, options?: split.Options): stream.Transform;
declare function split(matcher: split.Matcher, options?: split.Options): stream.Transform;
declare function split(options?: split.Options): stream.Transform;
export = split;
