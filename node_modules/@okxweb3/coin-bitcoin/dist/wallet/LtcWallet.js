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
exports.LtcWallet = exports.litecoin = void 0;
const coin_base_1 = require("@okxweb3/coin-base");
const BtcWallet_1 = require("./BtcWallet");
const bitcoin = __importStar(require("../index"));
exports.litecoin = {
    messagePrefix: 'Litecoin Signed Message:\n',
    bech32: 'ltc',
    bip32: {
        public: 0x019da462,
        private: 0x019d9cfe,
    },
    pubKeyHash: 0x30,
    scriptHash: 0x32,
    wif: 0xb0,
};
class LtcWallet extends BtcWallet_1.BtcWallet {
    network() {
        return exports.litecoin;
    }
    async getDerivedPath(param) {
        if (!param.segwitType) {
            return `m/44'/2'/0'/0/${param.index}`;
        }
        if (param.segwitType == coin_base_1.segwitType.SEGWIT_NESTED) {
            return `m/84'/2'/0'/0/${param.index}`;
        }
        else if (param.segwitType == coin_base_1.segwitType.SEGWIT_NESTED_49) {
            return `m/49'/2'/0'/0/${param.index}`;
        }
        else if (param.segwitType == coin_base_1.segwitType.SEGWIT_NATIVE) {
            return `m/84'/2'/0'/0/${param.index}`;
        }
        else {
            return Promise.reject(coin_base_1.DerivePathError);
        }
    }
    signMessage(param) {
        try {
            const typedMessage = param.data;
            let signature = bitcoin.message.sign(param.privateKey, typedMessage.message, this.network(), exports.litecoin.messagePrefix);
            return Promise.resolve(signature);
        }
        catch (e) {
            return Promise.reject(coin_base_1.SignMsgError);
        }
    }
    async verifyMessage(param) {
        try {
            const typedMessage = param.data;
            const ret = bitcoin.message.verify(typedMessage.publicKey, typedMessage.message, param.signature, exports.litecoin.messagePrefix);
            return Promise.resolve(ret);
        }
        catch (e) {
            return Promise.reject(coin_base_1.SignMsgError);
        }
    }
}
exports.LtcWallet = LtcWallet;
//# sourceMappingURL=LtcWallet.js.map