import { Module } from "@nestjs/common";
import type { RestRouter } from "@eristack/rest";
import { mountOpinionRouter } from "../express/index.js";
import type { INestApplication } from "@nestjs/common";

export type OpinionModuleOptions = {
  router: RestRouter;
  basePath?: string;
};

/** Mount opinion REST routes on a Nest Express adapter (Horizon — full decorators later). */
@Module({})
export class OpinionModule {
  static forRoot(options: OpinionModuleOptions) {
    return {
      module: OpinionModule,
      providers: [
        {
          provide: "OPINION_ROUTER",
          useValue: options.router,
        },
        {
          provide: "OPINION_BASE_PATH",
          useValue: options.basePath ?? "",
        },
      ],
      exports: ["OPINION_ROUTER"],
    };
  }

  static mount(app: INestApplication, options: OpinionModuleOptions): void {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use(
      options.basePath ?? "/",
      mountOpinionRouter({
        router: options.router,
        basePath: options.basePath,
      }),
    );
  }
}
