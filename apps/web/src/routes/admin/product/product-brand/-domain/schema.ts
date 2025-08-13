import z from 'zod';

export const ProductBrandSchema = z.object({
  id: z.uuid(),
  productTypeId: z.uuid(),
  name: z.string(),
  industry: z.string().optional(),
  description: z.string().optional(),
});
