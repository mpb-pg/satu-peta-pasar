import { sql } from 'drizzle-orm';
import { pgTable, real, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { productBrands, provinces, regencies } from './map-product';

export const stalls = pgTable('stalls', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  address: varchar('address'),
  regencyId: uuid('regency_id')
    .notNull()
    .references(() => regencies.id),
  provinceId: uuid('province_id')
    .notNull()
    .references(() => provinces.id),
  latitude: real('latitude'),
  longitude: real('longitude'),
  owner: varchar('owner'),
  noTelp: varchar('no_telp'),
  criteria: varchar('criteria', { length: 1 }),
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const stallProductBrands = pgTable('stall_product_brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  stallId: uuid('stall_id')
    .notNull()
    .references(() => stalls.id),
  productBrandId: uuid('product_brand_id')
    .notNull()
    .references(() => productBrands.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
