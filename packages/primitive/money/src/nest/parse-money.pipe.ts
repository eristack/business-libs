import {
  BadRequestException,
  Injectable,
  PipeTransform,
  type ArgumentMetadata,
} from "@nestjs/common";
import { parseMoneyJSON } from "../rest/index.js";
import { RestMoneyFieldError } from "../rest/errors.js";

@Injectable()
export class ParseMoneyPipe implements PipeTransform {
  constructor(private readonly path = "money") {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const path = metadata.data?.toString() || this.path;
    try {
      return parseMoneyJSON(value, path);
    } catch (error) {
      if (error instanceof RestMoneyFieldError) {
        throw new BadRequestException({
          message: error.message,
          issues: error.issues,
        });
      }
      throw error;
    }
  }
}
