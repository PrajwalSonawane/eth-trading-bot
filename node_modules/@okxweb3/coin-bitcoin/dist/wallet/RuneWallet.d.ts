import { SignTxParams } from "@okxweb3/coin-base";
import { BtcWallet } from "./BtcWallet";
import * as bitcoin from "../index";
import { utxoTx } from "../index";
export declare class RuneWallet extends BtcWallet {
    convert2RuneTx(paramData: any): utxoTx;
    signTransaction(param: SignTxParams): Promise<any>;
    private getOpReturnOutput;
    estimateFee(param: SignTxParams): Promise<number>;
}
export declare class RuneTestWallet extends RuneWallet {
    network(): bitcoin.Network;
}
