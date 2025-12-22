import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { user } from '@/lib/db/schema';
import { protectedProcedure } from '@/lib/orpc';

export const deleteUser = protectedProcedure
  .input(
    z.object({
      id: z.string().uuid(),
    })
  )
  .handler(async ({ input, context }) => {
    const [deletedUser] = await context.db
      .delete(user)
      .where(eq(user.id, input.id))
      .returning();

    if (!deletedUser) {
      throw new Error('User not found');
    }

    return {
      success: true,
      data: deletedUser,
    };
  });
