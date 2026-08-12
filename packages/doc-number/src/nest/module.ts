import {
  DynamicModule,
  Module,
  type InjectionToken,
  type ModuleMetadata,
  type OptionalFactoryDependency,
} from "@nestjs/common";
import type { DocNumberApi } from "../core/create-doc-number.js";
import type { RestDocNumberConfig } from "../rest/index.js";
import { DocNumberController } from "./controller.js";
import { DOC_NUMBER, DOC_NUMBER_REST_CONFIG } from "./tokens.js";

export interface DocNumberModuleOptions extends RestDocNumberConfig {
  docNumber: DocNumberApi;
  /** When false, do not register controller routes. Default true. */
  controller?: boolean;
}

export interface DocNumberModuleAsyncOptions
  extends Pick<ModuleMetadata, "imports"> {
  /**
   * App factory that builds options from injected deps (DB, ConfigService, …).
   * The package never constructs those dependencies.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (
    ...args: any[]
  ) =>
    | Omit<DocNumberModuleOptions, "controller">
    | Promise<Omit<DocNumberModuleOptions, "controller">>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  /** When false, do not register controller routes. Default true. */
  controller?: boolean;
}

const MODULE_OPTIONS = "DOC_NUMBER_MODULE_OPTIONS";

function restConfigFrom(options: RestDocNumberConfig): RestDocNumberConfig {
  return { docNumber: options.docNumber };
}

@Module({})
export class DocNumberModule {
  /** Synchronous register when the app already constructed `docNumber`. */
  static register(options: DocNumberModuleOptions): DynamicModule {
    return {
      module: DocNumberModule,
      controllers: options.controller === false ? [] : [DocNumberController],
      providers: [
        { provide: DOC_NUMBER, useValue: options.docNumber },
        {
          provide: DOC_NUMBER_REST_CONFIG,
          useValue: restConfigFrom(options),
        },
      ],
      exports: [DOC_NUMBER, DOC_NUMBER_REST_CONFIG],
    };
  }

  /**
   * Inject app-owned dependencies and build `docNumber` in `useFactory`.
   *
   * @example
   * ```ts
   * DocNumberModule.registerAsync({
   *   imports: [DatabaseModule],
   *   inject: [DRIZZLE],
   *   useFactory: (db) => ({
   *     docNumber: createDocNumber({
   *       formats: createDrizzleFormatStore({ dialect: "pgsql", db, table }),
   *       sequences: createDrizzleSequenceStore({ dialect: "pgsql", db, table: seqTable }),
   *     }),
   *   }),
   * })
   * ```
   */
  static registerAsync(options: DocNumberModuleAsyncOptions): DynamicModule {
    return {
      module: DocNumberModule,
      imports: options.imports ?? [],
      controllers: options.controller === false ? [] : [DocNumberController],
      providers: [
        {
          provide: MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        {
          provide: DOC_NUMBER,
          useFactory: (opts: RestDocNumberConfig) => opts.docNumber,
          inject: [MODULE_OPTIONS],
        },
        {
          provide: DOC_NUMBER_REST_CONFIG,
          useFactory: (opts: RestDocNumberConfig) => restConfigFrom(opts),
          inject: [MODULE_OPTIONS],
        },
      ],
      exports: [DOC_NUMBER, DOC_NUMBER_REST_CONFIG],
    };
  }
}
