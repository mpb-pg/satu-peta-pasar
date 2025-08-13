import { and, asc, eq } from 'drizzle-orm';
import z from 'zod';
import { productBrands, productTypes } from '@/lib/db/schema/map-product';
import { stallProductBrands, stalls } from '@/lib/db/schema/stall';
import { protectedProcedure } from '@/lib/orpc';

export const getStallProductBrand = protectedProcedure
  .input(
    z.object({
      stallId: z.string().optional(),
      productBrandId: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const baseQuery = context.db
      .select({
        id: stallProductBrands.id,
        stallId: stallProductBrands.stallId,
        stallName: stalls.name,
        productBrandId: stallProductBrands.productBrandId,
        productBrandName: productBrands.name,
        productBrandType: productTypes.name,
        productBrandIndustry: productBrands.industry,
        description: productBrands.description,
      })
      .from(stallProductBrands)
      .innerJoin(stalls, eq(stallProductBrands.stallId, stalls.id))
      .innerJoin(
        productBrands,
        eq(stallProductBrands.productBrandId, productBrands.id)
      )
      .innerJoin(
        productTypes,
        eq(productBrands.productTypeId, productTypes.id)
      );

    const conditions: ReturnType<typeof eq>[] = [];
    if (input.stallId) {
      conditions.push(eq(stallProductBrands.stallId, input.stallId));
    }
    if (input.productBrandId) {
      conditions.push(
        eq(stallProductBrands.productBrandId, input.productBrandId)
      );
    }

    return {
      data: await baseQuery.where(and(...conditions)).orderBy(asc(stalls.name)),
    };
  });
