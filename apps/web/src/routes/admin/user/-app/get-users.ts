import { z } from 'zod';
import { user } from '@/lib/db/schema';
import { protectedProcedure } from '@/lib/orpc';

export const getUsers = protectedProcedure
  .input(
    z.object({
      userId: z.string().optional(),
    })
  )
  .handler(async ({ context }) => {
    const baseQuery = context.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.createdAt,
      })
      .from(user);

    return {
      data: await baseQuery,
    };
  });
