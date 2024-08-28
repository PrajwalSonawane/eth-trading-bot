/// <reference types="node" />
export declare function varSliceSize(someScript: Buffer): number;
export declare function vectorSize(someVector: Buffer[]): number;
export interface Output {
    script: Buffer;
    value: number;
}
export interface Input {
    hash: Buffer;
    index: number;
    script: Buffer;
    sequence: number;
    witness: Buffer[];
}
export declare class Transaction {
    static readonly DEFAULT_SEQUENCE = 4294967295;
    static readonly SIGHASH_DEFAULT = 0;
    static readonly SIGHASH_ALL = 1;
    static readonly SIGHASH_NONE = 2;
    static readonly SIGHASH_SINGLE = 3;
    static readonly SIGHASH_ANYONECANPAY = 128;
    static readonly SIGHASH_OUTPUT_MASK = 3;
    static readonly SIGHASH_INPUT_MASK = 128;
    static readonly SIGHASH_BITCOINCASHBIP143 = 64;
    static readonly ADVANCED_TRANSACTION_MARKER = 0;
    static readonly ADVANCED_TRANSACTION_FLAG = 1;
    static fromBuffer(buffer: Buffer, _NO_STRICT?: boolean): Transaction;
    static fromHex(hex: string): Transaction;
    static isCoinbaseHash(buffer: Buffer): boolean;
    version: number;
    locktime: number;
    ins: Input[];
    outs: Output[];
    isCoinbase(): boolean;
    addInput(hash: Buffer, index: number, sequence?: number, scriptSig?: Buffer): number;
    addOutput(scriptPubKey: Buffer, value: number): number;
    hasWitnesses(): boolean;
    weight(): number;
    virtualSize(): number;
    dogeByteLength(): number;
    byteLength(_ALLOW_WITNESS?: boolean): number;
    clone(): Transaction;
    hashForSignature(inIndex: number, prevOutScript: Buffer, hashType: number): Buffer;
    hashForCashSignature(inIndex: number, prevOutScript: Buffer, inAmount: number, hashType: number): Buffer;
    hashForWitnessV1(inIndex: number, prevOutScripts: Buffer[], values: number[], hashType: number, leafHash?: Buffer, annex?: Buffer): Buffer;
    hashForWitnessV0(inIndex: number, prevOutScript: Buffer, value: number, hashType: number): Buffer;
    getHash(forWitness?: boolean): Buffer;
    getId(): string;
    toBuffer(buffer?: Buffer, initialOffset?: number): Buffer;
    toHex(): string;
    setInputScript(index: number, scriptSig: Buffer): void;
    setWitness(index: number, witness: Buffer[]): void;
    private __toBuffer;
    hashForWitness(inIndex: number, prevOutScript: Buffer, value: number, hashType: number): Buffer;
}
