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
exports.canAdd = exports.check = exports.expected = exports.encode = exports.decode = void 0;
const typeFields_1 = require("../../typeFields");
const tools_1 = require("../tools");
const varuint = __importStar(require("../varint"));
function decode(keyVal) {
    if (keyVal.key[0] !== typeFields_1.InputTypes.WITNESS_UTXO) {
        throw new Error('Decode Error: could not decode witnessUtxo with key 0x' +
            keyVal.key.toString('hex'));
    }
    const value = (0, tools_1.readUInt64LE)(keyVal.value, 0);
    let _offset = 8;
    const scriptLen = varuint.decode(keyVal.value, _offset);
    _offset += varuint.encodingLength(scriptLen);
    const script = keyVal.value.slice(_offset);
    if (script.length !== scriptLen) {
        throw new Error('Decode Error: WITNESS_UTXO script is not proper length');
    }
    return {
        script,
        value,
    };
}
exports.decode = decode;
function encode(data) {
    const { script, value } = data;
    const varintLen = varuint.encodingLength(script.length);
    const result = Buffer.allocUnsafe(8 + varintLen + script.length);
    (0, tools_1.writeUInt64LE)(result, value, 0);
    varuint.encode(script.length, result, 8);
    script.copy(result, 8 + varintLen);
    return {
        key: Buffer.from([typeFields_1.InputTypes.WITNESS_UTXO]),
        value: result,
    };
}
exports.encode = encode;
exports.expected = '{ script: Buffer; value: number; }';
function check(data) {
    return Buffer.isBuffer(data.script) && typeof data.value === 'number';
}
exports.check = check;
function canAdd(currentData, newData) {
    return !!currentData && !!newData && currentData.witnessUtxo === undefined;
}
exports.canAdd = canAdd;
//# sourceMappingURL=witnessUtxo.js.map