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
exports.DogeWallet = exports.dogeCoin = void 0;
const bitcoin = __importStar(require("../index"));
const coin_base_1 = require("@okxweb3/coin-base");
const BtcWallet_1 = require("./BtcWallet");
exports.dogeCoin = {
    messagePrefix: 'Dogecoin Signed Message:\n',
    bech32: 'bc',
    bip32: {
        public: 49990397,
        private: 49988504,
    },
    pubKeyHash: 30,
    scriptHash: 22,
    wif: 158,
};
class DogeWallet extends BtcWallet_1.BtcWallet {
    network() {
        return exports.dogeCoin;
    }
    async signTransaction(param) {
        const type = param.data.type || 0;
        if (type === 1) {
            try {
                return Promise.resolve(bitcoin.dogInscribe(exports.dogeCoin, param.data));
            }
            catch (e) {
                return Promise.reject(coin_base_1.SignTxError);
            }
        }
        else if (type === 2) {
            try {
                return Promise.resolve(bitcoin.psbtSign(param.data.psbt, param.privateKey, this.network(), param.data.maximumFeeRate ? param.data.maximumFeeRate : 100000));
            }
            catch (e) {
                return Promise.reject(coin_base_1.SignTxError);
            }
        }
        else {
            return super.signTransaction(param);
        }
    }
    signMessage(param) {
        try {
            const typedMessage = param.data;
            let signature = bitcoin.message.sign(param.privateKey, typedMessage.message, this.network(), exports.dogeCoin.messagePrefix);
            return Promise.resolve(signature);
        }
        catch (e) {
            return Promise.reject(coin_base_1.SignMsgError);
        }
    }
    async verifyMessage(param) {
        try {
            const typedMessage = param.data;
            const ret = bitcoin.message.verify(typedMessage.publicKey, typedMessage.message, param.signature, exports.dogeCoin.messagePrefix);
            return Promise.resolve(ret);
        }
        catch (e) {
            return Promise.reject(coin_base_1.SignMsgError);
        }
    }
}
exports.DogeWallet = DogeWallet;
//# sourceMappingURL=DogeWallet.js.map