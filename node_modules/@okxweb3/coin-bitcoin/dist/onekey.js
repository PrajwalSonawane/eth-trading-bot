"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oneKeyBuildBtcTx = void 0;
const bitcoinjs_lib_1 = require("./bitcoinjs-lib");
const bufferutils_1 = require("./bitcoinjs-lib/bufferutils");
const crypto_lib_1 = require("@okxweb3/crypto-lib");
const wallet_1 = require("./wallet");
const txBuild_1 = require("./txBuild");
const networks_1 = require("./bitcoinjs-lib/networks");
const addressTypeToOneKeyInputScriptType = {
    "legacy": "SPENDADDRESS",
    "segwit_native": "SPENDWITNESS",
    "segwit_nested": "SPENDP2SHWITNESS",
    "segwit_taproot": "SPENDTAPROOT",
};
const addressTypeToOneKeyOutputScriptType = {
    "legacy": "PAYTOADDRESS",
    "segwit_native": "PAYTOWITNESS",
    "segwit_nested": "PAYTOP2SHWITNESS",
    "segwit_taproot": "PAYTOTAPROOT",
};
function oneKeyBuildBtcTx(txData, network = networks_1.bitcoin) {
    const tx = (0, wallet_1.convert2UtxoTx)(txData);
    if (tx.omni) {
        const coinType = (0, wallet_1.number2Hex)(tx.omni.coinType || 31, 8);
        const amount = (0, wallet_1.number2Hex)(tx.omni.amount, 16);
        const omniScript = "6f6d6e69" + "0000" + "0000" + coinType + amount;
        tx.outputs.push({
            address: "",
            amount: 0,
            omniScript,
        });
    }
    const changeAmount = parseInt((0, txBuild_1.signBtc)(tx, "", network, undefined, true, true));
    const dustSize = txData.dustSize || 546;
    if (changeAmount >= dustSize) {
        tx.outputs.push({
            address: tx.address,
            amount: changeAmount,
            derivationPath: tx.derivationPath,
            isChange: true,
        });
    }
    const inputs = [];
    const refTxs = [];
    tx.inputs.forEach((input) => {
        const address_n = parseDerivationPath(input.derivationPath);
        inputs.push({
            address_n,
            prev_hash: input.txId,
            prev_index: input.vOut,
            amount: input.amount.toString(),
            script_type: addressTypeToOneKeyInputScriptType[(0, txBuild_1.getAddressType)(input.address, network)],
        });
        refTxs.push(parseRefTx(input.nonWitnessUtxo, input.txId));
    });
    const outputs = [];
    tx.outputs.forEach((output) => {
        if (output.isChange) {
            outputs.push({
                address_n: parseDerivationPath(output.derivationPath),
                amount: output.amount.toString(),
                script_type: addressTypeToOneKeyOutputScriptType[(0, txBuild_1.getAddressType)(output.address, network)],
            });
        }
        else if (output.omniScript) {
            outputs.push({
                amount: "0",
                op_return_data: output.omniScript,
                script_type: "PAYTOOPRETURN",
            });
        }
        else {
            outputs.push({
                address: output.address,
                amount: output.amount.toString(),
                script_type: "PAYTOADDRESS",
            });
        }
    });
    return {
        inputs: inputs,
        outputs: outputs,
        refTxs: refTxs,
        coin: "btc",
    };
}
exports.oneKeyBuildBtcTx = oneKeyBuildBtcTx;
function parseRefTx(rawTx, txId) {
    const transaction = bitcoinjs_lib_1.Transaction.fromHex(rawTx);
    const refInputs = [];
    transaction.ins.forEach(input => {
        refInputs.push({
            prev_hash: crypto_lib_1.base.toHex((0, bufferutils_1.reverseBuffer)(input.hash)),
            prev_index: input.index,
            script_sig: crypto_lib_1.base.toHex(input.script),
            sequence: input.sequence,
        });
    });
    const refOutputs = [];
    transaction.outs.forEach(output => {
        refOutputs.push({
            amount: output.value,
            script_pubkey: crypto_lib_1.base.toHex(output.script),
        });
    });
    return {
        hash: txId,
        inputs: refInputs,
        bin_outputs: refOutputs,
        lock_time: transaction.locktime,
        version: transaction.version,
    };
}
function parseDerivationPath(path) {
    let splitPath = path.split('/');
    if (splitPath[0] === 'm') {
        splitPath = splitPath.slice(1);
    }
    const address_n = [];
    splitPath.forEach(indexStr => {
        let index;
        if (indexStr.slice(-1) === `'`) {
            index = harden(parseInt(indexStr.slice(0, -1), 10));
        }
        else {
            index = parseInt(indexStr, 10);
        }
        address_n.push(index);
    });
    return address_n;
}
function harden(num) {
    return 0x80000000 + num;
}
//# sourceMappingURL=onekey.js.map