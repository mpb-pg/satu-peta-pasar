import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { user } from '@/lib/db/schema';
import { protectedProcedure } from '@/lib/orpc';

export const getUserById = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    const baseQuery = context.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, input.userId));

    return {
      data: await baseQuery,
    };
  });
