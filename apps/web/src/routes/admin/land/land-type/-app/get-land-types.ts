import { landTypes } from "@/lib/db/schema/map_product";
import { protectedProcedure } from "@/lib/orpc";
import { and, ilike } from "drizzle-orm";
import z from "zod";

export const getLandTypes = protectedProcedure
    .input(
        z.object({
            search: z.string().optional(),
        })
    )
    .handler(async ({ input, context }) => {
        const baseQuery = context.db
            .select({
                id: landTypes.id,
                name: landTypes.name,
            })
            .from(landTypes);

        const conditions = [];
        if (input.search) {
            conditions.push(ilike(landTypes.name, `%${input.search}%`));
        }

        return {
            data: await baseQuery
                .where(and(...conditions))
                .orderBy(landTypes.name),
        };
    });