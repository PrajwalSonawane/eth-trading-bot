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
exports.convert2LegacyAddress = exports.isCashAddress = exports.ValidateBitcashP2PkHAddress = exports.GetBitcashP2PkHAddressByPublicKey = exports.GetBitcashAddressByPublicKey = exports.GetBitcashAddressByHash = void 0;
const crypto_1 = require("../bitcoinjs-lib/crypto");
const cashAddrJs = __importStar(require("./cashaddr"));
const payments = __importStar(require("../bitcoinjs-lib/payments"));
function GetBitcashAddressByHash(prefix, type, hash) {
    return cashAddrJs.encode(prefix, type, hash);
}
exports.GetBitcashAddressByHash = GetBitcashAddressByHash;
function GetBitcashAddressByPublicKey(prefix, type, publicKey) {
    const hash = (0, crypto_1.hash160)(Buffer.from(publicKey));
    return GetBitcashAddressByHash(prefix, type, hash);
}
exports.GetBitcashAddressByPublicKey = GetBitcashAddressByPublicKey;
function GetBitcashP2PkHAddressByPublicKey(publicKey) {
    const hash = (0, crypto_1.hash160)(Buffer.from(publicKey));
    return GetBitcashAddressByHash("bitcoincash", "P2PKH", hash);
}
exports.GetBitcashP2PkHAddressByPublicKey = GetBitcashP2PkHAddressByPublicKey;
function ValidateBitcashP2PkHAddress(address) {
    try {
        if (address.indexOf(":") === -1) {
            address = "bitcoincash:" + address;
        }
        const { prefix, type, hash } = cashAddrJs.decode(address);
        return type === "P2PKH" && hash.length === 20;
    }
    catch (e) {
        return false;
    }
}
exports.ValidateBitcashP2PkHAddress = ValidateBitcashP2PkHAddress;
function isCashAddress(address) {
    try {
        if (address.startsWith("bitcoincash:")) {
            return true;
        }
        address = "bitcoincash:" + address;
        cashAddrJs.decode(address);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.isCashAddress = isCashAddress;
function convert2LegacyAddress(address, network) {
    if (address.indexOf(":") === -1) {
        address = "bitcoincash:" + address;
    }
    const { type, hash } = cashAddrJs.decode(address);
    if (type == "P2PKH") {
        const result = payments.p2pkh({ hash: Buffer.from(hash), network });
        return result.address;
    }
    else if (type == "P2SH") {
        const result = payments.p2sh({ hash: Buffer.from(hash), network });
        return result.address;
    }
    else {
        throw new Error("convert2LegacyAddress error");
    }
}
exports.convert2LegacyAddress = convert2LegacyAddress;
//# sourceMappingURL=index.js.map