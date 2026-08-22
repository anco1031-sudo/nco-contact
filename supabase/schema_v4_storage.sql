-- ============================================
-- Supabase Storage: survey-images bucket
-- ============================================

-- สร้าง bucket สำหรับเก็บรูปภาพแบบสำรวจ
INSERT INTO storage.buckets (id, name, public)
VALUES ('survey-images', 'survey-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: ทุกคนดูรูปได้ (public bucket)
CREATE POLICY "Public read access for survey images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'survey-images');

-- Policy: ทุกคน upload ได้
CREATE POLICY "Anyone can upload survey images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'survey-images');

-- Policy: เจ้าของลบได้ (ใช้สำหรับลบเมื่อลบ survey)
CREATE POLICY "Anyone can delete survey images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'survey-images');
