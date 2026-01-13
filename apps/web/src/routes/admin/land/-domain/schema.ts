import z from 'zod';

export const LandTypeSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});
