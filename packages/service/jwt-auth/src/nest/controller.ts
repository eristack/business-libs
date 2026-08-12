import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import {
  createRestActions,
  serializeClearCookie,
  serializeSetCookie,
  type RestAuthConfig,
  type RestResponse,
} from "../rest/index.js";
import { JWT_AUTH_REST_CONFIG } from "./tokens.js";

function flattenQuery(
  query: Request["query"],
): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(query)) {
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

function toRestRequest(
  req: Request,
  body: unknown,
  params?: Record<string, string | undefined>,
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
    cookies: {
      get: (name: string) => {
        const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
        return cookies?.[name];
      },
    },
    body,
    params,
    query: flattenQuery(req.query),
  };
}

function applyRestResponse(res: Response, result: RestResponse): void {
  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }
  }
  if (result.cookies) {
    for (const cookie of result.cookies) {
      res.append("Set-Cookie", serializeSetCookie(cookie));
    }
  }
  if (result.clearCookies) {
    for (const name of result.clearCookies) {
      res.append("Set-Cookie", serializeClearCookie(name));
    }
  }
  res.status(result.status).json(result.body);
}

@Controller("auth")
export class JwtAuthController {
  private readonly actions: ReturnType<typeof createRestActions>;

  constructor(@Inject(JWT_AUTH_REST_CONFIG) config: RestAuthConfig) {
    this.actions = createRestActions(config);
  }

  @Post("issue")
  async issue(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: unknown,
  ): Promise<void> {
    applyRestResponse(res, await this.actions.issue(toRestRequest(req, body)));
  }

  @Post("login")
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: unknown,
  ): Promise<void> {
    applyRestResponse(res, await this.actions.login(toRestRequest(req, body)));
  }

  @Post("change-password")
  async changePassword(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: unknown,
  ): Promise<void> {
    applyRestResponse(
      res,
      await this.actions.changePassword(toRestRequest(req, body)),
    );
  }

  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: unknown,
  ): Promise<void> {
    applyRestResponse(res, await this.actions.refresh(toRestRequest(req, body)));
  }

  @Post("logout")
  async logout(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: unknown,
  ): Promise<void> {
    applyRestResponse(res, await this.actions.logout(toRestRequest(req, body)));
  }

  @Post("logout-all")
  async logoutAll(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: unknown,
    @Headers("authorization") _authorization?: string,
  ): Promise<void> {
    applyRestResponse(res, await this.actions.logoutAll(toRestRequest(req, body)));
  }

  @Get("sessions")
  async listSessions(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    applyRestResponse(res, await this.actions.listSessions(toRestRequest(req, undefined)));
  }

  @Delete("sessions/:sessionId")
  async revokeSession(
    @Req() req: Request,
    @Res() res: Response,
    @Param("sessionId") sessionId: string,
    @Body() body: unknown,
  ): Promise<void> {
    applyRestResponse(
      res,
      await this.actions.revokeSession(toRestRequest(req, body, { sessionId })),
    );
  }
}
