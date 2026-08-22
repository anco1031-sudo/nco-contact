-- ============================================
-- Edit Requests: ระบบขอแก้ไขรายชื่อ
-- ============================================

-- เพิ่มคอลัมน์ในตาราง requests เดิม
ALTER TABLE requests ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'add';
-- type: 'add' = เพิ่มรายชื่อใหม่, 'edit' = ขอแก้ไขรายชื่อ

ALTER TABLE requests ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
-- ใช้เก็บ id ของรายชื่อที่ต้องการแก้ไข (เฉพาะ type = 'edit')

ALTER TABLE requests ADD COLUMN IF NOT EXISTS edit_data JSONB;
-- ใช้เก็บข้อมูลที่ต้องการแก้ไข (เฉพาะ type = 'edit')
-- เช่น { "phone": "0812345678", "workplace": "ที่ใหม่" }
