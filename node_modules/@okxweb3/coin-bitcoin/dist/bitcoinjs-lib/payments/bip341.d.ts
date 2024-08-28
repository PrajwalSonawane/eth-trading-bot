/// <reference types="node" />
import { Tapleaf, Taptree } from '../types';
export declare const LEAF_VERSION_TAPSCRIPT = 192;
export declare const MAX_TAPTREE_DEPTH = 128;
interface HashLeaf {
    hash: Buffer;
}
interface HashBranch {
    hash: Buffer;
    left: HashTree;
    right: HashTree;
}
interface TweakedPublicKey {
    parity: number;
    x: Buffer;
}
export type HashTree = HashLeaf | HashBranch;
export declare function rootHashFromPath(controlBlock: Buffer, leafHash: Buffer): Buffer;
export declare function toHashTree(scriptTree: Taptree): HashTree;
export declare function findScriptPath(node: HashTree, hash: Buffer): Buffer[] | undefined;
export declare function tapleafHash(leaf: Tapleaf): Buffer;
export declare function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer;
export declare function tweakKey(pubKey: Buffer, h: Buffer | undefined): TweakedPublicKey | null;
export {};
