/// <reference types="node" />
import * as bitcoin from "./bitcoinjs-lib";
import { InscriptionData, PrevOutput, TxOut } from "./inscribe";
export declare const CHANGE_OUTPUT_MAX_SIZE: number;
export type DogInscriptionRequest = {
    commitTxPrevOutputList: PrevOutput[];
    commitFeeRate: number;
    revealFeeRate: number;
    inscriptionData: InscriptionData;
    revealOutValue: number;
    changeAddress: string;
    minChangeValue?: number;
};
type DogInscriptionTxCtxData = {
    privateKey: Buffer;
    inscriptionScript?: Buffer;
    redeemScript?: Buffer;
    commitTxAddress?: string;
    commitTxAddressPkScript?: Buffer;
    hash?: Buffer;
    revealTxPrevOutput?: TxOut;
    revealPkScript?: Buffer;
};
export type Chunk = {
    buf: Buffer;
    len: number;
    opcodenum: number;
};
export declare function bufferToBuffer(b: Buffer): Buffer;
export declare function bufferToChunk(b: Buffer): Chunk;
export declare class DogScript {
    chunks: Chunk[];
    total(): number;
    toBuffer(): Buffer;
}
export declare class DogInscriptionTool {
    network: bitcoin.Network;
    inscriptionTxCtxDataList: DogInscriptionTxCtxData[];
    revealTxs: bitcoin.Transaction[];
    commitTx: bitcoin.Transaction;
    commitTxPrevOutputFetcher: number[];
    revealTxPrevOutputFetcher: number[];
    mustCommitTxFee: number;
    mustRevealTxFees: number[];
    commitAddrs: string[];
    fromAddr: string;
    revealAddr: string;
    static newDogInscriptionTool(network: bitcoin.Network, request: DogInscriptionRequest): DogInscriptionTool;
    buildEmptyRevealTxs(network: bitcoin.Network, revealOutValue: number, revealFeeRate: number): number;
    buildCommitTx(network: bitcoin.Network, commitTxPrevOutputList: PrevOutput[], changeAddress: string, totalRevealPrevOutputValue: number, revealOutValue: number, commitFeeRate: number, minChangeValue: number): boolean;
    signCommitTx(commitTxPrevOutputList: PrevOutput[]): void;
    completeRevealTx(): void;
    calculateFee(): {
        commitTxFee: number;
        revealTxFees: number[];
    };
}
export declare function dogInscribe(network: bitcoin.Network, request: DogInscriptionRequest): {
    commitAddrs: string[];
    commitTxFee: number;
    revealTxFees: number[];
    commitTx: string;
    revealTxs: string[];
};
export {};
