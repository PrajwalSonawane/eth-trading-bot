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
exports.psbtToKeyVals = exports.psbtToBuffer = void 0;
const convert = __importStar(require("../converter"));
const tools_1 = require("../converter/tools");
function psbtToBuffer({ globalMap, inputs, outputs, }) {
    const { globalKeyVals, inputKeyVals, outputKeyVals } = psbtToKeyVals({
        globalMap,
        inputs,
        outputs,
    });
    const globalBuffer = (0, tools_1.keyValsToBuffer)(globalKeyVals);
    const keyValsOrEmptyToBuffer = (keyVals) => keyVals.length === 0 ? [Buffer.from([0])] : keyVals.map(tools_1.keyValsToBuffer);
    const inputBuffers = keyValsOrEmptyToBuffer(inputKeyVals);
    const outputBuffers = keyValsOrEmptyToBuffer(outputKeyVals);
    const header = Buffer.allocUnsafe(5);
    header.writeUIntBE(0x70736274ff, 0, 5);
    return Buffer.concat([header, globalBuffer].concat(inputBuffers, outputBuffers));
}
exports.psbtToBuffer = psbtToBuffer;
const sortKeyVals = (a, b) => {
    return a.key.compare(b.key);
};
function keyValsFromMap(keyValMap, converterFactory) {
    const keyHexSet = new Set();
    const keyVals = Object.entries(keyValMap).reduce((result, [key, value]) => {
        if (key === 'unknownKeyVals')
            return result;
        const converter = converterFactory[key];
        if (converter === undefined)
            return result;
        const encodedKeyVals = (Array.isArray(value) ? value : [value]).map(converter.encode);
        const keyHexes = encodedKeyVals.map(kv => kv.key.toString('hex'));
        keyHexes.forEach(hex => {
            if (keyHexSet.has(hex))
                throw new Error('Serialize Error: Duplicate key: ' + hex);
            keyHexSet.add(hex);
        });
        return result.concat(encodedKeyVals);
    }, []);
    const otherKeyVals = keyValMap.unknownKeyVals
        ? keyValMap.unknownKeyVals.filter((keyVal) => {
            return !keyHexSet.has(keyVal.key.toString('hex'));
        })
        : [];
    return keyVals.concat(otherKeyVals).sort(sortKeyVals);
}
function psbtToKeyVals({ globalMap, inputs, outputs, }) {
    return {
        globalKeyVals: keyValsFromMap(globalMap, convert.globals),
        inputKeyVals: inputs.map(i => keyValsFromMap(i, convert.inputs)),
        outputKeyVals: outputs.map(o => keyValsFromMap(o, convert.outputs)),
    };
}
exports.psbtToKeyVals = psbtToKeyVals;
//# sourceMappingURL=toBuffer.js.map