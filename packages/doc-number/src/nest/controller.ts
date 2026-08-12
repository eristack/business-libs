import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import {
  createRestActions,
  type RestDocNumberConfig,
  type RestResponse,
} from "../rest/index.js";
import { DOC_NUMBER_REST_CONFIG } from "./tokens.js";

function toRestRequest(
  req: Request,
  body: unknown,
  params?: Record<string, string | undefined>,
  query?: Record<string, string | string[] | undefined>,
) {
  return {
    method: req.method,
    headers: {
      get: (name: string) => {
        const value = req.headers[name.toLowerCase()] ?? req.headers[name];
        if (Array.isArray(value)) return value[0] ?? null;
        return value ?? null;
      },
    },
    body,
    params,
    query,
  };
}

function applyRestResponse(res: Response, result: RestResponse): void {
  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }
  }
  res.status(result.status).json(result.body);
}

@Controller("doc-number")
export class DocNumberController {
  private readonly actions: ReturnType<typeof createRestActions>;

  constructor(@Inject(DOC_NUMBER_REST_CONFIG) config: RestDocNumberConfig) {
    this.actions = createRestActions(config);
  }

  @Get("formats")
  async listFormats(
    @Req() req: Request,
    @Res() res: Response,
    @Query("entityKey") entityKey?: string,
  ): Promise<void> {
    applyRestResponse(
      res,
      await this.actions.listFormats(
        toRestRequest(req, undefined, undefined, { entityKey }),
      ),
    );
  }

  @Get("formats/active")
  async getActiveFormat(
    @Req() req: Request,
    @Res() res: Response,
    @Query("entityKey") entityKey?: string,
  ): Promise<void> {
    applyRestResponse(
      res,
      await this.actions.getActiveFormat(
        toRestRequest(req, undefined, undefined, { entityKey }),
      ),
    );
  }

  @Get("formats/:id")
  async getFormatById(
    @Req() req: Request,
    @Res() res: Response,
    @Param("id") id: string,
  ): Promise<void> {
    applyRestResponse(
      res,
      await this.actions.getFormatById(toRestRequest(req, undefined, { id })),
    );
  }

  @Post("formats")
  async createFormat(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: unknown,
  ): Promise<void> {
    applyRestResponse(
      res,
      await this.actions.createFormat(toRestRequest(req, body)),
    );
  }

  @Patch("formats/:id")
  async updateFormat(
    @Req() req: Request,
    @Res() res: Response,
    @Param("id") id: string,
    @Body() body: unknown,
  ): Promise<void> {
    applyRestResponse(
      res,
      await this.actions.updateFormat(toRestRequest(req, body, { id })),
    );
  }

  @Post("preview")
  async preview(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: unknown,
  ): Promise<void> {
    applyRestResponse(
      res,
      await this.actions.preview(toRestRequest(req, body)),
    );
  }
}
