import {
  All,
  Controller,
  Inject,
  Req,
  Res,
  type DynamicModule,
} from "@nestjs/common";
import type { Request, Response } from "express";
import type { RestRouter } from "../core/types.js";

export const REST_ROUTER = Symbol("ERISTACK_REST_ROUTER");
export const REST_BASE_PATH = Symbol("ERISTACK_REST_BASE_PATH");

@Controller()
export class RestDispatchController {
  constructor(
    @Inject(REST_ROUTER) private readonly router: RestRouter,
    @Inject(REST_BASE_PATH) private readonly basePath: string,
  ) {}

  @All("*")
  async dispatch(@Req() req: Request, @Res() res: Response): Promise<void> {
    let path = req.path;
    const base = this.basePath.replace(/\/$/, "");
    if (base && path.startsWith(base)) {
      path = path.slice(base.length) || "/";
    }

    const result = await this.router.dispatch({
      method: req.method,
      path,
      query: req.query as Record<string, string | string[] | undefined>,
      body: req.body,
      headers: req.headers as Record<string, string | string[] | undefined>,
    });

    if (!result.matched) {
      res.status(404).json({
        error: { code: "NOT_FOUND", message: "No route" },
      });
      return;
    }

    const { response } = result;
    if (response.headers) {
      for (const [key, value] of Object.entries(response.headers)) {
        res.setHeader(key, value);
      }
    }
    if (response.body === undefined) {
      res.sendStatus(response.status);
      return;
    }
    res.status(response.status).json(response.body);
  }
}

export type RestModuleOptions = {
  router: RestRouter;
  basePath?: string;
};

export class RestModule {
  static forRoutes(options: RestModuleOptions): DynamicModule {
    return {
      module: RestModule,
      controllers: [RestDispatchController],
      providers: [
        { provide: REST_ROUTER, useValue: options.router },
        { provide: REST_BASE_PATH, useValue: options.basePath ?? "" },
      ],
      exports: [REST_ROUTER],
    };
  }
}
