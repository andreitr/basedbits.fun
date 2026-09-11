export class TimeoutError extends Error {
  constructor(
    readonly label: string,
    readonly ms: number,
  ) {
    super(`${label} timed out after ${ms} ms`);
    this.name = "TimeoutError";
  }
}

/**
 * Race `promise` against a timer. Rejects with a TimeoutError once `ms` elapses.
 *
 * This does NOT cancel the underlying work — whatever `promise` was doing keeps running
 * in the background. Use it as an outer safety net around a sequence whose individual
 * steps already carry their own (tighter) timeouts.
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(label, ms)), ms);
  });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
};
