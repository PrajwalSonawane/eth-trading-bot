"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = exports.encode = exports.encodingLength = void 0;
const ops_1 = require("./ops");
function encodingLength(i) {
    return i < ops_1.OPS.OP_PUSHDATA1 ? 1 : i <= 0xff ? 2 : i <= 0xffff ? 3 : 5;
}
exports.encodingLength = encodingLength;
function encode(buffer, num, offset) {
    const size = encodingLength(num);
    if (size === 1) {
        buffer.writeUInt8(num, offset);
    }
    else if (size === 2) {
        buffer.writeUInt8(ops_1.OPS.OP_PUSHDATA1, offset);
        buffer.writeUInt8(num, offset + 1);
    }
    else if (size === 3) {
        buffer.writeUInt8(ops_1.OPS.OP_PUSHDATA2, offset);
        buffer.writeUInt16LE(num, offset + 1);
    }
    else {
        buffer.writeUInt8(ops_1.OPS.OP_PUSHDATA4, offset);
        buffer.writeUInt32LE(num, offset + 1);
    }
    return size;
}
exports.encode = encode;
function decode(buffer, offset) {
    const opcode = buffer.readUInt8(offset);
    let num;
    let size;
    if (opcode < ops_1.OPS.OP_PUSHDATA1) {
        num = opcode;
        size = 1;
    }
    else if (opcode === ops_1.OPS.OP_PUSHDATA1) {
        if (offset + 2 > buffer.length)
            return null;
        num = buffer.readUInt8(offset + 1);
        size = 2;
    }
    else if (opcode === ops_1.OPS.OP_PUSHDATA2) {
        if (offset + 3 > buffer.length)
            return null;
        num = buffer.readUInt16LE(offset + 1);
        size = 3;
    }
    else {
        if (offset + 5 > buffer.length)
            return null;
        if (opcode !== ops_1.OPS.OP_PUSHDATA4)
            throw new Error('Unexpected opcode');
        num = buffer.readUInt32LE(offset + 1);
        size = 5;
    }
    return {
        opcode,
        number: num,
        size,
    };
}
exports.decode = decode;
//# sourceMappingURL=push_data.js.map