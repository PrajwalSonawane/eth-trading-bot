/// <reference types="node" />
export declare function decodeRaw(buffer: Buffer, version?: number): {
    version: number;
    privateKey: Buffer;
    compressed: boolean;
};
export declare function encodeRaw(version: number, privateKey: Buffer, compressed: boolean): Buffer;
export declare function decode(str: string, version?: number): {
    version: number;
    privateKey: Buffer;
    compressed: boolean;
};
export declare function encode(version: any, privateKey: Buffer, compressed: boolean): string;
