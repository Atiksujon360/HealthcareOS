export interface Chamber {
  id: string;
  name: string;
  institution: string;
  branch: string;
  room: string;
  address: string;
  phone: string;
  operatingDays: string[];
  operatingHours: string;
  consultationFeeBDT: number;
  followUpFeeBDT: number;
  slotDurationMinutes: number;
  assignedAssistantId: string;
  assignedAssistantName: string;
  activeToday: boolean;
}

export interface AssistantPermissions {
  canBookAppointments: boolean;
  canMarkArrival: boolean;
  canManageQueue: boolean;
  canViewClinicalNotes: boolean; // Must be false for assistant by default
  canViewPrescriptions: boolean; // Must be false by default
  canViewInvestigationResults: boolean; // Must be false by default
  canAuthorPrescriptions: boolean; // Must be false for assistant by default
  canCollectFees: boolean;
  canLogDocuments: boolean;
}

export interface ChamberAssistant {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  assignedChamberIds: string[];
  permissions: AssistantPermissions;
  activeChamberId: string;
}

export interface DuplicatePatientCandidate {
  id: string;
  targetPatientId: string;
  candidatePatientId: string;
  candidateName: string;
  candidateMRN: string;
  candidateDOB: string;
  candidatePhone: string;
  candidateAddress: string;
  matchScore: number; // 0 - 100
  matchReasons: string[];
  reviewStatus: 'unreviewed' | 'confirmed_distinct' | 'merged';
  flaggedDate: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export type InvestigationStatus = 'pending_review' | 'reviewed' | 'disputed' | 'draft_extraction';

export interface InvestigationResultItem {
  id: string;
  parameter: string;
  value: number | string;
  unit: string;
  referenceRangeText: string;
  minRange?: number;
  maxRange?: number;
  isAbnormal: boolean;
  criticality: 'normal' | 'borderline' | 'abnormal' | 'panic';
  historicalTrend?: {
    date: string;
    value: number;
    unit: string;
    facility: string;
  }[];
}

export interface InvestigationReport {
  id: string;
  reportNumber: string;
  patientId: string;
  patientName: string;
  mrn: string;
  testName: string;
  category: 'Biochemistry' | 'Hematology' | 'Endocrinology' | 'Cardiology' | 'Imaging' | 'Histopathology';
  testDate: string;
  facility: string;
  orderingPhysician: string;
  status: InvestigationStatus;
  isDraftOcrExtraction: boolean;
  ocrConfidencePercentage?: number;
  verifiedByPhysician?: string;
  verifiedAt?: string;
  clinicianAnnotations?: string[];
  disputeRationale?: string;
  results: InvestigationResultItem[];
  documentUrl?: string;
  uploadedAt: string;
}

export type ReferralLifecycleStatus = 
  | 'Draft'
  | 'Sent'
  | 'Acknowledged'
  | 'Under Review'
  | 'Response Drafted'
  | 'Response Approved'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled'
  | 'Info Requested';

export interface ReferralStatusEvent {
  status: ReferralLifecycleStatus;
  timestamp: string;
  actorName: string;
  actorRole: string;
  note?: string;
}

export interface ReferralSecondOpinion {
  id: string;
  referralNumber: string;
  direction: 'outbound' | 'inbound';
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  mrn: string;
  referringClinician: {
    name: string;
    title: string;
    organization: string;
    bmdc: string;
    phone: string;
  };
  receivingClinician: {
    name: string;
    title: string;
    organization: string;
    specialty: string;
  };
  reasonForReferral: string;
  clinicalSummary: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  currentStatus: ReferralLifecycleStatus;
  statusHistory: ReferralStatusEvent[];
  authorizedEncounterIds: string[];
  attachments: { name: string; type: string; date: string }[];
  dueDate: string;
  createdDate: string;
  response?: {
    draftedAt?: string;
    draftedBy?: string;
    approvedAt?: string;
    approvedBy?: string;
    isClinicianApproved: boolean;
    findings: string;
    recommendations: string;
    suggestedFollowUp: string;
  };
}

export interface SpecialistPatientBrief {
  patientId: string;
  patientName: string;
  mrn: string;
  todayVisitReason: {
    statement: string;
    sourceRef: string;
  };
  previousVisits: {
    date: string;
    encounterId: string;
    diagnosis: string;
    clinician: string;
    sourceRef: string;
  }[];
  investigationHighlights: {
    parameter: string;
    value: string;
    date: string;
    status: 'normal' | 'abnormal' | 'critical';
    sourceRef: string;
  }[];
  activeMedications: {
    drugName: string;
    dose: string;
    sourceRef: string;
    status: 'verified' | 'unverified';
  }[];
  allergies: {
    allergen: string;
    reaction: string;
    sourceRef: string;
  }[];
  outstandingTasks: {
    task: string;
    dueDate: string;
    severity: 'critical' | 'high' | 'medium';
    sourceRef: string;
  }[];
  referralContext?: {
    partnerName: string;
    status: string;
    reason: string;
    sourceRef: string;
  };
  missingOrConflictingItems: {
    category: 'missing' | 'unverified' | 'conflicting';
    label: string;
    description: string;
  }[];
}
