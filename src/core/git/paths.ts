export function getChangedPathsFromDiff(diff: string): string[] {
  const paths = new Set<string>();
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
