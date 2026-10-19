import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FileEdit, 
  Plus, 
  Video, 
  Building2, 
  ArrowUpRight, 
  Stethoscope, 
  TrendingUp, 
  Check,
  Eye,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import { 
  LiveECGMonitor, 
  AnimatedCareRadar, 
  AnimatedCounter, 
  CelebrationBurst 
} from '../../components/common/AnimatedTelemetry';

export const DoctorDashboard: React.FC = () => {
  const { 
    appointments, 
    updateAppointmentStatus, 
    setActiveView, 
    addToast,
    addAppointment,
    globalSearchQuery,
    t,
    language,
    formatNum,
    careGaps
  } = useApp();

  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationMsg, setCelebrationMsg] = useState<string>('');

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [tasks, setTasks] = useState<{ id: string; title: string; due: string; done: boolean }[]>([
    { id: 't1', title: 'Sign lab requisition for Mr. Rafiqul Islam (HbA1c & uACR, Popular Diagnostic)', due: 'Before 12:00 PM', done: false },
    { id: 't2', title: 'Review post-PTCA ECG strip for Alhaj Ashraful Haque', due: 'Today (Chamber 302)', done: false },
    { id: 't3', title: 'Authorize Togent 10mg & Compath 500/50 e-Prescription (Incepta/Renata)', due: 'Today 1:00 PM', done: false },
    { id: 't4', title: 'Consultation sign-off for Begum Tahmina Akhter (TeleHealth BD)', due: 'Completed', done: true },
  ]);

  // New appointment form state
  const [newPatientName, setNewPatientName] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newTime, setNewTime] = useState('03:30 PM');
  const [newType, setNewType] = useState<'In-person' | 'Virtual Video'>('In-person');

  // Filtered appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesFilter = statusFilter === 'all' || apt.status === statusFilter;
    const matchesSearch = 
      apt.patientName.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      apt.reason.toLowerCase().includes(globalSearchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextDone = !t.done;
        if (nextDone) {
          setCelebrationMsg(language === 'bn' ? 'ক্লিনিক্যাল টাস্ক সম্পন্ন হয়েছে!' : 'Clinical Task Completed!');
          setShowCelebration(true);
        }
        return { ...t, done: nextDone };
      }
      return t;
    }));
    addToast({
      type: 'info',
      title: language === 'bn' ? 'ক্লিনিক্যাল টাস্ক হালনাগাদ হয়েছে' : 'Clinical Task Updated',
      message: language === 'bn' ? 'চিকিৎসক চেকলিস্টটি হাসপাতালের রাউন্ডের সাথে সিঙ্ক করা হয়েছে।' : 'Physician checklist synchronized with daily hospital rounds.',
    });
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newReason.trim()) return;

    addAppointment({
      patientId: `pat-${Date.now().toString().slice(-3)}`,
      patientName: newPatientName,
      patientAge: 45,
      patientGender: 'Male',
      patientBloodType: 'B+',
      doctorId: 'doc-001',
      doctorName: 'Prof. Dr. Aisha Rahman',
      doctorSpecialty: 'Internal Medicine & Endocrinology',
      date: '2026-10-16',
      time: newTime,
      durationMinutes: 30,
      type: newType,
      clinicName: 'Evercare Hospital Dhaka',
      room: newType === 'In-person' ? 'Consultation Suite 408' : undefined,
      reason: newReason,
      status: 'scheduled',
      priority: 'routine',
    });

    setShowAddModal(false);
    setNewPatientName('');
    setNewReason('');
  };

  return (
    <div className="clinical-overview space-y-6">
      {/* Welcome Banner */}
      <section className="bg-white border border-[#CBD5E1] rounded-2xl p-6 lg:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden" aria-labelledby="doctor-overview-title">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
            <span>{t('dateDisplay')}</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-[#0A192F] bg-[#E6F4F1] px-2 py-0.5 rounded text-[10px] font-bold">
              {t('bmdcRegLabel')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 id="doctor-overview-title" className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-display tracking-tight">
              {t('doctorGreeting')}
            </h1>
          </div>

          <p className="text-sm text-[#64748B] mt-1.5 max-w-2xl leading-relaxed">
            {t('doctorSubtitle')}
          </p>

          <div className="mt-3 flex items-center gap-3 text-xs text-[#475569]">
            <span className="flex items-center gap-1 font-medium">
              <Building2 className="w-3.5 h-3.5 text-[#0F766E]" />
              Evercare Hospital Dhaka (Level 4, Suite 408)
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-[#0F766E] font-semibold">{t('chamberFee')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 relative z-10">
          <button
            onClick={() => setActiveView('doctor/schedule')}
            className="px-4 py-2.5 text-xs font-semibold text-[#0A192F] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl transition-colors whitespace-nowrap"
          >
            {t('chamberSchedule')}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            {t('bookPatient')}
          </button>
        </div>
      </section>

      {/* KPI Cards Strip with Motion and Animated Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <motion.div 
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white border border-[#CBD5E1] rounded-xl p-4 shadow-sm card-interactive"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">{t('todayAppointments')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0A192F] font-mono tabular-nums">
              <AnimatedCounter value={14} />
            </span>
            <span className="text-[11px] font-medium text-[#15803D] flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {language === 'bn' ? '+২ গড় অপেক্ষা' : '+2 vs avg'}
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">{t('virtualAndInClinic')}</p>
        </motion.div>

        {/* Card 2 */}
        <motion.div 
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white border border-[#CBD5E1] rounded-xl p-4 shadow-sm card-interactive"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">{t('waitingTriage')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0A192F] font-mono tabular-nums">
              <AnimatedCounter value={3} />
            </span>
            <span className="text-[11px] text-[#B45309] font-medium">{t('avgWait')}</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">{t('nextPatient')}</p>
        </motion.div>

        {/* Card 3 */}
        <motion.div 
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white border border-[#CBD5E1] rounded-xl p-4 shadow-sm card-interactive"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">{t('completedConsultations')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0A192F] font-mono tabular-nums">
              <AnimatedCounter value={8} />
            </span>
            <span className="text-[11px] text-[#15803D] font-medium">{formatNum(57)}% {language === 'bn' ? 'সম্পন্ন' : 'completed'}</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">{t('signedPrescriptions')}</p>
        </motion.div>

        {/* Card 4 */}
        <motion.div 
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white border border-[#CBD5E1] rounded-xl p-4 shadow-sm card-interactive"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">{t('pendingDocumentation')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#EEE9FF] text-[#4F7DF3] flex items-center justify-center">
              <FileEdit className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0A192F] font-mono tabular-nums">
              <AnimatedCounter value={2} />
            </span>
            <span className="text-[11px] text-[#B45309] font-medium">{language === 'bn' ? 'খসড়া এনকাউন্টার' : 'Draft encounters'}</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">{t('draftSavedIndicator')}</p>
        </motion.div>
      </div>

      {/* Animated Live CareLoop Radar Engine Banner */}
      <AnimatedCareRadar
        activeGapsCount={careGaps?.filter(g => g.status !== 'resolved' && g.status !== 'disputed')?.length || 4}
        totalMonitored={18}
        onScanClick={() => {
          setActiveView('doctor/careloop');
          addToast({
            type: 'info',
            title: language === 'bn' ? 'কেয়ারলুপ রাডার স্ক্যান সক্রিয়' : 'CareLoop Radar Scan Active',
            message: language === 'bn' ? 'সকল অমীমাংসিত ফলো-আপ এবং ল্যাব গ্যাপ বিশ্লেষণ করা হচ্ছে।' : 'Scanning all pending follow-up and investigation loops.',
          });
        }}
      />

      {/* Main Grid: Appointments & Clinical Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Appointments List (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
            {/* Header and Filter Controls */}
            <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#0A192F] font-display">
                  {t('scheduleHeader')}
                </h2>
                <p className="text-xs text-[#64748B]">
                  {t('scheduleSubheader')}
                </p>
              </div>

              {/* Segmented Filter Buttons */}
              <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === 'all'
                      ? 'bg-white text-[#0A192F] shadow-2xs font-semibold'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {t('all')} ({formatNum(appointments.length)})
                </button>
                <button
                  onClick={() => setStatusFilter('in-progress')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === 'in-progress'
                      ? 'bg-white text-[#0A192F] shadow-2xs font-semibold'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {t('inChamber')}
                </button>
                <button
                  onClick={() => setStatusFilter('checked-in')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === 'checked-in'
                      ? 'bg-white text-[#0A192F] shadow-2xs font-semibold'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {t('waiting')}
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === 'completed'
                      ? 'bg-white text-[#0A192F] shadow-2xs font-semibold'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {t('completed')}
                </button>
              </div>
            </div>

            {/* Appointment List Rows */}
            <div className="divide-y divide-[#F1F5F9]">
              {filteredAppointments.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="w-10 h-10 text-[#94A3B8] mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-[#0A192F]">
                    {language === 'bn' ? 'কোনো অ্যাপয়েন্টমেন্ট পাওয়া যায়নি' : 'No matching appointments'}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">
                    {language === 'bn' ? 'অন্য ফিল্টার অথবা সার্চ ব্যবহার করুন।' : 'Try selecting a different filter or search term.'}
                  </p>
                </div>
              ) : (
                filteredAppointments.map((apt) => {
                  return (
                    <div 
                      key={apt.id} 
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors ${
                        apt.status === 'in-progress' ? 'bg-[#F0FDFA]/60 border-l-4 border-l-[#0F766E]' : ''
                      }`}
                    >
                      {/* Left side: Time, Type, Patient identity */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        {/* Time block */}
                        <div className="text-center w-16 shrink-0 pt-0.5">
                          <span className="text-xs font-bold text-[#0A192F] block font-mono tabular-nums">
                            {formatNum(apt.time)}
                          </span>
                          <span className="text-[10px] text-[#64748B]">
                            {formatNum(apt.durationMinutes)} {t('mins')}
                          </span>
                        </div>

                        {/* Patient Avatar & Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span 
                              className="font-bold text-sm text-[#0A192F] hover:text-[#0F766E] cursor-pointer"
                              onClick={() => setSelectedAppointment(apt)}
                            >
                              {apt.patientName}
                            </span>
                            
                            {/* Static unboxed metadata (anti-pill compliant) */}
                            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                              <span>{formatNum(apt.patientAge)}y {apt.patientGender}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono font-bold text-[#0F766E]">{apt.patientBloodType}</span>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1">
                                {apt.type === 'Virtual Video' ? (
                                  <Video className="w-3 h-3 text-[#4F7DF3]" />
                                ) : (
                                  <Building2 className="w-3 h-3 text-[#0F766E]" />
                                )}
                                {apt.type}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-[#475569] mt-1 line-clamp-1">
                            {apt.reason}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#64748B]">
                            <span>{apt.clinicName}</span>
                            {apt.room && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-medium text-[#0A192F]">{apt.room}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side: Status indicator & Action triggers */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Status Label */}
                        <span className={`text-xs px-2.5 py-1 rounded-md font-medium capitalize ${
                          apt.status === 'in-progress'
                            ? 'bg-[#CCFBF1] text-[#0F766E]'
                            : apt.status === 'checked-in'
                            ? 'bg-[#FEF3C7] text-[#B45309]'
                            : apt.status === 'completed'
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : 'bg-[#F1F5F9] text-[#64748B]'
                        }`}>
                          {apt.status === 'in-progress' ? t('inChamber') : apt.status === 'checked-in' ? t('waiting') : apt.status === 'completed' ? t('completed') : apt.status.replace('-', ' ')}
                        </span>

                        {/* Direct Action: Start or Continue Consultation */}
                        {apt.patientName === 'Mr. Rafiqul Islam' ? (
                          <button
                            onClick={() => setActiveView('doctor/consultations/enc-2026-101')}
                            className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-2xs whitespace-nowrap"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            {t('openWorkspace')}
                          </button>
                        ) : apt.status !== 'completed' ? (
                          <button
                            onClick={() => {
                              updateAppointmentStatus(apt.id, 'in-progress');
                              setActiveView('doctor/consultations/enc-2026-101');
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0F766E] bg-[#E6F4F1] hover:bg-[#CCFBF1] rounded-xl transition-colors whitespace-nowrap"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            {t('startConsult')}
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedAppointment(apt)}
                            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg"
                            title={t('viewRecord')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom summary bar */}
            <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <span>
                {t('showingPatients')} {formatNum(filteredAppointments.length)} / {formatNum(appointments.length)} {t('patientsRegistered')}
              </span>
              <button 
                onClick={() => setActiveView('doctor/schedule')}
                className="text-[#0F766E] font-semibold hover:underline flex items-center gap-1"
              >
                {t('calendarView')}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Clinical Workload Trends & Completion Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-[#0A192F] font-display">{t('weeklyVolume')}</h3>
                <span className="text-xs font-mono text-[#64748B] tabular-nums">Oct 12 - 16</span>
              </div>
              <p className="text-xs text-[#64748B] mb-3">{t('weeklySubtitle')}</p>
              
              <div className="flex items-end justify-between h-28 gap-2 pt-2">
                {[
                  { day: language === 'bn' ? 'রবি' : 'Sun', count: 18, height: '90%' },
                  { day: language === 'bn' ? 'সোম' : 'Mon', count: 16, height: '80%' },
                  { day: language === 'bn' ? 'মঙ্গল' : 'Tue', count: 20, height: '100%' },
                  { day: language === 'bn' ? 'বুধ' : 'Wed', count: 15, height: '75%' },
                  { day: language === 'bn' ? 'বৃহঃ' : 'Thu', count: 14, height: '70%', current: true },
                ].map((bar) => (
                  <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono font-medium text-[#64748B] tabular-nums">{formatNum(bar.count)}</span>
                    <div 
                      style={{ height: bar.height }} 
                      className={`w-full rounded-t-md transition-all ${
                        bar.current ? 'bg-[#0F766E]' : 'bg-[#CCFBF1] hover:bg-[#99F6E4]'
                      }`}
                    />
                    <span className={`text-[10px] truncate max-w-full font-medium ${bar.current ? 'text-[#0F766E] font-bold' : 'text-[#64748B]'}`}>
                      {bar.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-[#0A192F] font-display">{t('consultationProgress')}</h3>
                <span className="text-xs font-mono text-[#15803D] font-bold">{formatNum(8)} / {formatNum(14)} {t('completed')}</span>
              </div>
              <p className="text-xs text-[#64748B] mb-4">
                {language === 'bn' ? 'আজকের চেম্বারের অগ্রগতি লক্ষ্যমাত্রা' : 'Daily chamber throughput and charting status'}
              </p>

              {/* Progress bar */}
              <div className="w-full bg-[#F1F5F9] rounded-full h-3 overflow-hidden">
                <div className="bg-[#0F766E] h-3 rounded-full transition-all" style={{ width: '57%' }} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 pt-2 border-t border-[#F1F5F9] text-center">
                <div>
                  <span className="block text-xs font-mono font-bold text-[#0A192F]">{formatNum(8)}</span>
                  <span className="text-[10px] text-[#64748B]">{t('completed')}</span>
                </div>
                <div>
                  <span className="block text-xs font-mono font-bold text-[#B45309]">{formatNum(3)}</span>
                  <span className="text-[10px] text-[#64748B]">{t('waiting')}</span>
                </div>
                <div>
                  <span className="block text-xs font-mono font-bold text-[#64748B]">{formatNum(3)}</span>
                  <span className="text-[10px] text-[#64748B]">{t('scheduled')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Patient Spotlight & Chamber Tasks (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Patient Spotlight Card */}
          <div className="bg-[#0A192F] text-white rounded-3xl p-5 shadow-sm border border-slate-800">
            <div className="flex items-center justify-between text-xs text-[#99F6E4] mb-3">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-ping" />
                {t('activePatientTitle')}
              </span>
              <span className="bg-teal-950/80 px-2.5 py-0.5 rounded text-[10px] font-mono border border-teal-800">
                {t('inChamber')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-900/60 text-[#2DD4BF] flex items-center justify-center font-bold text-base shrink-0 border border-teal-700">
                RI
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-base font-display truncate">Mr. Rafiqul Islam</h4>
                <p className="text-xs text-slate-300">54y Male · Diabetic Nephropathy Review</p>
              </div>
            </div>

            <div className="mt-3 py-2 px-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] font-mono text-[#99F6E4] flex justify-between">
              <span>BP: 136/88 mmHg</span>
              <span>Blood: B+</span>
              <span>SpO2: 99%</span>
            </div>

            {/* Live Telemetry Animated Monitor */}
            <div className="mt-3">
              <LiveECGMonitor bpm={74} label="Live Rhythm Strip" status="normal" />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-mono">MRN: EVR-DHK-784920</span>
              <button
                onClick={() => setActiveView('doctor/consultations/enc-2026-101')}
                className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-colors btn-interactive"
              >
                {t('resumeChart')}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pending Tasks & Clinical Reminders */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#0A192F] font-display">{t('chamberTasksTitle')}</h3>
              <span className="text-[11px] text-[#64748B]">
                {formatNum(tasks.filter(t => !t.done).length)} {t('tasksRemaining')}
              </span>
            </div>
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    task.done 
                      ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-60' 
                      : 'bg-white border-[#E2E8F0] hover:border-[#0F766E]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                    task.done ? 'bg-[#0F766E] border-[#0F766E] text-white' : 'border-[#CBD5E1] bg-white'
                  }`}>
                    {task.done && <Check className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium leading-snug ${
                      task.done ? 'line-through text-[#64748B]' : 'text-[#0F172A]'
                    }`}>
                      {task.title}
                    </p>
                    <span className="text-[10px] text-[#64748B] mt-0.5 block">{task.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hospital Clinical Activity */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#0A192F] font-display mb-3">{t('hospitalActivityTitle')}</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#0F766E] mt-1.5 shrink-0" />
                <div>
                  <p className="font-medium text-[#0F172A]">Mr. Rafiqul Islam verified</p>
                  <p className="text-[#64748B] text-[11px]">Popular Diagnostic Dhanmondi lab profile attached</p>
                  <span className="text-[10px] text-[#94A3B8]">09:48 AM · Evercare Suite 408</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#4F7DF3] mt-1.5 shrink-0" />
                <div>
                  <p className="font-medium text-[#0F172A]">Begum Tahmina Akhter connected</p>
                  <p className="text-[#64748B] text-[11px]">TeleHealth video queue ready from Uttara</p>
                  <span className="text-[10px] text-[#94A3B8]">10:25 AM · CareFlow TeleHealth BD</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#15803D] mt-1.5 shrink-0" />
                <div>
                  <p className="font-medium text-[#0F172A]">Alhaj Ashraful Haque arrival confirmed</p>
                  <p className="text-[#64748B] text-[11px]">Executive wing cardiac review scheduled at 11:15 AM</p>
                  <span className="text-[10px] text-[#94A3B8]">10:05 AM · Square Hospital Panthapath</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#0A192F] font-display">
                {language === 'bn' ? 'রোগীর অ্যাপয়েন্টমেন্ট বিবরণ' : 'Patient Encounter Summary'}
              </h3>
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="text-[#94A3B8] hover:text-[#0F172A] text-lg font-bold"
              >
                ×
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">{t('patient')}:</span>
                <span className="font-bold text-[#0A192F]">{selectedAppointment.patientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">{t('date')} & {t('time')}:</span>
                <span className="font-mono text-[#0A192F]">{selectedAppointment.date} at {selectedAppointment.time}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">{t('status')}:</span>
                <span className="font-medium text-[#0A192F]">{selectedAppointment.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">{t('hospital')}:</span>
                <span className="text-[#0A192F]">{selectedAppointment.clinicName} ({selectedAppointment.room || 'TeleHealth BD'})</span>
              </div>
              <div className="py-2">
                <span className="text-[#64748B] block mb-1">
                  {language === 'bn' ? 'পরামর্শের প্রধান কারণ:' : 'Chief Reason for Consultation:'}
                </span>
                <p className="p-3 bg-[#F8FAFC] rounded-xl text-[#0F172A] leading-relaxed border border-[#E2E8F0]">
                  {selectedAppointment.reason}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 text-xs font-medium text-[#64748B] hover:text-[#0F172A] rounded-xl"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setActiveView('doctor/consultations/enc-2026-101');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors"
              >
                {t('openWorkspace')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form onSubmit={handleCreateAppointment} className="bg-white border border-[#E2E8F0] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#0A192F] font-display">
                {language === 'bn' ? 'নতুন চেম্বার অ্যাপয়েন্টমেন্ট শিডিউল' : 'Schedule Chamber Appointment'}
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] text-lg font-bold"
              >
                ×
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] font-medium mb-1">
                  {language === 'bn' ? 'রোগীর পুরো নাম' : 'Patient Full Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Md. Ashiqur Rahman"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:border-[#0F766E]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] font-medium mb-1">{t('time')}</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="block text-[#64748B] font-medium mb-1">{t('status')}</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'In-person' | 'Virtual Video')}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="In-person">In-person (Evercare Suite 408)</option>
                    <option value="Virtual Video">Virtual Video (TeleHealth BD)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#64748B] font-medium mb-1">
                  {language === 'bn' ? 'সমস্যা ও রেফারেল নোট' : 'Chief Symptoms & Referral Reason'}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Clinical symptoms, fasting sugar level, or physician referral note..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-medium text-[#64748B] hover:text-[#0F172A]"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-xs"
              >
                {t('submit')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Animated Celebration Burst for clinical milestones */}
      <CelebrationBurst 
        show={showCelebration} 
        message={celebrationMsg} 
        onComplete={() => setShowCelebration(false)} 
      />
    </div>
  );
};
