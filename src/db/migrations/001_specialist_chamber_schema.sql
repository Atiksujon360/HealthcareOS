-- ============================================================================
-- HealthcareOS Bangladesh: Specialist Case Command Center & Solo Chamber Schema
-- Migration 001: Initial Core Schema & Multi-Tenant Partitioning
-- Target Database: PostgreSQL 15+ (Cloud SQL / Supabase / Neon / RDS)
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TENANTS & CHAMBERS (Multi-Chamber Solo Consultant Architecture)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Hospital Network', 'Private Practice', 'Diagnostic Centre', 'Specialist Chamber')),
    bmdc_institution_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chambers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    operating_days TEXT[] NOT NULL DEFAULT '{"Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday"}',
    operating_hours VARCHAR(100) NOT NULL,
    consultation_fee_bdt NUMERIC(10, 2) NOT NULL DEFAULT 1500.00,
    follow_up_fee_bdt NUMERIC(10, 2) NOT NULL DEFAULT 1000.00,
    slot_duration_minutes INT NOT NULL DEFAULT 20,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chambers_org ON chambers(organization_id);

-- ----------------------------------------------------------------------------
-- 2. STAFF & DELEGATED ASSISTANT ROLES (Strict Confidentiality RBAC)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('doctor', 'specialist_professor', 'chamber_assistant', 'nurse', 'clinic_admin', 'pharmacist', 'patient')),
    bmdc_reg_number VARCHAR(50), -- BMDC Reg for doctors
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assistant_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assistant_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chamber_id UUID NOT NULL REFERENCES chambers(id) ON DELETE CASCADE,
    can_book_appointments BOOLEAN NOT NULL DEFAULT true,
    can_mark_arrival BOOLEAN NOT NULL DEFAULT true,
    can_manage_queue BOOLEAN NOT NULL DEFAULT true,
    can_collect_fees BOOLEAN NOT NULL DEFAULT true,
    can_log_documents BOOLEAN NOT NULL DEFAULT true,
    -- Strict clinical confidentiality safeguards:
    can_view_clinical_notes BOOLEAN NOT NULL DEFAULT false,
    can_view_prescriptions BOOLEAN NOT NULL DEFAULT false,
    can_view_investigation_results BOOLEAN NOT NULL DEFAULT false,
    can_author_prescriptions BOOLEAN NOT NULL DEFAULT false,
    granted_by_physician_id UUID REFERENCES users(id),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_assistant_chamber UNIQUE(assistant_user_id, chamber_id)
);

-- ----------------------------------------------------------------------------
-- 3. PATIENTS & LONGITUDINAL IDENTITY MANAGEMENT (Anti-Auto-Merge)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patient_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    mrn VARCHAR(100) NOT NULL, -- Medical Record Number
    name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group VARCHAR(10),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    national_health_id VARCHAR(100),
    allergies TEXT[] DEFAULT '{}',
    chronic_conditions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_org_mrn UNIQUE(organization_id, mrn)
);

CREATE INDEX idx_patient_org_phone ON patient_records(organization_id, phone);
CREATE INDEX idx_patient_org_name ON patient_records(organization_id, name);

-- Suspected Duplicate Candidate Registry (Requires explicit authorized human review)
CREATE TABLE IF NOT EXISTS suspected_duplicate_patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    primary_patient_id UUID NOT NULL REFERENCES patient_records(id) ON DELETE CASCADE,
    candidate_patient_id UUID NOT NULL REFERENCES patient_records(id) ON DELETE CASCADE,
    match_score INT NOT NULL CHECK (match_score BETWEEN 0 AND 100),
    match_reasons JSONB NOT NULL DEFAULT '[]',
    review_status VARCHAR(50) NOT NULL DEFAULT 'unreviewed' CHECK (review_status IN ('unreviewed', 'confirmed_distinct', 'merged', 'rejected')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    flagged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. CLINICAL ENCOUNTERS & LONGITUDINAL RECORDS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    chamber_id UUID NOT NULL REFERENCES chambers(id),
    patient_id UUID NOT NULL REFERENCES patient_records(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES users(id),
    encounter_date DATE NOT NULL,
    chief_complaint TEXT NOT NULL,
    history_of_present_illness TEXT,
    systolic_bp INT,
    diastolic_bp INT,
    heart_rate INT,
    temperature_fahrenheit NUMERIC(4, 1),
    spo2_percentage INT,
    weight_kg NUMERIC(5, 2),
    examination_notes TEXT,
    clinical_assessment TEXT,
    diagnoses JSONB NOT NULL DEFAULT '[]', -- Array of { code: 'E11.9', label: 'T2DM' }
    treatment_plan TEXT,
    follow_up_instructions TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'amended')),
    signed_at TIMESTAMPTZ,
    signed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_encounters_patient ON encounters(patient_id, encounter_date DESC);

