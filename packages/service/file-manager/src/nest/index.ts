/**
 * Nest apps mount the same Express router on the underlying Express instance, or use
 * `@nestjs/platform-express` middleware:
 *
 * ```ts
 * import { createFileManagerRouter } from "@eristack/file-manager/express";
 * app.use("/files", createFileManagerRouter({ fileManager }));
 * ```
 */
export { createFileManagerRouter } from "../express/index.js";
