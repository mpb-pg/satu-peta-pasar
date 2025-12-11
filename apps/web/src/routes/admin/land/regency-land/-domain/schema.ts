import z from 'zod';

export const RegencyLandSchema = z.object({
  id: z.uuid(),
  regencyId: z.uuid(),
  landTypeId: z.uuid(),
  area: z.number(),
});
