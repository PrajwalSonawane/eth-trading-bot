import * as bitcoin from "../index";
import { SignTxParams, VerifyMessageParams } from "@okxweb3/coin-base";
import { BtcWallet } from "./BtcWallet";
export declare const dogeCoin: bitcoin.Network;
export declare class DogeWallet extends BtcWallet {
    network(): bitcoin.networks.Network;
    signTransaction(param: SignTxParams): Promise<any>;
    signMessage(param: SignTxParams): Promise<string>;
    verifyMessage(param: VerifyMessageParams): Promise<boolean>;
}
