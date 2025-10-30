import z from "zod";

export const ProvinceCommoditySchema = z.object({
  id: z.uuid(),
  provinceId: z.uuid(),
  commodityTypeId: z.uuid(),
  area: z.number(),
})