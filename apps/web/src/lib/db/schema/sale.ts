import { sql } from 'drizzle-orm';
import {
  date,
  pgTable,
  real,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { productBrands } from './map-product';

export const dailySales = pgTable('daily_sales', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  productBrandId: uuid('product_brand_id')
    .notNull()
    .references(() => productBrands.id),
  realization: real('realization'),
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const salesRealizations = pgTable('sales_realizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportDate: date('report_date').notNull(),
  productBrandId: uuid('product_brand_id')
    .notNull()
    .references(() => productBrands.id),
  realizationDaily: real('realization_daily'),
  month: varchar('month'),
  realizationMonthly: real('realization_monthly'),
  rkapMonthly: real('rkap_monthly'),
  realizationYtd: real('realizaton_ytd'),
  rkapYtd: real('rkap_ytd'),
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  rkapYearly: real('rkap_yearly'),
  realizationLastYear: real('realization_last_year'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
