import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { user } from '@/lib/db/schema';
import { protectedProcedure } from '@/lib/orpc';

export const updateUser = protectedProcedure
  .input(
    z.object({
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      image: z.string().optional(),
      role: z.enum(['admin', 'viewer', 'guest']).optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const { id, ...updateData } = input;

    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(filteredData).length === 0) {
      throw new Error('No fields to update');
    }

    const [updatedUser] = await context.db
      .update(user)
      .set({
        ...filteredData,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return {
      data: updatedUser,
    };
  });
