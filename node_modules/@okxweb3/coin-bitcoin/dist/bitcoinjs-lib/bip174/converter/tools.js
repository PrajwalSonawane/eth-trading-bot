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
exports.writeUInt64LE = exports.readUInt64LE = exports.keyValToBuffer = exports.keyValsToBuffer = exports.reverseBuffer = exports.range = void 0;
const varuint = __importStar(require("./varint"));
const range = (n) => [...Array(n).keys()];
exports.range = range;
function reverseBuffer(buffer) {
    if (buffer.length < 1)
        return buffer;
    let j = buffer.length - 1;
    let tmp = 0;
    for (let i = 0; i < buffer.length / 2; i++) {
        tmp = buffer[i];
        buffer[i] = buffer[j];
        buffer[j] = tmp;
        j--;
    }
    return buffer;
}
exports.reverseBuffer = reverseBuffer;
function keyValsToBuffer(keyVals) {
    const buffers = keyVals.map(keyValToBuffer);
    buffers.push(Buffer.from([0]));
    return Buffer.concat(buffers);
}
exports.keyValsToBuffer = keyValsToBuffer;
function keyValToBuffer(keyVal) {
    const keyLen = keyVal.key.length;
    const valLen = keyVal.value.length;
    const keyVarIntLen = varuint.encodingLength(keyLen);
    const valVarIntLen = varuint.encodingLength(valLen);
    const buffer = Buffer.allocUnsafe(keyVarIntLen + keyLen + valVarIntLen + valLen);
    varuint.encode(keyLen, buffer, 0);
    keyVal.key.copy(buffer, keyVarIntLen);
    varuint.encode(valLen, buffer, keyVarIntLen + keyLen);
    keyVal.value.copy(buffer, keyVarIntLen + keyLen + valVarIntLen);
    return buffer;
}
exports.keyValToBuffer = keyValToBuffer;
function verifuint(value, max) {
    if (typeof value !== 'number')
        throw new Error('cannot write a non-number as a number');
    if (value < 0)
        throw new Error('specified a negative value for writing an unsigned value');
    if (value > max)
        throw new Error('RangeError: value out of range');
    if (Math.floor(value) !== value)
        throw new Error('value has a fractional component');
}
function readUInt64LE(buffer, offset) {
    const a = buffer.readUInt32LE(offset);
    let b = buffer.readUInt32LE(offset + 4);
    b *= 0x100000000;
    verifuint(b + a, 0x001fffffffffffff);
    return b + a;
}
exports.readUInt64LE = readUInt64LE;
function writeUInt64LE(buffer, value, offset) {
    verifuint(value, 0x001fffffffffffff);
    buffer.writeInt32LE(value & -1, offset);
    buffer.writeUInt32LE(Math.floor(value / 0x100000000), offset + 4);
    return offset + 8;
}
exports.writeUInt64LE = writeUInt64LE;
//# sourceMappingURL=tools.js.map