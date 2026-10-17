export type UserRole = 
  | 'doctor' 
  | 'patient' 
  | 'clinic_admin' 
  | 'pharmacist' 
  | 'courier' 
  | 'saas_admin' 
  | 'public';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title?: string;
  email: string;
  avatarUrl?: string;
  organization?: string;
  branch?: string;
  specialty?: string;
}

export type AppointmentStatus = 
  | 'scheduled' 
  | 'checked-in' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientBloodType?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  durationMinutes: number;
  type: 'In-person' | 'Virtual Video';
  clinicName: string;
  room?: string;
  reason: string;
  status: AppointmentStatus;
  priority?: 'routine' | 'urgent' | 'follow-up';
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  mrn: string; // Medical Record Number
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  lastVisit: string;
  phone: string;
  email: string;
  insuranceProvider: string;
  policyNumber: string;
  avatarUrl?: string;
}

export type DosageForm = 
  | 'Tablet' 
  | 'Capsule' 
  | 'Syrup' 
  | 'Suspension' 
  | 'Injection' 
  | 'Inhaler' 
  | 'Eye Drop' 
  | 'Ear Drop' 
  | 'Cream / Ointment' 
  | 'Suppository';

export type RouteOfAdministration = 
  | 'Oral' 
  | 'Sublingual' 
  | 'Intravenous (IV)' 
  | 'Intramuscular (IM)' 
  | 'Subcutaneous'
  | 'Inhalation' 
  | 'Topical' 
  | 'Ophthalmic' 
  | 'Rectal';

export interface PrescriptionDrug {
  id: string;
  drugName: string;
  genericName?: string;
  strength?: string;
  dosage?: string; // e.g. 10 mg / 500 mg
  dosageForm?: DosageForm | string;
  route: RouteOfAdministration | string;
  dose?: string; // e.g. 1 Tablet, 5 ml, 2 Puffs
  frequency: string;
  duration: string;
  quantity?: string; // e.g. 30 Tablets, 1 Bottle
  mealTiming?: 'Before meals' | 'After meals' | 'With meals' | 'Empty stomach' | 'At bedtime' | 'Anytime';
  instructions: string;
  pharmacyNotes?: string;
  catalogSource?: 'local_dgda' | 'careflow_emr' | 'online_external' | 'manual';
  isManualEntry?: boolean;
  verified?: boolean;
  manufacturer?: string;
  indicativePriceBDT?: number;
  darNo?: string; // DGDA registration number
  dispensed?: boolean;
}

export interface MedicineCatalogItem {
  id: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: DosageForm;
  route: RouteOfAdministration;
  manufacturer: string;
  darNo?: string;
  source: 'local_dgda' | 'careflow_emr' | 'online_external';
  sourceLabel: string;
  verified: boolean;
  therapeuticClass: string;
  indicativePriceBDT?: number;
  packSize?: string;
  retrievedAt?: string;
  description?: string;
}

export interface PatientPrescriptionHistory {
  id: string;
  encounterId: string;
  date: string;
  doctorName: string;
  doctorBMDC: string;
  facility: string;
  diagnoses: string[];
  status: 'signed' | 'draft' | 'superseded';
  prescriptions: PrescriptionDrug[];
  clinicalAdvice: string;
}

export interface ConsultationEncounter {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  encounterDate: string;
  status: 'draft' | 'signed';
  chiefComplaint: string;
  hpi: string; // History of Present Illness
  vitals: {
    bloodPressure: string;
    heartRate: number;
    temperature: string;
    spo2: number;
    weight: string;
  };
  medicalHistory: string;
  allergies: string[];
  currentMedications: string[];
  examinationNotes: string;
  assessment: string;
  diagnoses: { code: string; label: string }[];
  treatmentPlan: string;
  prescriptions: PrescriptionDrug[];
  labOrders: { id: string; testName: string; priority: 'routine' | 'urgent'; status: 'ordered' | 'completed' }[];
  followUp: string;
  signedAt?: string;
  signedBy?: string;
}

export interface PharmacyMedication {
  id: string;
  name: string;
  genericName: string;
  category: string;
  sku: string;
  batchNumber: string;
  stock: number;
  unit: string;
  minThreshold: number;
  expiryDate: string;
  unitPrice: number;
  supplier: string;
  status: 'in-stock' | 'low-stock' | 'near-expiry' | 'out-of-stock';
}

export type DeliveryStatus = 
  | 'assigned' 
  | 'ready_for_pickup' 
  | 'picked_up' 
  | 'in_transit' 
  | 'delivered' 
  | 'failed';

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  prescriptionId?: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  pickupLocation: string;
  itemsSummary: string;
  status: DeliveryStatus;
  courierName?: string;
  assignedAt: string;
  estimatedDelivery: string;
  timeline: { title: string; time: string; completed: boolean }[];
  deliveryNotes?: string;
  proofOfDelivery?: {
    receivedBy: string;
    signedTime: string;
    confirmationCode: string;
  };
}

export interface ClinicQueueItem {
  ticketNumber: string;
  patientName: string;
  doctorName: string;
  department: string;
  arrivalTime: string;
  waitTimeMins: number;
  status: 'waiting' | 'with-doctor' | 'in-triage' | 'completed';
}

export interface OrganizationTenant {
  id: string;
  name: string;
  type: 'Hospital Network' | 'Private Practice' | 'Pharmacy Chain' | 'Diagnostic Lab';
  plan: 'Starter' | 'Professional Clinic' | 'Enterprise Health System';
  branches: number;
  staffCount: number;
  mrr: number;
  status: 'active' | 'trial' | 'past-due';
  renewalDate: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  module: 'Clinical' | 'Pharmacy' | 'Billing' | 'Access Control' | 'System';
  details: string;
  ipAddress: string;
}
