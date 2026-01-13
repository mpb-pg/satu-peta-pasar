import { and, eq, ilike } from 'drizzle-orm';
import z from 'zod';
import {
  commodityTypes,
  productBrands,
  productDosages,
} from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';

export const getProductDosages = protectedProcedure
  .input(
    z.object({
      commodityTypeId: z.string().optional(),
      productBrandId: z.string().optional(),
      search: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const baseQuery = context.db
      .select({
        id: productDosages.id,
        commodityTypeId: productDosages.commodityTypeId,
        commodityTypeName: commodityTypes.name,
        productBrandId: productDosages.productBrandId,
        productBrandName: productBrands.name,
        dosage: productDosages.dosage,
        unit: productDosages.unit,
      })
      .from(productDosages)
      .innerJoin(
        productBrands,
        eq(productDosages.productBrandId, productBrands.id)
      )
      .innerJoin(
        commodityTypes,
        eq(productDosages.commodityTypeId, commodityTypes.id)
      );

    const conditions: ReturnType<typeof ilike | typeof eq>[] = [];
    if (input.commodityTypeId) {
      conditions.push(
        eq(productDosages.commodityTypeId, input.commodityTypeId)
      );
    }
    if (input.productBrandId) {
      conditions.push(eq(productDosages.productBrandId, input.productBrandId));
    }
    if (input.search) {
      conditions.push(ilike(productBrands.name, `%${input.search}%`));
    }

    return {
      data: await baseQuery
        .where(and(...conditions))
        .orderBy(productBrands.name),
    };
  });
