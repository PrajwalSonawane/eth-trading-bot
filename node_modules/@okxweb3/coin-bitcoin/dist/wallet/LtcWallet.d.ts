import { GetDerivedPathParam, SignTxParams, VerifyMessageParams } from "@okxweb3/coin-base";
import { BtcWallet } from "./BtcWallet";
import * as bitcoin from "../index";
export declare const litecoin: bitcoin.Network;
export declare class LtcWallet extends BtcWallet {
    network(): bitcoin.networks.Network;
    getDerivedPath(param: GetDerivedPathParam): Promise<any>;
    signMessage(param: SignTxParams): Promise<string>;
    verifyMessage(param: VerifyMessageParams): Promise<boolean>;
}
