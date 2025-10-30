import z from "zod";

export const SaleSchema = z.object({
  id: z.uuid(),
  reportDate: z.date(),
  productBrandId: z.uuid(),
  realizationDaily: z.number(),
  month: z.string().min(1).max(2),
  realizationMonthly: z.number(),
  rkapMonthly: z.number(),
  realizationYtd: z.number(),
  rkapYtd: z.number(),
  year: z.string().min(4).max(4),
  rkapYearly: z.number(),
  realizationLastYear: z.number(),
})