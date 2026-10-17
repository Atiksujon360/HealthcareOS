import { CareJourneyEvent, CareGap, PatientContinuityMetrics } from '../types/careLoop';

export const INITIAL_CARE_GAPS: CareGap[] = [
  {
    id: 'gap-001',
    patientId: 'pat-101',
    patientName: 'Mr. Rafiqul Islam',
    patientAge: 54,
    patientGender: 'Male',
    mrn: 'EVR-DHK-784920',
    gapType: 'unclosed_referral',
    title: 'Unclosed Specialist Referral: Annual Diabetic Retinopathy Fundus Examination',
    severity: 'critical',
    clinicalRationale: 'Patient has had T2DM for >8 years with latest HbA1c 8.4%. Annual dilated eye examination is imperative to prevent irreversible diabetic maculopathy and proliferative retinopathy.',
    guidelineReference: 'ADA & DGHS National Guidelines for Clinical Management of Diabetes 2026 (Sec 11.2)',
    accountableOwner: {
      id: 'doc-001',
      name: 'Prof. Dr. Aisha Rahman',
      role: 'Attending Endocrinologist'
    },
    detectedDate: '2026-09-02',
    dueDate: '2026-10-02',
    daysOverdue: 15,
    barrier: {
      type: 'scheduling_conflict',
      description: 'Patient reports heavy corporate commitments in Motijheel and stated the National Eye Institute long lines are unmanageable on weekdays.',
      reportedAt: '2026-10-05',
      suggestedIntervention: 'Coordinate priority tele-triage or weekend morning appointment at Evercare Eye Clinic with pre-booked slot.'
    },
    status: 'active',
    escalationTier: 2,
    escalationStatus: 'Tier 2 Escalation: Care Coordinator notified for outreach',
    suggestedAction: {
      actionType: 'send_outreach',
      label: 'Initiate WhatsApp Outreach & Fast-Track Eye Clinic',
      details: 'Send automated bilingual reminder with 1-click option to book Saturday slot at Evercare Ophthalmology'
    }
  },
  {
    id: 'gap-002',
    patientId: 'pat-101',
    patientName: 'Mr. Rafiqul Islam',
    patientAge: 54,
    patientGender: 'Male',
    mrn: 'EVR-DHK-784920',
    gapType: 'unreviewed_lab',
    title: 'Unacknowledged Diagnostic Result: Serum Creatinine & eGFR (58 mL/min/1.73m²)',
    severity: 'high',
    clinicalRationale: 'Specimen processed by Popular Diagnostic 3 days ago. eGFR is borderline low (Stage 3a CKD). Attending physician must review to ensure SGLT2i/Metformin titration is renal-safe.',
    guidelineReference: 'KDIGO 2024 Clinical Practice Guideline for Diabetes Management in CKD & BMDC EMR Protocol',
    accountableOwner: {
      id: 'doc-001',
      name: 'Prof. Dr. Aisha Rahman',
      role: 'Attending Endocrinologist'
    },
    detectedDate: '2026-10-14',
    dueDate: '2026-10-16',
    daysOverdue: 1,
    barrier: {
      type: 'system_delay',
      description: 'Result synchronized from Popular Diagnostic API but physician was engaged in intensive outpatient clinics and chamber.',
      reportedAt: '2026-10-15',
      suggestedIntervention: 'Flag directly in active consultation encounter for rapid sign-off with 1-click clinical note.'
    },
    status: 'active',
    escalationTier: 1,
    escalationStatus: 'Tier 1: Physician Inbox Notification Pending',
    suggestedAction: {
      actionType: 'fast_track_lab',
      label: 'Review Lab & Acknowledge with Clinical Note',
      details: 'Review renal panel directly in workspace and append clearance note to encounter #enc-2026-101'
    }
  },
  {
    id: 'gap-003',
    patientId: 'pat-101',
    patientName: 'Mr. Rafiqul Islam',
    patientAge: 54,
    patientGender: 'Male',
    mrn: 'EVR-DHK-784920',
    gapType: 'overdue_follow_up',
    title: 'Quarterly Comprehensive Metabolic Panel & HbA1c Re-evaluation',
    severity: 'medium',
    clinicalRationale: 'Patient glycemic variability (fasting 140-158 mg/dL) necessitates structured 90-day repeat to assess response to dual oral antidiabetic therapy.',
    guidelineReference: 'Bangladesh Endocrine Society (BES) Type 2 Diabetes Consensus 2025',
    accountableOwner: {
      id: 'coord-01',
      name: 'Sister Nusrat Jahan, RN',
      role: 'Care Coordinator'
    },
    detectedDate: '2026-10-01',
    dueDate: '2026-10-16',
    daysOverdue: 1,
    barrier: {
      type: 'none',
      description: 'Patient currently present in consultation workspace for today encounter.',
      reportedAt: '2026-10-16'
    },
    status: 'in_progress',
    escalationTier: 1,
    suggestedAction: {
      actionType: 'schedule_appointment',
      label: 'Confirm 90-Day Follow-Up Booking',
      details: 'Select follow-up date for January 2027 during today encounter closure.'
    }
  },
  {
    id: 'gap-004',
    patientId: 'pat-102',
    patientName: 'Begum Tahmina Akhter',
    patientAge: 46,
    patientGender: 'Female',
    mrn: 'SQR-DHK-482019',
    gapType: 'unfilled_prescription',
    title: 'Unfilled Maintenance Inhaler Refill: Seretide 250 Evohaler (Salmeterol/Fluticasone)',
    severity: 'high',
    clinicalRationale: 'Maintenance inhaled corticosteroid was due for pharmacy refill 8 days ago. Patient is at elevated risk of severe acute asthmatic exacerbation during Dhaka winter season.',
    guidelineReference: 'GINA 2025 Global Strategy for Asthma Management and Prevention',
    accountableOwner: {
      id: 'phm-301',
      name: 'Kazi Farhan Sadik, M.Pharm',
      role: 'Chief Dispensing Pharmacist'
    },
    detectedDate: '2026-10-08',
    dueDate: '2026-10-12',
    daysOverdue: 5,
    barrier: {
      type: 'financial',
      description: 'Patient informed pharmacy tele-support that imported brand cost (৳1,450) is burdensome this month.',
      reportedAt: '2026-10-10',
      suggestedIntervention: 'Offer locally manufactured DGDA-approved alternative: Respispiro 250 (Incepta Pharmaceuticals, ৳620) or Bexitrol-F (Beximco).'
    },
    status: 'active',
    escalationTier: 2,
    escalationStatus: 'Tier 2: Pharmacy Coordinator outreach triggered',
    suggestedAction: {
      actionType: 'pharmacy_refill',
      label: 'Offer DGDA Generic Alternative & Courier Delivery',
      details: 'Dispatch Respispiro 250 at 55% lower cost with rider delivery to Dhanmondi home'
    }
  },
  {
    id: 'gap-005',
    patientId: 'pat-103',
    patientName: 'Alhaj Ashraful Haque',
    patientAge: 68,
    patientGender: 'Male',
    mrn: 'UNT-DHK-301984',
    gapType: 'overdue_follow_up',
    title: 'Post-PTCA Annual Transthoracic Echocardiogram & Left Ventricular Function Review',
    severity: 'critical',
    clinicalRationale: 'Patient underwent drug-eluting stent placement in LAD (2022). Annual TTE is required to evaluate ejection fraction (prior EF 45%) and wall motion abnormalities.',
    guidelineReference: 'ACC/AHA/SCAI Coronary Revascularization Guidelines & Bangladesh Cardiac Society Protocol',
    accountableOwner: {
      id: 'doc-002',
      name: 'Dr. Tanvir Ahmed',
      role: 'Consultant Cardiologist'
    },
    detectedDate: '2026-09-25',
    dueDate: '2026-10-05',
    daysOverdue: 12,
    barrier: {
      type: 'transport',
      description: 'Severe bilateral knee osteoarthritis severely limits patient mobility from Uttara to Central Dhaka hospital.',
      reportedAt: '2026-10-02',
      suggestedIntervention: 'Arrange CareFlow Hospital Patient Transfer Ambulance or refer to partner diagnostic center in Uttara Sector 4.'
    },
    status: 'active',
    escalationTier: 2,
    escalationStatus: 'Tier 2: Logistics Coordinator intervention required',
    suggestedAction: {
      actionType: 'reassign_owner',
      label: 'Assign to Uttara Satellite Diagnostic Hub',
      details: 'Schedule TTE at Popular Diagnostic Uttara with senior cardiac sonographer'
    }
  }
];

