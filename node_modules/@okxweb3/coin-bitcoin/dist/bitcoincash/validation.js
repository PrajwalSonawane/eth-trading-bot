'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
function validate(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
exports.validate = validate;
//# sourceMappingURL=validation.js.map