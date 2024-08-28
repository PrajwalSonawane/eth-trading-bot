'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert = void 0;
const validation_1 = require("./validation");
function convert(data, from, to, strictMode) {
    var length = strictMode
        ? Math.floor(data.length * from / to)
        : Math.ceil(data.length * from / to);
    var mask = (1 << to) - 1;
    var result = new Uint8Array(length);
    var index = 0;
    var accumulator = 0;
    var bits = 0;
    for (var i = 0; i < data.length; ++i) {
        var value = data[i];
        (0, validation_1.validate)(0 <= value && (value >> from) === 0, 'Invalid value: ' + value + '.');
        accumulator = (accumulator << from) | value;
        bits += from;
        while (bits >= to) {
            bits -= to;
            result[index] = (accumulator >> bits) & mask;
            ++index;
        }
    }
    if (!strictMode) {
        if (bits > 0) {
            result[index] = (accumulator << (to - bits)) & mask;
            ++index;
        }
    }
    else {
        (0, validation_1.validate)(bits < from && ((accumulator << (to - bits)) & mask) === 0, 'Input cannot be converted to ' + to + ' bits without padding, but strict mode was used.');
    }
    return result;
}
exports.convert = convert;
//# sourceMappingURL=convertBits.js.map