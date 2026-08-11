import { Module } from "@nestjs/common";
import { JwtAuthModule } from "@eristack/jwt-auth/nest";
import { jwtAuth } from "./auth.context.js";
import { MeController } from "./me.controller.js";

@Module({
  imports: [
    JwtAuthModule.register({
      jwtAuth,
      refreshTokenTransport: "body",
    }),
  ],
  controllers: [MeController],
})
export class AppModule {}
