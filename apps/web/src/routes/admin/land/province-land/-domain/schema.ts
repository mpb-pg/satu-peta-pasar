import z from 'zod';

export const ProvinceLandSchema = z.object({
  id: z.uuid(),
  provinceId: z.uuid(),
  landTypeId: z.uuid(),
  area: z.number(),
});
