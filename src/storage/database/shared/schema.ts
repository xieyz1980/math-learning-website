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
    points: integer("points").notNull().default(300), // 积分
    status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'banned'
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
    index("users_status_idx").on(table.status),
  ]
);

// 系统配置表
export const systemConfig = pgTable("system_config", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

// 年级表
export const grades = pgTable(
  "grades",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 50 }).notNull(), // '初一', '初二', '初三', '高一', '高二', '高三'
    sort_order: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("grades_name_idx").on(table.name),
    index("grades_sort_order_idx").on(table.sortOrder),
  ]
);

// 教材版本表
export const textbookVersions = pgTable(
  "textbook_versions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 100 }).notNull(), // '人教版', '北京版', '北师大版'
    publisher: varchar("publisher", { length: 100 }), // 出版社
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("textbook_versions_name_idx").on(table.name),
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
    gradeId: varchar("grade_id", { length: 36 }), // 年级ID
    versionId: varchar("version_id", { length: 36 }), // 教材版本ID
    videoUrl: text("video_url").notNull(),
    description: text("description"),
    videoType: varchar("video_type", { length: 50 }).notNull().default("bilibili"),
    createdBy: varchar("created_by", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("courses_chapter_idx").on(table.chapter),
    index("courses_created_by_idx").on(table.createdBy),
    index("courses_grade_id_idx").on(table.gradeId),
    index("courses_version_id_idx").on(table.versionId),
  ]
);

// 试卷表
export const examPapers = pgTable(
  "exam_papers",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 255 }).notNull(),
    gradeId: varchar("grade_id", { length: 36 }).notNull(), // 年级ID
    examType: varchar("exam_type", { length: 50 }).notNull(), // '期中', '期末', '单元测试'
    region: varchar("region", { length: 100 }), // '海淀', '西城'
    duration: integer("duration").notNull(), // 考试时长（分钟）
    totalScore: integer("total_score").notNull().default(100), // 总分
    questions: jsonb("questions").notNull(), // 题目JSON数组
    fileUrl: text("file_url"), // 原始文件URL
    createdBy: varchar("created_by", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("exam_papers_grade_id_idx").on(table.gradeId),
    index("exam_papers_exam_type_idx").on(table.examType),
    index("exam_papers_region_idx").on(table.region),
  ]
);

// 考试记录表
export const examRecords = pgTable(
  "exam_records",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    paperId: varchar("paper_id", { length: 36 }).notNull(),
    answers: jsonb("answers").notNull(), // 用户答案
    score: integer("score"), // 得分
    startTime: timestamp("start_time", { withTimezone: true, mode: "string" }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true, mode: "string" }).notNull(),
    completed: boolean("completed").notNull().default(false),
    analysis: jsonb("analysis"), // AI分析结果
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("exam_records_user_id_idx").on(table.userId),
    index("exam_records_paper_id_idx").on(table.paperId),
    index("exam_records_created_at_idx").on(table.createdAt),
  ]
);

// 学习记录表
export const studyRecords = pgTable(
  "study_records",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    courseId: varchar("course_id", { length: 36 }).notNull(),
    duration: integer("duration").notNull().default(0), // 学习时长（秒）
    pointsCost: integer("points_cost").notNull().default(0), // 消耗积分
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("study_records_user_id_idx").on(table.userId),
    index("study_records_course_id_idx").on(table.courseId),
    index("study_records_created_at_idx").on(table.createdAt),
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
  points: true,
  status: true,
});

export const updateUserSchema = createCoercedInsertSchema(users)
  .pick({
    password: true,
    status: true,
    points: true,
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
  gradeId: true,
  versionId: true,
});

export const updateCourseSchema = createCoercedInsertSchema(courses)
  .pick({
    title: true,
    chapter: true,
    videoUrl: true,
    description: true,
    videoType: true,
    gradeId: true,
    versionId: true,
  })
  .partial();

// ExamPaper schemas
export const insertExamPaperSchema = createCoercedInsertSchema(examPapers).pick({
  title: true,
  gradeId: true,
  examType: true,
  region: true,
  duration: true,
  totalScore: true,
  questions: true,
  fileUrl: true,
  createdBy: true,
});

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

export type ExamPaper = typeof examPapers.$inferSelect;
export type InsertExamPaper = z.infer<typeof insertExamPaperSchema>;

export type ExamRecord = typeof examRecords.$inferSelect;

export type StudyRecord = typeof studyRecords.$inferSelect;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type UpdateNote = z.infer<typeof updateNoteSchema>;
