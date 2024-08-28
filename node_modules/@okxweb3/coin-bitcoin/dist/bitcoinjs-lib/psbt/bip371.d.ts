/// <reference types="node" />
import { Taptree } from '../types';
import { PsbtInput, PsbtOutput, TapLeaf } from '../bip174/interfaces';
export declare const toXOnly: (pubKey: Buffer) => Buffer;
export declare function tapScriptFinalizer(inputIndex: number, input: PsbtInput, tapLeafHashToFinalize?: Buffer): {
    finalScriptWitness: Buffer | undefined;
};
export declare function serializeTaprootSignature(sig: Buffer, sighashType?: number): Buffer;
export declare function isTaprootInput(input: PsbtInput): boolean;
export declare function isTaprootOutput(output: PsbtOutput, script?: Buffer): boolean;
export declare function checkTaprootInputFields(inputData: PsbtInput, newInputData: PsbtInput, action: string): void;
export declare function checkTaprootOutputFields(outputData: PsbtOutput, newOutputData: PsbtOutput, action: string): void;
export declare function tweakInternalPubKey(inputIndex: number, input: PsbtInput): Buffer;
export declare function tapTreeToList(tree: Taptree): TapLeaf[];
export declare function tapTreeFromList(leaves?: TapLeaf[]): Taptree;
export declare function checkTaprootInputForSigs(input: PsbtInput, action: string): boolean;
