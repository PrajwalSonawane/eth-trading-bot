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
exports.outputs = exports.inputs = exports.globals = void 0;
const typeFields_1 = require("../typeFields");
const globalXpub = __importStar(require("./global/globalXpub"));
const unsignedTx = __importStar(require("./global/unsignedTx"));
const finalScriptSig = __importStar(require("./input/finalScriptSig"));
const finalScriptWitness = __importStar(require("./input/finalScriptWitness"));
const nonWitnessUtxo = __importStar(require("./input/nonWitnessUtxo"));
const partialSig = __importStar(require("./input/partialSig"));
const porCommitment = __importStar(require("./input/porCommitment"));
const sighashType = __importStar(require("./input/sighashType"));
const tapKeySig = __importStar(require("./input/tapKeySig"));
const tapLeafScript = __importStar(require("./input/tapLeafScript"));
const tapMerkleRoot = __importStar(require("./input/tapMerkleRoot"));
const tapScriptSig = __importStar(require("./input/tapScriptSig"));
const witnessUtxo = __importStar(require("./input/witnessUtxo"));
const tapTree = __importStar(require("./output/tapTree"));
const bip32Derivation = __importStar(require("./shared/bip32Derivation"));
const checkPubkey = __importStar(require("./shared/checkPubkey"));
const redeemScript = __importStar(require("./shared/redeemScript"));
const tapBip32Derivation = __importStar(require("./shared/tapBip32Derivation"));
const tapInternalKey = __importStar(require("./shared/tapInternalKey"));
const witnessScript = __importStar(require("./shared/witnessScript"));
const globals = {
    unsignedTx,
    globalXpub,
    checkPubkey: checkPubkey.makeChecker([]),
};
exports.globals = globals;
const inputs = {
    nonWitnessUtxo,
    partialSig,
    sighashType,
    finalScriptSig,
    finalScriptWitness,
    porCommitment,
    witnessUtxo,
    bip32Derivation: bip32Derivation.makeConverter(typeFields_1.InputTypes.BIP32_DERIVATION),
    redeemScript: redeemScript.makeConverter(typeFields_1.InputTypes.REDEEM_SCRIPT),
    witnessScript: witnessScript.makeConverter(typeFields_1.InputTypes.WITNESS_SCRIPT),
    checkPubkey: checkPubkey.makeChecker([
        typeFields_1.InputTypes.PARTIAL_SIG,
        typeFields_1.InputTypes.BIP32_DERIVATION,
    ]),
    tapKeySig,
    tapScriptSig,
    tapLeafScript,
    tapBip32Derivation: tapBip32Derivation.makeConverter(typeFields_1.InputTypes.TAP_BIP32_DERIVATION),
    tapInternalKey: tapInternalKey.makeConverter(typeFields_1.InputTypes.TAP_INTERNAL_KEY),
    tapMerkleRoot,
};
exports.inputs = inputs;
const outputs = {
    bip32Derivation: bip32Derivation.makeConverter(typeFields_1.OutputTypes.BIP32_DERIVATION),
    redeemScript: redeemScript.makeConverter(typeFields_1.OutputTypes.REDEEM_SCRIPT),
    witnessScript: witnessScript.makeConverter(typeFields_1.OutputTypes.WITNESS_SCRIPT),
    checkPubkey: checkPubkey.makeChecker([typeFields_1.OutputTypes.BIP32_DERIVATION]),
    tapBip32Derivation: tapBip32Derivation.makeConverter(typeFields_1.OutputTypes.TAP_BIP32_DERIVATION),
    tapTree,
    tapInternalKey: tapInternalKey.makeConverter(typeFields_1.OutputTypes.TAP_INTERNAL_KEY),
};
exports.outputs = outputs;
//# sourceMappingURL=index.js.map