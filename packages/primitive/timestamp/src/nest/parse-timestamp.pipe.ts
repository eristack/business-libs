import {
  BadRequestException,
  Injectable,
  PipeTransform,
  type ArgumentMetadata,
} from "@nestjs/common";
import { parseTimestampJSON } from "../rest/index.js";
import { RestTimestampFieldError } from "../rest/errors.js";

@Injectable()
export class ParseTimestampPipe implements PipeTransform {
  constructor(private readonly path = "timestamp") {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const path = metadata.data?.toString() || this.path;
    try {
      return parseTimestampJSON(value, path);
    } catch (error) {
      if (error instanceof RestTimestampFieldError) {
        throw new BadRequestException({
          message: error.message,
          issues: error.issues,
        });
      }
      throw error;
    }
  }
}
