/**
 * performanceLogger.ts
 *
 * Wraps any async call and logs performance info to the console in development.
 * No-op in production — the wrapper is stripped to just `return fn()`.
 *
 * Usage:
 *   const result = await withPerfLog('properties.list', () => ctx.db.properties.findMany(...))
 *   const result = await withPerfLog('properties.list', () => fetchFn(), { fromCache: true })
 */

interface PerfLogOptions {
  /** Override cache detection. If omitted, inferred from elapsed time (< 5ms = likely cached). */
  fromCache?: boolean;
}

type MaybeCountable = {
  data?: unknown[];
  items?: unknown[];
  [key: string]: unknown;
};

function getResultCount(result: unknown): number | undefined {
  if (Array.isArray(result)) return result.length;
  if (result && typeof result === 'object') {
    const r = result as MaybeCountable;
    if (Array.isArray(r.data)) return r.data.length;
    if (Array.isArray(r.items)) return r.items.length;
  }
  return undefined;
}

export async function withPerfLog<T>(
  procedureName: string,
  fn: () => Promise<T>,
  options: PerfLogOptions = {}
): Promise<T> {
  // Production: pure passthrough, zero overhead
  if (process.env.NODE_ENV !== 'development') {
    return fn();
  }

  const start = performance.now();
  const result = await fn();
  const elapsed = performance.now() - start;

  const count = getResultCount(result);
  // Heuristic: < 5ms almost certainly served from in-memory cache
  const isCached = options.fromCache ?? elapsed < 5;

  const color = isCached ? '#6366f1' : '#10b981';
  const label = `[PerfLog] ${procedureName} — ${elapsed.toFixed(1)}ms ${isCached ? '⚡ cache' : '🌐 fresh'}`;

  console.groupCollapsed(`%c${label}`, `color: ${color}; font-weight: bold;`);
  console.log('Procedure :', procedureName);
  console.log('Duration  :', `${elapsed.toFixed(2)}ms`);
  if (count !== undefined) console.log('Count     :', count);
  console.log('Source    :', isCached ? 'cache (< 5ms)' : 'fresh fetch');
  console.log('Result    :', result);
  console.groupEnd();

  return result;
}
