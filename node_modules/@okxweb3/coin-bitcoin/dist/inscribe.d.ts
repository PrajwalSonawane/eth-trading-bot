/// <reference types="node" />
import * as bitcoin from "./bitcoinjs-lib";
export type InscriptionData = {
    contentType: string;
    body: string | Buffer;
    revealAddr: string;
};
export type PrevOutput = {
    txId: string;
    vOut: number;
    amount: number;
    address: string;
    privateKey: string;
    publicKey?: string;
};
export type InscriptionRequest = {
    commitTxPrevOutputList: PrevOutput[];
    commitFeeRate: number;
    revealFeeRate: number;
    inscriptionDataList: InscriptionData[];
    revealOutValue: number;
    changeAddress: string;
    minChangeValue?: number;
    shareData?: string;
    masterPublicKey?: string;
    chainCode?: string;
    commitTx?: string;
    signatureList?: string[];
};
export type InscribeTxs = {
    commitTx: string;
    revealTxs: string[];
    commitTxFee: number;
    revealTxFees: number[];
    commitAddrs: string[];
};
export type TxOut = {
    pkScript: Buffer;
    value: number;
};
type InscriptionTxCtxData = {
    privateKey: Buffer;
    inscriptionScript: Buffer;
    commitTxAddress: string;
    commitTxAddressPkScript: Buffer;
    witness: Buffer[];
    hash: Buffer;
    revealTxPrevOutput: TxOut;
    revealPkScript: Buffer;
};
export declare class InscriptionTool {
    network: bitcoin.Network;
    inscriptionTxCtxDataList: InscriptionTxCtxData[];
    revealTxs: bitcoin.Transaction[];
    commitTx: bitcoin.Transaction;
    commitTxPrevOutputFetcher: number[];
    revealTxPrevOutputFetcher: number[];
    mustCommitTxFee: number;
    mustRevealTxFees: number[];
    commitAddrs: string[];
    static newInscriptionTool(network: bitcoin.Network, request: InscriptionRequest): InscriptionTool;
    buildEmptyRevealTx(network: bitcoin.Network, revealOutValue: number, revealFeeRate: number): number;
    buildCommitTx(network: bitcoin.Network, commitTxPrevOutputList: PrevOutput[], changeAddress: string, totalRevealPrevOutputValue: number, commitFeeRate: number, minChangeValue: number): boolean;
    signCommitTx(commitTxPrevOutputList: PrevOutput[]): void;
    completeRevealTx(): void;
    calculateFee(): {
        commitTxFee: number;
        revealTxFees: number[];
    };
}
export declare function inscribe(network: bitcoin.Network, request: InscriptionRequest): {
    commitAddrs: string[];
    commitTxFee: number;
    revealTxFees: number[];
    commitTx: string;
    revealTxs: string[];
};
export declare function inscribeForMPCUnsigned(request: InscriptionRequest, network: bitcoin.Network, unsignedCommitTxHash?: Buffer, signedCommitTxHash?: Buffer): {
    signHashList: string[];
    commitTx: string;
    revealTxs: string[];
    commitTxFee: number;
    revealTxFees: number[];
    commitAddrs: string[];
};
export declare function inscribeForMPCSigned(request: InscriptionRequest, network: bitcoin.Network): {
    signHashList: null;
    commitTx: string;
    revealTxs: string[];
    commitTxFee: number;
    revealTxFees: number[];
    commitAddrs: string[];
};
export {};
