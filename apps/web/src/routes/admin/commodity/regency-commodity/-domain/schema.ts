import z from 'zod';

export const RegencyCommoditySchema = z.object({
  id: z.uuid(),
  regencyId: z.uuid(),
  commodityTypeId: z.uuid(),
  area: z.number(),
  year: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
