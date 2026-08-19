-- ============================================================
-- Rillnet: Bể vỡ & Truy thu — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Bảng chính: Sự cố bể vỡ
CREATE TABLE IF NOT EXISTS breakage_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_code TEXT UNIQUE NOT NULL,
  order_tracking TEXT,
  project TEXT DEFAULT 'general',
  incident_type TEXT NOT NULL CHECK (incident_type IN ('damage','loss','shortage','wet','other')),
  detection_stage TEXT NOT NULL CHECK (detection_stage IN ('delivery','sorting','linehaul','warehouse','customer')),
  description TEXT,
  estimated_value NUMERIC(12,0) DEFAULT 0,
  quantity_damaged INT DEFAULT 0,
  product_name TEXT,
  location_name TEXT,
  location_gps JSONB,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  root_cause TEXT CHECK (root_cause IS NULL OR root_cause IN ('carrier','warehouse','shipper','driver','shared','force_majeure')),
  investigation_notes TEXT,
  investigated_by TEXT,
  investigated_at TIMESTAMPTZ,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','investigating','assessed','recovery_assigned','closed')),
  reported_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ảnh / Video chứng cứ
CREATE TABLE IF NOT EXISTS breakage_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES breakage_incidents(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'image' CHECK (file_type IN ('image','video')),
  caption TEXT,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Phiếu truy thu
CREATE TABLE IF NOT EXISTS recovery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recovery_code TEXT UNIQUE NOT NULL,
  incident_id UUID NOT NULL REFERENCES breakage_incidents(id) ON DELETE CASCADE,
  assignee_type TEXT NOT NULL CHECK (assignee_type IN ('driver','warehouse','subcontractor','insurance','shared')),
  assignee_name TEXT NOT NULL,
  liability_percent INT DEFAULT 100 CHECK (liability_percent BETWEEN 0 AND 100),
  amount NUMERIC(12,0) NOT NULL,
  amount_recovered NUMERIC(12,0) DEFAULT 0,
  recovery_method TEXT CHECK (recovery_method IS NULL OR recovery_method IN ('salary_deduct','wallet_deduct','invoice_offset','bank_transfer','other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','collecting','collected','disputed','cancelled')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  due_date DATE,
  collected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- 4. Comments / Discussion thread
CREATE TABLE IF NOT EXISTS breakage_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES breakage_incidents(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_incidents_status ON breakage_incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_project ON breakage_incidents(project);
CREATE INDEX IF NOT EXISTS idx_incidents_detected ON breakage_incidents(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_incident ON breakage_evidence(incident_id);
CREATE INDEX IF NOT EXISTS idx_recovery_incident ON recovery_assignments(incident_id);
CREATE INDEX IF NOT EXISTS idx_recovery_status ON recovery_assignments(status);
CREATE INDEX IF NOT EXISTS idx_comments_incident ON breakage_comments(incident_id);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_incidents_updated
  BEFORE UPDATE ON breakage_incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
