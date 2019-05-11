import {SpawnOptions} from "child_process";
import {Readable} from "stream";

export declare function run(program: string, args: string[] | string, options?: SpawnOptions, stderr?: boolean)
   : Promise<string>;

export declare function log(program: string, args: string[] | string, options?: SpawnOptions): void;

export declare function script(scriptContents: string): Promise<string>;

export declare function stream(program: string, args: string[] | string, options?: SpawnOptions): Readable;

