import { asc } from 'drizzle-orm';
import { provinces } from '@/lib/db/schema/map_product';
import { publicProcedure } from '@/lib/orpc';

export const getAllProvinces = publicProcedure.handler(async ({ context }) => {
  const items = await context.db
    .select({
      id: provinces.id,
      code: provinces.code,
      name: provinces.name,
      area: provinces.area,
    })
    .from(provinces)
    .orderBy(asc(provinces.name));

  return items;
});
