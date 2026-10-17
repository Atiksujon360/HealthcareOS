import { 
  Chamber, 
  ChamberAssistant, 
  DuplicatePatientCandidate, 
  InvestigationReport, 
  ReferralSecondOpinion,
  SpecialistPatientBrief
} from '../types/specialist';

export const MOCK_CHAMBERS: Chamber[] = [
  {
    id: 'chm-001',
    name: 'Evercare Specialist Suite 408',
    institution: 'Evercare Hospital Dhaka',
    branch: 'Bashundhara R/A',
    room: 'Level 4, Suite 408',
    address: 'Plot 81, Block E, Bashundhara R/A, Dhaka 1229',
    phone: '+880 2-8431661 Ext: 4080',
    operatingDays: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    operatingHours: '09:00 AM - 01:30 PM',
    consultationFeeBDT: 2000,
    followUpFeeBDT: 1200,
    slotDurationMinutes: 20,
    assignedAssistantId: 'asst-001',
    assignedAssistantName: 'Md. Rashedul Alam',
    activeToday: true
  },
  {
    id: 'chm-002',
    name: 'Popular Diagnostic Evening Chamber 205',
    institution: 'Popular Diagnostic Centre Ltd.',
    branch: 'Dhanmondi Branch (Unit 2)',
    room: 'Building 2, Room 205',
    address: 'House 16, Road 2, Dhanmondi R/A, Dhaka 1205',
    phone: '+880 9613-787801',
    operatingDays: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'],
    operatingHours: '05:00 PM - 09:30 PM',
    consultationFeeBDT: 1500,
    followUpFeeBDT: 1000,
    slotDurationMinutes: 15,
    assignedAssistantId: 'asst-001',
    assignedAssistantName: 'Md. Rashedul Alam',
    activeToday: true
  },
  {
    id: 'chm-003',
    name: 'CareFlow TeleHealth BD Virtual Chamber',
    institution: 'CareFlow Digital Health Network',
    branch: 'Nationwide Virtual Consultation',
    room: 'Encrypted HD Video Room BD-1',
    address: 'Dhaka DC-1 Cloud Tele-Clinic',
    phone: 'Helpline: 16263',
    operatingDays: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    operatingHours: '09:30 PM - 11:00 PM',
    consultationFeeBDT: 1000,
    followUpFeeBDT: 700,
    slotDurationMinutes: 15,
    assignedAssistantId: 'asst-001',
    assignedAssistantName: 'Md. Rashedul Alam',
    activeToday: false
  }
];

export const MOCK_CHAMBER_ASSISTANTS: ChamberAssistant[] = [
  {
    id: 'asst-001',
    name: 'Md. Rashedul Alam',
    title: 'Senior Chamber Coordinator & Serial Secretary',
    phone: '+880 1718-992014',
    email: 'rashedul.chamber@evercarebd.com',
    assignedChamberIds: ['chm-001', 'chm-002', 'chm-003'],
    activeChamberId: 'chm-001',
    permissions: {
      canBookAppointments: true,
      canMarkArrival: true,
      canManageQueue: true,
      canViewClinicalNotes: false, // Strict confidentiality enforcement
      canViewPrescriptions: false, // Cannot view confidential medical treatment
      canViewInvestigationResults: false, // Cannot view diagnostic test values
      canAuthorPrescriptions: false, // Cannot author or modify medical treatments
      canCollectFees: true,
      canLogDocuments: true
    }
  }
];

export const MOCK_DUPLICATE_CANDIDATES: DuplicatePatientCandidate[] = [
  {
    id: 'dup-001',
    targetPatientId: 'pat-101', // Mr. Rafiqul Islam (MRN: EVR-DHK-784920)
    candidatePatientId: 'pat-temp-902',
    candidateName: 'Rafiqul Islam (Chamber Serial Entry)',
    candidateMRN: 'POP-DHK-109284',
    candidateDOB: '1974-09-03', // Differs from primary 1972-04-12
    candidatePhone: '+880 1711-238910', // Identical phone
    candidateAddress: 'Flat 4B, Road 7A, Dhanmondi (Primary lists Road 12)',
    matchScore: 84,
    matchReasons: [
      'Identical mobile phone (+880 1711-238910)',
      'High lexical name similarity (96% match)',
      'Identical neighborhood location (Dhanmondi, Dhaka)'
    ],
    reviewStatus: 'unreviewed',
    flaggedDate: '2026-10-15 06:14 PM',
    reviewNotes: 'Auto-merge prohibited: DOB discrepancy detected (1972 vs 1974). Requires clinician or EMR supervisor manual verification before linking records.'
  }
];

