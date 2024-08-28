"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeConverter = void 0;
const varuint = __importStar(require("../varint"));
const bip32Derivation = __importStar(require("./bip32Derivation"));
const isValidBIP340Key = (pubkey) => pubkey.length === 32;
function makeConverter(TYPE_BYTE) {
    const parent = bip32Derivation.makeConverter(TYPE_BYTE, isValidBIP340Key);
    function decode(keyVal) {
        const nHashes = varuint.decode(keyVal.value);
        const nHashesLen = varuint.encodingLength(nHashes);
        const base = parent.decode({
            key: keyVal.key,
            value: keyVal.value.slice(nHashesLen + nHashes * 32),
        });
        const leafHashes = new Array(nHashes);
        for (let i = 0, _offset = nHashesLen; i < nHashes; i++, _offset += 32) {
            leafHashes[i] = keyVal.value.slice(_offset, _offset + 32);
        }
        return { ...base, leafHashes };
    }
    function encode(data) {
        const base = parent.encode(data);
        const nHashesLen = varuint.encodingLength(data.leafHashes.length);
        const nHashesBuf = Buffer.allocUnsafe(nHashesLen);
        varuint.encode(data.leafHashes.length, nHashesBuf);
        const value = Buffer.concat([nHashesBuf, ...data.leafHashes, base.value]);
        return { ...base, value };
    }
    const expected = '{ ' +
        'masterFingerprint: Buffer; ' +
        'pubkey: Buffer; ' +
        'path: string; ' +
        'leafHashes: Buffer[]; ' +
        '}';
    function check(data) {
        return (Array.isArray(data.leafHashes) &&
            data.leafHashes.every((leafHash) => Buffer.isBuffer(leafHash) && leafHash.length === 32) &&
            parent.check(data));
    }
    return {
        decode,
        encode,
        check,
        expected,
        canAddToArray: parent.canAddToArray,
    };
}
exports.makeConverter = makeConverter;
//# sourceMappingURL=tapBip32Derivation.js.map