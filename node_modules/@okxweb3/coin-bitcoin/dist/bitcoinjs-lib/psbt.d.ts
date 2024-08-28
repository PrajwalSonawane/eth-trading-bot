/// <reference types="node" />
import { Psbt as PsbtBase } from './bip174/psbt';
import { KeyValue, PsbtGlobalUpdate, PsbtInput, PsbtInputUpdate, PsbtOutput, PsbtOutputUpdate } from './bip174/interfaces';
import { Network } from './networks';
import { Transaction } from './transaction';
export interface TransactionInput {
    hash: string | Buffer;
    index: number;
    sequence?: number;
}
export interface PsbtTxInput extends TransactionInput {
    hash: Buffer;
}
export interface TransactionOutput {
    script: Buffer;
    value: number;
}
export interface PsbtTxOutput extends TransactionOutput {
    address: string | undefined;
}
export type ValidateSigFunction = (pubkey: Buffer, msghash: Buffer, signature: Buffer) => boolean;
export declare class Psbt {
    readonly data: PsbtBase;
    static fromBase64(data: string, opts?: PsbtOptsOptional): Psbt;
    static fromHex(data: string, opts?: PsbtOptsOptional): Psbt;
    static fromBuffer(buffer: Buffer, opts?: PsbtOptsOptional): Psbt;
    private __CACHE;
    private opts;
    constructor(opts?: PsbtOptsOptional, data?: PsbtBase);
    get inputCount(): number;
    get version(): number;
    set version(version: number);
    get locktime(): number;
    set locktime(locktime: number);
    get txInputs(): PsbtTxInput[];
    get txOutputs(): PsbtTxOutput[];
    combine(...those: Psbt[]): this;
    clone(): Psbt;
    setMaximumFeeRate(satoshiPerByte: number): void;
    setVersion(version: number): this;
    setLocktime(locktime: number): this;
    setInputSequence(inputIndex: number, sequence: number): this;
    addInputs(inputDatas: PsbtInputExtended[]): this;
    addInput(inputData: PsbtInputExtended): this;
    addOutputs(outputDatas: PsbtOutputExtended[]): this;
    addOutput(outputData: PsbtOutputExtended): this;
    extractTransaction(disableFeeCheck?: boolean): Transaction;
    getFeeRate(): number;
    getFee(): number;
    finalizeAllInputs(): this;
    finalizeInput(inputIndex: number, finalScriptsFunc?: FinalScriptsFunc | FinalTaprootScriptsFunc): this;
    finalizeTaprootInput(inputIndex: number, tapLeafHashToFinalize?: Buffer, finalScriptsFunc?: FinalTaprootScriptsFunc): this;
    private _finalizeInput;
    private _finalizeTaprootInput;
    getInputType(inputIndex: number): AllScriptType;
    inputHasPubkey(inputIndex: number, pubkey: Buffer): boolean;
    inputHasHDKey(inputIndex: number, root: HDSigner): boolean;
    outputHasPubkey(outputIndex: number, pubkey: Buffer): boolean;
    outputHasHDKey(outputIndex: number, root: HDSigner): boolean;
    validateSignaturesOfAllInputs(validator: ValidateSigFunction): boolean;
    validateSignaturesOfInput(inputIndex: number, validator: ValidateSigFunction, pubkey?: Buffer): boolean;
    private _validateSignaturesOfInput;
    private validateSignaturesOfTaprootInput;
    signAllInputsHD(hdKeyPair: HDSigner, sighashTypes?: number[]): this;
    signAllInputsHDAsync(hdKeyPair: HDSigner | HDSignerAsync, sighashTypes?: number[]): Promise<void>;
    signInputHD(inputIndex: number, hdKeyPair: HDSigner, sighashTypes?: number[]): this;
    signInputHDAsync(inputIndex: number, hdKeyPair: HDSigner | HDSignerAsync, sighashTypes?: number[]): Promise<void>;
    signAllInputs(keyPair: Signer, sighashTypes?: number[]): this;
    signAllInputsAsync(keyPair: Signer | SignerAsync, sighashTypes?: number[]): Promise<void>;
    signInput(inputIndex: number, keyPair: Signer, sighashTypes?: number[]): this;
    signTaprootInput(inputIndex: number, keyPair: Signer, tapLeafHashToSign?: Buffer, sighashTypes?: number[]): this;
    getHashAndSighashType(inputIndex: number, publicKey: Buffer, sighashTypes?: number[]): {
        hash: Buffer;
        sighashType: number;
    };
    private _signInput;
    private _signTaprootInput;
    signInputAsync(inputIndex: number, keyPair: Signer | SignerAsync, sighashTypes?: number[]): Promise<void>;
    signTaprootInputAsync(inputIndex: number, keyPair: Signer | SignerAsync, tapLeafHash?: Buffer, sighashTypes?: number[]): Promise<void>;
    private _signInputAsync;
    private _signTaprootInputAsync;
    private checkTaprootHashesForSig;
    toBuffer(): Buffer;
    toHex(): string;
    toBase64(): string;
    updateGlobal(updateData: PsbtGlobalUpdate): this;
    updateInput(inputIndex: number, updateData: PsbtInputUpdate): this;
    updateOutput(outputIndex: number, updateData: PsbtOutputUpdate): this;
    addUnknownKeyValToGlobal(keyVal: KeyValue): this;
    addUnknownKeyValToInput(inputIndex: number, keyVal: KeyValue): this;
    addUnknownKeyValToOutput(outputIndex: number, keyVal: KeyValue): this;
    clearFinalizedInput(inputIndex: number): this;
    verify(pubBuf: Buffer, witness: Buffer): boolean;
}
interface PsbtCache {
    __NON_WITNESS_UTXO_TX_CACHE: Transaction[];
    __NON_WITNESS_UTXO_BUF_CACHE: Buffer[];
    __TX_IN_CACHE: {
        [index: string]: number;
    };
    __TX: Transaction;
    __FEE_RATE?: number;
    __FEE?: number;
    __EXTRACTED_TX?: Transaction;
    __UNSAFE_SIGN_NONSEGWIT: boolean;
}
interface PsbtOptsOptional {
    network?: Network;
    maximumFeeRate?: number;
}
export interface PsbtInputExtended extends PsbtInput, TransactionInput {
}
export type PsbtOutputExtended = PsbtOutputExtendedAddress | PsbtOutputExtendedScript;
interface PsbtOutputExtendedAddress extends PsbtOutput {
    address: string;
    value: number;
}
interface PsbtOutputExtendedScript extends PsbtOutput {
    script: Buffer;
    value: number;
}
interface HDSignerBase {
    publicKey: Buffer;
    fingerprint: Buffer;
}
export interface HDSigner extends HDSignerBase {
    derivePath(path: string): HDSigner;
    sign(hash: Buffer): Buffer;
}
export interface HDSignerAsync extends HDSignerBase {
    derivePath(path: string): HDSignerAsync;
    sign(hash: Buffer): Promise<Buffer>;
}
export interface Signer {
    publicKey: Buffer;
    network?: any;
    sign(hash: Buffer, lowR?: boolean): Buffer;
    signSchnorr?(hash: Buffer): Buffer;
    getPublicKey?(): Buffer;
}
export interface SignerAsync {
    publicKey: Buffer;
    network?: any;
    sign(hash: Buffer, lowR?: boolean): Promise<Buffer>;
    signSchnorr?(hash: Buffer): Promise<Buffer>;
    getPublicKey?(): Buffer;
}
type FinalScriptsFunc = (inputIndex: number, input: PsbtInput, script: Buffer, isSegwit: boolean, isP2SH: boolean, isP2WSH: boolean) => {
    finalScriptSig: Buffer | undefined;
    finalScriptWitness: Buffer | undefined;
};
type FinalTaprootScriptsFunc = (inputIndex: number, input: PsbtInput, tapLeafHashToFinalize?: Buffer) => {
    finalScriptWitness: Buffer | undefined;
};
export declare function getHashAndSighashType(inputs: PsbtInput[], inputIndex: number, pubkey: Buffer, cache: PsbtCache, sighashTypes: number[]): {
    hash: Buffer;
    sighashType: number;
};
type AllScriptType = 'witnesspubkeyhash' | 'pubkeyhash' | 'multisig' | 'pubkey' | 'nonstandard' | 'p2sh-witnesspubkeyhash' | 'p2sh-pubkeyhash' | 'p2sh-multisig' | 'p2sh-pubkey' | 'p2sh-nonstandard' | 'p2wsh-pubkeyhash' | 'p2wsh-multisig' | 'p2wsh-pubkey' | 'p2wsh-nonstandard' | 'p2sh-p2wsh-pubkeyhash' | 'p2sh-p2wsh-multisig' | 'p2sh-p2wsh-pubkey' | 'p2sh-p2wsh-nonstandard';
export {};
