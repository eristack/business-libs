import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@eristack/jwt-auth/nest";
import type { AuthContext } from "@eristack/jwt-auth/rest";

type AuthedRequest = {
  auth?: AuthContext;
};

@Controller()
export class MeController {
  @Get("health")
  health() {
    return { ok: true, example: "nestjs" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthedRequest) {
    return {
      subject: req.auth!.subject,
      claims: req.auth!.claims,
    };
  }
}
