// Custom error name (e.g. "InsufficientUSDCForTicket") from a viem contract error. Walks `cause` by shape rather
// than instanceof, since wagmi bundles its own viem copy whose error classes differ from the root one.
export const revertName = (error: unknown): string | undefined => {
  let current = error as
    | { cause?: unknown; data?: { errorName?: string } }
    | undefined;
  for (let depth = 0; current && depth < 10; depth++) {
    if (current.data?.errorName) return current.data.errorName;
    current = current.cause as typeof current;
  }
  return undefined;
};