export const MOCK_INVESTIGATIONS: InvestigationReport[] = [
  {
    id: 'inv-001',
    reportNumber: 'POP-BIO-99214',
    patientId: 'pat-101',
    patientName: 'Mr. Rafiqul Islam',
    mrn: 'EVR-DHK-784920',
    testName: 'Comprehensive Renal Function & Glycemic Panel',
    category: 'Biochemistry',
    testDate: '2026-10-14',
    facility: 'Popular Diagnostic Centre (Dhanmondi Branch)',
    orderingPhysician: 'Prof. Dr. Aisha Rahman (BMDC A-48291)',
    status: 'pending_review',
    isDraftOcrExtraction: false,
    uploadedAt: '2026-10-15 04:20 PM',
    clinicianAnnotations: [
      'Borderline low eGFR (58 mL/min/1.73m²). Caution with high-dose Metformin/SGLT2i.'
    ],
    results: [
      {
        id: 'res-101',
        parameter: 'Serum Creatinine',
        value: 1.34,
        unit: 'mg/dL',
        referenceRangeText: '0.70 - 1.20 mg/dL',
        minRange: 0.70,
        maxRange: 1.20,
        isAbnormal: true,
        criticality: 'abnormal',
        historicalTrend: [
          { date: '2026-04-10', value: 1.08, unit: 'mg/dL', facility: 'Evercare Lab' },
          { date: '2026-08-20', value: 1.18, unit: 'mg/dL', facility: 'Popular Diagnostic' },
          { date: '2026-10-14', value: 1.34, unit: 'mg/dL', facility: 'Popular Diagnostic' }
        ]
      },
      {
        id: 'res-102',
        parameter: 'Estimated GFR (CKD-EPI 2021)',
        value: 58,
        unit: 'mL/min/1.73m²',
        referenceRangeText: '> 60 mL/min/1.73m²',
        minRange: 60,
        maxRange: 120,
        isAbnormal: true,
        criticality: 'abnormal',
        historicalTrend: [
          { date: '2026-04-10', value: 78, unit: 'mL/min/1.73m²', facility: 'Evercare Lab' },
          { date: '2026-08-20', value: 68, unit: 'mL/min/1.73m²', facility: 'Popular Diagnostic' },
          { date: '2026-10-14', value: 58, unit: 'mL/min/1.73m²', facility: 'Popular Diagnostic' }
        ]
      },
      {
        id: 'res-103',
        parameter: 'HbA1c (Glycated Hemoglobin)',
        value: 8.4,
        unit: '%',
        referenceRangeText: '< 5.7% (Diabetic Goal: < 7.0%)',
        minRange: 4.0,
        maxRange: 5.7,
        isAbnormal: true,
        criticality: 'abnormal',
        historicalTrend: [
          { date: '2026-04-10', value: 7.2, unit: '%', facility: 'Evercare Lab' },
          { date: '2026-08-20', value: 7.9, unit: '%', facility: 'Popular Diagnostic' },
          { date: '2026-10-14', value: 8.4, unit: '%', facility: 'Popular Diagnostic' }
        ]
      },
      {
        id: 'res-104',
        parameter: 'Fasting Plasma Glucose (FPG)',
        value: 156,
        unit: 'mg/dL',
        referenceRangeText: '70 - 100 mg/dL',
        minRange: 70,
        maxRange: 100,
        isAbnormal: true,
        criticality: 'abnormal',
        historicalTrend: [
          { date: '2026-08-20', value: 142, unit: 'mg/dL', facility: 'Popular Diagnostic' },
          { date: '2026-10-14', value: 156, unit: 'mg/dL', facility: 'Popular Diagnostic' }
        ]
      },
      {
        id: 'res-105',
        parameter: 'Serum Electrolytes: Sodium (Na+)',
        value: 139,
        unit: 'mmol/L',
        referenceRangeText: '135 - 145 mmol/L',
        minRange: 135,
        maxRange: 145,
        isAbnormal: false,
        criticality: 'normal'
      },
      {
        id: 'res-106',
        parameter: 'Serum Electrolytes: Potassium (K+)',
        value: 4.4,
        unit: 'mmol/L',
        referenceRangeText: '3.5 - 5.1 mmol/L',
        minRange: 3.5,
        maxRange: 5.1,
        isAbnormal: false,
        criticality: 'normal'
      }
    ]
  },
  {
    id: 'inv-002',
    reportNumber: 'EVR-IMG-88192',
    patientId: 'pat-101',
    patientName: 'Mr. Rafiqul Islam',
    mrn: 'EVR-DHK-784920',
    testName: 'Transthoracic Echocardiogram & Doppler (Draft OCR Extraction)',
    category: 'Cardiology',
    testDate: '2026-10-08',
    facility: 'Evercare Hospital Dhaka (Non-Invasive Cardiology)',
    orderingPhysician: 'Prof. Dr. Aisha Rahman',
    status: 'draft_extraction',
    isDraftOcrExtraction: true,
    ocrConfidencePercentage: 91,
    uploadedAt: '2026-10-11 11:45 AM',
    clinicianAnnotations: [
      'Draft parsed via AI document parser. Awaiting specialist clinician verification before confirming into longitudinal record.'
    ],
    results: [
      {
        id: 'res-201',
        parameter: 'Left Ventricular Ejection Fraction (LVEF, Simpson)',
        value: 55,
        unit: '%',
        referenceRangeText: '53 - 73%',
        minRange: 53,
        maxRange: 73,
        isAbnormal: false,
        criticality: 'normal',
        historicalTrend: [
          { date: '2025-06-12', value: 58, unit: '%', facility: 'United Hospital' },
          { date: '2026-10-08', value: 55, unit: '%', facility: 'Evercare Hospital' }
        ]
      },
      {
        id: 'res-202',
        parameter: 'Interventricular Septal Thickness (IVSd)',
        value: 12.2,
        unit: 'mm',
        referenceRangeText: '6.0 - 10.0 mm',
        minRange: 6.0,
        maxRange: 10.0,
        isAbnormal: true,
        criticality: 'borderline',
        historicalTrend: [
          { date: '2025-06-12', value: 11.0, unit: 'mm', facility: 'United Hospital' },
          { date: '2026-10-08', value: 12.2, unit: 'mm', facility: 'Evercare Hospital' }
        ]
      },
      {
        id: 'res-203',
        parameter: 'Mitral Inflow E/A Ratio',
        value: '0.78 (Grade-1 Diastolic Dysfunction)',
        unit: 'ratio',
        referenceRangeText: '0.80 - 2.0',
        isAbnormal: true,
        criticality: 'borderline'
      }
    ]
  }
];

