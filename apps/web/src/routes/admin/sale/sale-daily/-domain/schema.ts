import z from 'zod';

export const DailySaleSchema = z.object({
  id: z.uuid(),
  date: z.date(),
  productBrandId: z.uuid(),
  realization: z.number(),
});
