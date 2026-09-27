import type { Express } from "express";

/** Vercel Node serverless handler signature (IncomingMessage + ServerResponse). */
export type VercelNodeHandler = (
  req: unknown,
  res: unknown,
) => void | Promise<void>;

/**
 * Wrap an Express app as the default export for `@vercel/node`.
 * Pair with `@eristack/logger` requestId middleware inside the app.
 */
export function createVercelExpressHandler(app: Express): VercelNodeHandler {
  return app as unknown as VercelNodeHandler;
}

export type VercelDeployNotes = {
  maxDurationSeconds: number;
  bodySizeLimit: string;
  coldStart: string;
};

export const defaultVercelDeployNotes: VercelDeployNotes = {
  maxDurationSeconds: 60,
  bodySizeLimit: "4.5mb on Hobby — configure in vercel.json",
  coldStart: "Keep Express app singleton; lazy-init Drizzle pool on first request",
};
