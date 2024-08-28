"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySimple = exports.signSimple = void 0;
const crypto_lib_1 = require("@okxweb3/crypto-lib");
const address_1 = require("./address");
const transaction_1 = require("./transaction");
const psbt_1 = require("./psbt");
const varuint_1 = require("./varuint");
const psbtSign_1 = require("../psbtSign");
const txBuild_1 = require("../txBuild");
const psbtutils_1 = require("./psbt/psbtutils");
function bip0322_hash(message) {
    const tag = 'BIP0322-signed-message';
    const tagHash = crypto_lib_1.base.sha256(Buffer.from(tag));
    const result = crypto_lib_1.base.sha256(Buffer.concat([tagHash, tagHash, Buffer.from(message)]));
    return crypto_lib_1.base.toHex(result);
}
async function signSimple(message, address, privateKey, network) {
    const outputScript = (0, address_1.toOutputScript)(address, network);
    const prevoutHash = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex');
    const prevoutIndex = 0xffffffff;
    const sequence = 0;
    const scriptSig = Buffer.concat([Buffer.from('0020', 'hex'), Buffer.from(bip0322_hash(message), 'hex')]);
    const txToSpend = new transaction_1.Transaction();
    txToSpend.version = 0;
    txToSpend.addInput(prevoutHash, prevoutIndex, sequence, scriptSig);
    txToSpend.addOutput(outputScript, 0);
    const psbtToSign = new psbt_1.Psbt({ network });
    psbtToSign.setVersion(0);
    psbtToSign.addInput({
        hash: txToSpend.getHash(),
        index: 0,
        sequence: 0,
        witnessUtxo: {
            script: outputScript,
            value: 0
        },
    });
    if ((0, psbtutils_1.isP2TR)(outputScript)) {
        psbtToSign.updateInput(0, {
            tapInternalKey: (0, txBuild_1.wif2Public)(privateKey, network).slice(1),
        });
    }
    psbtToSign.addOutput({ script: Buffer.from('6a', 'hex'), value: 0 });
    (0, psbtSign_1.psbtSignImpl)(psbtToSign, privateKey, network);
    psbtToSign.finalizeAllInputs();
    const txToSign = psbtToSign.extractTransaction();
    function encodeVarString(b) {
        return Buffer.concat([(0, varuint_1.encode)(b.byteLength), b]);
    }
    const len = (0, varuint_1.encode)(txToSign.ins[0].witness.length);
    const result = Buffer.concat([len, ...txToSign.ins[0].witness.map((w) => encodeVarString(w))]);
    return crypto_lib_1.base.toBase64(result);
}
exports.signSimple = signSimple;
function verifySimple(message, address, witness, publicKey, network) {
    const outputScript = (0, address_1.toOutputScript)(address, network);
    const prevoutHash = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex');
    const prevoutIndex = 0xffffffff;
    const sequence = 0;
    const scriptSig = Buffer.concat([Buffer.from('0020', 'hex'), Buffer.from(bip0322_hash(message), 'hex')]);
    const txToSpend = new transaction_1.Transaction();
    txToSpend.version = 0;
    txToSpend.addInput(prevoutHash, prevoutIndex, sequence, scriptSig);
    txToSpend.addOutput(outputScript, 0);
    const psbtToSign = new psbt_1.Psbt();
    psbtToSign.setVersion(0);
    psbtToSign.addInput({
        hash: txToSpend.getHash(),
        index: 0,
        sequence: 0,
        witnessUtxo: {
            script: outputScript,
            value: 0
        },
    });
    const pubBuf = crypto_lib_1.base.fromHex(publicKey);
    if ((0, psbtutils_1.isP2TR)(outputScript)) {
        psbtToSign.updateInput(0, {
            tapInternalKey: pubBuf.slice(1),
        });
    }
    psbtToSign.addOutput({ script: Buffer.from('6a', 'hex'), value: 0 });
    return psbtToSign.verify(pubBuf, Buffer.from(crypto_lib_1.base.fromBase64(witness)));
}
exports.verifySimple = verifySimple;
//# sourceMappingURL=bip0322.js.map