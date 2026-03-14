import {
  pgTable,
  serial,
  integer,
  numeric,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  balance: numeric("balance", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