export const INITIAL_CARE_JOURNEY_EVENTS: CareJourneyEvent[] = [
  {
    id: 'evt-101',
    patientId: 'pat-101',
    patientName: 'Mr. Rafiqul Islam',
    type: 'consultation_completed',
    title: 'Quarterly Endocrinology Consultation Initiated',
    description: 'Dr. Aisha Rahman conducted detailed evaluation of glycemic fluctuations and bilateral pedal edema.',
    timestamp: '2026-10-16 10:15 AM',
    status: 'completed',
    responsiblePerson: {
      name: 'Prof. Dr. Aisha Rahman',
      role: 'Attending Physician',
      facility: 'Evercare Hospital Dhaka'
    },
    source: 'EMR',
    evidence: 'Encounter #enc-2026-101 recorded with vital signs, BMI 27.8, and foot monofilament testing normal.'
  },
  {
    id: 'evt-102',
    patientId: 'pat-101',
    patientName: 'Mr. Rafiqul Islam',
    type: 'prescription_issued',
    title: 'Smart e-Prescription Authored & Verified',
    description: 'Titrated Compath (Metformin/Vildagliptin) 500/50 BID and added Togent (Empagliflozin) 10mg morning.',
    timestamp: '2026-10-16 10:35 AM',
    status: 'completed',
    responsiblePerson: {
      name: 'Prof. Dr. Aisha Rahman',
      role: 'Attending Physician',
      facility: 'Evercare Hospital Dhaka'
    },
    source: 'EMR',
    evidence: 'Rx #RX-2026-7849 generated with digital QR verification code and DGDA drug registry IDs.'
  },
  {
    id: 'evt-103',
    patientId: 'pat-101',
    patientName: 'Mr. Rafiqul Islam',
    type: 'lab_result_received',
    title: 'Serum Creatinine & eGFR Lab Report Synchronized',
    description: 'Specimen collected at Popular Diagnostic Dhanmondi. Serum Creatinine 1.34 mg/dL, eGFR 58 mL/min/1.73m².',
    timestamp: '2026-10-15 04:20 PM',
    status: 'awaiting_review',
    responsiblePerson: {
      name: 'Dr. Shamim Reza, MD (Biochemistry)',
      role: 'Chief Pathologist',
      facility: 'Popular Diagnostic Centre'
    },
    source: 'Laboratory',
    evidence: 'Lab ID: POP-BIO-99214. Flagged for borderline low GFR.',
    associatedGapId: 'gap-002'
  },
  {
    id: 'evt-104',
    patientId: 'pat-101',
    patientName: 'Mr. Rafiqul Islam',
    type: 'referral_created',
    title: 'Diabetic Eye Screen Referral Issued to National Eye Institute',
    description: 'Urgent referral for dilated retinal photography and optical coherence tomography (OCT).',
    timestamp: '2026-09-02 11:30 AM',
    status: 'overdue',
    responsiblePerson: {
      name: 'Prof. Dr. Aisha Rahman',
      role: 'Attending Physician',
      facility: 'Evercare Hospital Dhaka'
    },
    source: 'EMR',
    evidence: 'Referral Ref #REF-EYE-4812. Status remaining unacknowledged by external clinic.',
    associatedGapId: 'gap-001'
  },
  {
    id: 'evt-105',
    patientId: 'pat-101',
    patientName: 'Mr. Rafiqul Islam',
    type: 'barrier_reported',
    title: 'Patient Barrier Logged: Corporate Work Hours in Motijheel',
    description: 'Patient reported inability to take half-day leave on weekdays for outpatient ophthalmic clinic.',
    timestamp: '2026-10-05 02:15 PM',
    status: 'pending',
    responsiblePerson: {
      name: 'Sister Nusrat Jahan, RN',
      role: 'Care Coordinator',
      facility: 'CareFlow Tele-Coordination Desk'
    },
    source: 'Care Coordinator',
    evidence: 'Coordinator telephone log note #CC-552. Escalated to Tier 2.',
    associatedGapId: 'gap-001'
  },
  {
    id: 'evt-106',
    patientId: 'pat-101',
    patientName: 'Mr. Rafiqul Islam',
    type: 'prescription_dispensed',
    title: 'Home Delivery Dispatched: Courier Rider Shamim',
    description: 'Prescription packaged with cold-chain safeguards and dispatched for delivery to Dhanmondi.',
    timestamp: '2026-10-16 11:15 AM',
    status: 'completed',
    responsiblePerson: {
      name: 'Shamim Akhter',
      role: 'Medical Courier Rider #28',
      facility: 'CareFlow Express Logistics'
    },
    source: 'Pharmacy',
    evidence: 'Consignment #DEL-8841. OTP confirmation delivery code generated.'
  },
  {
    id: 'evt-201',
    patientId: 'pat-102',
    patientName: 'Begum Tahmina Akhter',
    type: 'care_coordination_task_assigned',
    title: 'Asthma Inhaler Adherence & Cost Assistance Task',
    description: 'Pharmacist triggered affordable alternative switch to overcome ৳1,450 brand price barrier.',
    timestamp: '2026-10-10 03:00 PM',
    status: 'pending',
    responsiblePerson: {
      name: 'Kazi Farhan Sadik, M.Pharm',
      role: 'Chief Pharmacist',
      facility: 'Labaid Central Pharmacy'
    },
    source: 'Pharmacy',
    associatedGapId: 'gap-004'
  },
  {
    id: 'evt-301',
    patientId: 'pat-103',
    patientName: 'Alhaj Ashraful Haque',
    type: 'follow_up_recommended',
    title: 'Annual Cardiology Post-PTCA Assessment Due',
    description: 'Cardiology team scheduled 12-month echo and exercise tolerance review.',
    timestamp: '2026-09-25 09:45 AM',
    status: 'overdue',
    responsiblePerson: {
      name: 'Dr. Tanvir Ahmed',
      role: 'Consultant Cardiologist',
      facility: 'United Hospital Dhaka'
    },
    source: 'EMR',
    associatedGapId: 'gap-005'
  }
];

