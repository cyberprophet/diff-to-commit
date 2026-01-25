export function inferScopeFromPaths(paths: string[]): string | undefined {
  const counts = new Map<string, number>();

  for (const filePath of paths) {
    const topLevel = filePath.split("/")[0];
    if (!topLevel || topLevel === filePath) {
      continue;
    }
    counts.set(topLevel, (counts.get(topLevel) ?? 0) + 1);
  }

  if (counts.size === 0) {
    return undefined;
  }

  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const [top, topCount] = sorted[0];
  const secondCount = sorted[1]?.[1] ?? 0;

  if (topCount === 0 || topCount === secondCount) {
    return undefined;
  }

  return top;
}
