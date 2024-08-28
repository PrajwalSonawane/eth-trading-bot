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
exports.dogInscribe = exports.DogInscriptionTool = exports.DogScript = exports.bufferToChunk = exports.bufferToBuffer = exports.CHANGE_OUTPUT_MAX_SIZE = void 0;
const bitcoin = __importStar(require("./bitcoinjs-lib"));
const crypto_lib_1 = require("@okxweb3/crypto-lib");
const bcrypto = __importStar(require("./bitcoinjs-lib/crypto"));
const txBuild_1 = require("./txBuild");
const bitcoinjs_lib_1 = require("./bitcoinjs-lib");
const ops_1 = require("./bitcoinjs-lib/ops");
const payments = __importStar(require("./bitcoinjs-lib/payments"));
const bufferutils_1 = require("./bitcoinjs-lib/bufferutils");
exports.CHANGE_OUTPUT_MAX_SIZE = 20 + 4 + 34 + 4;
const defaultTxVersion = 2;
const defaultSequenceNum = 0xfffffffd;
const defaultRevealOutValue = 100000;
const defaultMinChangeValue = 100000;
const MAX_CHUNK_LEN = 240;
const MAX_PAYLOAD_LEN = 1500;
function numberToChunk(n) {
    return {
        buf: n <= 16 ? undefined : n < 128 ? Buffer.from([n]) : Buffer.from([n % 256, n / 256]),
        len: n <= 16 ? 0 : n < 128 ? 1 : 2,
        opcodenum: n == 0 ? 0 : n <= 16 ? 80 + n : n < 128 ? 1 : 2
    };
}
function bufferToBuffer(b) {
    let c = bufferToChunk(b);
    let size = bufferutils_1.varuint.encodingLength(c.opcodenum);
    var opcodenum = c.opcodenum;
    if (c.buf) {
        if (opcodenum === ops_1.OPS.OP_PUSHDATA1) {
            size += bufferutils_1.varuint.encodingLength(c.len);
        }
        else if (opcodenum === ops_1.OPS.OP_PUSHDATA2) {
            size += bufferutils_1.varuint.encodingLength(c.len);
        }
        else if (opcodenum === ops_1.OPS.OP_PUSHDATA4) {
            size += bufferutils_1.varuint.encodingLength(c.len);
        }
        size += c.buf.length;
    }
    let bw = bitcoinjs_lib_1.BufferWriter.withCapacity(size);
    bw.writeUInt8(c.opcodenum);
    if (c.buf) {
        if (opcodenum < ops_1.OPS.OP_PUSHDATA1) {
            bw.writeSlice(c.buf);
        }
        else if (opcodenum === ops_1.OPS.OP_PUSHDATA1) {
            bw.writeUInt8(c.len);
            bw.writeSlice(c.buf);
        }
        else if (opcodenum === ops_1.OPS.OP_PUSHDATA2) {
            bw.writeUInt64(c.len);
            bw.writeSlice(c.buf);
        }
        else if (opcodenum === ops_1.OPS.OP_PUSHDATA4) {
            bw.writeUInt32(c.len);
            bw.writeSlice(c.buf);
        }
    }
    return bw.end();
}
exports.bufferToBuffer = bufferToBuffer;
function bufferToChunk(b) {
    return {
        buf: b.length ? b : undefined,
        len: b.length,
        opcodenum: b.length <= 75 ? b.length : b.length <= 255 ? 76 : 77
    };
}
exports.bufferToChunk = bufferToChunk;
function opcodeToChunk(op) {
    return { opcodenum: op };
}
class DogScript {
    constructor() {
        this.chunks = [];
    }
    total() {
        if (this.chunks.length == 0) {
            return 0;
        }
        const size = this.chunks
            .map(chunk => {
            let size = bufferutils_1.varuint.encodingLength(chunk.opcodenum);
            var opcodenum = chunk.opcodenum;
            if (chunk.buf) {
                if (opcodenum < ops_1.OPS.OP_PUSHDATA1) {
                }
                else if (opcodenum === ops_1.OPS.OP_PUSHDATA1) {
                    size += bufferutils_1.varuint.encodingLength(chunk.len);
                }
                else if (opcodenum === ops_1.OPS.OP_PUSHDATA2) {
                    size += bufferutils_1.varuint.encodingLength(chunk.len);
                }
                else if (opcodenum === ops_1.OPS.OP_PUSHDATA4) {
                    size += bufferutils_1.varuint.encodingLength(chunk.len);
                }
                size += chunk.buf.length;
            }
            return size;
        })
            .reduce((a, b) => a + b);
        return size;
    }
    toBuffer() {
        let total = this.total();
        let bw = bitcoinjs_lib_1.BufferWriter.withCapacity(total);
        for (var i = 0; i < this.chunks.length; i++) {
            var chunk = this.chunks[i];
            var opcodenum = chunk.opcodenum;
            bw.writeUInt8(chunk.opcodenum);
            if (chunk.buf) {
                if (opcodenum < ops_1.OPS.OP_PUSHDATA1) {
                    bw.writeSlice(chunk.buf);
                }
                else if (opcodenum === ops_1.OPS.OP_PUSHDATA1) {
                    bw.writeUInt8(chunk.len);
                    bw.writeSlice(chunk.buf);
                }
                else if (opcodenum === ops_1.OPS.OP_PUSHDATA2) {
                    bw.writeUInt64(chunk.len);
                    bw.writeSlice(chunk.buf);
                }
                else if (opcodenum === ops_1.OPS.OP_PUSHDATA4) {
                    bw.writeUInt32(chunk.len);
                    bw.writeSlice(chunk.buf);
                }
            }
        }
        return bw.end();
    }
}
exports.DogScript = DogScript;
class DogInscriptionTool {
    constructor() {
        this.network = bitcoin.networks.bitcoin;
        this.inscriptionTxCtxDataList = [];
        this.revealTxs = [];
        this.commitTx = new bitcoin.Transaction();
        this.commitTxPrevOutputFetcher = [];
        this.revealTxPrevOutputFetcher = [];
        this.mustCommitTxFee = 0;
        this.mustRevealTxFees = [];
        this.commitAddrs = [];
        this.fromAddr = '';
        this.revealAddr = '';
    }
    static newDogInscriptionTool(network, request) {
        const tool = new DogInscriptionTool();
        tool.network = network;
        const revealOutValue = request.revealOutValue || defaultRevealOutValue;
        const minChangeValue = request.minChangeValue || defaultMinChangeValue;
        const privateKey = request.commitTxPrevOutputList[0].privateKey;
        tool.inscriptionTxCtxDataList = createInscriptionTxCtxData(network, request.inscriptionData, privateKey);
        tool.revealAddr = request.inscriptionData.revealAddr;
        const privateKeyHex = crypto_lib_1.base.toHex(crypto_lib_1.base.fromHex((0, txBuild_1.privateKeyFromWIF)(privateKey, network)));
        const publicKey = (0, txBuild_1.private2public)(privateKeyHex);
        tool.fromAddr = bitcoin.payments.p2pkh({ pubkey: publicKey, network: network }).address;
        const totalRevealPrevOutputValue = tool.buildEmptyRevealTxs(network, revealOutValue, request.revealFeeRate);
        const insufficient = tool.buildCommitTx(network, request.commitTxPrevOutputList, request.changeAddress, totalRevealPrevOutputValue, revealOutValue, request.commitFeeRate, minChangeValue);
        if (insufficient) {
            return tool;
        }
        tool.signCommitTx(request.commitTxPrevOutputList);
        tool.completeRevealTx();
        return tool;
    }
    buildEmptyRevealTxs(network, revealOutValue, revealFeeRate) {
        let totalPrevOutputValue = 0;
        const revealTxs = [];
        const mustRevealTxFees = [];
        const commitAddrs = [];
        let left = 0;
        for (let i = this.inscriptionTxCtxDataList.length - 1; i > -1; i--) {
            let inscriptionTxCtxData = this.inscriptionTxCtxDataList[i];
            const tx = new bitcoin.Transaction();
            tx.version = defaultTxVersion;
            tx.addInput(Buffer.alloc(32), 0, defaultSequenceNum);
            tx.addInput(Buffer.alloc(32), 1, defaultSequenceNum);
            tx.addOutput(i != this.inscriptionTxCtxDataList.length - 1 ? inscriptionTxCtxData.commitTxAddressPkScript : inscriptionTxCtxData.revealPkScript, revealOutValue);
            const emptySignature = Buffer.alloc(72);
            let unlock = Buffer.concat([inscriptionTxCtxData.inscriptionScript, bufferToBuffer(emptySignature), bufferToBuffer(inscriptionTxCtxData.redeemScript)]);
            tx.ins[0].script = unlock;
            if (i != this.inscriptionTxCtxDataList.length - 1) {
                tx.addOutput(bitcoin.address.toOutputScript(this.fromAddr, network), left);
            }
            tx.ins[1].script = Buffer.alloc(106);
            const fee = Math.floor((tx.dogeByteLength() + exports.CHANGE_OUTPUT_MAX_SIZE) * revealFeeRate);
            left += fee;
            const prevOutputValue = fee;
            inscriptionTxCtxData.revealTxPrevOutput = {
                pkScript: inscriptionTxCtxData.commitTxAddressPkScript,
                value: prevOutputValue,
            };
            totalPrevOutputValue += prevOutputValue;
            revealTxs.push(tx);
            mustRevealTxFees.push(fee);
            commitAddrs.push(inscriptionTxCtxData.commitTxAddress);
        }
        for (let i = 0, j = revealTxs.length - 1; i < j; i++, j--) {
            [revealTxs[i], revealTxs[j]] = [revealTxs[j], revealTxs[i]];
            [mustRevealTxFees[i], mustRevealTxFees[j]] = [mustRevealTxFees[j], mustRevealTxFees[i]];
            [commitAddrs[i], commitAddrs[j]] = [commitAddrs[j], commitAddrs[i]];
        }
        this.revealTxs = revealTxs;
        this.mustRevealTxFees = mustRevealTxFees;
        this.commitAddrs = commitAddrs;
        totalPrevOutputValue += revealOutValue;
        return totalPrevOutputValue;
    }
    buildCommitTx(network, commitTxPrevOutputList, changeAddress, totalRevealPrevOutputValue, revealOutValue, commitFeeRate, minChangeValue) {
        let totalSenderAmount = 0;
        const tx = new bitcoin.Transaction();
        tx.version = defaultTxVersion;
        commitTxPrevOutputList.forEach(commitTxPrevOutput => {
            const hash = crypto_lib_1.base.reverseBuffer(crypto_lib_1.base.fromHex(commitTxPrevOutput.txId));
            tx.addInput(hash, commitTxPrevOutput.vOut, defaultSequenceNum);
            this.commitTxPrevOutputFetcher.push(commitTxPrevOutput.amount);
            totalSenderAmount += commitTxPrevOutput.amount;
        });
        tx.addOutput(this.inscriptionTxCtxDataList[0].revealTxPrevOutput.pkScript, revealOutValue);
        tx.addOutput(bitcoin.address.toOutputScript(this.fromAddr, network), totalRevealPrevOutputValue);
        const changePkScript = bitcoin.address.toOutputScript(changeAddress, network);
        tx.addOutput(changePkScript, 0);
        const txForEstimate = tx.clone();
        signTx(txForEstimate, commitTxPrevOutputList, this.network);
        const fee = Math.floor((txForEstimate.dogeByteLength() + exports.CHANGE_OUTPUT_MAX_SIZE) * commitFeeRate);
        const changeAmount = totalSenderAmount - totalRevealPrevOutputValue - fee;
        if (changeAmount >= minChangeValue) {
            tx.outs[tx.outs.length - 1].value = changeAmount;
        }
        else {
            tx.outs = tx.outs.slice(0, tx.outs.length - 1);
            txForEstimate.outs = txForEstimate.outs.slice(0, txForEstimate.outs.length - 1);
            const feeWithoutChange = Math.floor(txForEstimate.dogeByteLength() * commitFeeRate);
            if (totalSenderAmount - totalRevealPrevOutputValue - feeWithoutChange < 0) {
                this.mustCommitTxFee = fee;
                return true;
            }
        }
        this.commitTx = tx;
        return false;
    }
    signCommitTx(commitTxPrevOutputList) {
        signTx(this.commitTx, commitTxPrevOutputList, this.network);
    }
    completeRevealTx() {
        for (let i = 0; i < this.revealTxs.length; i++) {
            let revealTx = this.revealTxs[i];
            revealTx.ins[0].hash = i == 0 ? this.commitTx.getHash() : this.revealTxs[i - 1].getHash();
            revealTx.ins[1].hash = i == 0 ? this.commitTx.getHash() : this.revealTxs[i - 1].getHash();
            this.revealTxPrevOutputFetcher.push(this.inscriptionTxCtxDataList[i].revealTxPrevOutput.value);
            const prevOutScripts = this.inscriptionTxCtxDataList[i].redeemScript;
            const hash = revealTx.hashForSignature(0, prevOutScripts, bitcoin.Transaction.SIGHASH_ALL);
            const privateKeyHex = crypto_lib_1.base.toHex(this.inscriptionTxCtxDataList[i].privateKey);
            const signature = (0, txBuild_1.sign)(hash, privateKeyHex);
            let txsignature = bitcoin.script.signature.encode(signature, bitcoin.Transaction.SIGHASH_ALL);
            revealTx.ins[0].script = Buffer.concat([this.inscriptionTxCtxDataList[i].inscriptionScript, bufferToBuffer(txsignature), bufferToBuffer(this.inscriptionTxCtxDataList[i].redeemScript)]);
            const prevScript = bitcoin.address.toOutputScript(this.fromAddr, this.network);
            const hash2 = revealTx.hashForSignature(1, prevScript, bitcoin.Transaction.SIGHASH_ALL);
            const signature2 = (0, txBuild_1.sign)(hash2, privateKeyHex);
            const payment = bitcoin.payments.p2pkh({
                signature: bitcoin.script.signature.encode(signature2, bitcoin.Transaction.SIGHASH_ALL),
                pubkey: (0, txBuild_1.private2public)(privateKeyHex),
            });
            revealTx.ins[1].script = payment.input;
        }
    }
    calculateFee() {
        let commitTxFee = 0;
        this.commitTx.ins.forEach((_, i) => {
            commitTxFee += this.commitTxPrevOutputFetcher[i];
        });
        this.commitTx.outs.forEach(out => {
            commitTxFee -= out.value;
        });
        let revealTxFees = [];
        this.revealTxs.forEach((revealTx, i) => {
            let revealTxFee = 0;
            revealTxFee = this.revealTxPrevOutputFetcher[i];
            revealTxFees.push(revealTxFee);
        });
        return {
            commitTxFee,
            revealTxFees,
        };
    }
}
exports.DogInscriptionTool = DogInscriptionTool;
function signTx(tx, commitTxPrevOutputList, network) {
    tx.ins.forEach((input, i) => {
        const addressType = (0, txBuild_1.getAddressType)(commitTxPrevOutputList[i].address, network);
        const privateKey = crypto_lib_1.base.fromHex((0, txBuild_1.privateKeyFromWIF)(commitTxPrevOutputList[i].privateKey, network));
        const privateKeyHex = crypto_lib_1.base.toHex(privateKey);
        const publicKey = (0, txBuild_1.private2public)(privateKeyHex);
        if (addressType === 'legacy') {
            const prevScript = bitcoin.address.toOutputScript(commitTxPrevOutputList[i].address, network);
            const hash = tx.hashForSignature(i, prevScript, bitcoin.Transaction.SIGHASH_ALL);
            const signature = (0, txBuild_1.sign)(hash, privateKeyHex);
            const payment = bitcoin.payments.p2pkh({
                signature: bitcoin.script.signature.encode(signature, bitcoin.Transaction.SIGHASH_ALL),
                pubkey: publicKey,
            });
            input.script = payment.input;
        }
        else {
            const pubKeyHash = bcrypto.hash160(publicKey);
            const prevOutScript = Buffer.of(0x19, 0x76, 0xa9, 0x14, ...pubKeyHash, 0x88, 0xac);
            const value = commitTxPrevOutputList[i].amount;
            const hash = tx.hashForWitness(i, prevOutScript, value, bitcoin.Transaction.SIGHASH_ALL);
            const signature = (0, txBuild_1.sign)(hash, privateKeyHex);
            input.witness = [
                bitcoin.script.signature.encode(signature, bitcoin.Transaction.SIGHASH_ALL),
                publicKey,
            ];
            const redeemScript = Buffer.of(0x16, 0, 20, ...pubKeyHash);
            if (addressType === "segwit_nested") {
                input.script = redeemScript;
            }
        }
    });
}
function createInscriptionTxCtxData(network, inscriptionData, privateKeyWif) {
    const privateKey = crypto_lib_1.base.fromHex((0, txBuild_1.privateKeyFromWIF)(privateKeyWif, network));
    const pubKey = (0, txBuild_1.wif2Public)(privateKeyWif, network);
    const ops = bitcoin.script.OPS;
    let data;
    if (typeof inscriptionData.body == 'string') {
        data = Buffer.from(inscriptionData.body);
    }
    else {
        data = inscriptionData.body;
    }
    let parts = [];
    while (data.length) {
        let part = data.slice(0, Math.min(MAX_CHUNK_LEN, data.length));
        data = data.slice(part.length);
        parts.push(part);
    }
    let inscription = new DogScript();
    inscription.chunks.push(bufferToChunk(Buffer.from('ord')));
    inscription.chunks.push(numberToChunk(parts.length));
    inscription.chunks.push(bufferToChunk(Buffer.from(inscriptionData.contentType)));
    parts.forEach((part, n) => {
        inscription.chunks.push(numberToChunk(parts.length - n - 1));
        inscription.chunks.push(bufferToChunk(part));
    });
    let ctxDatas = [];
    while (inscription.chunks.length) {
        let partial = new DogScript();
        if (ctxDatas.length == 0) {
            partial.chunks.push(inscription.chunks.shift());
        }
        while (partial.total() <= MAX_PAYLOAD_LEN && inscription.chunks.length) {
            partial.chunks.push(inscription.chunks.shift());
            partial.chunks.push(inscription.chunks.shift());
        }
        if (partial.total() > MAX_PAYLOAD_LEN) {
            inscription.chunks.unshift(partial.chunks.pop());
            inscription.chunks.unshift(partial.chunks.pop());
        }
        let lock = new DogScript();
        lock.chunks.push(bufferToChunk(pubKey));
        lock.chunks.push(opcodeToChunk(ops.OP_CHECKSIGVERIFY));
        partial.chunks.forEach(() => {
            lock.chunks.push(opcodeToChunk(ops.OP_DROP));
        });
        lock.chunks.push(opcodeToChunk(ops.OP_TRUE));
        let lockhash = crypto_lib_1.base.ripemd160(crypto_lib_1.base.sha256(lock.toBuffer()));
        let { output, address } = payments.p2sh({ hash: Buffer.from(lockhash), network: network });
        let ctx = {
            privateKey: privateKey,
            inscriptionScript: partial.toBuffer(),
            redeemScript: lock.toBuffer(),
            commitTxAddress: address,
            commitTxAddressPkScript: output,
            revealTxPrevOutput: {
                pkScript: Buffer.alloc(0),
                value: 100000,
            },
            revealPkScript: bitcoin.address.toOutputScript(inscriptionData.revealAddr, network),
        };
        ctxDatas.push(ctx);
    }
    return ctxDatas;
}
function dogInscribe(network, request) {
    const tool = DogInscriptionTool.newDogInscriptionTool(network, request);
    if (tool.mustCommitTxFee > 0) {
        return {
            commitTx: "",
            revealTxs: [],
            commitTxFee: tool.mustCommitTxFee,
            revealTxFees: tool.mustRevealTxFees,
            commitAddrs: tool.commitAddrs,
        };
    }
    return {
        commitTx: tool.commitTx.toHex(),
        revealTxs: tool.revealTxs.map(revealTx => revealTx.toHex()),
        ...tool.calculateFee(),
        commitAddrs: tool.commitAddrs,
    };
}
exports.dogInscribe = dogInscribe;
//# sourceMappingURL=doginals.js.map