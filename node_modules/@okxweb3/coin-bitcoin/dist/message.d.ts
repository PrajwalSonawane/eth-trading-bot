/// <reference types="node" />
import { Network } from './bitcoinjs-lib';
export declare function magicHash(message: string, messagePrefix?: string): Uint8Array;
export declare function toCompact(i: number, signature: Uint8Array, compressed: boolean): Buffer;
export declare function sign(wifPrivate: string, message: string, network?: Network | Network[], messagePrefix?: string): string;
export declare function verify(publicKey: string, message: string, sig: string, messagePrefix?: string): boolean;
export declare function getMPCSignedMessage(hash: string, sig: string, publicKey: string): string;
export declare function verifyWithAddress(address: string, message: string, sig: string, messagePrefix?: string): boolean;
