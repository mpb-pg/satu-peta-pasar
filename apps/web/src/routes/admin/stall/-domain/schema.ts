import z from 'zod';

export const StallSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  address: z.string().optional(),
  regencyId: z.uuid(),
  provinceId: z.uuid(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  owner: z.string().optional(),
  no_telp: z.string().optional(),
  criteria: z.string().min(1).max(1).optional(),
});
