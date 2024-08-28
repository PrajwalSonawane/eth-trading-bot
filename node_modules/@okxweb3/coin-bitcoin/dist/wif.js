"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = exports.decode = exports.encodeRaw = exports.decodeRaw = void 0;
const crypto_lib_1 = require("@okxweb3/crypto-lib");
function decodeRaw(buffer, version) {
    if (version !== undefined && buffer[0] !== version)
        throw new Error('Invalid network version');
    if (buffer.length === 33) {
        return {
            version: buffer[0],
            privateKey: buffer.slice(1, 33),
            compressed: false
        };
    }
    if (buffer.length !== 34)
        throw new Error('Invalid WIF length');
    if (buffer[33] !== 0x01)
        throw new Error('Invalid compression flag');
    return {
        version: buffer[0],
        privateKey: buffer.slice(1, 33),
        compressed: true
    };
}
exports.decodeRaw = decodeRaw;
function encodeRaw(version, privateKey, compressed) {
    const result = Buffer.alloc(compressed ? 34 : 33);
    result.writeUInt8(version, 0);
    privateKey.copy(result, 1);
    if (compressed) {
        result[33] = 0x01;
    }
    return result;
}
exports.encodeRaw = encodeRaw;
function decode(str, version) {
    return decodeRaw(crypto_lib_1.base.fromBase58Check(str), version);
}
exports.decode = decode;
function encode(version, privateKey, compressed) {
    if (typeof version === 'number')
        return crypto_lib_1.base.toBase58Check(encodeRaw(version, privateKey, compressed));
    return crypto_lib_1.base.toBase58Check(encodeRaw(version.version, version.privateKey, version.compressed));
}
exports.encode = encode;
//# sourceMappingURL=wif.js.map