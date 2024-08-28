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
exports.UsdtTestWallet = exports.UsdtWallet = void 0;
const coin_base_1 = require("@okxweb3/coin-base");
const BtcWallet_1 = require("./BtcWallet");
const bitcoin = __importStar(require("../index"));
class UsdtWallet extends BtcWallet_1.BtcWallet {
    async signTransaction(param) {
        let txHex = null;
        try {
            const privateKey = param.privateKey;
            const utxoTx = (0, BtcWallet_1.convert2UtxoTx)(param.data);
            if (!utxoTx.omni) {
                return Promise.reject(coin_base_1.SignTxError);
            }
            const coinType = (0, BtcWallet_1.number2Hex)(utxoTx.omni.coinType || 31, 8);
            const amount = (0, BtcWallet_1.number2Hex)(utxoTx.omni.amount, 16);
            const script = "6a146f6d6e69" + "0000" + "0000" + coinType + amount;
            const extraOutput = { address: "", amount: 0, omniScript: script };
            utxoTx.outputs.push(extraOutput);
            txHex = bitcoin.signBtc(utxoTx, privateKey, this.network());
            return Promise.resolve(txHex);
        }
        catch (e) {
            return Promise.reject(coin_base_1.SignTxError);
        }
    }
    async estimateFee(param) {
        try {
            const utxoTx = (0, BtcWallet_1.convert2UtxoTx)(param.data);
            if (!utxoTx.omni) {
                return Promise.reject(coin_base_1.EstimateFeeError);
            }
            const coinType = (0, BtcWallet_1.number2Hex)(utxoTx.omni.coinType || 31, 8);
            const amount = (0, BtcWallet_1.number2Hex)(utxoTx.omni.amount, 16);
            const script = "6a146f6d6e69" + "0000" + "0000" + coinType + amount;
            const extraOutput = { address: "", amount: 0, omniScript: script };
            utxoTx.outputs.push(extraOutput);
            const fee = bitcoin.estimateBtcFee(utxoTx, this.network());
            return Promise.resolve(fee);
        }
        catch (e) {
            return Promise.reject(coin_base_1.EstimateFeeError);
        }
    }
    getHardWareRawTransaction(param) {
        try {
            const type = param.data.type || 0;
            const utxoTx = (0, BtcWallet_1.convert2UtxoTx)(param.data);
            if (!utxoTx.omni) {
                return Promise.reject(coin_base_1.SignTxError);
            }
            const coinType = (0, BtcWallet_1.number2Hex)(utxoTx.omni.coinType || 31, 8);
            const amount = (0, BtcWallet_1.number2Hex)(utxoTx.omni.amount, 16);
            const script = "6a146f6d6e69" + "0000" + "0000" + coinType + amount;
            const extraOutput = { address: "", amount: 0, omniScript: script };
            utxoTx.outputs.push(extraOutput);
            let txHex;
            if (type === 2) {
                const change = bitcoin.signBtc(utxoTx, "", this.network(), undefined, true, true);
                const changeUtxo = {
                    address: utxoTx.address,
                    amount: parseInt(change),
                    bip32Derivation: utxoTx.bip32Derivation
                };
                utxoTx.outputs.push(changeUtxo);
                txHex = bitcoin.buildPsbt(utxoTx, this.network());
            }
            else {
                txHex = bitcoin.signBtc(utxoTx, "", this.network(), undefined, true);
            }
            return Promise.resolve(txHex);
        }
        catch (e) {
            return Promise.reject(coin_base_1.GetHardwareRawTransactionError);
        }
    }
}
exports.UsdtWallet = UsdtWallet;
class UsdtTestWallet extends UsdtWallet {
    network() {
        return bitcoin.networks.testnet;
    }
}
exports.UsdtTestWallet = UsdtTestWallet;
//# sourceMappingURL=UsdtWallet.js.map