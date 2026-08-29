import { Controller, Get, Inject, Query } from "@nestjs/common";
import type { DataGridQuery } from "@eristack/data-grid";
import { ParseDataGridPipe } from "@eristack/data-grid/nest";
import { toDataGridBody } from "@eristack/data-grid/rest";
import type { AppDatabase } from "./database/create-db.js";
import { APP_DATABASE } from "./database/tokens.js";
import { listOrders } from "./orders/list-orders.js";

@Controller("orders")
export class OrdersController {
  constructor(@Inject(APP_DATABASE) private readonly appDb: AppDatabase) {}

  @Get()
  async list(@Query(ParseDataGridPipe) query: DataGridQuery) {
    const result = await listOrders(this.appDb.db, query);
    return toDataGridBody(result);
  }
}
