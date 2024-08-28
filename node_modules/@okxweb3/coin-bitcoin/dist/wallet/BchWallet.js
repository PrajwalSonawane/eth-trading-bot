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
exports.BchWallet = void 0;
const coin_base_1 = require("@okxweb3/coin-base");
const crypto_lib_1 = require("@okxweb3/crypto-lib");
const BtcWallet_1 = require("./BtcWallet");
const bitcoin = __importStar(require("../index"));
class BchWallet extends BtcWallet_1.BtcWallet {
    async getDerivedPath(param) {
        return `m/44'/145'/0'/0/${param.index}`;
    }
    async getNewAddress(param) {
        try {
            let network = this.network();
            let privateKey = param.privateKey;
            const publicKey = bitcoin.wif2Public(privateKey, network);
            const address = bitcoin.GetBitcashP2PkHAddressByPublicKey(publicKey);
            const addressWithoutPrefix = address.replace("bitcoincash:", "");
            let data = {
                address: addressWithoutPrefix || "",
                publicKey: crypto_lib_1.base.toHex(publicKey)
            };
            return Promise.resolve(data);
        }
        catch (e) {
            return Promise.reject(coin_base_1.NewAddressError);
        }
    }
    async validAddress(param) {
        let isValid = false;
        try {
            let network = this.network();
            let outputScript = bitcoin.address.toOutputScript(param.address, network);
            if (outputScript) {
                isValid = true;
            }
        }
        catch (e) {
        }
        if (!isValid) {
            isValid = bitcoin.ValidateBitcashP2PkHAddress(param.address);
        }
        let data = {
            isValid: isValid,
            address: param.address
        };
        return Promise.resolve(data);
    }
    async signTransaction(param) {
        let txHex = null;
        try {
            const privateKey = param.privateKey;
            const utxoTx = (0, BtcWallet_1.convert2UtxoTx)(param.data);
            utxoTx.outputs.forEach((it) => {
                if (bitcoin.isCashAddress(it.address)) {
                    it.address = bitcoin.convert2LegacyAddress(it.address, this.network());
                }
            });
            if (bitcoin.isCashAddress(utxoTx.address)) {
                utxoTx.address = bitcoin.convert2LegacyAddress(utxoTx.address, this.network());
            }
            txHex = bitcoin.signBch(utxoTx, privateKey, this.network());
            return Promise.resolve(txHex);
        }
        catch (e) {
            return Promise.reject(coin_base_1.SignTxError);
        }
    }
    async estimateFee(param) {
        try {
            const utxoTx = (0, BtcWallet_1.convert2UtxoTx)(param.data);
            utxoTx.outputs.forEach((it) => {
                if (bitcoin.isCashAddress(it.address)) {
                    it.address = bitcoin.convert2LegacyAddress(it.address, this.network());
                }
            });
            if (bitcoin.isCashAddress(utxoTx.address)) {
                utxoTx.address = bitcoin.convert2LegacyAddress(utxoTx.address, this.network());
            }
            const fee = bitcoin.estimateBchFee(utxoTx, this.network());
            return Promise.resolve(fee);
        }
        catch (e) {
            return Promise.reject(coin_base_1.EstimateFeeError);
        }
    }
    getMPCRawTransaction(param) {
        try {
            const utxoTx = (0, BtcWallet_1.convert2UtxoTx)(param.data);
            utxoTx.outputs.forEach((it) => {
                if (bitcoin.isCashAddress(it.address)) {
                    it.address = bitcoin.convert2LegacyAddress(it.address, this.network());
                }
            });
            if (bitcoin.isCashAddress(utxoTx.address)) {
                utxoTx.address = bitcoin.convert2LegacyAddress(utxoTx.address, this.network());
            }
            const hash = [];
            const hex = bitcoin.signBch(utxoTx, "", this.network(), hash);
            const data = {
                raw: hex,
                hash: hash
            };
            return Promise.resolve(data);
        }
        catch (e) {
            return Promise.reject(coin_base_1.GetMpcRawTransactionError);
        }
    }
    getAddressByPublicKey(param) {
        const publicKey = crypto_lib_1.base.fromHex(param.publicKey);
        const address = bitcoin.GetBitcashP2PkHAddressByPublicKey(publicKey);
        return Promise.resolve(address.replace("bitcoincash:", ""));
    }
    getMPCTransaction(param) {
        try {
            const hex = bitcoin.getMPCTransaction(param.raw, param.sigs, true);
            return Promise.resolve(hex);
        }
        catch (e) {
            return Promise.reject(coin_base_1.GetMpcTransactionError);
        }
    }
    getHardWareRawTransaction(param) {
        try {
            const utxoTx = (0, BtcWallet_1.convert2UtxoTx)(param.data);
            utxoTx.outputs.forEach((it) => {
                if (bitcoin.isCashAddress(it.address)) {
                    it.address = bitcoin.convert2LegacyAddress(it.address, this.network());
                }
            });
            if (bitcoin.isCashAddress(utxoTx.address)) {
                utxoTx.address = bitcoin.convert2LegacyAddress(utxoTx.address, this.network());
            }
            const hex = bitcoin.signBch(utxoTx, "", this.network(), undefined, true);
            return Promise.resolve(hex);
        }
        catch (e) {
            return Promise.reject(coin_base_1.GetHardwareRawTransactionError);
        }
    }
}
exports.BchWallet = BchWallet;
//# sourceMappingURL=BchWallet.js.map