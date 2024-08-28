import { GetAddressParams, GetDerivedPathParam, MpcTransactionParam, NewAddressParams, SignTxParams, ValidAddressParams } from "@okxweb3/coin-base";
import { BtcWallet } from "./BtcWallet";
export declare class BchWallet extends BtcWallet {
    getDerivedPath(param: GetDerivedPathParam): Promise<any>;
    getNewAddress(param: NewAddressParams): Promise<any>;
    validAddress(param: ValidAddressParams): Promise<any>;
    signTransaction(param: SignTxParams): Promise<any>;
    estimateFee(param: SignTxParams): Promise<number>;
    getMPCRawTransaction(param: SignTxParams): Promise<any>;
    getAddressByPublicKey(param: GetAddressParams): Promise<string>;
    getMPCTransaction(param: MpcTransactionParam): Promise<any>;
    getHardWareRawTransaction(param: SignTxParams): Promise<any>;
}
