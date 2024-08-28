export declare function encode(prefix: string, type: string, hash: Uint8Array): string;
export declare function decode(address: string): {
    prefix: string;
    type: string;
    hash: Uint8Array;
};
