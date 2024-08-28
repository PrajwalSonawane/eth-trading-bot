"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = exports.decode = exports.check = void 0;
function check(buffer) {
    if (buffer.length < 8)
        return false;
    if (buffer.length > 72)
        return false;
    if (buffer[0] !== 0x30)
        return false;
    if (buffer[1] !== buffer.length - 2)
        return false;
    if (buffer[2] !== 0x02)
        return false;
    const lenR = buffer[3];
    if (lenR === 0)
        return false;
    if (5 + lenR >= buffer.length)
        return false;
    if (buffer[4 + lenR] !== 0x02)
        return false;
    const lenS = buffer[5 + lenR];
    if (lenS === 0)
        return false;
    if (6 + lenR + lenS !== buffer.length)
        return false;
    if (buffer[4] & 0x80)
        return false;
    if (lenR > 1 && buffer[4] === 0x00 && !(buffer[5] & 0x80))
        return false;
    if (buffer[lenR + 6] & 0x80)
        return false;
    if (lenS > 1 && buffer[lenR + 6] === 0x00 && !(buffer[lenR + 7] & 0x80))
        return false;
    return true;
}
exports.check = check;
function decode(buffer) {
    if (buffer.length < 8)
        throw new Error('DER sequence length is too short');
    if (buffer.length > 72)
        throw new Error('DER sequence length is too long');
    if (buffer[0] !== 0x30)
        throw new Error('Expected DER sequence');
    if (buffer[1] !== buffer.length - 2)
        throw new Error('DER sequence length is invalid');
    if (buffer[2] !== 0x02)
        throw new Error('Expected DER integer');
    const lenR = buffer[3];
    if (lenR === 0)
        throw new Error('R length is zero');
    if (5 + lenR >= buffer.length)
        throw new Error('R length is too long');
    if (buffer[4 + lenR] !== 0x02)
        throw new Error('Expected DER integer (2)');
    const lenS = buffer[5 + lenR];
    if (lenS === 0)
        throw new Error('S length is zero');
    if (6 + lenR + lenS !== buffer.length)
        throw new Error('S length is invalid');
    if (buffer[4] & 0x80)
        throw new Error('R value is negative');
    if (lenR > 1 && buffer[4] === 0x00 && !(buffer[5] & 0x80))
        throw new Error('R value excessively padded');
    if (buffer[lenR + 6] & 0x80)
        throw new Error('S value is negative');
    if (lenS > 1 && buffer[lenR + 6] === 0x00 && !(buffer[lenR + 7] & 0x80))
        throw new Error('S value excessively padded');
    return {
        r: buffer.slice(4, 4 + lenR),
        s: buffer.slice(6 + lenR),
    };
}
exports.decode = decode;
function encode(r, s) {
    const lenR = r.length;
    const lenS = s.length;
    if (lenR === 0)
        throw new Error('R length is zero');
    if (lenS === 0)
        throw new Error('S length is zero');
    if (lenR > 33)
        throw new Error('R length is too long');
    if (lenS > 33)
        throw new Error('S length is too long');
    if (r[0] & 0x80)
        throw new Error('R value is negative');
    if (s[0] & 0x80)
        throw new Error('S value is negative');
    if (lenR > 1 && r[0] === 0x00 && !(r[1] & 0x80))
        throw new Error('R value excessively padded');
    if (lenS > 1 && s[0] === 0x00 && !(s[1] & 0x80))
        throw new Error('S value excessively padded');
    const signature = Buffer.allocUnsafe(6 + lenR + lenS);
    signature[0] = 0x30;
    signature[1] = signature.length - 2;
    signature[2] = 0x02;
    signature[3] = r.length;
    r.copy(signature, 4);
    signature[4 + lenR] = 0x02;
    signature[5 + lenR] = s.length;
    s.copy(signature, 6 + lenR);
    return signature;
}
exports.encode = encode;
//# sourceMappingURL=bip66.js.map