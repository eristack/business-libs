import { Global, Module } from "@nestjs/common";
import { createAppDatabase } from "./create-db.js";
import { APP_DATABASE } from "./tokens.js";

@Global()
@Module({
  providers: [
    {
      provide: APP_DATABASE,
      useFactory: () => createAppDatabase(),
    },
  ],
  exports: [APP_DATABASE],
})
export class DatabaseModule {}
