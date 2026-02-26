import { pgTable, serial, timestamp, index, varchar, integer, foreignKey, text, unique, check, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const textbookVersions = pgTable("textbook_versions", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	publisher: varchar({ length: 200 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("textbook_versions_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const grades = pgTable("grades", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("grades_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("grades_sort_order_idx").using("btree", table.sortOrder.asc().nullsLast().op("int4_ops")),
]);

export const notes = pgTable("notes", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }),
	courseId: varchar("course_id", { length: 36 }),
	content: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("notes_course_id_idx").using("btree", table.courseId.asc().nullsLast().op("text_ops")),
	index("notes_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [appUsers.id],
			name: "notes_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "notes_course_id_fkey"
		}).onDelete("set null"),
]);

export const systemConfig = pgTable("system_config", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	key: varchar({ length: 100 }).notNull(),
	value: text(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("system_config_key_idx").using("btree", table.key.asc().nullsLast().op("text_ops")),
	unique("system_config_key_key").on(table.key),
]);

export const userProfiles = pgTable("user_profiles", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 50 }).default('user'),
	points: integer().default(300).notNull(),
	status: varchar({ length: 20 }).default('active'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_profiles_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("user_profiles_email_key").on(table.email),
	check("user_profiles_role_check", sql`(role)::text = ANY ((ARRAY['admin'::character varying, 'user'::character varying])::text[])`),
	check("user_profiles_status_check", sql`(status)::text = ANY ((ARRAY['active'::character varying, 'disabled'::character varying])::text[])`),
]);

export const courses = pgTable("courses", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	chapter: varchar({ length: 255 }),
	videoUrl: text("video_url"),
	videoType: varchar("video_type", { length: 50 }),
	description: text(),
	gradeId: varchar("grade_id", { length: 36 }),
	versionId: varchar("version_id", { length: 36 }),
	createdBy: varchar("created_by", { length: 36 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("courses_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("text_ops")),
	index("courses_grade_id_idx").using("btree", table.gradeId.asc().nullsLast().op("text_ops")),
	index("courses_version_id_idx").using("btree", table.versionId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.gradeId],
			foreignColumns: [grades.id],
			name: "courses_grade_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.versionId],
			foreignColumns: [textbookVersions.id],
			name: "courses_version_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [appUsers.id],
			name: "courses_created_by_fkey"
		}).onDelete("set null"),
]);

export const appUsers = pgTable("app_users", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 50 }).default('user'),
	points: integer().default(300).notNull(),
	status: varchar({ length: 20 }).default('active'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("app_users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("app_users_role_idx").using("btree", table.role.asc().nullsLast().op("text_ops")),
	unique("app_users_email_key").on(table.email),
	check("app_users_role_check", sql`(role)::text = ANY ((ARRAY['admin'::character varying, 'user'::character varying])::text[])`),
	check("app_users_status_check", sql`(status)::text = ANY ((ARRAY['active'::character varying, 'disabled'::character varying])::text[])`),
]);

export const examPapers = pgTable("exam_papers", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	gradeId: varchar("grade_id", { length: 36 }),
	region: varchar({ length: 100 }),
	examType: varchar("exam_type", { length: 50 }),
	questions: jsonb().default([]).notNull(),
	totalScore: integer("total_score").default(100),
	duration: integer().default(60),
	createdBy: varchar("created_by", { length: 36 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("exam_papers_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("text_ops")),
	index("exam_papers_grade_id_idx").using("btree", table.gradeId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.gradeId],
			foreignColumns: [grades.id],
			name: "exam_papers_grade_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [appUsers.id],
			name: "exam_papers_created_by_fkey"
		}).onDelete("set null"),
]);

export const studyRecords = pgTable("study_records", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }),
	courseId: varchar("course_id", { length: 36 }),
	watchedDuration: integer("watched_duration").default(0),
	lastPosition: integer("last_position").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("study_records_course_id_idx").using("btree", table.courseId.asc().nullsLast().op("text_ops")),
	index("study_records_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [appUsers.id],
			name: "study_records_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "study_records_course_id_fkey"
		}).onDelete("cascade"),
]);

export const examRecords = pgTable("exam_records", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }),
	paperId: varchar("paper_id", { length: 36 }),
	answers: jsonb().default([]).notNull(),
	score: integer(),
	totalScore: integer("total_score"),
	status: varchar({ length: 20 }).default('completed'),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("exam_records_paper_id_idx").using("btree", table.paperId.asc().nullsLast().op("text_ops")),
	index("exam_records_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [appUsers.id],
			name: "exam_records_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.paperId],
			foreignColumns: [examPapers.id],
			name: "exam_records_paper_id_fkey"
		}).onDelete("cascade"),
	check("exam_records_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'completed'::character varying])::text[])`),
]);

