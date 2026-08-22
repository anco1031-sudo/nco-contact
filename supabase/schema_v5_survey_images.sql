-- ============================================
-- Survey Images: หลายรูปต่อ 1 แบบสำรวจ
-- ============================================

CREATE TABLE IF NOT EXISTS survey_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE survey_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view survey images" ON survey_images FOR SELECT USING (true);
CREATE POLICY "Anyone can insert survey images" ON survey_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can delete survey images" ON survey_images FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_survey_images_survey_id ON survey_images(survey_id);
