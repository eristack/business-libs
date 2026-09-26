export class FileManagerError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "FileManagerError";
    this.code = code;
  }
}

export class FileNotFoundError extends FileManagerError {
  constructor(id?: string) {
    super("FILE_NOT_FOUND", id ? `File not found: ${id}` : "File not found");
    this.name = "FileNotFoundError";
  }
}

export class FileNotReadyError extends FileManagerError {
  constructor(id: string) {
    super("FILE_NOT_READY", `Upload not completed for file: ${id}`);
    this.name = "FileNotReadyError";
  }
}

export class InvalidFileInputError extends FileManagerError {
  constructor(message: string) {
    super("INVALID_FILE_INPUT", message);
    this.name = "InvalidFileInputError";
  }
}

export class StorageObjectMissingError extends FileManagerError {
  constructor(key: string) {
    super("STORAGE_OBJECT_MISSING", `Object missing in storage: ${key}`);
    this.name = "StorageObjectMissingError";
  }
}
