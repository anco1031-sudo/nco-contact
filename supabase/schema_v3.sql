-- ============================================
-- NCO 1333 - Schema V3: Surveys + News Expiry
-- ============================================

-- เพิ่ม expires_at ใน news
ALTER TABLE news ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- ตารางสำรวจ/โหวต (Surveys)
CREATE TABLE IF NOT EXISTS surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  close_date DATE NOT NULL,
  created_by TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตารางตัวเลือกโหวต (Survey Options)
CREATE TABLE IF NOT EXISTS survey_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตารางคะแนนโหวต (Survey Votes)
CREATE TABLE IF NOT EXISTS survey_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  option_id UUID REFERENCES survey_options(id) ON DELETE CASCADE,
  voter_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(survey_id, voter_name)
);

-- Enable RLS
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_votes ENABLE ROW LEVEL SECURITY;

-- Surveys: ทุกคนอ่านได้, admin จัดการได้
CREATE POLICY "Anyone can view surveys" ON surveys FOR SELECT USING (true);
CREATE POLICY "Anyone can submit surveys" ON surveys FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update surveys" ON surveys FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete surveys" ON surveys FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Survey Options: ทุกคนอ่านได้
CREATE POLICY "Anyone can view options" ON survey_options FOR SELECT USING (true);
CREATE POLICY "Anyone can insert options" ON survey_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can delete options" ON survey_options FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Survey Votes: ทุกคนอ่าน/โหวตได้
CREATE POLICY "Anyone can view votes" ON survey_votes FOR SELECT USING (true);
CREATE POLICY "Anyone can vote" ON survey_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can delete votes" ON survey_votes FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_surveys_close_date ON surveys(close_date);
CREATE INDEX IF NOT EXISTS idx_survey_options_survey_id ON survey_options(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_votes_survey_id ON survey_votes(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_votes_option_id ON survey_votes(option_id);
CREATE INDEX IF NOT EXISTS idx_news_expires_at ON news(expires_at);
