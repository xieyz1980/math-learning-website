import { relations } from "drizzle-orm/relations";
import { appUsers, notes, courses, grades, textbookVersions, examPapers, studyRecords, examRecords } from "./schema";

export const notesRelations = relations(notes, ({one}) => ({
	appUser: one(appUsers, {
		fields: [notes.userId],
		references: [appUsers.id]
	}),
	course: one(courses, {
		fields: [notes.courseId],
		references: [courses.id]
	}),
}));

export const appUsersRelations = relations(appUsers, ({many}) => ({
	notes: many(notes),
	courses: many(courses),
	examPapers: many(examPapers),
	studyRecords: many(studyRecords),
	examRecords: many(examRecords),
}));

export const coursesRelations = relations(courses, ({one, many}) => ({
	notes: many(notes),
	grade: one(grades, {
		fields: [courses.gradeId],
		references: [grades.id]
	}),
	textbookVersion: one(textbookVersions, {
		fields: [courses.versionId],
		references: [textbookVersions.id]
	}),
	appUser: one(appUsers, {
		fields: [courses.createdBy],
		references: [appUsers.id]
	}),
	studyRecords: many(studyRecords),
}));

export const gradesRelations = relations(grades, ({many}) => ({
	courses: many(courses),
	examPapers: many(examPapers),
}));

export const textbookVersionsRelations = relations(textbookVersions, ({many}) => ({
	courses: many(courses),
}));

export const examPapersRelations = relations(examPapers, ({one, many}) => ({
	grade: one(grades, {
		fields: [examPapers.gradeId],
		references: [grades.id]
	}),
	appUser: one(appUsers, {
		fields: [examPapers.createdBy],
		references: [appUsers.id]
	}),
	examRecords: many(examRecords),
}));

export const studyRecordsRelations = relations(studyRecords, ({one}) => ({
	appUser: one(appUsers, {
		fields: [studyRecords.userId],
		references: [appUsers.id]
	}),
	course: one(courses, {
		fields: [studyRecords.courseId],
		references: [courses.id]
	}),
}));

export const examRecordsRelations = relations(examRecords, ({one}) => ({
	appUser: one(appUsers, {
		fields: [examRecords.userId],
		references: [appUsers.id]
	}),
	examPaper: one(examPapers, {
		fields: [examRecords.paperId],
		references: [examPapers.id]
	}),
}));