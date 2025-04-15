import { jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { customAlphabet } from "nanoid";
import { user } from "./auth.schema";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 7);

export const share = pgTable(
  "share",
  {
    id: text("id")
      .unique()
      .notNull()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .primaryKey()
      .unique()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    trackIds: jsonb("track_ids").$type<string[]>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    timeRange: text("time_range", { enum: ["short_term", "medium_term", "long_term"] })
      .notNull()
      .default("long_term"),
  },
  (table) => [uniqueIndex("id_index").on(table.id)],
);
