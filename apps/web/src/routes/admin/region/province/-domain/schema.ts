import z from "zod";

export const ProvinceSchema = z.object({
  id: z.uuid(),
  code: z.string().min(1).max(3),
  name: z.string(),
  area: z.number().optional(),
})