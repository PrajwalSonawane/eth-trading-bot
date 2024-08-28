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
exports.defaultLocktimeSetter = exports.defaultVersionSetter = exports.addOutputAttributes = exports.addInputAttributes = exports.updateOutput = exports.updateInput = exports.updateGlobal = exports.inputCheckUncleanFinalized = exports.getEnumLength = exports.checkHasKey = exports.checkForOutput = exports.checkForInput = void 0;
const converter = __importStar(require("./converter"));
function checkForInput(inputs, inputIndex) {
    const input = inputs[inputIndex];
    if (input === undefined)
        throw new Error(`No input #${inputIndex}`);
    return input;
}
exports.checkForInput = checkForInput;
function checkForOutput(outputs, outputIndex) {
    const output = outputs[outputIndex];
    if (output === undefined)
        throw new Error(`No output #${outputIndex}`);
    return output;
}
exports.checkForOutput = checkForOutput;
function checkHasKey(checkKeyVal, keyVals, enumLength) {
    if (checkKeyVal.key[0] < enumLength) {
        throw new Error(`Use the method for your specific key instead of addUnknownKeyVal*`);
    }
    if (keyVals &&
        keyVals.filter(kv => kv.key.equals(checkKeyVal.key)).length !== 0) {
        throw new Error(`Duplicate Key: ${checkKeyVal.key.toString('hex')}`);
    }
}
exports.checkHasKey = checkHasKey;
function getEnumLength(myenum) {
    let count = 0;
    Object.keys(myenum).forEach(val => {
        if (Number(isNaN(Number(val)))) {
            count++;
        }
    });
    return count;
}
exports.getEnumLength = getEnumLength;
function inputCheckUncleanFinalized(inputIndex, input) {
    let result = false;
    if (input.nonWitnessUtxo || input.witnessUtxo) {
        const needScriptSig = !!input.redeemScript;
        const needWitnessScript = !!input.witnessScript;
        const scriptSigOK = !needScriptSig || !!input.finalScriptSig;
        const witnessScriptOK = !needWitnessScript || !!input.finalScriptWitness;
        const hasOneFinal = !!input.finalScriptSig || !!input.finalScriptWitness;
        result = scriptSigOK && witnessScriptOK && hasOneFinal;
    }
    if (result === false) {
        throw new Error(`Input #${inputIndex} has too much or too little data to clean`);
    }
}
exports.inputCheckUncleanFinalized = inputCheckUncleanFinalized;
function throwForUpdateMaker(typeName, name, expected, data) {
    throw new Error(`Data for ${typeName} key ${name} is incorrect: Expected ` +
        `${expected} and got ${JSON.stringify(data)}`);
}
function updateMaker(typeName) {
    return (updateData, mainData) => {
        for (const name of Object.keys(updateData)) {
            const data = updateData[name];
            const { canAdd, canAddToArray, check, expected } = converter[typeName + 's'][name] || {};
            const isArray = !!canAddToArray;
            if (check) {
                if (isArray) {
                    if (!Array.isArray(data) ||
                        (mainData[name] && !Array.isArray(mainData[name]))) {
                        throw new Error(`Key type ${name} must be an array`);
                    }
                    if (!data.every(check)) {
                        throwForUpdateMaker(typeName, name, expected, data);
                    }
                    const arr = mainData[name] || [];
                    const dupeCheckSet = new Set();
                    if (!data.every(v => canAddToArray(arr, v, dupeCheckSet))) {
                        throw new Error('Can not add duplicate data to array');
                    }
                    mainData[name] = arr.concat(data);
                }
                else {
                    if (!check(data)) {
                        throwForUpdateMaker(typeName, name, expected, data);
                    }
                    if (!canAdd(mainData, data)) {
                        throw new Error(`Can not add duplicate data to ${typeName}`);
                    }
                    mainData[name] = data;
                }
            }
        }
    };
}
exports.updateGlobal = updateMaker('global');
exports.updateInput = updateMaker('input');
exports.updateOutput = updateMaker('output');
function addInputAttributes(inputs, data) {
    const index = inputs.length - 1;
    const input = checkForInput(inputs, index);
    (0, exports.updateInput)(data, input);
}
exports.addInputAttributes = addInputAttributes;
function addOutputAttributes(outputs, data) {
    const index = outputs.length - 1;
    const output = checkForOutput(outputs, index);
    (0, exports.updateOutput)(data, output);
}
exports.addOutputAttributes = addOutputAttributes;
function defaultVersionSetter(version, txBuf) {
    if (!Buffer.isBuffer(txBuf) || txBuf.length < 4) {
        throw new Error('Set Version: Invalid Transaction');
    }
    txBuf.writeUInt32LE(version, 0);
    return txBuf;
}
exports.defaultVersionSetter = defaultVersionSetter;
function defaultLocktimeSetter(locktime, txBuf) {
    if (!Buffer.isBuffer(txBuf) || txBuf.length < 4) {
        throw new Error('Set Locktime: Invalid Transaction');
    }
    txBuf.writeUInt32LE(locktime, txBuf.length - 4);
    return txBuf;
}
exports.defaultLocktimeSetter = defaultLocktimeSetter;
//# sourceMappingURL=utils.js.map