'use strict';
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
exports.decode = exports.encode = void 0;
const base32 = __importStar(require("./base32"));
const bigInt = require('big-integer');
const convertBits = __importStar(require("./convertBits"));
const validation_1 = require("./validation");
function encode(prefix, type, hash) {
    const prefixData = concat(prefixToUint5Array(prefix), new Uint8Array(1));
    const versionByte = getTypeBits(type) + getHashSizeBits(hash);
    const payloadData = toUint5Array(concat(new Uint8Array([versionByte]), hash));
    const checksumData = concat(concat(prefixData, payloadData), new Uint8Array(8));
    const payload = concat(payloadData, checksumToUint5Array(polymod(checksumData)));
    return prefix + ':' + base32.encode(payload);
}
exports.encode = encode;
function decode(address) {
    const pieces = address.toLowerCase().split(':');
    (0, validation_1.validate)(pieces.length === 2, 'Missing prefix: ' + address + '.');
    const prefix = pieces[0];
    const payload = base32.decode(pieces[1]);
    (0, validation_1.validate)(validChecksum(prefix, payload), 'Invalid checksum: ' + address + '.');
    const payloadData = fromUint5Array(payload.subarray(0, -8));
    const versionByte = payloadData[0];
    const hash = payloadData.subarray(1);
    (0, validation_1.validate)(getHashSize(versionByte) === hash.length * 8, 'Invalid hash size: ' + address + '.');
    const type = getType(versionByte);
    return {
        prefix: prefix,
        type: type,
        hash: hash,
    };
}
exports.decode = decode;
var VALID_PREFIXES = ['bitcoincash', 'bchtest', 'bchreg'];
function isValidPrefix(prefix) {
    return hasSingleCase(prefix) && VALID_PREFIXES.indexOf(prefix.toLowerCase()) !== -1;
}
function prefixToUint5Array(prefix) {
    var result = new Uint8Array(prefix.length);
    for (var i = 0; i < prefix.length; ++i) {
        result[i] = prefix[i].charCodeAt(0) & 31;
    }
    return result;
}
function checksumToUint5Array(checksum) {
    var result = new Uint8Array(8);
    for (var i = 0; i < 8; ++i) {
        result[7 - i] = checksum.and(31).toJSNumber();
        checksum = checksum.shiftRight(5);
    }
    return result;
}
function getTypeBits(type) {
    switch (type) {
        case 'P2PKH':
            return 0;
        case 'P2SH':
            return 8;
        default:
            throw new Error('Invalid type: ' + type + '.');
    }
}
function getType(versionByte) {
    switch (versionByte & 120) {
        case 0:
            return 'P2PKH';
        case 8:
            return 'P2SH';
        default:
            throw new Error('Invalid address type in version byte: ' + versionByte + '.');
    }
}
function getHashSizeBits(hash) {
    switch (hash.length * 8) {
        case 160:
            return 0;
        case 192:
            return 1;
        case 224:
            return 2;
        case 256:
            return 3;
        case 320:
            return 4;
        case 384:
            return 5;
        case 448:
            return 6;
        case 512:
            return 7;
        default:
            throw new Error('Invalid hash size: ' + hash.length + '.');
    }
}
function getHashSize(versionByte) {
    switch (versionByte & 7) {
        case 0:
            return 160;
        case 1:
            return 192;
        case 2:
            return 224;
        case 3:
            return 256;
        case 4:
            return 320;
        case 5:
            return 384;
        case 6:
            return 448;
        case 7:
            return 512;
    }
}
function toUint5Array(data) {
    return convertBits.convert(data, 8, 5, false);
}
function fromUint5Array(data) {
    return convertBits.convert(data, 5, 8, true);
}
function concat(a, b) {
    var ab = new Uint8Array(a.length + b.length);
    ab.set(a);
    ab.set(b, a.length);
    return ab;
}
function polymod(data) {
    var GENERATOR = [0x98f2bc8e61, 0x79b76d99e2, 0xf33e5fb3c4, 0xae2eabe2a8, 0x1e4f43e470];
    var checksum = bigInt(1);
    for (var i = 0; i < data.length; ++i) {
        var value = data[i];
        var topBits = checksum.shiftRight(35);
        checksum = checksum.and(0x07ffffffff).shiftLeft(5).xor(value);
        for (var j = 0; j < GENERATOR.length; ++j) {
            if (topBits.shiftRight(j).and(1).equals(1)) {
                checksum = checksum.xor(GENERATOR[j]);
            }
        }
    }
    return checksum.xor(1);
}
function validChecksum(prefix, payload) {
    var prefixData = concat(prefixToUint5Array(prefix), new Uint8Array(1));
    var checksumData = concat(prefixData, payload);
    return polymod(checksumData).equals(0);
}
function hasSingleCase(str) {
    return str === str.toLowerCase() || str === str.toUpperCase();
}
//# sourceMappingURL=cashaddr.js.map