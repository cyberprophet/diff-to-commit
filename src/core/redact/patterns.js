"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REDACTION_RULES = void 0;
exports.REDACTION_RULES = [
    {
        name: "authorization-bearer",
        pattern: /(Authorization:\s*Bearer\s+)([A-Za-z0-9\-._~+/]+=*)/gi,
        replace: (match, prefix) => `${prefix}[REDACTED]`
    },
    {
        name: "bearer-token",
        pattern: /\bBearer\s+([A-Za-z0-9\-._~+/]+=*)\b/gi,
        replace: () => "Bearer [REDACTED]"
    },
    {
        name: "api-key-assign",
        pattern: /\b(api[_-]?key|apikey|secret|token|password)\b\s*[:=]\s*(['"]?)([^'"\s]+)\2/gi,
        replace: (match, key, quote) => `${key}: ${quote}[REDACTED]${quote}`
    },
    {
        name: "private-key-block",
        pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
        replace: () => "[REDACTED_PRIVATE_KEY]"
    },
    {
        name: "aws-access-key-id",
        pattern: /\b(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\b/g,
        replace: () => "[REDACTED_AWS_ACCESS_KEY_ID]"
    },
    {
        name: "aws-secret-key",
        pattern: /(aws(.{0,20})?secret(.{0,20})?['"]?\s*[:=]\s*['"]?)([A-Za-z0-9/+=]{40})(['"]?)/gi,
        replace: (match, prefix, _a, _b, _c, _secret, suffix) => `${prefix}[REDACTED]${suffix}`
    }
];
//# sourceMappingURL=patterns.js.map