export const MOCK_REFERRALS: ReferralSecondOpinion[] = [
  {
    id: 'ref-001',
    referralNumber: 'REF-EYE-4812',
    direction: 'outbound',
    patientId: 'pat-101',
    patientName: 'Mr. Rafiqul Islam',
    patientAge: 54,
    patientGender: 'Male',
    mrn: 'EVR-DHK-784920',
    referringClinician: {
      name: 'Prof. Dr. Aisha Rahman',
      title: 'Professor of Endocrinology & Internal Medicine',
      organization: 'Evercare Hospital Dhaka',
      bmdc: 'A-48291',
      phone: '+880 1711-002914'
    },
    receivingClinician: {
      name: 'Prof. Dr. Harun-Or-Rashid',
      title: 'Senior Vitreo-Retinal Surgeon',
      organization: 'National Institute of Ophthalmology & Hospital (NIO&H), Dhaka',
      specialty: 'Retina & Ophthalmic Surgery'
    },
    reasonForReferral: 'Annual Diabetic Retinopathy Dilated Fundoscopy & Optical Coherence Tomography (OCT)',
    clinicalSummary: '54-year-old male with poorly controlled Type 2 Diabetes Mellitus (HbA1c 8.4%). Complains of intermittent evening blurred vision. Requires stereoscopic retinal evaluation to rule out clinically significant macular edema.',
    priority: 'Urgent',
    currentStatus: 'Sent',
    statusHistory: [
      {
        status: 'Draft',
        timestamp: '2026-09-02 10:15 AM',
        actorName: 'Prof. Dr. Aisha Rahman',
        actorRole: 'Attending Physician',
        note: 'Referral draft created in EMR consultation encounter #enc-2026-081'
      },
      {
        status: 'Sent',
        timestamp: '2026-09-02 11:30 AM',
        actorName: 'Prof. Dr. Aisha Rahman',
        actorRole: 'Attending Physician',
        note: 'Authorized and securely dispatched to National Eye Institute digital triage desk'
      }
    ],
    authorizedEncounterIds: ['enc-2026-101'],
    attachments: [
      { name: 'Latest_Renal_Glycemic_Panel_POP-99214.pdf', type: 'PDF', date: '2026-10-14' },
      { name: 'Summary_Consultation_Chart_Evercare.pdf', type: 'PDF', date: '2026-10-16' }
    ],
    dueDate: '2026-10-02',
    createdDate: '2026-09-02'
  },
  {
    id: 'ref-002',
    referralNumber: 'REF-ENDO-9921',
    direction: 'inbound',
    patientId: 'pat-101',
    patientName: 'Mr. Rafiqul Islam',
    patientAge: 54,
    patientGender: 'Male',
    mrn: 'EVR-DHK-784920',
    referringClinician: {
      name: 'Dr. Mahbubur Rahman, FCPS',
      title: 'Consultant Nephrologist',
      organization: 'Chittagong Medical College Hospital & Delta Medical',
      bmdc: 'A-31290',
      phone: '+880 1819-201948'
    },
    receivingClinician: {
      name: 'Prof. Dr. Aisha Rahman',
      title: 'Senior Specialist Endocrinologist',
      organization: 'Evercare Hospital Dhaka',
      specialty: 'Endocrinology & Diabetic Kidney Disease'
    },
    reasonForReferral: 'Second Opinion on SGLT2i (Empagliflozin) Initiation in eGFR 58 mL/min with Mild Pedal Edema',
    clinicalSummary: 'Requesting expert opinion regarding initiation of Togent (Empagliflozin 10mg) in a patient with Stage 3a DKD, trace microalbuminuria (uACR 180 mg/g), and bilateral dependent pedal swelling. Seeking guidance on whether diuretic titration or ACEi/ARB optimization should precede.',
    priority: 'Urgent',
    currentStatus: 'Under Review',
    statusHistory: [
      {
        status: 'Draft',
        timestamp: '2026-10-12 02:00 PM',
        actorName: 'Dr. Mahbubur Rahman',
        actorRole: 'Referring Nephrologist'
      },
      {
        status: 'Sent',
        timestamp: '2026-10-12 03:30 PM',
        actorName: 'Dr. Mahbubur Rahman',
        actorRole: 'Referring Nephrologist'
      },
      {
        status: 'Acknowledged',
        timestamp: '2026-10-13 09:15 AM',
        actorName: 'Sister Nusrat Jahan, RN',
        actorRole: 'Specialist Triage Nurse',
        note: 'Referral package received, verified complete and assigned to Prof. Aisha Rahman'
      },
      {
        status: 'Under Review',
        timestamp: '2026-10-14 11:00 AM',
        actorName: 'Prof. Dr. Aisha Rahman',
        actorRole: 'Specialist Professor',
        note: 'Reviewing renal panel and metabolic profile. Drafting formal clinical recommendation.'
      }
    ],
    authorizedEncounterIds: ['enc-2026-101'],
    attachments: [
      { name: 'Nephrology_Case_Note_DrMahbub.pdf', type: 'PDF', date: '2026-10-12' },
      { name: 'Urinary_Albumin_Creatinine_Ratio.pdf', type: 'PDF', date: '2026-10-10' }
    ],
    dueDate: '2026-10-18',
    createdDate: '2026-10-12',
    response: {
      draftedAt: '2026-10-16 09:40 AM',
      draftedBy: 'Prof. Dr. Aisha Rahman',
      isClinicianApproved: false, // Requires explicit sign-off before transmission!
      findings: 'Patient exhibits Stage 3a Diabetic Kidney Disease with stable electrolytes (K+ 4.4 mmol/L). Dependent edema is hemodynamic and postural rather than congestive heart failure (Normal LVEF 55%).',
      recommendations: 'Empagliflozin 10mg once daily is strongly indicated under KDIGO 2024 guidelines for cardiorenal protection even with eGFR down to 20 mL/min. Recheck eGFR in 4 weeks. Maintain Camlodin 5mg with compression stockings for pedal swelling.',
      suggestedFollowUp: 'Repeat Serum Creatinine & Potassium in 30 days.'
    }
  }
];

