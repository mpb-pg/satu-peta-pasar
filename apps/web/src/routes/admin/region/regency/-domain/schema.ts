import z from 'zod';

export const RegencySchema = z.object({
  id: z.uuid(),
  code: z.string().min(1).max(7),
  name: z.string(),
  provinceId: z.uuid(),
  area: z.number().optional(),
});
