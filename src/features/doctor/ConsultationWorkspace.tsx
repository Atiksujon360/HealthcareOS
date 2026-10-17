import React, { useState } from 'react';
import { 
  Stethoscope, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  FileCheck, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Pill, 
  FlaskConical, 
  Calendar, 
  Eye, 
  Lock, 
  Clock, 
  User, 
  History,
  FileText,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { PrescriptionDrug } from '../../types';
import { PrescriptionBuilder, MedicineSearch } from './components/PrescriptionBuilder';
import { CelebrationBurst } from '../../components/common/AnimatedTelemetry';

export { MedicineSearch, PrescriptionBuilder };

export const ConsultationWorkspace: React.FC = () => {
  const { 
    activeConsultation, 
    updateConsultation, 
    signAndFinalizeConsultation, 
    addPrescriptionToConsultation, 
    setActiveView,
    addToast,
    t,
    language,
    formatNum,
    careGaps,
    resolveCareGap,
    setActiveCareLoopPatientId
  } = useApp();

  const [activeTab, setActiveTab] = useState<'clinical' | 'prescriptions' | 'labs' | 'plan' | 'careloop'>('clinical');
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showSignConfirmModal, setShowSignConfirmModal] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationMsg, setCelebrationMsg] = useState<string>('');

  const patientCareGaps = careGaps.filter(
    g => g.patientId === activeConsultation.patientId && (g.status === 'active' || g.status === 'in_progress')
  );
  const criticalGapsCount = patientCareGaps.filter(g => g.severity === 'critical').length;

  const isSigned = activeConsultation.status === 'signed';

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('doctor/dashboard')}
            className="p-2.5 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] rounded-xl transition-colors"
            title="Back to Doctor Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider font-mono">
                {language === 'bn' ? 'এনকাউন্টার' : 'Encounter'} #{activeConsultation.id}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                isSigned ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEF3C7] text-[#B45309]'
              }`}>
                {activeConsultation.status === 'signed' ? (language === 'bn' ? 'বিএমডিসি স্বাক্ষরিত ও চূড়ান্ত' : 'BMDC Signed & Finalized') : (language === 'bn' ? 'চেম্বারে খসড়া চলমান' : 'Draft In Chamber')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0A192F] font-display tracking-tight">
              {t('encounterTitle')}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0A192F] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-xl transition-colors shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#0F766E]" />
            {t('previewChart')}
          </button>

          {!isSigned ? (
            <>
              <button
                onClick={() => {
                  updateConsultation({});
                  addToast({
                    type: 'info',
                    title: language === 'bn' ? 'খসড়া সংরক্ষিত হয়েছে' : 'Draft Saved',
                    message: language === 'bn' ? 'ক্লিনিক্যাল রেকর্ড টাইমস্ট্যাম্প সহ স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়েছে।' : 'Clinical record snapshot saved with timestamp.',
                  });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F766E] bg-[#E6F4F1] hover:bg-[#CCFBF1] rounded-xl transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {t('saveDraft')}
              </button>

              <button
                onClick={() => setShowSignConfirmModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-xs"
              >
                <FileCheck className="w-3.5 h-3.5" />
                {t('signAndFinalize')}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#DCFCE7] text-[#15803D] rounded-xl text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('signedBy')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Patient Demographic & Vitals Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center font-bold text-base">
              RI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#0A192F] font-display">
                  {activeConsultation.patientName}
                </h2>
                <span className="text-xs font-mono font-semibold text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded">
                  MRN: EVR-DHK-784920
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                <span>{formatNum(54)}y Male</span>
                <span>·</span>
                <span>DOB: 12 Apr 1972</span>
                <span>·</span>
                <span className="font-mono font-bold text-[#0A192F]">B+</span>
                <span>·</span>
                <span>Dhanmondi, Dhaka</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-[#FEF2F2] border border-[#FEE2E2] px-3 py-2 rounded-xl text-[#B91C1C]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <div>
              <span className="font-semibold block">{t('allergies')}</span>
              <span>{activeConsultation.allergies.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
          <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] block uppercase tracking-wider">{t('bloodPressure')}</span>
            <span className="text-sm font-bold text-[#0A192F] font-mono tabular-nums">
              {activeConsultation.vitals.bloodPressure}
            </span>
          </div>
          <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] card-interactive">
            <span className="text-[10px] text-[#64748B] uppercase tracking-wider flex items-center justify-between">
              <span>{t('heartRate')}</span>
              <Heart className="w-3 h-3 text-teal-600 animate-heartbeat" />
            </span>
            <span className="text-sm font-bold text-[#0A192F] font-mono tabular-nums">
              {formatNum(activeConsultation.vitals.heartRate)} bpm
            </span>
          </div>
          <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] block uppercase tracking-wider">{t('temperature')}</span>
            <span className="text-sm font-bold text-[#0A192F] font-mono tabular-nums">
              {activeConsultation.vitals.temperature}
            </span>
          </div>
          <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] block uppercase tracking-wider">SpO2 (Oxygen)</span>
            <span className="text-sm font-bold text-[#0A192F] font-mono tabular-nums">
              {formatNum(activeConsultation.vitals.spo2)}%
            </span>
          </div>
          <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] col-span-2 sm:col-span-1">
            <span className="text-[10px] text-[#64748B] block uppercase tracking-wider">{t('weight')}</span>
            <span className="text-sm font-bold text-[#0A192F] font-mono tabular-nums">
              {activeConsultation.vitals.weight}
            </span>
          </div>
        </div>
      </div>

      {/* CareLoop Active Gaps Alert Banner */}
      {patientCareGaps.length > 0 && (
        <div className="bg-gradient-to-r from-[#FFFBEB] via-[#FEF3C7] to-[#FFFBEB] border border-[#FCD34D] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-[#D97706] text-white shrink-0 mt-0.5 sm:mt-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#92400E] uppercase tracking-wider">
                  {language === 'bn' ? 'কেয়ারলুপ এআই ধারাবাহিকতা সতর্কতা' : 'CareLoop Care Continuity Alert'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${criticalGapsCount > 0 ? 'bg-[#DC2626]' : 'bg-[#D97706]'}`}>
                  {formatNum(patientCareGaps.length)} {language === 'bn' ? 'টি সক্রিয় কেয়ার গ্যাপ' : 'Gaps Detected'}
                </span>
              </div>
              <p className="text-xs text-[#78350F] mt-0.5">
                {patientCareGaps.map(g => g.title).join(' · ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('careloop')}
            className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs whitespace-nowrap self-start sm:self-center"
          >
            {language === 'bn' ? 'ভিজিটে গ্যাপ সমাধান করুন' : 'Review & Close in Visit'}
          </button>
        </div>
      )}

      {/* Workspace Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E2E8F0] pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('clinical')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'clinical'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          {t('clinicalNotesTab')}
        </button>
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'prescriptions'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          {t('prescriptionsTab')} ({formatNum(activeConsultation.prescriptions.length)})
        </button>
        <button
          onClick={() => setActiveTab('labs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'labs'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          {t('labOrdersTab')} ({formatNum(activeConsultation.labOrders.length)})
        </button>
        <button
          onClick={() => setActiveTab('plan')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'plan'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          {t('followUpTab')}
        </button>
        <button
          onClick={() => setActiveTab('careloop')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'careloop'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>{language === 'bn' ? 'কেয়ারলুপ কন্টিনিউইটি' : 'CareLoop Gaps'}</span>
          {patientCareGaps.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              criticalGapsCount > 0 ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#E6F4F1] text-[#0F766E]'
            }`}>
              {formatNum(patientCareGaps.length)}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Clinical Notes & Examination */}
      {activeTab === 'clinical' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
              <label className="block text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-2 font-display">
                {t('chiefComplaint')}
              </label>
              <textarea
                disabled={isSigned}
                rows={3}
                value={activeConsultation.chiefComplaint}
                onChange={(e) => updateConsultation({ chiefComplaint: e.target.value })}
                className="w-full p-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] leading-relaxed disabled:opacity-80"
              />
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
              <label className="block text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-2 font-display">
                {t('hpi')}
              </label>
              <textarea
                disabled={isSigned}
                rows={6}
                value={activeConsultation.hpi}
                onChange={(e) => updateConsultation({ hpi: e.target.value })}
                className="w-full p-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] leading-relaxed disabled:opacity-80"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
              <label className="block text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-2 font-display">
                {t('physicalExam')}
              </label>
              <textarea
                disabled={isSigned}
                rows={6}
                value={activeConsultation.examinationNotes}
                onChange={(e) => updateConsultation({ examinationNotes: e.target.value })}
                className="w-full p-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] leading-relaxed disabled:opacity-80"
              />
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
              <label className="block text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-2 font-display">
                {t('currentMedications')}
              </label>
              <div className="space-y-2">
                {activeConsultation.currentMedications.map((med, idx) => (
                  <div key={idx} className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] flex items-center justify-between">
                    <span>{med}</span>
                    <span className="text-[10px] text-[#15803D] font-semibold bg-[#DCFCE7] px-2 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Smart e-Prescriptions Builder */}
      {activeTab === 'prescriptions' && (
        <PrescriptionBuilder 
          onOpenPreview={() => setShowPreviewModal(true)}
          onOpenSignModal={() => setShowSignConfirmModal(true)}
        />
      )}

      {/* Tab 3: Diagnostic Labs */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0A192F] font-display">
                {language === 'bn' ? 'ডায়াগনস্টিক ল্যাবরেটরি টেস্ট অর্ডার' : 'Diagnostic Laboratory Orders'}
              </h3>
              <p className="text-xs text-[#64748B]">Integrated with Popular Diagnostic Centre & Evercare Laboratory</p>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs divide-y divide-[#F1F5F9]">
            {activeConsultation.labOrders.map((lab) => (
              <div key={lab.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EEE9FF] text-[#4F7DF3] flex items-center justify-center shrink-0">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#0A192F]">{lab.testName}</h4>
                    <span className="text-[11px] text-[#64748B] font-mono">Popular Diagnostic Dhanmondi #LAB-{lab.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-medium text-[#0F766E] bg-[#E6F4F1] px-2.5 py-0.5 rounded-full uppercase">
                    {lab.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Plan & Follow-up */}
      {activeTab === 'plan' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-3 font-display">
              {t('diagnoses')}
            </h3>
            <div className="space-y-2">
              {activeConsultation.diagnoses.map((dx, idx) => (
                <div key={idx} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between text-xs">
                  <span className="font-medium text-[#0A192F]">{dx.label}</span>
                  <span className="font-mono font-bold text-[#0F766E] bg-[#E6F4F1] px-2.5 py-0.5 rounded">
                    ICD-10: {dx.code}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-2 font-display">
              {t('treatmentPlan')}
            </h3>
            <textarea
              disabled={isSigned}
              rows={5}
              value={activeConsultation.treatmentPlan}
              onChange={(e) => updateConsultation({ treatmentPlan: e.target.value })}
              className="w-full p-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] leading-relaxed disabled:opacity-80"
            />
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-2 font-display">
              {t('followUp')}
            </h3>
            <input
              type="text"
              disabled={isSigned}
              value={activeConsultation.followUp}
              onChange={(e) => updateConsultation({ followUp: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] disabled:opacity-80 font-mono"
            />
          </div>
        </div>
      )}

      {/* Tab 5: CareLoop Continuity & Gaps in Active Consultation */}
      {activeTab === 'careloop' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider font-display flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {language === 'bn' ? 'কেয়ারলুপ ধারাবাহিকতা পর্যবেক্ষণ' : 'Care Continuity & Coordination Gaps'}
                </span>
                <span className="text-xs font-mono text-[#64748B]">
                  Encounter: #{activeConsultation.id}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#0A192F] font-display mt-0.5">
                {language === 'bn' ? 'আজকের ভিজিটের মাধ্যমে অমীমাংসিত কেয়ার গ্যাপসমূহ বন্ধ করুন' : 'Active Care Gaps for ' + activeConsultation.patientName}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Resolving outstanding gaps during the encounter prevents care drop-off and maintains clinical compliance.
              </p>
            </div>

            <button
              onClick={() => {
                setActiveCareLoopPatientId(activeConsultation.patientId);
                setActiveView('doctor/careloop');
              }}
              className="px-3.5 py-2 text-xs font-bold text-[#0F766E] bg-[#E6F4F1] hover:bg-[#CCFBF1] rounded-xl transition-colors whitespace-nowrap self-start sm:self-center"
            >
              {language === 'bn' ? 'সম্পূর্ণ কেয়ারলুপ কনসোল খুলুন' : 'Open Full CareLoop Console →'}
            </button>
          </div>

          {patientCareGaps.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-10 text-center shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#0A192F]">
                {language === 'bn' ? 'কোনো অমীমাংসিত কেয়ার গ্যাপ নেই' : 'No Open Care Gaps for this Patient'}
              </h4>
              <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1">
                All historical diagnostics, referrals, and follow-ups are closed with verified clinical evidence.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {patientCareGaps.map((gap) => (
                <div 
                  key={gap.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                    gap.severity === 'critical' ? 'border-[#FCA5A5]' : 'border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          gap.severity === 'critical' ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#FFEDD5] text-[#C2410C]'
                        }`}>
                          {gap.severity} Severity
                        </span>
                        <span className="text-[11px] font-mono text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded">
                          {gap.gapType.replace('_', ' ').toUpperCase()}
                        </span>
                        {gap.daysOverdue > 0 && (
                          <span className="text-[11px] text-[#DC2626] font-semibold">
                            {formatNum(gap.daysOverdue)} days overdue
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-[#0A192F]">
                        {gap.title}
                      </h4>
                      <p className="text-xs text-[#475569]">
                        <strong>Clinical Rationale:</strong> {gap.clinicalRationale}
                      </p>
                      <p className="text-[11px] text-[#0F766E] italic">
                        {gap.guidelineReference}
                      </p>

                      {gap.barrier && gap.barrier.type !== 'none' && (
                        <div className="p-2 rounded-lg bg-[#FFFBEB] text-[#92400E] text-[11px] font-medium border border-[#FDE68A]">
                          Patient Barrier: {gap.barrier.description}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const evidence = `Documented and resolved in active consultation encounter #${activeConsultation.id} by ${activeConsultation.doctorName}. Vital signs and treatment adjusted.`;
                          resolveCareGap(gap.id, evidence);
                        }}
                        className="px-3.5 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs whitespace-nowrap flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'ভিজিটে অনুমোদন ও বন্ধ করুন' : 'Sign Off & Close in Visit'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveCareLoopPatientId(gap.patientId);
                          setActiveView('doctor/careloop');
                        }}
                        className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0A192F] text-xs font-semibold rounded-xl transition-colors whitespace-nowrap text-center"
                      >
                        {language === 'bn' ? 'বিস্তারিত ও সমন্বয়' : 'Outreach & Options'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Sign Modal */}
      {showSignConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A192F] font-display">
                  {language === 'bn' ? 'বিএমডিসি ডিজিটাল প্রেসক্রিপশন স্বাক্ষর' : 'Sign & Authorize e-Prescription'}
                </h3>
                <p className="text-xs text-[#64748B]">BMDC Reg: A-48291 · Prof. Dr. Aisha Rahman</p>
              </div>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              {language === 'bn' 
                ? 'আপনি কি নিশ্চিত যে এই ক্লিনিক্যাল চার্টটি লক করে বিএমডিসি প্রেসক্রিপশন হিসেবে অনুমোদন দিতে চান? একবার স্বাক্ষরিত হলে এটি এভারকেয়ার সেন্ট্রাল ফার্মেসিতে সরাসরি চলে যাবে।'
                : 'Are you sure you want to finalize and lock this clinical encounter? This will apply your BMDC digital signature, generate the verified prescription token, and dispatch medications to CareFlow Pharmacy.'}
            </p>

            <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl text-xs text-[#92400E]">
              <span className="font-semibold block mb-0.5">DGHS Record Compliance:</span>
              Once locked, records cannot be modified without an auditable clinical addendum.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setShowSignConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  signAndFinalizeConsultation();
                  setShowSignConfirmModal(false);
                  setCelebrationMsg(language === 'bn' ? 'প্রেসক্রিপশন সফলভাবে সাইন ও লক করা হয়েছে!' : 'Official BMDC Prescription Signed & Verified!');
                  setShowCelebration(true);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs btn-interactive"
              >
                {t('signAndFinalize')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal: Full Medical Prescription View (Authentic Bangladesh Doctor Rx Pad) */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Action Bar */}
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0F766E] uppercase tracking-wider font-mono">
                {t('officialRxPadTitle')}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-xs font-semibold rounded-lg text-[#0A192F]"
                >
                  <Printer className="w-3.5 h-3.5 text-[#0F766E]" />
                  {t('printOrSave')}
                </button>
                <button 
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-700 text-xl font-bold ml-2"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Official Rx Pad Document Content */}
            <div id="printable-prescription" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs bg-white text-[#0A192F]">
              {/* Doctor Letterhead */}
              <div className="border-b-2 border-[#0F766E] pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#0A192F] font-display">
                    Prof. Dr. Aisha Rahman
                  </h2>
                  <p className="text-xs font-semibold text-[#0F766E] mt-0.5">
                    MBBS (DMC), FCPS (Medicine), MD (Endocrinology)
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    Senior Consultant — Internal Medicine & Diabetes
                  </p>
                  <p className="text-[11px] font-mono text-[#0A192F] font-semibold mt-1">
                    BMDC Reg. No: A-48291
                  </p>
                </div>

                <div className="text-left sm:text-right text-[11px] text-[#64748B] space-y-0.5">
                  <p className="font-bold text-[#0A192F]">Evercare Hospital Dhaka</p>
                  <p>Suite 408, Plot 81, Block E, Bashundhara R/A, Dhaka-1229</p>
                  <p className="font-mono text-[#0F766E]">Hotline: 10678 · CareFlow ID: #CF-DOC-001</p>
                </div>
              </div>

              {/* Patient Demographics Bar */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[#64748B] block text-[10px]">{t('patient')}:</span>
                  <span className="font-bold text-[#0A192F]">{activeConsultation.patientName}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">{t('age')} / {t('gender')} / {t('bloodGroup')}:</span>
                  <span className="font-semibold text-[#0A192F]">{formatNum(54)}Y / Male / B+</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">{t('date')}:</span>
                  <span className="font-mono text-[#0A192F]">{activeConsultation.encounterDate}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">MRN:</span>
                  <span className="font-mono font-bold text-[#0F766E]">EVR-DHK-784920</span>
                </div>
              </div>

              {/* Prescription Body Split */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2">
                {/* Left Side: Vitals & Investigations */}
                <div className="sm:col-span-4 space-y-4 border-r border-[#F1F5F9] pr-3 text-[11px]">
                  <div>
                    <h4 className="font-bold text-[#0A192F] uppercase tracking-wider text-[10px] mb-1">
                      {language === 'bn' ? 'শারীরিক ভাইটালস' : 'Clinical Vitals'}
                    </h4>
                    <p className="font-mono text-[#0F766E] font-medium">BP: {activeConsultation.vitals.bloodPressure}</p>
                    <p className="font-mono text-[#64748B]">HR: {formatNum(activeConsultation.vitals.heartRate)} bpm</p>
                    <p className="font-mono text-[#64748B]">Weight: {activeConsultation.vitals.weight}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#0A192F] uppercase tracking-wider text-[10px] mb-1">
                      {language === 'bn' ? 'ঔষধে এলার্জি' : 'Allergies & Cautions'}
                    </h4>
                    <p className="text-[#B91C1C] font-semibold">Penicillin, Sulfa</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#0A192F] uppercase tracking-wider text-[10px] mb-1">
                      {t('advisedInvestigations')}
                    </h4>
                    <ul className="list-disc pl-3 text-[#475569] space-y-0.5">
                      <li>HbA1c (HPLC Method)</li>
                      <li>Serum Creatinine & eGFR</li>
                      <li>Lipid Profile (Fasting)</li>
                      <li>Urine Microalbumin (uACR)</li>
                    </ul>
                    <span className="text-[10px] text-[#0F766E] block mt-1">Popular Diagnostic Centre, Dhanmondi</span>
                  </div>
                </div>

                {/* Right Side: Rx Symbol & Medications */}
                <div className="sm:col-span-8 space-y-4 pl-1">
                  <div className="text-2xl font-serif font-black text-[#0F766E]">
                    ℞
                  </div>

                  <div className="space-y-3.5">
                    {activeConsultation.prescriptions.map((rx, idx) => (
                      <div key={rx.id} className="border-b border-[#F1F5F9] pb-2.5">
                        <div className="flex items-baseline justify-between">
                          <span className="font-bold text-sm text-[#0A192F]">
                            {formatNum(idx + 1)}. {rx.dosageForm ? `${rx.dosageForm}. ` : ''}{rx.drugName} {rx.dosage || rx.strength || ''}
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-[#0F766E]">
                            ({rx.duration})
                          </span>
                        </div>
                        {rx.genericName && (
                          <p className="text-[11px] text-[#64748B] font-mono italic">
                            ({rx.genericName})
                          </p>
                        )}
                        <p className="text-xs font-bold text-[#0F766E] mt-0.5">
                          ℞ {rx.frequency} {rx.route && rx.route !== 'Oral' ? `· [${rx.route}]` : ''} {rx.quantity ? `· Qty: ${rx.quantity}` : ''}
                        </p>
                        {rx.instructions && (
                          <p className="text-[11px] text-[#475569] mt-0.5">
                            {rx.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Advice Section */}
                  <div className="pt-3 border-t border-[#E2E8F0]">
                    <h4 className="font-bold text-[#0A192F] uppercase tracking-wider text-[10px] mb-1">
                      {language === 'bn' ? 'চিকিৎসা পরামর্শ ও বিশেষ উপদেশ' : 'Clinical Advice & Regimen'}
                    </h4>
                    <p className="text-xs text-[#475569] leading-relaxed whitespace-pre-line">
                      {activeConsultation.treatmentPlan}
                    </p>
                  </div>
                </div>
              </div>

              {/* Prescription Footer & Signatures */}
              <div className="pt-6 border-t-2 border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-[#0A192F]" />
                  </div>
                  <div>
                    <span className="font-bold text-[#0F766E] block font-mono">
                      {t('verifiedRxSeal')}
                    </span>
                    <span className="text-[10px] text-[#64748B]">Scan QR for Pharmacist verification & Dispense</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-serif italic text-sm text-[#0A192F] font-bold">
                    Prof. Dr. Aisha Rahman
                  </div>
                  <div className="text-[10px] text-[#64748B] font-mono">
                    Digitally Signed · BMDC A-48291
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animated Prescription Sign-Off Celebration */}
      <CelebrationBurst 
        show={showCelebration} 
        message={celebrationMsg} 
        onComplete={() => setShowCelebration(false)} 
      />
    </div>
  );
};
