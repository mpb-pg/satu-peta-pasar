import {
  pgTable,
  uuid,
  varchar,
  real,
  timestamp,
} from "drizzle-orm/pg-core";
import { provinces, regencies } from "./map_product";

export const stalls = pgTable("stalls", {
  id: uuid("id").primaryKey(),
  name: varchar("name").notNull(),
  address: varchar("address"),
  regencyId: uuid("regency_id")
    .notNull()
    .references(() => regencies.id),
  provinceId: uuid("province_id")
    .notNull()
    .references(() => provinces.id),
  latitude: real("latitude"),
  longitude: real("longitude"),
  owner: varchar("owner"),
  noTelp: varchar("no_telp"),
  criteria: varchar("criteria", { length: 1 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});