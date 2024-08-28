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
exports.Transaction = exports.vectorSize = exports.varSliceSize = void 0;
const bufferutils_1 = require("./bufferutils");
const bcrypto = __importStar(require("./crypto"));
const bscript = __importStar(require("./script"));
const script_1 = require("./script");
const types = __importStar(require("./types"));
const { typeforce } = types;
function varSliceSize(someScript) {
    const length = someScript.length;
    return bufferutils_1.varuint.encodingLength(length) + length;
}
exports.varSliceSize = varSliceSize;
function vectorSize(someVector) {
    const length = someVector.length;
    return (bufferutils_1.varuint.encodingLength(length) +
        someVector.reduce((sum, witness) => {
            return sum + varSliceSize(witness);
        }, 0));
}
exports.vectorSize = vectorSize;
const EMPTY_BUFFER = Buffer.allocUnsafe(0);
const EMPTY_WITNESS = [];
const ZERO = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex');
const ONE = Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex');
const VALUE_UINT64_MAX = Buffer.from('ffffffffffffffff', 'hex');
const BLANK_OUTPUT = {
    script: EMPTY_BUFFER,
    valueBuffer: VALUE_UINT64_MAX,
};
function isOutput(out) {
    return out.value !== undefined;
}
class Transaction {
    constructor() {
        this.version = 1;
        this.locktime = 0;
        this.ins = [];
        this.outs = [];
    }
    static fromBuffer(buffer, _NO_STRICT) {
        const bufferReader = new bufferutils_1.BufferReader(buffer);
        const tx = new Transaction();
        tx.version = bufferReader.readInt32();
        const marker = bufferReader.readUInt8();
        const flag = bufferReader.readUInt8();
        let hasWitnesses = false;
        if (marker === Transaction.ADVANCED_TRANSACTION_MARKER &&
            flag === Transaction.ADVANCED_TRANSACTION_FLAG) {
            hasWitnesses = true;
        }
        else {
            bufferReader.offset -= 2;
        }
        const vinLen = bufferReader.readVarInt();
        for (let i = 0; i < vinLen; ++i) {
            tx.ins.push({
                hash: bufferReader.readSlice(32),
                index: bufferReader.readUInt32(),
                script: bufferReader.readVarSlice(),
                sequence: bufferReader.readUInt32(),
                witness: EMPTY_WITNESS,
            });
        }
        const voutLen = bufferReader.readVarInt();
        for (let i = 0; i < voutLen; ++i) {
            tx.outs.push({
                value: bufferReader.readUInt64(),
                script: bufferReader.readVarSlice(),
            });
        }
        if (hasWitnesses) {
            for (let i = 0; i < vinLen; ++i) {
                tx.ins[i].witness = bufferReader.readVector();
            }
            if (!tx.hasWitnesses())
                throw new Error('Transaction has superfluous witness data');
        }
        tx.locktime = bufferReader.readUInt32();
        if (_NO_STRICT)
            return tx;
        if (bufferReader.offset !== buffer.length)
            throw new Error('Transaction has unexpected data');
        return tx;
    }
    static fromHex(hex) {
        return Transaction.fromBuffer(Buffer.from(hex, 'hex'), false);
    }
    static isCoinbaseHash(buffer) {
        typeforce(types.Hash256bit, buffer);
        for (let i = 0; i < 32; ++i) {
            if (buffer[i] !== 0)
                return false;
        }
        return true;
    }
    isCoinbase() {
        return (this.ins.length === 1 && Transaction.isCoinbaseHash(this.ins[0].hash));
    }
    addInput(hash, index, sequence, scriptSig) {
        typeforce(types.tuple(types.Hash256bit, types.UInt32, types.maybe(types.UInt32), types.maybe(types.Buffer)), arguments);
        if (types.Null(sequence)) {
            sequence = Transaction.DEFAULT_SEQUENCE;
        }
        return (this.ins.push({
            hash,
            index,
            script: scriptSig || EMPTY_BUFFER,
            sequence: sequence,
            witness: EMPTY_WITNESS,
        }) - 1);
    }
    addOutput(scriptPubKey, value) {
        typeforce(types.tuple(types.Buffer, types.Satoshi), arguments);
        return (this.outs.push({
            script: scriptPubKey,
            value,
        }) - 1);
    }
    hasWitnesses() {
        return this.ins.some(x => {
            return x.witness.length !== 0;
        });
    }
    weight() {
        const base = this.byteLength(false);
        const total = this.byteLength(true);
        return base * 3 + total;
    }
    virtualSize() {
        return Math.ceil(this.weight() / 4);
    }
    dogeByteLength() {
        let result = 4 + 9 + 9 + 4 +
            this.ins.reduce((sum, input) => {
                let l = 32 + 4 + 4 + varSliceSize(input.script);
                return sum + 32 + 4 + l;
            }, 0) +
            this.outs.reduce((sum, output) => {
                return sum + 9 + output.script.length;
            }, 0);
        return Math.ceil(result);
        ;
    }
    byteLength(_ALLOW_WITNESS = true) {
        const hasWitnesses = _ALLOW_WITNESS && this.hasWitnesses();
        return ((hasWitnesses ? 10 : 8) +
            bufferutils_1.varuint.encodingLength(this.ins.length) +
            bufferutils_1.varuint.encodingLength(this.outs.length) +
            this.ins.reduce((sum, input) => {
                return sum + 40 + varSliceSize(input.script);
            }, 0) +
            this.outs.reduce((sum, output) => {
                return sum + 8 + varSliceSize(output.script);
            }, 0) +
            (hasWitnesses
                ? this.ins.reduce((sum, input) => {
                    return sum + vectorSize(input.witness);
                }, 0)
                : 0));
    }
    clone() {
        const newTx = new Transaction();
        newTx.version = this.version;
        newTx.locktime = this.locktime;
        newTx.ins = this.ins.map(txIn => {
            return {
                hash: txIn.hash,
                index: txIn.index,
                script: txIn.script,
                sequence: txIn.sequence,
                witness: txIn.witness,
            };
        });
        newTx.outs = this.outs.map(txOut => {
            return {
                script: txOut.script,
                value: txOut.value,
            };
        });
        return newTx;
    }
    hashForSignature(inIndex, prevOutScript, hashType) {
        typeforce(types.tuple(types.UInt32, types.Buffer, types.Number), arguments);
        if (inIndex >= this.ins.length)
            return ONE;
        const ourScript = bscript.compile(bscript.decompile(prevOutScript).filter(x => {
            return x !== script_1.OPS.OP_CODESEPARATOR;
        }));
        const txTmp = this.clone();
        if ((hashType & 0x1f) === Transaction.SIGHASH_NONE) {
            txTmp.outs = [];
            txTmp.ins.forEach((input, i) => {
                if (i === inIndex)
                    return;
                input.sequence = 0;
            });
        }
        else if ((hashType & 0x1f) === Transaction.SIGHASH_SINGLE) {
            if (inIndex >= this.outs.length)
                return ONE;
            txTmp.outs.length = inIndex + 1;
            for (let i = 0; i < inIndex; i++) {
                txTmp.outs[i] = BLANK_OUTPUT;
            }
            txTmp.ins.forEach((input, y) => {
                if (y === inIndex)
                    return;
                input.sequence = 0;
            });
        }
        if (hashType & Transaction.SIGHASH_ANYONECANPAY) {
            txTmp.ins = [txTmp.ins[inIndex]];
            txTmp.ins[0].script = ourScript;
        }
        else {
            txTmp.ins.forEach(input => {
                input.script = EMPTY_BUFFER;
            });
            txTmp.ins[inIndex].script = ourScript;
        }
        const buffer = Buffer.allocUnsafe(txTmp.byteLength(false) + 4);
        buffer.writeInt32LE(hashType, buffer.length - 4);
        txTmp.__toBuffer(buffer, 0, false);
        return bcrypto.hash256(buffer);
    }
    hashForCashSignature(inIndex, prevOutScript, inAmount, hashType) {
        if (hashType & Transaction.SIGHASH_BITCOINCASHBIP143) {
            if (types.Null(inAmount)) {
                throw new Error('Bitcoin Cash sighash requires value of input to be signed.');
            }
            return this.hashForWitnessV0(inIndex, prevOutScript, inAmount, hashType);
        }
        else {
            return this.hashForSignature(inIndex, prevOutScript, hashType);
        }
    }
    hashForWitnessV1(inIndex, prevOutScripts, values, hashType, leafHash, annex) {
        typeforce(types.tuple(types.UInt32, typeforce.arrayOf(types.Buffer), typeforce.arrayOf(types.Satoshi), types.UInt32), arguments);
        if (values.length !== this.ins.length ||
            prevOutScripts.length !== this.ins.length) {
            throw new Error('Must supply prevout script and value for all inputs');
        }
        const outputType = hashType === Transaction.SIGHASH_DEFAULT
            ? Transaction.SIGHASH_ALL
            : hashType & Transaction.SIGHASH_OUTPUT_MASK;
        const inputType = hashType & Transaction.SIGHASH_INPUT_MASK;
        const isAnyoneCanPay = inputType === Transaction.SIGHASH_ANYONECANPAY;
        const isNone = outputType === Transaction.SIGHASH_NONE;
        const isSingle = outputType === Transaction.SIGHASH_SINGLE;
        let hashPrevouts = EMPTY_BUFFER;
        let hashAmounts = EMPTY_BUFFER;
        let hashScriptPubKeys = EMPTY_BUFFER;
        let hashSequences = EMPTY_BUFFER;
        let hashOutputs = EMPTY_BUFFER;
        if (!isAnyoneCanPay) {
            let bufferWriter = bufferutils_1.BufferWriter.withCapacity(36 * this.ins.length);
            this.ins.forEach(txIn => {
                bufferWriter.writeSlice(txIn.hash);
                bufferWriter.writeUInt32(txIn.index);
            });
            hashPrevouts = bcrypto.sha256(bufferWriter.end());
            bufferWriter = bufferutils_1.BufferWriter.withCapacity(8 * this.ins.length);
            values.forEach(value => bufferWriter.writeUInt64(value));
            hashAmounts = bcrypto.sha256(bufferWriter.end());
            bufferWriter = bufferutils_1.BufferWriter.withCapacity(prevOutScripts.map(varSliceSize).reduce((a, b) => a + b));
            prevOutScripts.forEach(prevOutScript => bufferWriter.writeVarSlice(prevOutScript));
            hashScriptPubKeys = bcrypto.sha256(bufferWriter.end());
            bufferWriter = bufferutils_1.BufferWriter.withCapacity(4 * this.ins.length);
            this.ins.forEach(txIn => bufferWriter.writeUInt32(txIn.sequence));
            hashSequences = bcrypto.sha256(bufferWriter.end());
        }
        if (!(isNone || isSingle)) {
            const txOutsSize = this.outs
                .map(output => 8 + varSliceSize(output.script))
                .reduce((a, b) => a + b);
            const bufferWriter = bufferutils_1.BufferWriter.withCapacity(txOutsSize);
            this.outs.forEach(out => {
                bufferWriter.writeUInt64(out.value);
                bufferWriter.writeVarSlice(out.script);
            });
            hashOutputs = bcrypto.sha256(bufferWriter.end());
        }
        else if (isSingle && inIndex < this.outs.length) {
            const output = this.outs[inIndex];
            const bufferWriter = bufferutils_1.BufferWriter.withCapacity(8 + varSliceSize(output.script));
            bufferWriter.writeUInt64(output.value);
            bufferWriter.writeVarSlice(output.script);
            hashOutputs = bcrypto.sha256(bufferWriter.end());
        }
        const spendType = (leafHash ? 2 : 0) + (annex ? 1 : 0);
        const sigMsgSize = 174 -
            (isAnyoneCanPay ? 49 : 0) -
            (isNone ? 32 : 0) +
            (annex ? 32 : 0) +
            (leafHash ? 37 : 0);
        const sigMsgWriter = bufferutils_1.BufferWriter.withCapacity(sigMsgSize);
        sigMsgWriter.writeUInt8(hashType);
        sigMsgWriter.writeInt32(this.version);
        sigMsgWriter.writeUInt32(this.locktime);
        sigMsgWriter.writeSlice(hashPrevouts);
        sigMsgWriter.writeSlice(hashAmounts);
        sigMsgWriter.writeSlice(hashScriptPubKeys);
        sigMsgWriter.writeSlice(hashSequences);
        if (!(isNone || isSingle)) {
            sigMsgWriter.writeSlice(hashOutputs);
        }
        sigMsgWriter.writeUInt8(spendType);
        if (isAnyoneCanPay) {
            const input = this.ins[inIndex];
            sigMsgWriter.writeSlice(input.hash);
            sigMsgWriter.writeUInt32(input.index);
            sigMsgWriter.writeUInt64(values[inIndex]);
            sigMsgWriter.writeVarSlice(prevOutScripts[inIndex]);
            sigMsgWriter.writeUInt32(input.sequence);
        }
        else {
            sigMsgWriter.writeUInt32(inIndex);
        }
        if (annex) {
            const bufferWriter = bufferutils_1.BufferWriter.withCapacity(varSliceSize(annex));
            bufferWriter.writeVarSlice(annex);
            sigMsgWriter.writeSlice(bcrypto.sha256(bufferWriter.end()));
        }
        if (isSingle) {
            sigMsgWriter.writeSlice(hashOutputs);
        }
        if (leafHash) {
            sigMsgWriter.writeSlice(leafHash);
            sigMsgWriter.writeUInt8(0);
            sigMsgWriter.writeUInt32(0xffffffff);
        }
        return bcrypto.taggedHash('TapSighash', Buffer.concat([Buffer.of(0x00), sigMsgWriter.end()]));
    }
    hashForWitnessV0(inIndex, prevOutScript, value, hashType) {
        typeforce(types.tuple(types.UInt32, types.Buffer, types.Satoshi, types.UInt32), arguments);
        let tbuffer = Buffer.from([]);
        let bufferWriter;
        let hashOutputs = ZERO;
        let hashPrevouts = ZERO;
        let hashSequence = ZERO;
        if (!(hashType & Transaction.SIGHASH_ANYONECANPAY)) {
            tbuffer = Buffer.allocUnsafe(36 * this.ins.length);
            bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
            this.ins.forEach(txIn => {
                bufferWriter.writeSlice(txIn.hash);
                bufferWriter.writeUInt32(txIn.index);
            });
            hashPrevouts = bcrypto.hash256(tbuffer);
        }
        if (!(hashType & Transaction.SIGHASH_ANYONECANPAY) &&
            (hashType & 0x1f) !== Transaction.SIGHASH_SINGLE &&
            (hashType & 0x1f) !== Transaction.SIGHASH_NONE) {
            tbuffer = Buffer.allocUnsafe(4 * this.ins.length);
            bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
            this.ins.forEach(txIn => {
                bufferWriter.writeUInt32(txIn.sequence);
            });
            hashSequence = bcrypto.hash256(tbuffer);
        }
        if ((hashType & 0x1f) !== Transaction.SIGHASH_SINGLE &&
            (hashType & 0x1f) !== Transaction.SIGHASH_NONE) {
            const txOutsSize = this.outs.reduce((sum, output) => {
                return sum + 8 + varSliceSize(output.script);
            }, 0);
            tbuffer = Buffer.allocUnsafe(txOutsSize);
            bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
            this.outs.forEach(out => {
                bufferWriter.writeUInt64(out.value);
                bufferWriter.writeVarSlice(out.script);
            });
            hashOutputs = bcrypto.hash256(tbuffer);
        }
        else if ((hashType & 0x1f) === Transaction.SIGHASH_SINGLE &&
            inIndex < this.outs.length) {
            const output = this.outs[inIndex];
            tbuffer = Buffer.allocUnsafe(8 + varSliceSize(output.script));
            bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
            bufferWriter.writeUInt64(output.value);
            bufferWriter.writeVarSlice(output.script);
            hashOutputs = bcrypto.hash256(tbuffer);
        }
        tbuffer = Buffer.allocUnsafe(156 + varSliceSize(prevOutScript));
        bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
        const input = this.ins[inIndex];
        bufferWriter.writeInt32(this.version);
        bufferWriter.writeSlice(hashPrevouts);
        bufferWriter.writeSlice(hashSequence);
        bufferWriter.writeSlice(input.hash);
        bufferWriter.writeUInt32(input.index);
        bufferWriter.writeVarSlice(prevOutScript);
        bufferWriter.writeUInt64(value);
        bufferWriter.writeUInt32(input.sequence);
        bufferWriter.writeSlice(hashOutputs);
        bufferWriter.writeUInt32(this.locktime);
        bufferWriter.writeUInt32(hashType);
        return bcrypto.hash256(tbuffer);
    }
    getHash(forWitness) {
        if (forWitness && this.isCoinbase())
            return Buffer.alloc(32, 0);
        return bcrypto.hash256(this.__toBuffer(undefined, undefined, forWitness));
    }
    getId() {
        return (0, bufferutils_1.reverseBuffer)(this.getHash(false)).toString('hex');
    }
    toBuffer(buffer, initialOffset) {
        return this.__toBuffer(buffer, initialOffset, true);
    }
    toHex() {
        return this.toBuffer(undefined, undefined).toString('hex');
    }
    setInputScript(index, scriptSig) {
        typeforce(types.tuple(types.Number, types.Buffer), arguments);
        this.ins[index].script = scriptSig;
    }
    setWitness(index, witness) {
        typeforce(types.tuple(types.Number, [types.Buffer]), arguments);
        this.ins[index].witness = witness;
    }
    __toBuffer(buffer, initialOffset, _ALLOW_WITNESS = false) {
        if (!buffer)
            buffer = Buffer.allocUnsafe(this.byteLength(_ALLOW_WITNESS));
        const bufferWriter = new bufferutils_1.BufferWriter(buffer, initialOffset || 0);
        bufferWriter.writeInt32(this.version);
        const hasWitnesses = _ALLOW_WITNESS && this.hasWitnesses();
        if (hasWitnesses) {
            bufferWriter.writeUInt8(Transaction.ADVANCED_TRANSACTION_MARKER);
            bufferWriter.writeUInt8(Transaction.ADVANCED_TRANSACTION_FLAG);
        }
        bufferWriter.writeVarInt(this.ins.length);
        this.ins.forEach(txIn => {
            bufferWriter.writeSlice(txIn.hash);
            bufferWriter.writeUInt32(txIn.index);
            bufferWriter.writeVarSlice(txIn.script);
            bufferWriter.writeUInt32(txIn.sequence);
        });
        bufferWriter.writeVarInt(this.outs.length);
        this.outs.forEach(txOut => {
            if (isOutput(txOut)) {
                bufferWriter.writeUInt64(txOut.value);
            }
            else {
                bufferWriter.writeSlice(txOut.valueBuffer);
            }
            bufferWriter.writeVarSlice(txOut.script);
        });
        if (hasWitnesses) {
            this.ins.forEach(input => {
                bufferWriter.writeVector(input.witness);
            });
        }
        bufferWriter.writeUInt32(this.locktime);
        if (initialOffset !== undefined)
            return buffer.slice(initialOffset, bufferWriter.offset);
        return buffer;
    }
    hashForWitness(inIndex, prevOutScript, value, hashType) {
        typeforce(types.tuple(types.UInt32, types.Buffer, types.Satoshi, types.UInt32), arguments);
        let tbuffer = Buffer.from([]);
        let bufferWriter;
        let hashOutputs = ZERO;
        let hashPrevouts = ZERO;
        let hashSequence = ZERO;
        if (!(hashType & Transaction.SIGHASH_ANYONECANPAY)) {
            tbuffer = Buffer.allocUnsafe(36 * this.ins.length);
            bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
            this.ins.forEach(txIn => {
                bufferWriter.writeSlice(txIn.hash);
                bufferWriter.writeUInt32(txIn.index);
            });
            hashPrevouts = bcrypto.hash256(tbuffer);
        }
        if (!(hashType & Transaction.SIGHASH_ANYONECANPAY) &&
            (hashType & 0x1f) !== Transaction.SIGHASH_SINGLE &&
            (hashType & 0x1f) !== Transaction.SIGHASH_NONE) {
            tbuffer = Buffer.allocUnsafe(4 * this.ins.length);
            bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
            this.ins.forEach(txIn => {
                bufferWriter.writeUInt32(txIn.sequence);
            });
            hashSequence = bcrypto.hash256(tbuffer);
        }
        if ((hashType & 0x1f) !== Transaction.SIGHASH_SINGLE &&
            (hashType & 0x1f) !== Transaction.SIGHASH_NONE) {
            const txOutsSize = this.outs.reduce((sum, output) => {
                return sum + 8 + varSliceSize(output.script);
            }, 0);
            tbuffer = Buffer.allocUnsafe(txOutsSize);
            bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
            this.outs.forEach(out => {
                bufferWriter.writeUInt64(out.value);
                bufferWriter.writeVarSlice(out.script);
            });
            hashOutputs = bcrypto.hash256(tbuffer);
        }
        else if ((hashType & 0x1f) === Transaction.SIGHASH_SINGLE &&
            inIndex < this.outs.length) {
            const output = this.outs[inIndex];
            tbuffer = Buffer.allocUnsafe(8 + varSliceSize(output.script));
            bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
            bufferWriter.writeUInt64(output.value);
            bufferWriter.writeVarSlice(output.script);
            hashOutputs = bcrypto.hash256(tbuffer);
        }
        tbuffer = Buffer.allocUnsafe(156 + prevOutScript.length);
        bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
        const input = this.ins[inIndex];
        bufferWriter.writeInt32(this.version);
        bufferWriter.writeSlice(hashPrevouts);
        bufferWriter.writeSlice(hashSequence);
        bufferWriter.writeSlice(input.hash);
        bufferWriter.writeUInt32(input.index);
        bufferWriter.writeSlice(prevOutScript);
        bufferWriter.writeUInt64(value);
        bufferWriter.writeUInt32(input.sequence);
        bufferWriter.writeSlice(hashOutputs);
        bufferWriter.writeUInt32(this.locktime);
        bufferWriter.writeUInt32(hashType);
        return bcrypto.hash256(tbuffer);
    }
}
exports.Transaction = Transaction;
Transaction.DEFAULT_SEQUENCE = 0xffffffff;
Transaction.SIGHASH_DEFAULT = 0x00;
Transaction.SIGHASH_ALL = 0x01;
Transaction.SIGHASH_NONE = 0x02;
Transaction.SIGHASH_SINGLE = 0x03;
Transaction.SIGHASH_ANYONECANPAY = 0x80;
Transaction.SIGHASH_OUTPUT_MASK = 0x03;
Transaction.SIGHASH_INPUT_MASK = 0x80;
Transaction.SIGHASH_BITCOINCASHBIP143 = 0x40;
Transaction.ADVANCED_TRANSACTION_MARKER = 0x00;
Transaction.ADVANCED_TRANSACTION_FLAG = 0x01;
//# sourceMappingURL=transaction.js.map