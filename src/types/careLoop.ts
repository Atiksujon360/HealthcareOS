export type CareEventType = 
  | 'consultation_completed'
  | 'care_plan_created'
  | 'prescription_issued'
  | 'prescription_dispensed'
  | 'referral_created'
  | 'referral_acknowledged'
  | 'lab_ordered'
  | 'lab_result_received'
  | 'follow_up_recommended'
  | 'follow_up_scheduled'
  | 'patient_question_submitted'
  | 'care_coordination_task_assigned'
  | 'task_completed'
  | 'task_cancelled'
  | 'task_escalated'
  | 'barrier_reported';

export type EventStatus = 
  | 'completed' 
  | 'pending' 
  | 'overdue' 
  | 'disputed' 
  | 'awaiting_review';

export interface CareJourneyEvent {
  id: string;
  patientId: string;
  patientName: string;
  type: CareEventType;
  title: string;
  description: string;
  timestamp: string;
  status: EventStatus;
  responsiblePerson: {
    name: string;
    role: string;
    facility?: string;
  };
  source: 'EMR' | 'Laboratory' | 'Pharmacy' | 'Patient App' | 'Care Coordinator' | 'External Specialist';
  evidence?: string;
  associatedGapId?: string;
  metadata?: Record<string, any>;
}

export type CareGapType = 
  | 'overdue_follow_up'
  | 'unreviewed_lab'
  | 'unfilled_prescription'
  | 'unclosed_referral'
  | 'missing_preventive_screen'
  | 'barrier_flag';

export type CareGapSeverity = 'critical' | 'high' | 'medium' | 'low';

export type CareGapStatus = 'active' | 'in_progress' | 'resolved' | 'disputed';

export type PatientBarrierType = 
  | 'financial'
  | 'transport'
  | 'clinical_hesitancy'
  | 'scheduling_conflict'
  | 'system_delay'
  | 'out_of_stock'
  | 'none';

export interface PatientBarrier {
  type: PatientBarrierType;
  description: string;
  reportedAt?: string;
  suggestedIntervention?: string;
}

export interface CareGap {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  mrn: string;
  gapType: CareGapType;
  title: string;
  severity: CareGapSeverity;
  clinicalRationale: string;
  guidelineReference: string; // e.g. "ADA/DGHS Diabetes Guidelines 2026", "NICE Chronic Kidney Disease NG203"
  accountableOwner: {
    id: string;
    name: string;
    role: string;
  };
  detectedDate: string;
  dueDate: string;
  daysOverdue: number; // positive = days overdue, negative = days remaining
  barrier: PatientBarrier;
  status: CareGapStatus;
  escalationTier: 1 | 2 | 3;
  escalationStatus?: string;
  resolutionEvidence?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  disputeJustification?: string;
  disputedAt?: string;
  disputedBy?: string;
  suggestedAction: {
    actionType: 'schedule_appointment' | 'send_outreach' | 'fast_track_lab' | 'pharmacy_refill' | 'reassign_owner';
    label: string;
    details: string;
  };
}

export interface PatientContinuityMetrics {
  patientId: string;
  patientName: string;
  continuityScore: number; // 0 - 100 (Patient Continuity Index - PCI)
  riskLevel: 'Optimal' | 'Moderate Risk' | 'High Risk' | 'Critical Risk';
  activeGapsCount: number;
  criticalGapsCount: number;
  completedActionsCount: number;
  daysSinceLastClinicianContact: number;
  nextRecommendedAction: string;
  clinicalSummary: string;
}

export interface OutreachRecord {
  id: string;
  gapId: string;
  patientId: string;
  channel: 'WhatsApp' | 'SMS' | 'Phone Call' | 'In-App Notification';
  recipientPhone: string;
  messageContent: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  responseReceived?: string;
}
