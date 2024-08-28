import { SignTxParams } from "@okxweb3/coin-base";
import { BtcWallet } from "./BtcWallet";
import * as bitcoin from "../index";
export declare class UsdtWallet extends BtcWallet {
    signTransaction(param: SignTxParams): Promise<any>;
    estimateFee(param: SignTxParams): Promise<number>;
    getHardWareRawTransaction(param: SignTxParams): Promise<any>;
}
export declare class UsdtTestWallet extends UsdtWallet {
    network(): bitcoin.networks.Network;
}