-- ----------------------------------------------------------------------------
-- 5. INVESTIGATION REPORTS & STRUCTURED RESULTS (Strict Unit Checking)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS investigation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient_records(id) ON DELETE CASCADE,
    report_number VARCHAR(100) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Biochemistry', 'Hematology', 'Endocrinology', 'Cardiology', 'Imaging', 'Histopathology', 'Microbiology')),
    test_date DATE NOT NULL,
    facility_name VARCHAR(255) NOT NULL,
    ordering_physician_name VARCHAR(255),
    document_url TEXT,
    is_draft_ocr_extraction BOOLEAN NOT NULL DEFAULT false,
    ocr_confidence_percentage NUMERIC(5, 2),
    review_status VARCHAR(50) NOT NULL DEFAULT 'pending_review' CHECK (review_status IN ('pending_review', 'reviewed', 'disputed', 'draft_extraction')),
    verified_by_physician_id UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    dispute_rationale TEXT,
    clinician_annotations TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investigation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES investigation_reports(id) ON DELETE CASCADE,
    parameter VARCHAR(255) NOT NULL,
    numeric_value NUMERIC(12, 4),
    text_value VARCHAR(255),
    unit VARCHAR(50) NOT NULL, -- e.g. 'mg/dL', 'mL/min/1.73m²'
    reference_range_text VARCHAR(100),
    min_range NUMERIC(12, 4),
    max_range NUMERIC(12, 4),
    is_abnormal BOOLEAN NOT NULL DEFAULT false,
    criticality VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (criticality IN ('normal', 'borderline', 'abnormal', 'panic'))
);

CREATE INDEX idx_inv_results_report ON investigation_results(report_id);

-- ----------------------------------------------------------------------------
-- 6. REFERRAL & SECOND OPINION LIFECYCLE (Audited Multi-Step Workflow)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    referral_number VARCHAR(100) UNIQUE NOT NULL,
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('outbound', 'inbound')),
    patient_id UUID NOT NULL REFERENCES patient_records(id) ON DELETE RESTRICT,
    referring_clinician_id UUID REFERENCES users(id),
    referring_clinician_external_name VARCHAR(255),
    referring_organization VARCHAR(255) NOT NULL,
    referring_bmdc VARCHAR(50),
    receiving_clinician_id UUID REFERENCES users(id),
    receiving_clinician_external_name VARCHAR(255),
    receiving_organization VARCHAR(255) NOT NULL,
    receiving_specialty VARCHAR(100) NOT NULL,
    reason_for_referral TEXT NOT NULL,
    clinical_summary TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'Routine' CHECK (priority IN ('Routine', 'Urgent', 'Emergency')),
    due_date DATE,
    current_status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (
        current_status IN ('Draft', 'Sent', 'Acknowledged', 'Under Review', 'Response Drafted', 'Response Approved', 'Completed', 'Rejected', 'Cancelled', 'Info Requested')
    ),
    response_findings TEXT,
    response_recommendations TEXT,
    response_is_approved BOOLEAN NOT NULL DEFAULT false,
    response_approved_by UUID REFERENCES users(id),
    response_approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES users(id),
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referrals_patient ON referrals(patient_id);
CREATE INDEX idx_referrals_status ON referrals(current_status);

-- ----------------------------------------------------------------------------
-- 7. CARELOOP PENDING ACTIONS QUEUE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS care_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient_records(id) ON DELETE CASCADE,
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('unscheduled_follow_up', 'unreviewed_report', 'unacknowledged_referral', 'administrative_barrier', 'patient_question', 'unassigned_task')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_owner_id UUID REFERENCES users(id),
    severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    due_date DATE NOT NULL,
    is_overdue BOOLEAN GENERATED ALWAYS AS (due_date < CURRENT_DATE AND status IN ('pending', 'in_progress')) STORED,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'disputed')),
    resolution_evidence TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_care_tasks_owner_status ON care_tasks(assigned_owner_id, status);

-- ----------------------------------------------------------------------------
-- 8. COMPREHENSIVE AUDIT LOG (HIPAA / DGHS Medico-Legal Traceability)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id),
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(255) NOT NULL,
    module VARCHAR(50) NOT NULL CHECK (module IN ('Clinical', 'Prescriptions', 'Investigations', 'Referrals', 'Chamber Operations', 'Access Control', 'Security')),
    details TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, timestamp DESC);
CREATE INDEX idx_audit_logs_module ON audit_logs(module, timestamp DESC);

-- Enable Row-Level Security (RLS) for Multi-Tenant Isolation
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
