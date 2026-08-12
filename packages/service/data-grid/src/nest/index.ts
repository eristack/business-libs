import {
  Inject,
  createParamDecorator,
  type ExecutionContext,
  BadRequestException,
  Injectable,
  PipeTransform,
  type DynamicModule,
  Module,
} from "@nestjs/common";
import { createDataGrid } from "../core/create-data-grid.js";
import {
  InvalidOperatorError,
  InvalidQueryError,
} from "../core/errors.js";
import type { DataGridQuery, DataGridSchema } from "../core/types.js";
import { DATA_GRID_SCHEMA } from "./tokens.js";

export { DATA_GRID_SCHEMA } from "./tokens.js";

function queryRecord(raw: unknown): Record<string, string | string[] | undefined> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string" || Array.isArray(value)) {
      out[key] = value as string | string[];
    } else if (value == null) {
      out[key] = undefined;
    } else {
      out[key] = String(value);
    }
  }
  return out;
}

@Injectable()
export class ParseDataGridPipe implements PipeTransform {
  constructor(@Inject(DATA_GRID_SCHEMA) private readonly schema: DataGridSchema) {}

  transform(value: unknown): DataGridQuery {
    try {
      return createDataGrid(this.schema).parse(queryRecord(value));
    } catch (error) {
      if (error instanceof InvalidQueryError || error instanceof InvalidOperatorError) {
        throw new BadRequestException({
          error: { code: error.code, message: error.message },
        });
      }
      throw error;
    }
  }
}

/** Param decorator: `@DataGridQuery() query: DataGridQuery` (needs schema provider). */
export const DataGridQueryParam = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Record<string, string | string[] | undefined> => {
    const req = ctx.switchToHttp().getRequest<{ query?: unknown }>();
    return queryRecord(req.query);
  },
);

export interface DataGridModuleOptions {
  schema: DataGridSchema;
}

@Module({})
export class DataGridModule {
  static register(options: DataGridModuleOptions): DynamicModule {
    return {
      module: DataGridModule,
      providers: [
        { provide: DATA_GRID_SCHEMA, useValue: options.schema },
        {
          provide: ParseDataGridPipe,
          useFactory: (schema: DataGridSchema) => new ParseDataGridPipe(schema),
          inject: [DATA_GRID_SCHEMA],
        },
      ],
      exports: [DATA_GRID_SCHEMA, ParseDataGridPipe],
    };
  }
}

export function parseDataGridNestQuery(
  query: unknown,
  schema: DataGridSchema,
): DataGridQuery {
  return createDataGrid(schema).parse(queryRecord(query));
}
