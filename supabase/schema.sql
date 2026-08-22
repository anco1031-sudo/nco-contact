-- ============================================
-- NCO Contact Management System - Database Schema
-- ============================================

-- ตารางข้อมูลบุคลากร (Personnel contacts)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rank TEXT NOT NULL,              -- ยศ
  first_name TEXT NOT NULL,        -- ชื่อ
  last_name TEXT NOT NULL,         -- สกุล
  unit TEXT NOT NULL,              -- เหล่า
  company TEXT NOT NULL,           -- กองร้อย
  workplace TEXT NOT NULL DEFAULT '', -- ที่ทำงาน
  phone TEXT NOT NULL DEFAULT '',  -- เบอร์โทรศัพท์
  line_id TEXT NOT NULL DEFAULT '', -- ไลน์ไอดี
  notes TEXT NOT NULL DEFAULT '',  -- อื่น ๆ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตารางคำขอเพิ่มข้อมูล (Request submissions)
CREATE TABLE IF NOT EXISTS requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rank TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  company TEXT NOT NULL,
  workplace TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  line_id TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  requester_name TEXT NOT NULL,    -- ชื่อผู้ขอ
  requester_phone TEXT NOT NULL,   -- เบอร์ผู้ขอ
  status TEXT NOT NULL DEFAULT 'pending', -- pending / approved / rejected
  reviewed_by TEXT,                -- ผู้ reviewing
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง roles สำหรับ admin
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies: ทุกคนอ่าน contacts ได้
CREATE POLICY "Anyone can view contacts"
  ON contacts FOR SELECT
  USING (true);

-- Policies: เฉพาะ admin แก้ไข contacts ได้
CREATE POLICY "Admins can insert contacts"
  ON contacts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update contacts"
  ON contacts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete contacts"
  ON contacts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Policies: ทุกคนส่ง requests ได้
CREATE POLICY "Anyone can submit requests"
  ON requests FOR INSERT
  WITH CHECK (true);

-- Policies: เฉพาะ admin อ่าน requests ได้
CREATE POLICY "Admins can view requests"
  ON requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update requests"
  ON requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete requests"
  ON requests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Policies: user_roles
CREATE POLICY "Admins can view user roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_rank ON contacts(rank);
CREATE INDEX IF NOT EXISTS idx_contacts_first_name ON contacts(first_name);
CREATE INDEX IF NOT EXISTS idx_contacts_last_name ON contacts(last_name);
CREATE INDEX IF NOT EXISTS idx_contacts_unit ON contacts(unit);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);
CREATE INDEX IF NOT EXISTS idx_contacts_workplace ON contacts(workplace);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for contacts
CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
