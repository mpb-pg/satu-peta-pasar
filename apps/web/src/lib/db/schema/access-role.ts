import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { generateUUID } from './utils';

// Access Role
export const access_role = pgTable('access_role', {
  id: uuid('id').primaryKey().$defaultFn(generateUUID),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),
  role: text('role')
    .$defaultFn(() => 'user')
    .notNull(),
  createdAt: timestamp('created_at').notNull(),
});
