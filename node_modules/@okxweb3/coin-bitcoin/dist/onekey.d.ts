import { utxoTx } from "./type";
import { Network } from "./bitcoinjs-lib/networks";
type Input = {
    address_n: number[];
    prev_index: number;
    prev_hash: string;
    amount: string;
    script_type: string;
};
type Output = {
    address_n?: number[];
    address?: string;
    amount: string;
    script_type: string;
    op_return_data?: string;
};
type RefInput = {
    prev_hash: string;
    prev_index: number;
    script_sig: string;
    sequence: number;
};
type RefOutput = {
    amount: number;
    script_pubkey: string;
};
type RefTx = {
    hash: string;
    inputs: RefInput[];
    bin_outputs: RefOutput[];
    lock_time: number;
    version: number;
};
export type OneKeyBtcTx = {
    inputs: Input[];
    outputs: Output[];
    refTxs: RefTx[];
    coin: string;
};
export declare function oneKeyBuildBtcTx(txData: utxoTx, network?: Network): OneKeyBtcTx;
export {};
