import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  UserRole, 
  UserProfile, 
  Appointment, 
  ConsultationEncounter, 
  PatientRecord, 
  PharmacyMedication, 
  DeliveryOrder, 
  ClinicQueueItem, 
  OrganizationTenant, 
  AuditLog,
  PrescriptionDrug
} from '../types';
import {
  CURRENT_DOCTOR,
  CURRENT_PATIENT,
  CURRENT_CLINIC_ADMIN,
  CURRENT_PHARMACIST,
  CURRENT_COURIER,
  CURRENT_SAAS_ADMIN,
  MOCK_APPOINTMENTS,
  MOCK_PATIENT_RECORDS,
  MOCK_CONSULTATION,
  MOCK_PHARMACY_INVENTORY,
  MOCK_DELIVERIES,
  MOCK_CLINIC_QUEUE,
  MOCK_ORGANIZATIONS,
  MOCK_AUDIT_LOGS,
} from '../data/mockData';
import { 
  CareGap, 
  CareJourneyEvent, 
  OutreachRecord, 
  PatientBarrier 
} from '../types/careLoop';
import { 
  INITIAL_CARE_GAPS, 
  INITIAL_CARE_JOURNEY_EVENTS 
} from '../data/mockCareLoopData';
import { CareLoopEngine } from '../services/careLoopEngine';