// 真题表
export const realExams = pgTable("real_exams", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	gradeId: varchar("grade_id", { length: 36 }),
	region: varchar({ length: 100 }).notNull(),
	semester: varchar({ length: 50 }).notNull(),
	examType: varchar("exam_type", { length: 50 }).notNull(),
	year: integer().notNull(),
	duration: integer().notNull(),
	totalScore: integer("total_score").default(100).notNull(),
	questionCount: integer("question_count").default(0),
	status: varchar({ length: 20 }).default('active'),
	uploadedBy: varchar("uploaded_by", { length: 36 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("real_exams_exam_type_idx").using("btree", table.examType.asc().nullsLast().op("text_ops")),
	index("real_exams_grade_id_idx").using("btree", table.gradeId.asc().nullsLast().op("text_ops")),
	index("real_exams_region_idx").using("btree", table.region.asc().nullsLast().op("text_ops")),
	index("real_exams_uploaded_by_idx").using("btree", table.uploadedBy.asc().nullsLast().op("text_ops")),
	index("real_exams_year_idx").using("btree", table.year.asc().nullsLast().op("int4_ops")),
	foreignKey({
		columns: [table.gradeId],
		foreignColumns: [grades.id],
		name: "real_exams_grade_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.uploadedBy],
		foreignColumns: [appUsers.id],
		name: "real_exams_uploaded_by_fkey"
	}).onDelete("set null"),
	check("real_exams_status_check", sql`(status)::text = ANY ((ARRAY['active'::character varying, 'disabled'::character varying])::text[])`),
]);

// 真题题目表
export const realExamQuestions = pgTable("real_exam_questions", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	examId: varchar("exam_id", { length: 36 }).notNull(),
	questionNumber: integer("question_number").notNull(),
	questionType: varchar("question_type", { length: 50 }).notNull(),
	content: text().notNull(),
	options: jsonb(),
	answer: text(),
	score: integer().notNull(),
	difficulty: varchar({ length: 20 }).default('medium'),
	knowledgePoints: text("knowledge_points").array(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("real_exam_questions_difficulty_idx").using("btree", table.difficulty.asc().nullsLast().op("text_ops")),
	index("real_exam_questions_exam_id_idx").using("btree", table.examId.asc().nullsLast().op("text_ops")),
	index("real_exam_questions_type_idx").using("btree", table.questionType.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.examId],
		foreignColumns: [realExams.id],
		name: "real_exam_questions_exam_id_fkey"
	}).onDelete("cascade"),
	check("real_exam_questions_difficulty_check", sql`(difficulty)::text = ANY ((ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying])::text[])`),
]);

// 真题考试记录表
export const realExamRecords = pgTable("real_exam_records", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }),
	examId: varchar("exam_id", { length: 36 }),
	answers: jsonb().default({}).notNull(),
	score: integer(),
	totalScore: integer("total_score"),
	status: varchar({ length: 20 }).default('pending'),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	analysis: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("real_exam_records_exam_id_idx").using("btree", table.examId.asc().nullsLast().op("text_ops")),
	index("real_exam_records_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("real_exam_records_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [appUsers.id],
		name: "real_exam_records_user_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.examId],
		foreignColumns: [realExams.id],
		name: "real_exam_records_exam_id_fkey"
	}).onDelete("cascade"),
	check("real_exam_records_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'completed'::character varying])::text[])`),
]);

// 错题本表
export const wrongQuestions = pgTable("wrong_questions", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }),
	questionId: varchar("question_id", { length: 36 }).notNull(),
	questionType: varchar("question_type", { length: 50 }).notNull(),
	questionContent: text("question_content").notNull(),
	userAnswer: text("user_answer").notNull(),
	correctAnswer: text("correct_answer").notNull(),
	score: integer(),
	questionSource: varchar("question_source", { length: 50 }).notNull(),
	sourceId: varchar("source_id", { length: 36 }),
	recordId: varchar("record_id", { length: 36 }),
	knowledgePoints: text("knowledge_points").array(),
	note: text(),
	mastered: boolean().default(false).notNull(),
	practiceCount: integer("practice_count").default(0),
	lastPracticedAt: timestamp("last_practiced_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("wrong_questions_mastered_idx").using("btree", table.mastered.asc().nullsLast().op("bool_ops")),
	index("wrong_questions_question_id_idx").using("btree", table.questionId.asc().nullsLast().op("text_ops")),
	index("wrong_questions_source_idx").using("btree", table.questionSource.asc().nullsLast().op("text_ops")),
	index("wrong_questions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [appUsers.id],
		name: "wrong_questions_user_id_fkey"
	}).onDelete("cascade"),
]);