export const MOCK_SPECIALIST_PATIENT_BRIEF: SpecialistPatientBrief = {
  patientId: 'pat-101',
  patientName: 'Mr. Rafiqul Islam',
  mrn: 'EVR-DHK-784920',
  todayVisitReason: {
    statement: 'Fasting glucose elevation (140-158 mg/dL) despite dual oral therapy, with evening bilateral pedal swelling after office hours.',
    sourceRef: 'Encounter #enc-2026-101 (Chief Complaint)'
  },
  previousVisits: [
    {
      date: '2026-08-22',
      encounterId: 'enc-2026-081',
      diagnosis: 'Type 2 Diabetes Mellitus with Essential Hypertension',
      clinician: 'Prof. Dr. Aisha Rahman',
      sourceRef: 'Evercare EMR #EVR-ENC-88190'
    },
    {
      date: '2026-04-10',
      encounterId: 'enc-2026-042',
      diagnosis: 'Type 2 Diabetes Mellitus & Grade-1 Hepatic Steatosis',
      clinician: 'Prof. Dr. Aisha Rahman',
      sourceRef: 'Evercare EMR #EVR-ENC-74120'
    }
  ],
  investigationHighlights: [
    {
      parameter: 'HbA1c',
      value: '8.4% (Worsening from 7.9%)',
      date: '2026-10-14',
      status: 'abnormal',
      sourceRef: 'Report #POP-BIO-99214 (Popular Diagnostic)'
    },
    {
      parameter: 'Serum Creatinine',
      value: '1.34 mg/dL (Prior 1.08 mg/dL)',
      date: '2026-10-14',
      status: 'abnormal',
      sourceRef: 'Report #POP-BIO-99214'
    },
    {
      parameter: 'Estimated GFR',
      value: '58 mL/min/1.73m² (Stage 3a CKD)',
      date: '2026-10-14',
      status: 'abnormal',
      sourceRef: 'Report #POP-BIO-99214'
    },
    {
      parameter: 'Transthoracic Echo (LVEF)',
      value: '55% (Normal LV Systolic Function)',
      date: '2026-10-08',
      status: 'normal',
      sourceRef: 'Evercare Cardiology #EVR-IMG-88192'
    }
  ],
  activeMedications: [
    {
      drugName: 'Compath (Metformin + Vildagliptin) 500/50 mg',
      dose: '1 Tablet BID after meals',
      sourceRef: 'e-Prescription #RX-2026-7849',
      status: 'verified'
    },
    {
      drugName: 'Camlodin (Amlodipine) 5 mg',
      dose: '1 Tablet daily in morning',
      sourceRef: 'e-Prescription #RX-2026-7849',
      status: 'verified'
    },
    {
      drugName: 'Togent (Empagliflozin) 10 mg',
      dose: '1 Tablet morning with water',
      sourceRef: 'e-Prescription #RX-2026-7849 (Added Today)',
      status: 'verified'
    },
    {
      drugName: 'Ayurvedic Herbal Karela Juice Capsules',
      dose: '2 Capsules daily self-administered',
      sourceRef: 'Patient Self-Report (Unverified)',
      status: 'unverified'
    }
  ],
  allergies: [
    {
      allergen: 'Penicillin (Amoxicillin / Ampicillin)',
      reaction: 'Severe urticaria, erythema, and facial angioedema',
      sourceRef: 'Patient Allergy Record (Verified 2022)'
    },
    {
      allergen: 'Sulfa Antibiotics (Cotrimoxazole)',
      reaction: 'Maculopapular drug eruption',
      sourceRef: 'Patient Allergy Record (Verified 2020)'
    }
  ],
  outstandingTasks: [
    {
      task: 'Dilated Retinal Fundus Photography (15 Days Overdue)',
      dueDate: '2026-10-02',
      severity: 'critical',
      sourceRef: 'Referral #REF-EYE-4812'
    },
    {
      task: 'Physician Review & Sign-Off of Renal Panel (POP-BIO-99214)',
      dueDate: '2026-10-16',
      severity: 'high',
      sourceRef: 'Investigation Worklist #POP-99214'
    }
  ],
  referralContext: {
    partnerName: 'National Institute of Ophthalmology & Hospital (NIO&H)',
    status: 'Sent (Awaiting Acknowledgement)',
    reason: 'Diabetic Maculopathy & Retinopathy annual dilated surveillance',
    sourceRef: 'Referral #REF-EYE-4812'
  },
  missingOrConflictingItems: [
    {
      category: 'missing',
      label: 'Missing Baseline 12-Lead ECG in Record',
      description: 'Patient reports having had an ECG done at an outside clinic in 2024, but no structured document exists in the EMR.'
    },
    {
      category: 'unverified',
      label: 'Unverified Herbal Supplement Use',
      description: 'Patient self-reported Karela/Bitter Gourd capsules. Unknown interaction with Metformin/SGLT2i. Needs physician counseling.'
    },
    {
      category: 'conflicting',
      label: 'Suspected Duplicate Patient Profile Flagged',
      description: 'Chamber registry contains a record for "Rafiqul Islam" (Phone: +880 1711-238910) with differing DOB (1974 vs 1972). Auto-merge blocked pending authorized staff review.'
    }
  ]
};