import { TRANSLATIONS, Language, formatCurrency, formatNumber, normalizeLocalizedText } from '../locales/translations';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS['en']) => string;
  formatBDT: (amount: number) => string;
  formatNum: (num: number | string) => string;

  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserProfile;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  
  // Data States
  appointments: Appointment[];
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addAppointment: (newApt: Omit<Appointment, 'id'>) => void;
  
  patientRecords: PatientRecord[];
  activeConsultation: ConsultationEncounter;
  updateConsultation: (updated: Partial<ConsultationEncounter>) => void;
  signAndFinalizeConsultation: () => void;
  addPrescriptionToConsultation: (drug: Omit<PrescriptionDrug, 'id'>) => void;
  updatePrescriptionItem: (id: string, updated: Partial<PrescriptionDrug>) => void;
  removePrescriptionItem: (id: string) => void;
  reorderPrescriptionItem: (id: string, direction: 'up' | 'down') => void;
  duplicatePrescriptionItem: (id: string) => void;
  unlockConsultationForAmendment: (reason: string) => void;
  copyPrescriptionFromHistory: (items: PrescriptionDrug[]) => void;
  
  pharmacyInventory: PharmacyMedication[];
  updateInventoryStock: (id: string, delta: number) => void;
  dispensePrescription: (prescriptionId: string) => void;
  
  deliveries: DeliveryOrder[];
  updateDeliveryStatus: (id: string, newStatus: DeliveryOrder['status'], note?: string) => void;
  
  clinicQueue: ClinicQueueItem[];
  advanceQueue: (ticketNumber: string) => void;
  
  organizations: OrganizationTenant[];
  auditLogs: AuditLog[];
  
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Search & Filters
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;

  // HealthcareOS CareLoop AI - Care Continuity Engine
  careGaps: CareGap[];
  careJourneyEvents: CareJourneyEvent[];
  outreachRecords: OutreachRecord[];
  activeCareLoopPatientId: string;
  setActiveCareLoopPatientId: (id: string) => void;
  resolveCareGap: (gapId: string, evidence: string) => void;
  disputeCareGap: (gapId: string, justification: string) => void;
  reassignCareGap: (gapId: string, newOwner: { id: string; name: string; role: string }, note?: string) => void;
  updateCareGapBarrier: (gapId: string, barrier: PatientBarrier) => void;
  sendCareGapOutreach: (gapId: string, channel: 'WhatsApp' | 'SMS' | 'Phone Call', customMessage?: string) => void;
  addCareJourneyEvent: (event: Omit<CareJourneyEvent, 'id' | 'timestamp'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Keep the initial render deterministic for SSR hydration. Restore the preference after mount.
  const [language, setLanguageState] = useState<Language>('en');
  const [currentRole, setCurrentRoleState] = useState<UserRole>('doctor');
  const [activeView, setActiveView] = useState<string>('doctor/dashboard');
  const [selectedBranch, setSelectedBranch] = useState<string>('Evercare Hospital Dhaka (Bashundhara R/A)');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  const t = (key: keyof typeof TRANSLATIONS['en']): string => {
    return normalizeLocalizedText(TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key);
  };

  const formatBDT = (amount: number): string => {
    return formatCurrency(amount, language);
  };

  const formatNum = (num: number | string): string => {
    return formatNumber(num, language);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    addToast({
      type: 'info',
      title: lang === 'bn' ? 'ভাষা পরিবর্তিত হয়েছে' : 'Language Switched',
      message: lang === 'bn' ? 'সিস্টেম ভাষা বাংলা (Bengali) তে সেট করা হয়েছে।' : 'System language switched to English.',
    });
  };

  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [patientRecords] = useState<PatientRecord[]>(MOCK_PATIENT_RECORDS);
  const [activeConsultation, setActiveConsultation] = useState<ConsultationEncounter>(MOCK_CONSULTATION);
  const [pharmacyInventory, setPharmacyInventory] = useState<PharmacyMedication[]>(MOCK_PHARMACY_INVENTORY);
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(MOCK_DELIVERIES);
  const [clinicQueue, setClinicQueue] = useState<ClinicQueueItem[]>(MOCK_CLINIC_QUEUE);
  const [organizations] = useState<OrganizationTenant[]>(MOCK_ORGANIZATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // HealthcareOS CareLoop AI States
  const [careGaps, setCareGaps] = useState<CareGap[]>(INITIAL_CARE_GAPS);
  const [careJourneyEvents, setCareJourneyEvents] = useState<CareJourneyEvent[]>(INITIAL_CARE_JOURNEY_EVENTS);
  const [outreachRecords, setOutreachRecords] = useState<OutreachRecord[]>([]);
  const [activeCareLoopPatientId, setActiveCareLoopPatientId] = useState<string>('pat-101');

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem('healthcareos-language');
    if (storedLanguage === 'bn') setLanguageState('bn');
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'bn' ? 'bn' : 'en';
    document.documentElement.classList.toggle('font-bengali', language === 'bn');
    window.localStorage.setItem('healthcareos-language', language);
  }, [language]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    switch (role) {
      case 'doctor':
        setActiveView('doctor/dashboard');
        break;
      case 'patient':
        setActiveView('patient/dashboard');
        break;
      case 'clinic_admin':
        setActiveView('clinic/dashboard');
        break;
      case 'pharmacist':
        setActiveView('pharmacy/dashboard');
        break;
      case 'courier':
        setActiveView('delivery/dashboard');
        break;
      case 'saas_admin':
        setActiveView('admin/dashboard');
        break;
      case 'public':
        setActiveView('public/home');
        break;
    }
    addToast({
      type: 'info',
      title: 'Portal Switched',
      message: `Navigated to ${role.replace('_', ' ').toUpperCase()} workspace.`,
    });
  };

  const getCurrentUser = (): UserProfile => {
    switch (currentRole) {
      case 'doctor':
        return CURRENT_DOCTOR;
      case 'patient':
        return CURRENT_PATIENT;
      case 'clinic_admin':
        return CURRENT_CLINIC_ADMIN;
      case 'pharmacist':
        return CURRENT_PHARMACIST;
      case 'courier':
        return CURRENT_COURIER;
      case 'saas_admin':
        return CURRENT_SAAS_ADMIN;
      case 'public':
      default:
        return {
          id: 'guest',
          name: 'Guest Visitor',
          role: 'public',
          email: 'visitor@careflowhealth.io',
        };
    }
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );
    addToast({
      type: 'success',
      title: 'Appointment Updated',
      message: `Status transitioned to ${status.toUpperCase()}.`,
    });
  };

  const addAppointment = (newApt: Omit<Appointment, 'id'>) => {
    const id = `apt-${Date.now().toString().slice(-4)}`;
    setAppointments((prev) => [{ ...newApt, id }, ...prev]);
    addToast({
      type: 'success',
      title: 'Appointment Scheduled',
      message: `Consultation confirmed with ${newApt.doctorName} for ${newApt.date} at ${newApt.time}.`,
    });
  };

  const updateConsultation = (updated: Partial<ConsultationEncounter>) => {
    setActiveConsultation((prev) => ({ ...prev, ...updated }));
    addToast({
      type: 'info',
      title: 'Clinical Draft Saved',
      message: 'Workspace changes stored locally with auto-save timestamp.',
    });
  };

  const signAndFinalizeConsultation = () => {
    const now = new Date().toLocaleString();
    setActiveConsultation((prev) => ({
      ...prev,
      status: 'signed',
      signedAt: now,
      signedBy: CURRENT_DOCTOR.name,
    }));
    // Record audit log
    const logId = `aud-${Date.now().toString().slice(-4)}`;
    setAuditLogs((prev) => [
      {
        id: logId,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actor: CURRENT_DOCTOR.name,
        role: 'Doctor',
        action: 'Clinical Encounter Finalized & Signed',
        module: 'Clinical',
        details: `Encounter #${activeConsultation.id} finalized with diagnosis codes: ${activeConsultation.diagnoses.map(d => d.code).join(', ')}`,
        ipAddress: '192.168.1.104',
      },
      ...prev
    ]);
    addToast({
      type: 'success',
      title: 'Encounter Signed & Finalized',
      message: 'Medical chart locked. Prescriptions and lab requisitions queued for dispatch.',
    });
  };

  const addPrescriptionToConsultation = (drug: Omit<PrescriptionDrug, 'id'>) => {
    const id = `rx-${Date.now().toString().slice(-4)}`;
    setActiveConsultation((prev) => ({
      ...prev,
      prescriptions: [...prev.prescriptions, { ...drug, id }],
    }));
    addToast({
      type: 'success',
      title: 'Prescription Added',
      message: `${drug.drugName} ${drug.dosage || ''} drafted for clinical review.`,
    });
  };

  const updatePrescriptionItem = (id: string, updated: Partial<PrescriptionDrug>) => {
    setActiveConsultation((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.map((p) =>
        p.id === id ? { ...p, ...updated } : p
      ),
    }));
    addToast({
      type: 'info',
      title: 'Prescription Updated',
      message: 'Medication parameters adjusted.',
    });
  };

  const removePrescriptionItem = (id: string) => {
    setActiveConsultation((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((p) => p.id !== id),
    }));
    addToast({
      type: 'info',
      title: 'Item Removed',
      message: 'Medication removed from draft prescription.',
    });
  };

  const reorderPrescriptionItem = (id: string, direction: 'up' | 'down') => {
    setActiveConsultation((prev) => {
      const list = [...prev.prescriptions];
      const index = list.findIndex((p) => p.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, prescriptions: list };
    });
  };

  const duplicatePrescriptionItem = (id: string) => {
    const existing = activeConsultation.prescriptions.find((p) => p.id === id);
    if (!existing) return;
    const newId = `rx-${Date.now().toString().slice(-4)}`;
    const copy: PrescriptionDrug = {
      ...existing,
      id: newId,
      drugName: `${existing.drugName} (Copy)`,
      dispensed: false,
    };
    setActiveConsultation((prev) => ({
      ...prev,
      prescriptions: [...prev.prescriptions, copy],
    }));
    addToast({
      type: 'success',
      title: 'Medication Duplicated',
      message: `Duplicated ${existing.drugName} for dosage titration or regimen modification.`,
    });
  };

  const unlockConsultationForAmendment = (reason: string) => {
    setActiveConsultation((prev) => ({
      ...prev,
      status: 'draft',
    }));
    const logId = `aud-${Date.now().toString().slice(-4)}`;
    setAuditLogs((prev) => [
      {
        id: logId,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actor: CURRENT_DOCTOR.name,
        role: 'Doctor',
        action: 'Prescription Unlocked for Clinical Amendment',
        module: 'Clinical',
        details: `Encounter #${activeConsultation.id} unlocked. Clinical Reason: ${reason}`,
        ipAddress: '192.168.1.104',
      },
      ...prev,
    ]);
    addToast({
      type: 'warning',
      title: 'Prescription Unlocked',
      message: 'Chart opened for authorized amendment. Changes will be audited.',
    });
  };

  const copyPrescriptionFromHistory = (items: PrescriptionDrug[]) => {
    const newItems = items.map((it) => ({
      ...it,
      id: `rx-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
      dispensed: false,
    }));
    setActiveConsultation((prev) => ({
      ...prev,
      prescriptions: [...prev.prescriptions, ...newItems],
    }));
    addToast({
      type: 'success',
      title: 'Historical Regimen Copied',
      message: `${newItems.length} medication(s) transferred to current draft.`,
    });
  };

  const updateInventoryStock = (id: string, delta: number) => {
    setPharmacyInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stock + delta);
          let newStatus = item.status;
          if (newStock === 0) newStatus = 'out-of-stock';
          else if (newStock <= item.minThreshold) newStatus = 'low-stock';
          else newStatus = 'in-stock';
          return { ...item, stock: newStock, status: newStatus };
        }
        return item;
      })
    );
    addToast({
      type: 'info',
      title: 'Inventory Movement Logged',
      message: `Stock level adjusted for audit reconciliation.`,
    });
  };

  const dispensePrescription = (prescriptionId: string) => {
    // mark active prescription as dispensed
    setActiveConsultation((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.map((p) =>
        p.id === prescriptionId ? { ...p, dispensed: true } : p
      ),
    }));
    // create a delivery order for the dispensed item
    const newDelId = `del-${Date.now().toString().slice(-4)}`;
    const newDelivery: DeliveryOrder = {
      id: newDelId,
      orderNumber: `CFD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      prescriptionId,
      recipientName: activeConsultation.patientName,
      recipientPhone: '+1 (555) 234-8910',
      recipientAddress: '742 Evergreen Terrace, Apt 4B, Metro District',
      pickupLocation: 'CareFlow Central Pharmacy (Dispensing Bay 3)',
      itemsSummary: `Dispensed Rx Medication Order (#${prescriptionId})`,
      status: 'ready_for_pickup',
      assignedAt: 'Just now',
      estimatedDelivery: 'Within 2 hours',
      timeline: [
        { title: 'Prescription Verified by James Chen, PharmD', time: 'Just now', completed: true },
        { title: 'Dispensed & Tamper-Proof Packaged', time: 'Just now', completed: true },
        { title: 'Assigned to Fleet Dispatch', time: 'Pending pickup', completed: false },
        { title: 'Out for Courier Transit', time: 'Awaiting courier', completed: false },
        { title: 'Delivered with Recipient Signature', time: 'Scheduled', completed: false },
      ],
    };
    setDeliveries((prev) => [newDelivery, ...prev]);
    addToast({
      type: 'success',
      title: 'Medication Dispensed',
      message: `Rx verified and handed to logistics dispatch queue.`,
    });
  };

  const updateDeliveryStatus = (id: string, newStatus: DeliveryOrder['status'], note?: string) => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const updatedTimeline = d.timeline.map((step) => {
            if (newStatus === 'picked_up' && step.title.includes('Courier')) {
              return { ...step, completed: true, time: 'Just now' };
            }
            if (newStatus === 'in_transit' && step.title.includes('Transit')) {
              return { ...step, completed: true, time: 'Just now' };
            }
            if (newStatus === 'delivered' && step.title.includes('Delivered')) {
              return { ...step, completed: true, time: 'Delivered & Confirmed' };
            }
            return step;
          });

          return {
            ...d,
            status: newStatus,
            timeline: updatedTimeline,
            deliveryNotes: note || d.deliveryNotes,
            proofOfDelivery: newStatus === 'delivered' ? {
              receivedBy: `${d.recipientName} (Confirmed)`,
              signedTime: new Date().toLocaleTimeString(),
              confirmationCode: `POD-${Math.floor(1000 + Math.random() * 9000)}`
            } : d.proofOfDelivery
          };
        }
        return d;
      })
    );
    addToast({
      type: 'success',
      title: 'Courier Route Updated',
      message: `Order transitioned to ${newStatus.replace('_', ' ').toUpperCase()}`,
    });
  };

  const advanceQueue = (ticketNumber: string) => {
    setClinicQueue((prev) =>
      prev.map((item) =>
        item.ticketNumber === ticketNumber
          ? {
              ...item,
              status:
                item.status === 'waiting'
                  ? 'in-triage'
                  : item.status === 'in-triage'
                  ? 'with-doctor'
                  : 'completed',
            }
          : item
      )
    );
    addToast({
      type: 'info',
      title: 'Queue Advancing',
      message: `Patient Ticket ${ticketNumber} updated.`,
    });
  };

  // HealthcareOS CareLoop AI Handlers
  const resolveCareGap = (gapId: string, evidence: string) => {
    const targetGap = careGaps.find(g => g.id === gapId);
    if (!targetGap) return;

    const now = new Date().toLocaleString();
    const actorName = getCurrentUser().name;

    setCareGaps(prev => prev.map(g => g.id === gapId ? {
      ...g,
      status: 'resolved',
      resolutionEvidence: evidence,
      resolvedAt: now,
      resolvedBy: actorName
    } : g));

    const newEvent: CareJourneyEvent = {
      id: `evt-${Date.now().toString().slice(-4)}`,
      patientId: targetGap.patientId,
      patientName: targetGap.patientName,
      type: 'task_completed',
      title: `Care Gap Resolved: ${targetGap.title}`,
      description: `Action completed and clinically substantiated: "${evidence}"`,
      timestamp: now,
      status: 'completed',
      responsiblePerson: {
        name: actorName,
        role: getCurrentUser().role,
        facility: selectedBranch
      },
      source: 'Care Coordinator',
      evidence,
      associatedGapId: gapId
    };

    setCareJourneyEvents(prev => [newEvent, ...prev]);

    setAuditLogs(prev => [{
      id: `log-${Date.now().toString().slice(-4)}`,
      timestamp: now,
      actor: actorName,
      role: getCurrentUser().role,
      action: 'Care Gap Clinically Resolved',
      module: 'Clinical',
      details: `Gap #${gapId} ("${targetGap.title}") resolved with evidence: ${evidence}`,
      ipAddress: '10.240.12.84'
    }, ...prev]);

    addToast({
      type: 'success',
      title: language === 'bn' ? 'কেয়ার গ্যাপ সফলভাবে সমাপ্ত হয়েছে' : 'Care Gap Resolved',
      message: language === 'bn' 
        ? `ক্লিনিক্যাল এভিডেন্স সংরক্ষণ করা হয়েছে: ${targetGap.title}` 
        : `Verified evidence recorded and care loop successfully closed for ${targetGap.patientName}.`
    });
  };

  const disputeCareGap = (gapId: string, justification: string) => {
    const targetGap = careGaps.find(g => g.id === gapId);
    if (!targetGap) return;

    const now = new Date().toLocaleString();
    const actorName = getCurrentUser().name;

    setCareGaps(prev => prev.map(g => g.id === gapId ? {
      ...g,
      status: 'disputed',
      disputeJustification: justification,
      disputedAt: now,
      disputedBy: actorName
    } : g));

    const newEvent: CareJourneyEvent = {
      id: `evt-${Date.now().toString().slice(-4)}`,
      patientId: targetGap.patientId,
      patientName: targetGap.patientName,
      type: 'task_cancelled',
      title: `Clinical Override / Disputed: ${targetGap.title}`,
      description: `Clinician determined action is clinically inappropriate: "${justification}"`,
      timestamp: now,
      status: 'disputed',
      responsiblePerson: {
        name: actorName,
        role: getCurrentUser().role,
        facility: selectedBranch
      },
      source: 'EMR',
      evidence: justification,
      associatedGapId: gapId
    };

    setCareJourneyEvents(prev => [newEvent, ...prev]);

    setAuditLogs(prev => [{
      id: `log-${Date.now().toString().slice(-4)}`,
      timestamp: now,
      actor: actorName,
      role: getCurrentUser().role,
      action: 'Care Gap Clinically Disputed',
      module: 'Clinical',
      details: `Gap #${gapId} overridden by physician: ${justification}`,
      ipAddress: '10.240.12.84'
    }, ...prev]);

    addToast({
      type: 'info',
      title: language === 'bn' ? 'ক্লিনিক্যাল ওভাররাইড রেকর্ড করা হয়েছে' : 'Care Gap Disputed & Overridden',
      message: language === 'bn' ? 'চিকিৎসকের যুক্তি অডিট ট্রেইলে যুক্ত করা হয়েছে।' : 'Clinical justification logged with supervisor audit trail.'
    });
  };

  const reassignCareGap = (gapId: string, newOwner: { id: string; name: string; role: string }, note?: string) => {
    const targetGap = careGaps.find(g => g.id === gapId);
    if (!targetGap) return;

    const now = new Date().toLocaleString();
    setCareGaps(prev => prev.map(g => g.id === gapId ? {
      ...g,
      accountableOwner: newOwner,
      status: 'in_progress',
      escalationStatus: `Reassigned to ${newOwner.name} (${newOwner.role})`
    } : g));

    const newEvent: CareJourneyEvent = {
      id: `evt-${Date.now().toString().slice(-4)}`,
      patientId: targetGap.patientId,
      patientName: targetGap.patientName,
      type: 'care_coordination_task_assigned',
      title: `Accountable Owner Reassigned to ${newOwner.name}`,
      description: note || `Task reassigned to ${newOwner.role} for accelerated follow-through.`,
      timestamp: now,
      status: 'pending',
      responsiblePerson: {
        name: newOwner.name,
        role: newOwner.role,
        facility: selectedBranch
      },
      source: 'Care Coordinator',
      associatedGapId: gapId
    };

    setCareJourneyEvents(prev => [newEvent, ...prev]);

    addToast({
      type: 'info',
      title: language === 'bn' ? 'দায়িত্বপ্রাপ্ত ব্যক্তি পরিবর্তিত হয়েছে' : 'Owner Reassigned',
      message: `Accountability transferred to ${newOwner.name} (${newOwner.role}).`
    });
  };

  const updateCareGapBarrier = (gapId: string, barrier: PatientBarrier) => {
    const targetGap = careGaps.find(g => g.id === gapId);
    if (!targetGap) return;

    const now = new Date().toLocaleString();
    setCareGaps(prev => prev.map(g => g.id === gapId ? {
      ...g,
      barrier: {
        ...barrier,
        reportedAt: now
      }
    } : g));

    const newEvent: CareJourneyEvent = {
      id: `evt-${Date.now().toString().slice(-4)}`,
      patientId: targetGap.patientId,
      patientName: targetGap.patientName,
      type: 'barrier_reported',
      title: `Patient Barrier Reported: ${barrier.type.toUpperCase().replace('_', ' ')}`,
      description: barrier.description,
      timestamp: now,
      status: 'pending',
      responsiblePerson: {
        name: getCurrentUser().name,
        role: getCurrentUser().role,
        facility: selectedBranch
      },
      source: 'Patient App',
      associatedGapId: gapId
    };

    setCareJourneyEvents(prev => [newEvent, ...prev]);

    addToast({
      type: 'warning',
      title: language === 'bn' ? 'রোগীর প্রতিবন্ধকতা নথিভুক্ত হয়েছে' : 'Patient Barrier Documented',
      message: `${barrier.type.toUpperCase()} barrier recorded. Suggested intervention triggered.`
    });
  };

  const sendCareGapOutreach = (gapId: string, channel: 'WhatsApp' | 'SMS' | 'Phone Call', customMessage?: string) => {
    const targetGap = careGaps.find(g => g.id === gapId);
    if (!targetGap) return;

    const now = new Date().toLocaleString();
    const finalMessage = customMessage || CareLoopEngine.generateOutreachTemplate(targetGap, language, channel);

    const record: OutreachRecord = {
      id: `out-${Date.now().toString().slice(-4)}`,
      gapId,
      patientId: targetGap.patientId,
      channel,
      recipientPhone: '+880 1711-238910',
      messageContent: finalMessage,
      sentAt: now,
      status: 'delivered'
    };

    setOutreachRecords(prev => [record, ...prev]);

    setCareGaps(prev => prev.map(g => g.id === gapId ? {
      ...g,
      status: 'in_progress',
      escalationStatus: `Outreach dispatched via ${channel}`
    } : g));

    const newEvent: CareJourneyEvent = {
      id: `evt-${Date.now().toString().slice(-4)}`,
      patientId: targetGap.patientId,
      patientName: targetGap.patientName,
      type: 'care_coordination_task_assigned',
      title: `Patient Outreach Dispatched via ${channel}`,
      description: `Bilingual reminder sent to patient phone (+880 1711-238910): "${finalMessage.slice(0, 90)}..."`,
      timestamp: now,
      status: 'completed',
      responsiblePerson: {
        name: getCurrentUser().name,
        role: getCurrentUser().role,
        facility: selectedBranch
      },
      source: 'Care Coordinator',
      associatedGapId: gapId
    };

    setCareJourneyEvents(prev => [newEvent, ...prev]);

    addToast({
      type: 'success',
      title: language === 'bn' ? `${channel} বার্তা সফলভাবে পাঠানো হয়েছে` : `${channel} Outreach Dispatched`,
      message: language === 'bn' 
        ? `${targetGap.patientName}-এর কাছে কেয়ারলুপ বার্তা পৌঁছেছে।` 
        : `Patient continuity communication delivered to ${targetGap.patientName}.`
    });
  };

  const addCareJourneyEvent = (event: Omit<CareJourneyEvent, 'id' | 'timestamp'>) => {
    const now = new Date().toLocaleString();
    const id = `evt-${Date.now().toString().slice(-4)}`;
    setCareJourneyEvents(prev => [{ ...event, id, timestamp: now }, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatBDT,
        formatNum,
        currentRole,
        setCurrentRole,
        currentUser: getCurrentUser(),
        activeView,
        setActiveView,
        selectedBranch,
        setSelectedBranch,
        appointments,
        updateAppointmentStatus,
        addAppointment,
        patientRecords,
        activeConsultation,
        updateConsultation,
        signAndFinalizeConsultation,
        addPrescriptionToConsultation,
        updatePrescriptionItem,
        removePrescriptionItem,
        reorderPrescriptionItem,
        duplicatePrescriptionItem,
        unlockConsultationForAmendment,
        copyPrescriptionFromHistory,
        pharmacyInventory,
        updateInventoryStock,
        dispensePrescription,
        deliveries,
        updateDeliveryStatus,
        clinicQueue,
        advanceQueue,
        organizations,
        auditLogs,
        toasts,
        addToast,
        removeToast,
        globalSearchQuery,
        setGlobalSearchQuery,
        careGaps,
        careJourneyEvents,
        outreachRecords,
        activeCareLoopPatientId,
        setActiveCareLoopPatientId,
        resolveCareGap,
        disputeCareGap,
        reassignCareGap,
        updateCareGapBarrier,
        sendCareGapOutreach,
        addCareJourneyEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
