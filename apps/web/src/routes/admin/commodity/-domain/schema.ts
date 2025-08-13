import z from 'zod';

export const CommodityTypeSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  landTypeId: z.uuid(),
});
