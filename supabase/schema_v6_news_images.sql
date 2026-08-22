-- ============================================
-- News Images: หลายรูปต่อ 1 ข่าว
-- ============================================

CREATE TABLE IF NOT EXISTS news_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID REFERENCES news(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE news_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view news images" ON news_images FOR SELECT USING (true);
CREATE POLICY "Anyone can insert news images" ON news_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can delete news images" ON news_images FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_news_images_news_id ON news_images(news_id);
