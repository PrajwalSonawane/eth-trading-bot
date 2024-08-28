import { Network } from '../bitcoinjs-lib';
export declare function GetBitcashAddressByHash(prefix: string, type: string, hash: Uint8Array): string;
export declare function GetBitcashAddressByPublicKey(prefix: string, type: string, publicKey: Uint8Array): string;
export declare function GetBitcashP2PkHAddressByPublicKey(publicKey: Uint8Array): string;
export declare function ValidateBitcashP2PkHAddress(address: string): boolean;
export declare function isCashAddress(address: string): boolean;
export declare function convert2LegacyAddress(address: string, network: Network): string;
