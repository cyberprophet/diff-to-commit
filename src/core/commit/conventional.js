"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_TYPES = void 0;
exports.formatConventionalCommit = formatConventionalCommit;
exports.sanitizeSubject = sanitizeSubject;
exports.ALLOWED_TYPES = [
    "feat",
    "fix",
    "docs",
    "refactor",
    "test",
    "chore",
    "build",
    "ci",
    "perf",
    "style",
    "revert"
];
function formatConventionalCommit(message) {
    const type = exports.ALLOWED_TYPES.includes(message.type) ? message.type : "chore";
    const scope = message.scope ? `(${message.scope})` : "";
    const subject = sanitizeSubject(message.subject);
    const body = message.bodyBullets.length
        ? message.bodyBullets.map((line) => `- ${line}`).join("\n")
        : "- update changes";
    return `${type}${scope}: ${subject}\n\n${body}`;
}
function sanitizeSubject(subject) {
    const trimmed = subject.trim().replace(/\.$/, "");
    return trimmed.slice(0, 72).trim();
}
//# sourceMappingURL=conventional.js.map