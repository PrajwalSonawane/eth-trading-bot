'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = exports.encode = void 0;
const validation_1 = require("./validation");
const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const CHARSET_INVERSE_INDEX = {
    'q': 0, 'p': 1, 'z': 2, 'r': 3, 'y': 4, '9': 5, 'x': 6, '8': 7,
    'g': 8, 'f': 9, '2': 10, 't': 11, 'v': 12, 'd': 13, 'w': 14, '0': 15,
    's': 16, '3': 17, 'j': 18, 'n': 19, '5': 20, '4': 21, 'k': 22, 'h': 23,
    'c': 24, 'e': 25, '6': 26, 'm': 27, 'u': 28, 'a': 29, '7': 30, 'l': 31,
};
function encode(data) {
    var base32 = '';
    for (var i = 0; i < data.length; ++i) {
        var value = data[i];
        (0, validation_1.validate)(0 <= value && value < 32, 'Invalid value: ' + value + '.');
        base32 += CHARSET[value];
    }
    return base32;
}
exports.encode = encode;
function decode(str) {
    var data = new Uint8Array(str.length);
    for (var i = 0; i < str.length; ++i) {
        var value = str[i];
        (0, validation_1.validate)(value in CHARSET_INVERSE_INDEX, 'Invalid value: ' + value + '.');
        data[i] = CHARSET_INVERSE_INDEX[value];
    }
    return data;
}
exports.decode = decode;
//# sourceMappingURL=base32.js.map