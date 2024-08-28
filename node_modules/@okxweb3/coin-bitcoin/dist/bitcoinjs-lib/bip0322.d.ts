import { Network } from './networks';
export declare function signSimple(message: string, address: string, privateKey: string, network?: Network): Promise<string>;
export declare function verifySimple(message: string, address: string, witness: string, publicKey: string, network?: Network): boolean;