export const PATIENT_CONTINUITY_METRICS: Record<string, PatientContinuityMetrics> = {
  'pat-101': {
    patientId: 'pat-101',
    patientName: 'Mr. Rafiqul Islam',
    continuityScore: 68,
    riskLevel: 'Moderate Risk',
    activeGapsCount: 3,
    criticalGapsCount: 1,
    completedActionsCount: 9,
    daysSinceLastClinicianContact: 0,
    nextRecommendedAction: 'Sign off renal lab panel & confirm weekend eye clinic slot',
    clinicalSummary: 'Overall compliance is strong with medications and doctor visits; however, unclosed diabetic retinopathy referral and pending renal panel review expose patient to unmonitored microvascular risk.'
  },
  'pat-102': {
    patientId: 'pat-102',
    patientName: 'Begum Tahmina Akhter',
    continuityScore: 58,
    riskLevel: 'High Risk',
    activeGapsCount: 1,
    criticalGapsCount: 0,
    completedActionsCount: 6,
    daysSinceLastClinicianContact: 32,
    nextRecommendedAction: 'Deliver affordable generic inhaler (Respispiro 250) to prevent nocturnal wheeze',
    clinicalSummary: 'Asthma maintenance therapy discontinued for 8 days due to out-of-pocket costs. Immediate generic substitution required.'
  },
  'pat-103': {
    patientId: 'pat-103',
    patientName: 'Alhaj Ashraful Haque',
    continuityScore: 42,
    riskLevel: 'Critical Risk',
    activeGapsCount: 1,
    criticalGapsCount: 1,
    completedActionsCount: 4,
    daysSinceLastClinicianContact: 16,
    nextRecommendedAction: 'Arrange home-based cardiac evaluation or Uttara clinic transport for Echo',
    clinicalSummary: 'Post-PTCA echocardiogram overdue by 12 days. Severe knee osteoarthritis prevents transit to central hospital.'
  }
};
