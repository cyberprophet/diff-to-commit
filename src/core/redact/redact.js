"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskSensitive = maskSensitive;
const patterns_1 = require("./patterns");
function maskSensitive(input) {
    let output = input;
    for (const rule of patterns_1.REDACTION_RULES) {
        output = output.replace(rule.pattern, rule.replace);
    }
    return output;
}
//# sourceMappingURL=redact.js.map