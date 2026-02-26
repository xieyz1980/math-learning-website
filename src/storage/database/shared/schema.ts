import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// 系统表（保留）
export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
});

// 用户表
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 }).notNull().default("user"), // 'admin' or 'user'
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
  ]
);

// 课程表
export const courses = pgTable(
  "courses",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 255 }).notNull(),
    chapter: varchar("chapter", { length: 255 }).notNull(),
    videoUrl: text("video_url").notNull(),
    description: text("description"),
    videoType: varchar("video_type", { length: 50 }).notNull().default("bilibili"), // 'bilibili', 'youtube', 'direct', 'iframe'
    createdBy: varchar("created_by", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("courses_chapter_idx").on(table.chapter),
    index("courses_created_by_idx").on(table.createdBy),
  ]
);

// 笔记表
export const notes = pgTable(
  "notes",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    courseId: varchar("course_id", { length: 36 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("notes_user_id_idx").on(table.userId),
    index("notes_course_id_idx").on(table.courseId),
  ]
);

// Zod schemas for validation
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

// User schemas
export const insertUserSchema = createCoercedInsertSchema(users).pick({
  email: true,
  password: true,
  role: true,
});

export const updateUserSchema = createCoercedInsertSchema(users)
  .pick({
    password: true,
  })
  .partial();

// Course schemas
export const insertCourseSchema = createCoercedInsertSchema(courses).pick({
  title: true,
  chapter: true,
  videoUrl: true,
  description: true,
  videoType: true,
  createdBy: true,
});

export const updateCourseSchema = createCoercedInsertSchema(courses)
  .pick({
    title: true,
    chapter: true,
    videoUrl: true,
    description: true,
    videoType: true,
  })
  .partial();

// Note schemas
export const insertNoteSchema = createCoercedInsertSchema(notes).pick({
  userId: true,
  courseId: true,
  content: true,
});

export const updateNoteSchema = createCoercedInsertSchema(notes)
  .pick({
    content: true,
  })
  .partial();

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type UpdateCourse = z.infer<typeof updateCourseSchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type UpdateNote = z.infer<typeof updateNoteSchema>;
