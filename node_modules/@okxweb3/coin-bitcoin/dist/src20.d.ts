import * as bitcoin from "./bitcoinjs-lib";
import { InscriptionData, PrevOutput } from "./inscribe";
export type SrcInscriptionRequest = {
    commitTxPrevOutputList: PrevOutput[];
    commitFeeRate: number;
    inscriptionData: InscriptionData;
    revealOutValue: number;
    changeAddress: string;
    minChangeValue?: number;
};
export declare class SrcInscriptionTool {
    network: bitcoin.Network;
    revealTxs: bitcoin.Transaction[];
    commitTx: bitcoin.Transaction;
    commitTxPrevOutputFetcher: number[];
    revealTxPrevOutputFetcher: number[];
    mustCommitTxFee: number;
    mustRevealTxFees: number[];
    commitAddrs: string[];
    static newSrcInscriptionTool(network: bitcoin.Network, request: SrcInscriptionRequest): SrcInscriptionTool;
    buildCommitTx(network: bitcoin.Network, inscriptionData: InscriptionData, revealOutValue: number, commitTxPrevOutputList: PrevOutput[], changeAddress: string, commitFeeRate: number, minChangeValue: number): boolean;
    signCommitTx(commitTxPrevOutputList: PrevOutput[]): void;
    calculateFee(): {
        commitTxFee: number;
        revealTxFees: number[];
    };
}
export declare function srcInscribe(network: bitcoin.Network, request: SrcInscriptionRequest): {
    commitAddrs: string[];
    commitTxFee: number;
    revealTxFees: number[];
    commitTx: string;
    revealTxs: string[];
};
