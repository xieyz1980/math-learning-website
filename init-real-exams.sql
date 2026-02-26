-- 创建真题表
CREATE TABLE IF NOT EXISTS real_exams (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  grade_id VARCHAR(36) REFERENCES grades(id) ON DELETE CASCADE,
  region VARCHAR(100) NOT NULL,
  semester VARCHAR(50) NOT NULL, -- 学期：上学期、下学期
  exam_type VARCHAR(50) NOT NULL, -- 考试类型：期中、期末
  year INTEGER NOT NULL,
  duration INTEGER NOT NULL, -- 考试时长（分钟）
  total_score INTEGER NOT NULL DEFAULT 100,
  question_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  uploaded_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS real_exams_grade_id_idx ON real_exams(grade_id);
CREATE INDEX IF NOT EXISTS real_exams_region_idx ON real_exams(region);
CREATE INDEX IF NOT EXISTS real_exams_year_idx ON real_exams(year);
CREATE INDEX IF NOT EXISTS real_exams_exam_type_idx ON real_exams(exam_type);
CREATE INDEX IF NOT EXISTS real_exams_uploaded_by_idx ON real_exams(uploaded_by);

-- 创建真题题目表
CREATE TABLE IF NOT EXISTS real_exam_questions (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id VARCHAR(36) REFERENCES real_exams(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL, -- 题号
  question_type VARCHAR(50) NOT NULL, -- 题目类型：选择题、填空题、解答题
  content TEXT NOT NULL, -- 题目内容
  options JSONB, -- 选项（选择题）
  answer TEXT, -- 答案
  score INTEGER NOT NULL, -- 分值
  difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  knowledge_points TEXT[], -- 知识点
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS real_exam_questions_exam_id_idx ON real_exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS real_exam_questions_type_idx ON real_exam_questions(question_type);
CREATE INDEX IF NOT EXISTS real_exam_questions_difficulty_idx ON real_exam_questions(difficulty);

-- 创建真题考试记录表
CREATE TABLE IF NOT EXISTS real_exam_records (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  exam_id VARCHAR(36) REFERENCES real_exams(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}', -- 用户答案 {questionId: answer}
  score INTEGER,
  total_score INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  analysis JSONB, -- AI分析结果
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS real_exam_records_user_id_idx ON real_exam_records(user_id);
CREATE INDEX IF NOT EXISTS real_exam_records_exam_id_idx ON real_exam_records(exam_id);
CREATE INDEX IF NOT EXISTS real_exam_records_status_idx ON real_exam_records(status);
