import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// App Tables

export const books = pgTable("book", {
  id: text("id").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  author: text("author"),
  blobUrl: text("blobUrl").notNull(),
  coverUrl: text("coverUrl"),
  currentPage: integer("currentPage").default(1).notNull(),
  totalPages: integer("totalPages"),
  isEncrypted: integer("isEncrypted").default(0).notNull(), // 0 = false, 1 = true
  encryptionKey: text("encryptionKey"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const readingProgress = pgTable("reading_progress", {
  id: text("id").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bookId: text("bookId")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  pageNumber: integer("pageNumber").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const bookmarks = pgTable("bookmark", {
  id: text("id").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bookId: text("bookId")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  pageNumber: integer("pageNumber").notNull(),
  label: text("label"), // Optional user-provided label for the bookmark
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
