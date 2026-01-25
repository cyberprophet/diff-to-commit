"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChangedPathsFromDiff = getChangedPathsFromDiff;
function getChangedPathsFromDiff(diff) {
    const paths = new Set();
    const lines = diff.split("\n");
    for (const line of lines) {
        if (!line.startsWith("diff --git ")) {
            continue;
        }
        const match = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
        if (!match) {
            continue;
        }
        const [, aPath, bPath] = match;
        const path = bPath === "/dev/null" ? aPath : bPath;
        paths.add(path);
    }
    return Array.from(paths);
}
//# sourceMappingURL=paths.js.map