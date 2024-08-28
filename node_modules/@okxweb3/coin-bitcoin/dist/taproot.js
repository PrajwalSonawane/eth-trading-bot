"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taprootTweakPubkey = exports.taprootTweakPrivKey = void 0;
const crypto_lib_1 = require("@okxweb3/crypto-lib");
const secp256k1 = crypto_lib_1.signUtil.schnorr.secp256k1;
const schnorr = secp256k1.schnorr;
const ProjPoint = secp256k1.secp256k1.ProjectivePoint;
const CURVE_ORDER = secp256k1.secp256k1.CURVE.n;
function tapTweak(a, b) {
    const u = schnorr.utils;
    const t = u.taggedHash('TapTweak', a, b);
    const tn = u.bytesToNumberBE(t);
    if (tn >= CURVE_ORDER)
        throw new Error('tweak higher than curve order');
    return tn;
}
function taprootTweakPrivKey(privKey, merkleRoot = new Uint8Array()) {
    const u = schnorr.utils;
    const seckey0 = u.bytesToNumberBE(privKey);
    const P = ProjPoint.fromPrivateKey(seckey0);
    const seckey = P.hasEvenY() ? seckey0 : u.mod(-seckey0, CURVE_ORDER);
    const xP = u.pointToBytes(P);
    const t = tapTweak(xP, merkleRoot);
    return u.numberToBytesBE(u.mod(seckey + t, CURVE_ORDER), 32);
}
exports.taprootTweakPrivKey = taprootTweakPrivKey;
function taprootTweakPubkey(pubKey, h) {
    if (!h)
        h = new Uint8Array();
    const u = schnorr.utils;
    const t = tapTweak(pubKey, h);
    const P = u.lift_x(u.bytesToNumberBE(pubKey));
    const Q = P.add(ProjPoint.fromPrivateKey(t));
    const parity = Q.hasEvenY() ? 0 : 1;
    return [u.pointToBytes(Q), parity];
}
exports.taprootTweakPubkey = taprootTweakPubkey;
//# sourceMappingURL=taproot.js.map