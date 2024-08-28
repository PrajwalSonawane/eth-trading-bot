import { GetDerivedPathParam, MpcTransactionParam, SignTxParams } from "@okxweb3/coin-base";
import { BtcWallet } from "./BtcWallet";
export declare class BsvWallet extends BtcWallet {
    getDerivedPath(param: GetDerivedPathParam): Promise<any>;
    signTransaction(param: SignTxParams): Promise<any>;
    estimateFee(param: SignTxParams): Promise<number>;
    getMPCRawTransaction(param: SignTxParams): Promise<any>;
    getMPCTransaction(param: MpcTransactionParam): Promise<any>;
    getHardWareRawTransaction(param: SignTxParams): Promise<any>;
}
