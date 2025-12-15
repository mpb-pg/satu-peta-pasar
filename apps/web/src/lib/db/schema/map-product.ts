import { sql } from 'drizzle-orm';
import { pgTable, real, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const provinces = pgTable('provinces', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 3 }).notNull().unique(),
  name: varchar('name').notNull(),
  area: real('area'),
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const regencies = pgTable('regencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 5 }).notNull().unique(),
  provinceId: uuid('province_id')
    .notNull()
    .references(() => provinces.id, { onDelete: 'cascade' }),
  name: varchar('name').notNull(),
  area: real('area'),
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const landTypes = pgTable('land_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(), // ex. Pangan, Kebun, Horti, Tambak
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const provinceLands = pgTable('province_lands', {
  id: uuid('id').primaryKey().defaultRandom(),
  provinceId: uuid('province_id')
    .notNull()
    .references(() => provinces.id),
  landTypeId: uuid('land_type_id')
    .notNull()
    .references(() => landTypes.id),
  area: real('area'),
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const regencyLands = pgTable('regency_lands', {
  id: uuid('id').primaryKey().defaultRandom(),
  regencyId: uuid('regency_id')
    .notNull()
    .references(() => regencies.id),
  landTypeId: uuid('land_type_id')
    .notNull()
    .references(() => landTypes.id),
  area: real('area'),
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const commodityTypes = pgTable('commodity_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  landTypeId: uuid('land_type_id')
    .notNull()
    .references(() => landTypes.id),
  name: varchar('name').notNull(), // ex. Padi, Sawit, Bawang Merah
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const provinceCommodities = pgTable('province_commodities', {
  id: uuid('id').primaryKey().defaultRandom(),
  provinceId: uuid('province_id')
    .notNull()
    .references(() => provinces.id),
  commodityTypeId: uuid('commodity_type_id')
    .notNull()
    .references(() => commodityTypes.id),
  area: real('area'),
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const regencyCommodities = pgTable('regency_commodities', {
  id: uuid('id').primaryKey().defaultRandom(),
  regencyId: uuid('regency_id')
    .notNull()
    .references(() => regencies.id),
  commodityTypeId: uuid('commodity_type_id')
    .notNull()
    .references(() => commodityTypes.id),
  area: real('area'),
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productTypes = pgTable('product_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(), // ex. Pupuk PSO, Probiotik, Dekomposer
  description: varchar('description'),
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productBrands = pgTable('product_brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  productTypeId: uuid('product_type_id')
    .notNull()
    .references(() => productTypes.id),
  name: varchar('name').notNull(), // ex. Urea, Petroganik, Petrofish
  industry: varchar('industry'),
  description: varchar('description'),
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productDosages = pgTable('product_dosages', {
  id: uuid('id').primaryKey().defaultRandom(),
  commodityTypeId: uuid('commodity_type_id')
    .notNull()
    .references(() => commodityTypes.id),
  productBrandId: uuid('product_brand_id')
    .notNull()
    .references(() => productBrands.id),
  dosage: real('dosage'), // kg/ha
  unit: varchar('unit'),
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  createdAt: timestamp('created_at').defaultNow(),
});

export const provincePotentials = pgTable('province_potentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  provinceId: uuid('province_id')
    .notNull()
    .references(() => provinces.id),
  productBrandId: uuid('product_brand_id')
    .notNull()
    .references(() => productBrands.id),
  potential: real('potential'),
  description: varchar('description'),
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const regencyPotentials = pgTable('regency_potentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  regencyId: uuid('regency_id')
    .notNull()
    .references(() => regencies.id),
  productBrandId: uuid('product_brand_id')
    .notNull()
    .references(() => productBrands.id),
  potential: real('potential'),
  description: varchar('description'),
  year: varchar('year').default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::text`),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
