/// <reference types="node" />
export type TransactionFromBuffer = (buffer: Buffer) => Transaction;
export interface Transaction {
    getInputOutputCounts(): {
        inputCount: number;
        outputCount: number;
    };
    addInput(objectArg: any): void;
    addOutput(objectArg: any): void;
    toBuffer(): Buffer;
}
export interface KeyValue {
    key: Buffer;
    value: Buffer;
}
export interface PsbtGlobal extends PsbtGlobalUpdate {
    unsignedTx: Transaction;
    unknownKeyVals?: KeyValue[];
}
export interface PsbtGlobalUpdate {
    globalXpub?: GlobalXpub[];
}
export interface PsbtInput extends PsbtInputUpdate {
    unknownKeyVals?: KeyValue[];
}
export interface PsbtInputUpdate {
    partialSig?: PartialSig[];
    nonWitnessUtxo?: NonWitnessUtxo;
    witnessUtxo?: WitnessUtxo;
    sighashType?: SighashType;
    redeemScript?: RedeemScript;
    witnessScript?: WitnessScript;
    bip32Derivation?: Bip32Derivation[];
    finalScriptSig?: FinalScriptSig;
    finalScriptWitness?: FinalScriptWitness;
    porCommitment?: PorCommitment;
    tapKeySig?: TapKeySig;
    tapScriptSig?: TapScriptSig[];
    tapLeafScript?: TapLeafScript[];
    tapBip32Derivation?: TapBip32Derivation[];
    tapInternalKey?: TapInternalKey;
    tapMerkleRoot?: TapMerkleRoot;
}
export interface PsbtInputExtended extends PsbtInput {
    [index: string]: any;
}
export interface PsbtOutput extends PsbtOutputUpdate {
    unknownKeyVals?: KeyValue[];
}
export interface PsbtOutputUpdate {
    redeemScript?: RedeemScript;
    witnessScript?: WitnessScript;
    bip32Derivation?: Bip32Derivation[];
    tapBip32Derivation?: TapBip32Derivation[];
    tapTree?: TapTree;
    tapInternalKey?: TapInternalKey;
}
export interface PsbtOutputExtended extends PsbtOutput {
    [index: string]: any;
}
export interface GlobalXpub {
    extendedPubkey: Buffer;
    masterFingerprint: Buffer;
    path: string;
}
export interface PartialSig {
    pubkey: Buffer;
    signature: Buffer;
}
export interface Bip32Derivation {
    masterFingerprint: Buffer;
    pubkey: Buffer;
    path: string;
}
export interface WitnessUtxo {
    script: Buffer;
    value: number;
}
export type NonWitnessUtxo = Buffer;
export type SighashType = number;
export type RedeemScript = Buffer;
export type WitnessScript = Buffer;
export type FinalScriptSig = Buffer;
export type FinalScriptWitness = Buffer;
export type PorCommitment = string;
export type TapKeySig = Buffer;
export interface TapScriptSig extends PartialSig {
    leafHash: Buffer;
}
interface TapScript {
    leafVersion: number;
    script: Buffer;
}
export type ControlBlock = Buffer;
export interface TapLeafScript extends TapScript {
    controlBlock: ControlBlock;
}
export interface TapBip32Derivation extends Bip32Derivation {
    leafHashes: Buffer[];
}
export type TapInternalKey = Buffer;
export type TapMerkleRoot = Buffer;
export interface TapLeaf extends TapScript {
    depth: number;
}
export interface TapTree {
    leaves: TapLeaf[];
}
export type TransactionIOCountGetter = (txBuffer: Buffer) => {
    inputCount: number;
    outputCount: number;
};
export interface TransactionInput {
    hash: string | Buffer;
    index: number;
    sequence?: number;
}
export type TransactionInputAdder = (input: TransactionInput, txBuffer: Buffer) => Buffer;
export interface TransactionOutput {
    script: Buffer;
    value: number;
}
export type TransactionOutputAdder = (output: TransactionOutput, txBuffer: Buffer) => Buffer;
export type TransactionVersionSetter = (version: number, txBuffer: Buffer) => Buffer;
export type TransactionLocktimeSetter = (locktime: number, txBuffer: Buffer) => Buffer;
export {};
