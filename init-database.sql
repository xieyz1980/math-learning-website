-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  points INTEGER DEFAULT 300 NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建年级表
CREATE TABLE IF NOT EXISTS grades (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS grades_name_idx ON grades(name);
CREATE INDEX IF NOT EXISTS grades_sort_order_idx ON grades(sort_order);

-- 创建教材版本表
CREATE TABLE IF NOT EXISTS textbook_versions (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  publisher VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS textbook_versions_name_idx ON textbook_versions(name);

-- 创建课程表
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  chapter VARCHAR(255),
  video_url TEXT,
  video_type VARCHAR(50),
  description TEXT,
  grade_id VARCHAR(36) REFERENCES grades(id) ON DELETE CASCADE,
  version_id VARCHAR(36) REFERENCES textbook_versions(id) ON DELETE CASCADE,
  created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS courses_grade_id_idx ON courses(grade_id);
CREATE INDEX IF NOT EXISTS courses_version_id_idx ON courses(version_id);
CREATE INDEX IF NOT EXISTS courses_created_by_idx ON courses(created_by);

-- 创建试卷表
CREATE TABLE IF NOT EXISTS exam_papers (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  grade_id VARCHAR(36) REFERENCES grades(id) ON DELETE CASCADE,
  region VARCHAR(100),
  exam_type VARCHAR(50),
  questions JSONB NOT NULL DEFAULT '[]',
  total_score INTEGER DEFAULT 100,
  duration INTEGER DEFAULT 60,
  created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS exam_papers_grade_id_idx ON exam_papers(grade_id);
CREATE INDEX IF NOT EXISTS exam_papers_created_by_idx ON exam_papers(created_by);

-- 创建考试记录表
CREATE TABLE IF NOT EXISTS exam_records (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  paper_id VARCHAR(36) REFERENCES exam_papers(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '[]',
  score INTEGER,
  total_score INTEGER,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS exam_records_user_id_idx ON exam_records(user_id);
CREATE INDEX IF NOT EXISTS exam_records_paper_id_idx ON exam_records(paper_id);

-- 创建学习记录表
CREATE TABLE IF NOT EXISTS study_records (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(36) REFERENCES courses(id) ON DELETE CASCADE,
  watched_duration INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS study_records_user_id_idx ON study_records(user_id);
CREATE INDEX IF NOT EXISTS study_records_course_id_idx ON study_records(course_id);

-- 创建笔记表
CREATE TABLE IF NOT EXISTS notes (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(36) REFERENCES courses(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_course_id_idx ON notes(course_id);

-- 创建系统配置表
CREATE TABLE IF NOT EXISTS system_config (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS system_config_key_idx ON system_config(key);
