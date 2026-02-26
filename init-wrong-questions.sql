-- 创建错题本表
CREATE TABLE IF NOT EXISTS wrong_questions (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  question_id VARCHAR(36) NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  question_content TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  score INTEGER,
  question_source VARCHAR(50) NOT NULL, -- 'ai_exam' 或 'real_exam'
  source_id VARCHAR(36), -- 对应的考试ID或真题ID
  record_id VARCHAR(36), -- 考试记录ID
  knowledge_points TEXT[],
  note TEXT, -- 用户笔记
  mastered BOOLEAN DEFAULT FALSE, -- 是否已掌握
  practice_count INTEGER DEFAULT 0, -- 练习次数
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS wrong_questions_user_id_idx ON wrong_questions(user_id);
CREATE INDEX IF NOT EXISTS wrong_questions_question_id_idx ON wrong_questions(question_id);
CREATE INDEX IF NOT EXISTS wrong_questions_source_idx ON wrong_questions(question_source);
CREATE INDEX IF NOT EXISTS wrong_questions_mastered_idx ON wrong_questions(mastered);

-- 添加更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wrong_questions_updated_at BEFORE UPDATE ON wrong_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
