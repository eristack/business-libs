import type { BusyHandle } from "./busy.js";

export type RunFeedbackSequenceOptions<T> = {
  confirm?: () => Promise<boolean> | boolean;
  label?: string;
  work: () => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: unknown) => void;
  busy: BusyHandle;
};

/**
 * Headless confirm → busy run → success or error callback. The app owns dialogs and toasts.
 */
export async function runFeedbackSequence<T>(
  options: RunFeedbackSequenceOptions<T>,
): Promise<T | undefined> {
  if (options.confirm !== undefined) {
    const ok = await options.confirm();
    if (!ok) return undefined;
  }
  try {
    const result = await options.busy.run(options.work, options.label);
    options.onSuccess?.(result);
    return result;
  } catch (error) {
    options.onError?.(error);
    return undefined;
  }
}
