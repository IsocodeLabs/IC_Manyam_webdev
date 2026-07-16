export interface RedirectItem {
  id?: string;
  from_path: string;
  to_path: string;
}

interface CircularResult {
  isCircular: boolean;
  chain: string[];
  isTooDeep: boolean;
}

export function detectCircularRedirect(
  fromPath: string,
  toPath: string,
  allRedirects: RedirectItem[],
  excludeId?: string
): CircularResult {
  const normalizedFrom = fromPath.trim().toLowerCase();
  const normalizedTo = toPath.trim().toLowerCase();

  const chain = [normalizedFrom];
  const visited = new Set<string>([normalizedFrom]);
  
  let current = normalizedTo;
  
  // Filter out the redirect we are currently editing/updating to avoid self-reference
  const redirectsMap = new Map<string, string>();
  for (const r of allRedirects) {
    if (excludeId && r.id === excludeId) continue;
    redirectsMap.set(r.from_path.trim().toLowerCase(), r.to_path.trim().toLowerCase());
  }

  while (true) {
    chain.push(current);
    
    if (visited.has(current)) {
      return { isCircular: true, chain, isTooDeep: false };
    }
    
    visited.add(current);

    if (chain.length > 20) {
      return { isCircular: false, chain, isTooDeep: true };
    }

    const next = redirectsMap.get(current);
    if (!next) {
      break;
    }
    current = next;
  }

  return { isCircular: false, chain, isTooDeep: false };
}
