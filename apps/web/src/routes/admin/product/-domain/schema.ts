import z from 'zod';

export const ProductTypeSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().optional(),
});
