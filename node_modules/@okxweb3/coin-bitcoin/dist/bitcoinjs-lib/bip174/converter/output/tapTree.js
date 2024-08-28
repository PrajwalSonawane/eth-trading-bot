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
const varuint = __importStar(require("../varint"));
function decode(keyVal) {
    if (keyVal.key[0] !== typeFields_1.OutputTypes.TAP_TREE || keyVal.key.length !== 1) {
        throw new Error('Decode Error: could not decode tapTree with key 0x' +
            keyVal.key.toString('hex'));
    }
    let _offset = 0;
    const data = [];
    while (_offset < keyVal.value.length) {
        const depth = keyVal.value[_offset++];
        const leafVersion = keyVal.value[_offset++];
        const scriptLen = varuint.decode(keyVal.value, _offset);
        _offset += varuint.encodingLength(scriptLen);
        data.push({
            depth,
            leafVersion,
            script: keyVal.value.slice(_offset, _offset + scriptLen),
        });
        _offset += scriptLen;
    }
    return { leaves: data };
}
exports.decode = decode;
function encode(tree) {
    const key = Buffer.from([typeFields_1.OutputTypes.TAP_TREE]);
    const bufs = [].concat(...tree.leaves.map(tapLeaf => [
        Buffer.of(tapLeaf.depth, tapLeaf.leafVersion),
        varuint.encode(tapLeaf.script.length),
        tapLeaf.script,
    ]));
    return {
        key,
        value: Buffer.concat(bufs),
    };
}
exports.encode = encode;
exports.expected = '{ leaves: [{ depth: number; leafVersion: number, script: Buffer; }] }';
function check(data) {
    return (Array.isArray(data.leaves) &&
        data.leaves.every((tapLeaf) => tapLeaf.depth >= 0 &&
            tapLeaf.depth <= 128 &&
            (tapLeaf.leafVersion & 0xfe) === tapLeaf.leafVersion &&
            Buffer.isBuffer(tapLeaf.script)));
}
exports.check = check;
function canAdd(currentData, newData) {
    return !!currentData && !!newData && currentData.tapTree === undefined;
}
exports.canAdd = canAdd;
//# sourceMappingURL=tapTree.js.map