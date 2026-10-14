export {
  createWorkshopClient,
  type CreateWorkshopClientOptions,
  type WorkshopClientMode,
} from "./workshop.js";
export {
  DocumentVersionMissingError,
  expectedVersionFromDocument,
  isConflictVersionBody,
  isConflictVersionHttp,
  patchDocumentWithExpectedVersion,
  withExpectedVersion,
  type PatchDocumentResult,
  type VersionedDocument,
} from "./document-version.js";
