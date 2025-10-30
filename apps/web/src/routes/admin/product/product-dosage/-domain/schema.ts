import z from "zod";

export const ProductDosageSchema = z.object({
  id: z.uuid(),
  commodityTypeId: z.uuid(),
  productBrandId: z.uuid(),
  dosage: z.number(),
  unit: z.string(),
})