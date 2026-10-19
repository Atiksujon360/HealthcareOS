import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Send, 
  Stethoscope, 
  Pill, 
  UserCheck, 
  Filter, 
  Search, 
  Sparkles, 
  MessageSquare, 
  X, 
  Building2, 
  TrendingUp, 
  AlertCircle, 
  Lock, 
  Check, 
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { CareGap, PatientBarrierType, CareGapSeverity } from '../../types/careLoop';
import { CareLoopEngine } from '../../services/careLoopEngine';
import { AnimatedCounter, CelebrationBurst } from '../../components/common/AnimatedTelemetry';

export const CareLoopDashboard: React.FC = () => {
  const { 
    careGaps, 
    careJourneyEvents, 
    patientRecords, 
    activeCareLoopPatientId, 
    setActiveCareLoopPatientId,
    resolveCareGap, 
    disputeCareGap, 
    reassignCareGap, 
    updateCareGapBarrier, 
    sendCareGapOutreach,
    addAppointment,
    addToast,
    language,
    formatNum,
    currentRole,
    setActiveView
  } = useApp();

  // Selected patient
  const selectedPatient = useApp().patientRecords.find(p => p.id === activeCareLoopPatientId) || patientRecords[0];

  // Filtering & Search
  const [selectedTab, setSelectedTab] = useState<'board' | 'timeline' | 'analytics' | 'barriers'>('board');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [timelineFilter, setTimelineFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal states
  const [actionModalGap, setActionModalGap] = useState<CareGap | null>(null);
  const [activeActionModalType, setActiveActionModalType] = useState<
    'schedule' | 'outreach' | 'resolve' | 'dispute' | 'reassign' | 'barrier' | null
  >(null);

  // Outreach modal form state
  const [outreachChannel, setOutreachChannel] = useState<'WhatsApp' | 'SMS' | 'Phone Call'>('WhatsApp');
  const [customOutreachMsg, setCustomOutreachMsg] = useState<string>('');

  // Resolution evidence form state
  const [resolutionEvidence, setResolutionEvidence] = useState<string>('');

  // Dispute justification form state
  const [disputeJustification, setDisputeJustification] = useState<string>('');

  // Reassignment form state
  const [reassignTarget, setReassignTarget] = useState<{ id: string; name: string; role: string }>({
    id: 'coord-01',
    name: 'Sister Nusrat Jahan, RN',
    role: 'Care Coordinator'
  });
  const [reassignNote, setReassignNote] = useState<string>('');

  // Schedule follow-up state
  const [scheduleDate, setScheduleDate] = useState<string>('2026-10-24');
  const [scheduleTime, setScheduleTime] = useState<string>('11:30 AM');
  const [scheduleType, setScheduleType] = useState<'In-person' | 'Virtual Video'>('In-person');

  // Barrier update state
  const [newBarrierType, setNewBarrierType] = useState<PatientBarrierType>('financial');
  const [newBarrierDesc, setNewBarrierDesc] = useState<string>('');

  // Animation Celebration state
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationMsg, setCelebrationMsg] = useState<string>('');

  // Filtered Gaps for current selected patient (or all if specified)
  const patientGaps = useMemo(() => {
    return careGaps.filter(g => g.patientId === selectedPatient.id);
  }, [careGaps, selectedPatient]);

  const filteredGaps = useMemo(() => {
    return patientGaps.filter(g => {
      const matchSeverity = severityFilter === 'all' || g.severity === severityFilter;
      const matchStatus = statusFilter === 'all' 
        ? true 
        : statusFilter === 'active' 
        ? (g.status === 'active' || g.status === 'in_progress')
        : g.status === statusFilter;
      const matchQuery = !searchQuery 
        || g.title.toLowerCase().includes(searchQuery.toLowerCase())
        || g.clinicalRationale.toLowerCase().includes(searchQuery.toLowerCase())
        || g.guidelineReference.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSeverity && matchStatus && matchQuery;
    });
  }, [patientGaps, severityFilter, statusFilter, searchQuery]);

  // Filtered Timeline Events
  const patientEvents = useMemo(() => {
    return careJourneyEvents.filter(e => e.patientId === selectedPatient.id);
  }, [careJourneyEvents, selectedPatient]);

  const filteredEvents = useMemo(() => {
    return patientEvents.filter(e => {
      if (timelineFilter === 'all') return true;
      if (timelineFilter === 'overdue') return e.status === 'overdue';
      if (timelineFilter === 'pending') return e.status === 'pending' || e.status === 'awaiting_review';
      if (timelineFilter === 'completed') return e.status === 'completed';
      if (timelineFilter === 'barriers') return e.type === 'barrier_reported';
      return true;
    });
  }, [patientEvents, timelineFilter]);

  // Dynamic Patient Continuity Index
  const continuityData = useMemo(() => {
    return CareLoopEngine.calculatePCI(patientGaps, patientEvents);
  }, [patientGaps, patientEvents]);

  // AI Next Best Action
  const nextBestAction = useMemo(() => {
    return CareLoopEngine.getNextBestAction(selectedPatient.name, patientGaps);
  }, [selectedPatient, patientGaps]);

  // Aggregate statistics
  const stats = useMemo(() => {
    const totalGaps = careGaps.length;
    const activeGapsCount = careGaps.filter(g => g.status === 'active' || g.status === 'in_progress').length;
    const criticalGapsCount = careGaps.filter(g => (g.status === 'active' || g.status === 'in_progress') && g.severity === 'critical').length;
    const resolvedGapsCount = careGaps.filter(g => g.status === 'resolved').length;
    const resolutionRate = totalGaps > 0 ? Math.round((resolvedGapsCount / totalGaps) * 100) : 0;
    return { totalGaps, activeGapsCount, criticalGapsCount, resolvedGapsCount, resolutionRate };
  }, [careGaps]);

  // Handlers for Modals
  const openActionModal = (gap: CareGap, type: 'schedule' | 'outreach' | 'resolve' | 'dispute' | 'reassign' | 'barrier') => {
    setActionModalGap(gap);
    setActiveActionModalType(type);
    if (type === 'outreach') {
      setCustomOutreachMsg(CareLoopEngine.generateOutreachTemplate(gap, language, outreachChannel));
    }
    if (type === 'resolve') {
      setResolutionEvidence('');
    }
    if (type === 'dispute') {
      setDisputeJustification('');
    }
  };

  const handleExecuteResolution = () => {
    if (!actionModalGap || !resolutionEvidence.trim()) {
      addToast({
        type: 'error',
        title: 'Evidence Required',
        message: 'Please document verified clinical evidence or completion confirmation before closing the gap.'
      });
      return;
    }
    resolveCareGap(actionModalGap.id, resolutionEvidence.trim());
    setCelebrationMsg(language === 'bn' ? 'কেয়ার গ্যাপ সফলভাবে সমাধান করা হয়েছে!' : 'Care Gap Resolved & Closed With Verified Clinical Evidence!');
    setShowCelebration(true);
    setActiveActionModalType(null);
    setActionModalGap(null);
  };

  const handleExecuteDispute = () => {
    if (!actionModalGap || !disputeJustification.trim()) {
      addToast({
        type: 'error',
        title: 'Justification Required',
        message: 'A clinical rationale must be documented when overriding or disputing a care gap.'
      });
      return;
    }
    disputeCareGap(actionModalGap.id, disputeJustification.trim());
    setActiveActionModalType(null);
    setActionModalGap(null);
  };

  const handleExecuteOutreach = () => {
    if (!actionModalGap) return;
    sendCareGapOutreach(actionModalGap.id, outreachChannel, customOutreachMsg.trim());
    setCelebrationMsg(language === 'bn' ? 'রোগী আউটরিচ সফলভাবে পাঠানো হয়েছে!' : `Patient Outreach Dispatched via ${outreachChannel}!`);
    setShowCelebration(true);
    setActiveActionModalType(null);
    setActionModalGap(null);
  };

  const handleExecuteReassign = () => {
    if (!actionModalGap) return;
    reassignCareGap(actionModalGap.id, reassignTarget, reassignNote.trim());
    setActiveActionModalType(null);
    setActionModalGap(null);
  };

  const handleExecuteSchedule = () => {
    if (!actionModalGap) return;
    addAppointment({
      patientId: actionModalGap.patientId,
      patientName: actionModalGap.patientName,
      patientAge: actionModalGap.patientAge,
      patientGender: actionModalGap.patientGender,
      doctorId: 'doc-001',
      doctorName: actionModalGap.accountableOwner.name,
      doctorSpecialty: 'Internal Medicine & Endocrinology',
      date: scheduleDate,
      time: scheduleTime,
      durationMinutes: 30,
      type: scheduleType,
      clinicName: 'Evercare Hospital Dhaka',
      room: 'Suite 408 (Level 4)',
      reason: `CareLoop Follow-Up: ${actionModalGap.title}`,
      status: 'scheduled',
      priority: actionModalGap.severity === 'critical' ? 'urgent' : 'routine'
    });
    // Also resolve or mark in-progress the gap
    resolveCareGap(actionModalGap.id, `Follow-up appointment officially scheduled for ${scheduleDate} at ${scheduleTime} (${scheduleType}).`);
    setCelebrationMsg(language === 'bn' ? 'ফলো-আপ অ্যাপয়েন্টমেন্ট বুকিং সম্পন্ন!' : 'Care Loop Closed: Follow-Up Appointment Scheduled!');
    setShowCelebration(true);
    setActiveActionModalType(null);
    setActionModalGap(null);
  };

  const handleExecuteBarrierUpdate = () => {
    if (!actionModalGap || !newBarrierDesc.trim()) return;
    updateCareGapBarrier(actionModalGap.id, {
      type: newBarrierType,
      description: newBarrierDesc.trim()
    });
    setActiveActionModalType(null);
    setActionModalGap(null);
  };

  // Severity styling helper
  const getSeverityBadge = (severity: CareGapSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
            {language === 'bn' ? 'সংকটজনক (Critical)' : 'Critical Severity'}
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFEDD5] text-[#C2410C] border border-[#FDBA74]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
            {language === 'bn' ? 'উচ্চ ঝুঁকি (High)' : 'High Risk'}
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            {language === 'bn' ? 'মাঝারি (Medium)' : 'Medium'}
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
            {language === 'bn' ? 'সাধারণ (Low)' : 'Low'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: CareLoop AI Identity & Architecture Header */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#0E2A47] to-[#0F766E] rounded-3xl p-6 lg:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-[#0F766E]/30 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#0F766E]/40 border border-[#2DD4BF]/30 text-[#5EEAD4]">
                <Sparkles className="w-3.5 h-3.5 text-[#5EEAD4]" />
                {language === 'bn' ? 'কেয়ারলুপ এআই · ক্লিনিক্যাল কন্টিনিউইটি ইঞ্জিন' : 'HealthcareOS CareLoop AI'}
              </span>
              <span className="text-[11px] text-white/70 font-mono hidden sm:inline">
                v2.6 Continuous Coordination
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display text-white">
              {language === 'bn' ? 'কেয়ার কন্টিনিউইটি ও কেয়ার গ্যাপ প্রতিরোধ ইঞ্জিন' : 'Care Continuity & Care Gap Prevention Engine'}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-3xl mt-1.5 leading-relaxed">
              {language === 'bn' 
                ? 'রিয়েল-টাইমে অসমাপ্ত প্রেসক্রিপশন, অনিরীক্ষিত ল্যাব রিপোর্ট, অতিক্রান্ত ফলো-আপ ও রেফারেল ট্র্যাক করুন। প্রতিটি অ্যাকশনের জন্য সুনির্দিষ্ট মালিকানা ও নিরাপদ এস্কেলেশন পাথ নিশ্চিত করে।'
                : 'Proactively identifies incomplete care tasks, unreviewed critical diagnostics, overdue diabetic screens, and unfilled medications with accountable clinician ownership and closing evidence.'
              }
            </p>
          </div>

          {/* Quick Metrics Header Pill */}
          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 min-w-[220px]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/80 uppercase tracking-wider font-semibold">
                {language === 'bn' ? 'কেয়ার গ্যাপ সমাধান হার' : 'Gap Resolution Rate'}
              </span>
              <span className="text-xl font-bold font-mono text-[#5EEAD4]">
                {formatNum(stats.resolutionRate)}%
              </span>
            </div>
            <div className="text-[11px] text-white/70 flex items-center gap-2">
              <span>{formatNum(stats.activeGapsCount)} {language === 'bn' ? 'সক্রিয়' : 'Active'}</span>
              <span>·</span>
              <span className="text-[#FCA5A5] font-semibold">{formatNum(stats.criticalGapsCount)} {language === 'bn' ? 'জরুরি ঝুঁকি' : 'Critical'}</span>
              <span>·</span>
              <span className="text-[#86EFAC]">{formatNum(stats.resolvedGapsCount)} {language === 'bn' ? 'সমাপ্ত' : 'Closed'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Selector & Continuity Index Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-[#F1F5F9]">
          {/* Patient Switcher Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center font-bold text-lg font-display shrink-0 border border-[#99F6E4]">
              {selectedPatient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded">
                  {language === 'bn' ? 'সক্রিয় রোগী ফাইল' : 'Active Patient Cohort'}
                </span>
                <span className="text-xs font-mono text-[#64748B]">
                  MRN: {selectedPatient.mrn}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={selectedPatient.id}
                  onChange={(e) => setActiveCareLoopPatientId(e.target.value)}
                  className="text-base sm:text-lg font-extrabold text-[#0A192F] font-display bg-transparent border-b border-[#0F766E] pb-0.5 focus:outline-none cursor-pointer"
                >
                  {patientRecords.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.age}y {p.gender})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                {selectedPatient.chronicConditions.join(' · ')}
              </p>
            </div>
          </div>

          {/* Animated Patient Continuity Index (PCI) Score Card */}
          <div className="flex items-center gap-4 bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 sm:p-4 rounded-2xl shadow-xs card-interactive">
            {/* Animated Circular Ring Visualizer */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="24"
                  fill="transparent"
                  stroke="#E2E8F0"
                  strokeWidth="5"
                />
                <motion.circle
                  cx="30"
                  cy="30"
                  r="24"
                  fill="transparent"
                  stroke={
                    continuityData.score >= 80 
                      ? '#0F766E' 
                      : continuityData.score >= 50 
                      ? '#D97706' 
                      : '#DC2626'
                  }
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="150.8"
                  initial={{ strokeDashoffset: 150.8 }}
                  animate={{ strokeDashoffset: 150.8 * (1 - Math.min(Math.max(continuityData.score, 0), 100) / 100) }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-base font-extrabold font-mono leading-none ${
                  continuityData.score >= 80 
                    ? 'text-[#0F766E]' 
                    : continuityData.score >= 50 
                    ? 'text-[#D97706]' 
                    : 'text-[#DC2626]'
                }`}>
                  <AnimatedCounter value={continuityData.score} />
                </span>
                <span className="text-[9px] text-[#94A3B8] font-bold">PCI</span>
              </div>
            </div>

            <div className="h-10 w-px bg-[#CBD5E1]" />

            <div>
              <div className="flex items-center gap-1.5">
                <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full ${
                  continuityData.riskLevel === 'Optimal'
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : continuityData.riskLevel === 'Moderate Risk'
                    ? 'bg-[#FEF3C7] text-[#B45309]'
                    : 'bg-[#FEE2E2] text-[#B91C1C]'
                }`}>
                  {continuityData.riskLevel}
                </span>
                <span className="text-[10px] text-[#64748B] font-mono">
                  {language === 'bn' ? 'সূচক' : 'Index'}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1 max-w-[200px] leading-tight">
                {continuityData.criticalGaps > 0 
                  ? `${formatNum(continuityData.criticalGaps)} critical care gap(s) require immediate physician sign-off.` 
                  : `${formatNum(continuityData.activeGaps)} active continuity action(s) tracked.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* AI Suggested Next Best Action Recommendation Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#F0FDFA] to-[#E6F4F1] border border-[#99F6E4] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#0F766E] text-white shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider font-display">
                  {language === 'bn' ? 'এআই পরবর্তী সর্বোত্তম পদক্ষেপ (Next Best Action)' : 'AI Recommended Next Best Action'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#0F766E] border border-[#99F6E4]">
                  {nextBestAction.priority}
                </span>
              </div>
              <p className="text-xs font-semibold text-[#0A192F] mt-0.5">
                {nextBestAction.recommendation}
              </p>
              <p className="text-[11px] text-[#475569] mt-0.5">
                <strong className="text-[#0A192F]">Clinical Rationale:</strong> {nextBestAction.rationale}
              </p>
            </div>
          </div>

          {nextBestAction.suggestedGapId && (
            <button
              onClick={() => {
                const target = careGaps.find(g => g.id === nextBestAction.suggestedGapId);
                if (target) openActionModal(target, target.suggestedAction.actionType === 'schedule_appointment' ? 'schedule' : 'outreach');
              }}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs whitespace-nowrap self-start md:self-center"
            >
              {language === 'bn' ? 'পদক্ষেপ গ্রহণ করুন' : 'Execute Action'}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs for CareLoop AI Suite */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] gap-4 overflow-x-auto pb-px">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedTab('board')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              selectedTab === 'board'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {language === 'bn' ? 'কেয়ার গ্যাপ বোর্ড' : 'Care Gap Prevention Board'} ({formatNum(patientGaps.length)})
          </button>

          <button
            onClick={() => setSelectedTab('timeline')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              selectedTab === 'timeline'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
            }`}
          >
            <Clock className="w-4 h-4" />
            {language === 'bn' ? 'ইউনিফাইড কেয়ার জার্নি' : 'Unified Care Journey Timeline'} ({formatNum(patientEvents.length)})
          </button>

          <button
            onClick={() => setSelectedTab('barriers')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              selectedTab === 'barriers'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            {language === 'bn' ? 'প্রতিবন্ধকতা ও সমাধান' : 'Patient Barriers & Solutions'}
          </button>

          <button
            onClick={() => setSelectedTab('analytics')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              selectedTab === 'analytics'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            {language === 'bn' ? 'কন্টিনিউইটি অ্যানালিটিক্স' : 'Continuity Analytics & Audit'}
          </button>
        </div>

        {/* Quick jump to consultation encounter if in doctor role */}
        {currentRole === 'doctor' && (
          <button
            onClick={() => setActiveView('doctor/consultations/enc-2026-101')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F766E] hover:bg-[#E6F4F1] rounded-xl transition-colors whitespace-nowrap border border-[#99F6E4]"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'কনসালটেশন ওয়ার্কস্পেসে ফিরে যান' : 'Open Active Consultation'}</span>
          </button>
        )}
      </div>

      {/* TAB 1: Care Gap Prevention Board */}
      {selectedTab === 'board' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#64748B] flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" />
                {language === 'bn' ? 'ফিল্টার:' : 'Filter:'}
              </span>

              {/* Status pills */}
              {(['active', 'resolved', 'disputed', 'all'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-xs rounded-xl font-semibold capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-[#0F766E] text-white'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {st === 'active' ? (language === 'bn' ? 'সক্রিয় (Active)' : 'Active Gaps') : st}
                </button>
              ))}

              <div className="h-5 w-px bg-[#E2E8F0] mx-1 hidden sm:block" />

              {/* Severity filter */}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-2.5 py-1 text-[#0A192F] focus:outline-none"
              >
                <option value="all">{language === 'bn' ? 'সব তীব্রতা' : 'All Severities'}</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'কেয়ার গ্যাপ অনুসন্ধান...' : 'Search care gaps...'}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E]"
              />
            </div>
          </div>

          {/* Care Gap Cards */}
          {filteredGaps.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0A192F] font-display">
                {language === 'bn' ? 'কোনো সক্রিয় কেয়ার গ্যাপ নেই' : 'No Active Care Gaps Found'}
              </h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1">
                {language === 'bn' 
                  ? 'এই রোগীর জন্য সমস্ত ক্লিনিক্যাল অ্যাকশন এবং ফলো-আপ সম্পন্ন হয়েছে অথবা ফিল্টারের সাথে মেলেনি।'
                  : 'All clinical follow-up actions and diagnostics have been substantiated with verified evidence.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredGaps.map((gap) => (
                <div 
                  key={gap.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                    gap.status === 'resolved' 
                      ? 'border-[#86EFAC] bg-[#F0FDF4]/30' 
                      : gap.status === 'disputed' 
                      ? 'border-[#CBD5E1] opacity-75' 
                      : gap.severity === 'critical'
                      ? 'border-[#FCA5A5] hover:border-[#EF4444]'
                      : 'border-[#E2E8F0] hover:border-[#0F766E]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getSeverityBadge(gap.severity)}
                        <span className="text-[11px] font-mono font-semibold text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded">
                          {gap.gapType.replace('_', ' ').toUpperCase()}
                        </span>
                        {gap.daysOverdue > 0 && gap.status === 'active' && (
                          <span className="text-[11px] font-bold text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatNum(gap.daysOverdue)} {language === 'bn' ? 'দিন অতিক্রান্ত (Overdue)' : 'days overdue'}
                          </span>
                        )}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${
                          gap.status === 'resolved' ? 'bg-[#DCFCE7] text-[#15803D]' :
                          gap.status === 'disputed' ? 'bg-[#F1F5F9] text-[#64748B]' :
                          gap.status === 'in_progress' ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#E0F2FE] text-[#0369A1]'
                        }`}>
                          Status: {gap.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#0A192F] font-display">
                        {gap.title}
                      </h3>

                      <p className="text-xs text-[#334155] leading-relaxed">
                        <strong className="text-[#0A192F]">{language === 'bn' ? 'ক্লিনিক্যাল গুরুত্ব:' : 'Clinical Rationale:'}</strong> {gap.clinicalRationale}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] pt-1">
                        <div className="flex items-center gap-1">
                          <BookOpenIcon className="w-3.5 h-3.5 text-[#0F766E]" />
                          <span className="text-[11px] font-medium italic">{gap.guidelineReference}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>{language === 'bn' ? 'দায়িত্বপ্রাপ্ত:' : 'Accountable:'} <strong className="text-[#0A192F]">{gap.accountableOwner.name}</strong> ({gap.accountableOwner.role})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>{language === 'bn' ? 'নির্ধারিত তারিখ:' : 'Due Date:'} {gap.dueDate}</span>
                        </div>
                      </div>

                      {/* Barrier Flag Banner */}
                      {gap.barrier && gap.barrier.type !== 'none' && (
                        <div className="mt-3 p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-2 text-xs">
                          <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-bold text-[#92400E] uppercase text-[10px] tracking-wide block">
                              {language === 'bn' ? 'শনাক্তকৃত প্রতিবন্ধকতা (Patient Barrier):' : 'Identified Barrier:'} {gap.barrier.type.toUpperCase().replace('_', ' ')}
                            </span>
                            <p className="text-[#78350F] text-xs mt-0.5">
                              {gap.barrier.description}
                            </p>
                            {gap.barrier.suggestedIntervention && (
                              <p className="text-[#0F766E] text-[11px] font-medium mt-1">
                                <strong>Suggested Intervention:</strong> {gap.barrier.suggestedIntervention}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Resolution Evidence Box (if resolved) */}
                      {gap.status === 'resolved' && gap.resolutionEvidence && (
                        <div className="mt-3 p-3 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-xs">
                          <span className="font-bold text-[#166534] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                            {language === 'bn' ? 'যাচাইকৃত ক্লিনিক্যাল প্রমাণ (Resolution Evidence):' : 'Verified Clinical Evidence of Closure:'}
                          </span>
                          <p className="text-[#14532D] mt-1 font-mono text-[11px]">
                            {gap.resolutionEvidence}
                          </p>
                          <span className="text-[10px] text-[#15803D] mt-1 block">
                            Closed on {gap.resolvedAt} by {gap.resolvedBy}
                          </span>
                        </div>
                      )}

                      {/* Dispute Justification Box (if disputed) */}
                      {gap.status === 'disputed' && gap.disputeJustification && (
                        <div className="mt-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs">
                          <span className="font-bold text-[#475569] flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-[#64748B]" />
                            {language === 'bn' ? 'ক্লিনিক্যাল ওভাররাইড যুক্তি:' : 'Physician Clinical Override:'}
                          </span>
                          <p className="text-[#334155] mt-1 italic text-[11px]">
                            "{gap.disputeJustification}"
                          </p>
                          <span className="text-[10px] text-[#64748B] mt-1 block">
                            Disputed on {gap.disputedAt} by {gap.disputedBy}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Interactive Action Workspace Buttons */}
                    <div className="flex flex-wrap lg:flex-col items-stretch gap-2 shrink-0 lg:w-48 pt-2 lg:pt-0">
                      {gap.status !== 'resolved' && gap.status !== 'disputed' ? (
                        <>
                          <button
                            onClick={() => openActionModal(gap, 'schedule')}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? '১-ক্লিকে অ্যাপয়েন্টমেন্ট' : '1-Click Schedule'}</span>
                          </button>

                          <button
                            onClick={() => openActionModal(gap, 'outreach')}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#E6F4F1] hover:bg-[#CCFBF1] text-[#0F766E] rounded-xl text-xs font-bold transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'বার্তা পাঠান (SMS/WA)' : 'Patient Outreach'}</span>
                          </button>

                          <button
                            onClick={() => openActionModal(gap, 'resolve')}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F8FAFC] text-[#15803D] border border-[#86EFAC] rounded-xl text-xs font-bold transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'প্রমাণ সহ সমাপ্ত করুন' : 'Close with Evidence'}</span>
                          </button>

                          <div className="flex items-center gap-1 pt-1">
                            <button
                              onClick={() => openActionModal(gap, 'reassign')}
                              title="Reassign Accountable Owner"
                              className="flex-1 py-1 px-2 text-[11px] font-semibold text-[#475569] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-lg transition-colors text-center"
                            >
                              {language === 'bn' ? 'মালিকানা পরিবর্তন' : 'Reassign'}
                            </button>
                            <button
                              onClick={() => openActionModal(gap, 'barrier')}
                              title="Update Patient Barrier"
                              className="flex-1 py-1 px-2 text-[11px] font-semibold text-[#B45309] bg-[#FEF3C7] hover:bg-[#FDE68A] rounded-lg transition-colors text-center"
                            >
                              {language === 'bn' ? 'প্রতিবন্ধকতা' : 'Barrier'}
                            </button>
                            <button
                              onClick={() => openActionModal(gap, 'dispute')}
                              title="Clinical Dispute / Override"
                              className="py-1 px-2 text-[11px] font-semibold text-[#DC2626] bg-[#FEE2E2] hover:bg-[#FCA5A5] rounded-lg transition-colors text-center"
                            >
                              {language === 'bn' ? 'ওভাররাইড' : 'Override'}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-center">
                          <CheckCircle2 className="w-5 h-5 text-[#15803D] mx-auto mb-1" />
                          <span className="text-[11px] font-bold text-[#0A192F] block">
                            {gap.status === 'resolved' ? 'Care Loop Closed' : 'Clinically Overridden'}
                          </span>
                          <span className="text-[10px] text-[#64748B]">
                            Audited by {gap.resolvedBy || gap.disputedBy}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Unified Patient Care Journey Timeline */}
      {selectedTab === 'timeline' && (
        <div className="space-y-4">
          {/* Timeline Filter Bar */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#64748B]">{language === 'bn' ? 'সময়রেখা ফিল্টার:' : 'Timeline Filter:'}</span>
              {(['all', 'pending', 'overdue', 'completed', 'barriers'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimelineFilter(tf)}
                  className={`px-3 py-1 text-xs rounded-xl font-semibold capitalize transition-colors ${
                    timelineFilter === tf
                      ? 'bg-[#0F766E] text-white'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="text-xs text-[#64748B] font-mono">
              {formatNum(filteredEvents.length)} {language === 'bn' ? 'টি ইভেন্ট প্রদর্শিত' : 'events recorded'}
            </div>
          </div>

          {/* Vertical Timeline Card List */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="relative border-l-2 border-[#CBD5E1] ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
              {filteredEvents.map((evt) => {
                const isOverdue = evt.status === 'overdue';
                const isCompleted = evt.status === 'completed';
                const isBarrier = evt.type === 'barrier_reported';

                return (
                  <div key={evt.id} className="relative group">
                    {/* Circle Node Icon on the line */}
                    <div className={`absolute -left-[35px] sm:-left-[43px] top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white ${
                      isOverdue 
                        ? 'border-[#DC2626] text-[#DC2626] bg-[#FEE2E2]' 
                        : isCompleted 
                        ? 'border-[#15803D] text-[#15803D] bg-[#DCFCE7]' 
                        : isBarrier 
                        ? 'border-[#D97706] text-[#D97706] bg-[#FEF3C7]' 
                        : 'border-[#0F766E] text-[#0F766E] bg-[#E6F4F1]'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> :
                       isOverdue ? <AlertTriangle className="w-4 h-4" /> :
                       isBarrier ? <AlertCircle className="w-4 h-4" /> :
                       <Clock className="w-4 h-4" />}
                    </div>

                    {/* Timeline Event Content Card */}
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F766E] rounded-2xl p-4 sm:p-5 transition-all shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E2E8F0]/70">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCompleted ? 'bg-[#DCFCE7] text-[#15803D]' :
                            isOverdue ? 'bg-[#FEE2E2] text-[#B91C1C]' :
                            'bg-[#E0F2FE] text-[#0369A1]'
                          }`}>
                            {evt.status.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] font-semibold text-[#0F766E] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                            Source: {evt.source}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-[#64748B]">
                          {evt.timestamp}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#0A192F] mt-2 font-display">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-[#334155] mt-1 leading-relaxed">
                        {evt.description}
                      </p>

                      {/* Evidence if available */}
                      {evt.evidence && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[11px] text-[#475569] font-mono">
                          <strong className="text-[#0A192F] font-sans font-semibold">Evidence / Record:</strong> {evt.evidence}
                        </div>
                      )}

                      {/* Responsible Person Footer */}
                      <div className="flex items-center justify-between text-xs text-[#64748B] mt-3 pt-2 border-t border-[#E2E8F0]/60">
                        <span>
                          Accountable: <strong className="text-[#0A192F]">{evt.responsiblePerson.name}</strong> ({evt.responsiblePerson.role})
                        </span>
                        {evt.responsiblePerson.facility && (
                          <span className="text-[11px] text-[#94A3B8]">
                            {evt.responsiblePerson.facility}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Patient Barriers & Solutions */}
      {selectedTab === 'barriers' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-7 shadow-xs">
            <h3 className="text-base font-bold text-[#0A192F] font-display mb-1">
              {language === 'bn' ? 'রোগী-প্রতিবন্ধকতা বিশ্লেষণ ও সমন্বিত সমাধান ক্যাটালগ' : 'Patient Barrier Intelligence & Actionable Interventions'}
            </h3>
            <p className="text-xs text-[#64748B] max-w-2xl mb-6">
              {language === 'bn' 
                ? 'আর্থিক, যাতায়াত, ভীতি বা সময়সূচি সংক্রান্ত কারণে রোগী অনেক সময় যত্ন গ্রহণে বিরত থাকেন। কেয়ারলুপ এআই এসব প্রতিবন্ধকতা কাটিয়ে উঠতে সুনির্দিষ্ট বিকল্প প্রদান করে।'
                : 'Identifies systemic friction causing care drop-off (cost, Dhaka gridlock, pill fatigue, side effect anxiety) with algorithmic interventions.'
              }
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  type: 'financial' as PatientBarrierType,
                  title: language === 'bn' ? 'আর্থিক প্রতিবন্ধকতা (Financial Barrier)' : 'Financial & Out-of-Pocket Cost',
                  icon: Pill,
                  color: 'border-[#FCD34D] bg-[#FFFBEB]',
                  desc: 'Cost of imported pharmaceuticals (e.g. ৳1,450) or high diagnostic fees in private hospitals.',
                  solution: 'Switch to DGDA-approved domestic bioequivalent generics (Beximco, Incepta, Square) at 40-60% lower cost.'
                },
                {
                  type: 'transport' as PatientBarrierType,
                  title: language === 'bn' ? 'যাতায়াত ও জ্যাম (Transit & Mobility)' : 'Dhaka Transit & Immobility',
                  icon: Building2,
                  color: 'border-[#93C5FD] bg-[#EFF6FF]',
                  desc: 'Traffic congestion across Dhaka or osteoarthritis preventing physical travel to specialist chamber.',
                  solution: 'Offer encrypted HD Virtual Video Consultations or dispatch mobile phlebotomist for home blood draw.'
                },
                {
                  type: 'scheduling_conflict' as PatientBarrierType,
                  title: language === 'bn' ? 'কাজের সময়সূচি (Corporate / Shift Work)' : 'Corporate Work Hours',
                  icon: Calendar,
                  color: 'border-[#C4B5FD] bg-[#F5F3FF]',
                  desc: 'Corporate employees in Motijheel/Gulshan unable to attend morning hospital OPD queues.',
                  solution: 'Fast-track reserve slots for Friday/Saturday weekend morning clinics or late evening telemedicine.'
                },
                {
                  type: 'clinical_hesitancy' as PatientBarrierType,
                  title: language === 'bn' ? 'পার্শ্বপ্রতিক্রিয়ার ভয় (Hesitancy & Anxiety)' : 'Side-Effect Anxiety & Hesitancy',
                  icon: Stethoscope,
                  color: 'border-[#FCA5A5] bg-[#FEF2F2]',
                  desc: 'Misconceptions about insulin dependency, statin muscle aches, or fear of invasive tests.',
                  solution: 'Provide curated patient education guide in Bengali with a scheduled 5-minute nurse counseling telephone call.'
                },
                {
                  type: 'system_delay' as PatientBarrierType,
                  title: language === 'bn' ? 'ল্যাব বা সিস্টেম বিলম্ব (Systemic Bottlenecks)' : 'Systemic Diagnostic Delays',
                  icon: Clock,
                  color: 'border-[#CBD5E1] bg-[#F8FAFC]',
                  desc: 'Specimens pending batch processing at external diagnostic centers without physician alerting.',
                  solution: 'Automated EMR webhooks triggering urgent notification on doctor worklists when turnaround exceeds 24h.'
                }
              ].map((item) => (
                <div key={item.type} className={`border rounded-2xl p-5 ${item.color} shadow-2xs`}>
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="w-5 h-5 text-[#0A192F]" />
                    <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider font-display">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#334155] leading-relaxed mb-3">
                    {item.desc}
                  </p>
                  <div className="p-3 bg-white/80 rounded-xl border border-black/5 text-xs text-[#0F766E] font-medium">
                    <strong className="block text-[#0A192F] text-[11px] mb-0.5">CareLoop Protocol:</strong>
                    {item.solution}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Continuity Analytics & Executive Audit */}
      {selectedTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold block">
                {language === 'bn' ? 'মোট ট্র্যাকিংকৃত গ্যাপ' : 'Total Tracked Gaps'}
              </span>
              <span className="text-2xl font-extrabold text-[#0A192F] font-mono mt-1 block">
                {formatNum(careGaps.length)}
              </span>
              <span className="text-[11px] text-[#15803D] mt-1 block font-medium">
                100% with assigned clinical owners
              </span>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold block">
                {language === 'bn' ? 'সমাধান হার (Closure Rate)' : 'Gap Closure Rate'}
              </span>
              <span className="text-2xl font-extrabold text-[#0F766E] font-mono mt-1 block">
                {formatNum(stats.resolutionRate)}%
              </span>
              <span className="text-[11px] text-[#64748B] mt-1 block">
                Benchmark: {'>'}85% for Grade-A EMR
              </span>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold block">
                {language === 'bn' ? 'গড় সমাধান সময়' : 'Avg Resolution Time'}
              </span>
              <span className="text-2xl font-extrabold text-[#0A192F] font-mono mt-1 block">
                {formatNum(4.2)} {language === 'bn' ? 'দিন' : 'days'}
              </span>
              <span className="text-[11px] text-[#15803D] mt-1 block font-medium">
                -1.8 days vs manual clinic follow-up
              </span>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold block">
                {language === 'bn' ? 'সরাসরি রোগীর বার্তা' : 'Patient Outreach Sent'}
              </span>
              <span className="text-2xl font-extrabold text-[#0A192F] font-mono mt-1 block">
                {formatNum(useApp().outreachRecords.length + 8)}
              </span>
              <span className="text-[11px] text-[#0F766E] mt-1 block font-medium">
                WhatsApp & SMS automated triggers
              </span>
            </div>
          </div>

          {/* Audit Trail Disclaimer Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#0A192F] font-display">
                  {language === 'bn' ? 'ক্লিনিক্যাল সেফটি ও অডিট ট্রেইল ডিসক্লেমার' : 'Clinical Governance & Safety Principles'}
                </h4>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                  CareLoop AI is designed to support healthcare teams in closing coordination gaps through accountable task assignment, 
                  verified completion evidence, and safe escalation pathways. The system operates under the principle that every care action must have 
                  an accountable clinician or coordinator. CareLoop AI does not replace clinical judgment and does not guarantee medical outcomes.
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs font-mono text-[#64748B]">
                  <span>DGHS EMR Standards Compliant</span>
                  <span>·</span>
                  <span>BMDC Registered Physician Oversight</span>
                  <span>·</span>
                  <span>Tamper-Resistant Audit Log</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALS & DRAWERS FOR ACTIONS ================= */}

      {/* 1. Schedule Follow-Up Modal */}
      {activeActionModalType === 'schedule' && actionModalGap && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0F766E]" />
                <h3 className="text-base font-bold text-[#0A192F] font-display">
                  {language === 'bn' ? 'ফলো-আপ অ্যাপয়েন্টমেন্ট নির্ধারণ' : '1-Click Schedule Follow-Up'}
                </h3>
              </div>
              <button onClick={() => setActiveActionModalType(null)} className="p-1 text-[#94A3B8] hover:text-[#0A192F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
              <span className="font-bold text-[#0A192F] block">{actionModalGap.title}</span>
              <span className="text-[#64748B]">Patient: {actionModalGap.patientName} (MRN: {actionModalGap.mrn})</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#0A192F] block mb-1">Doctor / Specialist</label>
                <input 
                  type="text" 
                  disabled 
                  value={actionModalGap.accountableOwner.name}
                  className="w-full p-2.5 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-[#0A192F] font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0A192F] block mb-1">Appointment Date</label>
                  <input 
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full p-2 bg-white border border-[#CBD5E1] rounded-xl text-[#0A192F] focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0A192F] block mb-1">Time Slot</label>
                  <select 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full p-2 bg-white border border-[#CBD5E1] rounded-xl text-[#0A192F] focus:border-[#0F766E]"
                  >
                    <option value="09:30 AM">09:30 AM (Chamber)</option>
                    <option value="11:30 AM">11:30 AM (Morning)</option>
                    <option value="04:30 PM">04:30 PM (Evening)</option>
                    <option value="07:00 PM">07:00 PM (After Office)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0A192F] block mb-1">Consultation Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduleType('In-person')}
                    className={`p-2.5 rounded-xl border text-center font-semibold ${
                      scheduleType === 'In-person' ? 'border-[#0F766E] bg-[#E6F4F1] text-[#0F766E]' : 'border-[#E2E8F0] text-[#64748B]'
                    }`}
                  >
                    In-person Chamber
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleType('Virtual Video')}
                    className={`p-2.5 rounded-xl border text-center font-semibold ${
                      scheduleType === 'Virtual Video' ? 'border-[#0F766E] bg-[#E6F4F1] text-[#0F766E]' : 'border-[#E2E8F0] text-[#64748B]'
                    }`}
                  >
                    Encrypted Video Call
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                onClick={() => setActiveActionModalType(null)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteSchedule}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-xs"
              >
                Confirm Appointment & Close Gap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Patient Outreach Modal (WhatsApp / SMS / Phone Call) */}
      {activeActionModalType === 'outreach' && actionModalGap && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#0F766E]" />
                <h3 className="text-base font-bold text-[#0A192F] font-display">
                  {language === 'bn' ? 'রোগী সমন্বয় যোগাযোগ (Outreach)' : 'Trigger Patient Outreach'}
                </h3>
              </div>
              <button onClick={() => setActiveActionModalType(null)} className="p-1 text-[#94A3B8] hover:text-[#0A192F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 p-1 bg-[#F1F5F9] rounded-xl">
              {(['WhatsApp', 'SMS', 'Phone Call'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => {
                    setOutreachChannel(ch);
                    setCustomOutreachMsg(CareLoopEngine.generateOutreachTemplate(actionModalGap, language, ch));
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    outreachChannel === ch ? 'bg-white text-[#0F766E] shadow-2xs' : 'text-[#64748B]'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#64748B]">
                <span>Recipient: <strong>{actionModalGap.patientName}</strong> (+880 1711-238910)</span>
                <span className="text-[10px] text-[#0F766E] font-semibold">Bilingual Template</span>
              </div>
              <textarea
                rows={6}
                value={customOutreachMsg}
                onChange={(e) => setCustomOutreachMsg(e.target.value)}
                className="w-full p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E] leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                onClick={() => setActiveActionModalType(null)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteOutreach}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch via {outreachChannel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Close Gap with Evidence Modal */}
      {activeActionModalType === 'resolve' && actionModalGap && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
                <h3 className="text-base font-bold text-[#0A192F] font-display">
                  {language === 'bn' ? 'প্রমাণ সহ কেয়ার গ্যাপ সমাপ্তি' : 'Close Gap with Verified Evidence'}
                </h3>
              </div>
              <button onClick={() => setActiveActionModalType(null)} className="p-1 text-[#94A3B8] hover:text-[#0A192F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl text-xs text-[#14532D]">
              <strong>Rule:</strong> Gaps cannot be arbitrarily dismissed without verifiable clinical evidence, external report documentation, or verified consultation record.
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-[#0A192F] block">
                {language === 'bn' ? 'ক্লিনিক্যাল সমাপ্তির প্রমাণ (Evidence of Completion)' : 'Clinical Substantiation / Evidence:'}
              </label>
              <textarea
                rows={4}
                value={resolutionEvidence}
                onChange={(e) => setResolutionEvidence(e.target.value)}
                placeholder={language === 'bn' 
                  ? 'যেমন: বহিরাগত ল্যাব রিপোর্ট সংগৃহীত ও পর্যালোচিত। ক্রিয়েটিনিন ১.২, ইজিএফআর ৬৪। প্যাথলজি রেকর্ড নং POP-99120 যাচাই করা হয়েছে।'
                  : 'e.g., Patient completed external fundus photography at Labaid Eye Clinic. Normal findings verified and appended to medical records by Prof. Aisha Rahman.'
                }
                className="w-full p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E] leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                onClick={() => setActiveActionModalType(null)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteResolution}
                className="px-4 py-2 text-xs font-bold text-white bg-[#15803D] hover:bg-[#166534] rounded-xl transition-colors shadow-xs"
              >
                Confirm & Close Care Loop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Dispute / Clinical Override Modal */}
      {activeActionModalType === 'dispute' && actionModalGap && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#DC2626]" />
                <h3 className="text-base font-bold text-[#0A192F] font-display">
                  {language === 'bn' ? 'ক্লিনিক্যাল ওভাররাইড / ডিসপিউট' : 'Clinical Override / Dispute'}
                </h3>
              </div>
              <button onClick={() => setActiveActionModalType(null)} className="p-1 text-[#94A3B8] hover:text-[#0A192F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B]">
              <strong>Physician Override:</strong> When an algorithmic guideline care gap is deemed clinically inappropriate for this specific patient (e.g. drug contraindication, palliative goal of care, patient refusal with informed consent), document the medical rationale below.
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-[#0A192F] block">
                {language === 'bn' ? 'বাধ্যতামূলক চিকিৎসকের যুক্তি (Clinical Justification):' : 'Mandatory Clinical Justification:'}
              </label>
              <textarea
                rows={4}
                value={disputeJustification}
                onChange={(e) => setDisputeJustification(e.target.value)}
                placeholder="e.g., Inhaler therapy withheld due to confirmed hypersensitivity reaction; switched to oral leukotriene receptor antagonist monotherapy per pulmonologist review."
                className="w-full p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E] leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                onClick={() => setActiveActionModalType(null)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDispute}
                className="px-4 py-2 text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-xl transition-colors shadow-xs"
              >
                Sign & Record Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Reassign Accountability Modal */}
      {activeActionModalType === 'reassign' && actionModalGap && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#0F766E]" />
                <h3 className="text-base font-bold text-[#0A192F] font-display">
                  {language === 'bn' ? 'দায়িত্বপ্রাপ্ত ব্যক্তি পুনঃনির্ধারণ' : 'Reassign Accountable Owner'}
                </h3>
              </div>
              <button onClick={() => setActiveActionModalType(null)} className="p-1 text-[#94A3B8] hover:text-[#0A192F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#0A192F] block mb-1">Select New Owner</label>
                <select
                  value={reassignTarget.id}
                  onChange={(e) => {
                    const targets = [
                      { id: 'coord-01', name: 'Sister Nusrat Jahan, RN', role: 'Care Coordinator' },
                      { id: 'doc-001', name: 'Prof. Dr. Aisha Rahman', role: 'Attending Physician' },
                      { id: 'phm-301', name: 'Kazi Farhan Sadik, M.Pharm', role: 'Chief Pharmacist' },
                      { id: 'doc-002', name: 'Dr. Tanvir Ahmed', role: 'Consultant Cardiologist' }
                    ];
                    const selected = targets.find(t => t.id === e.target.value);
                    if (selected) setReassignTarget(selected);
                  }}
                  className="w-full p-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0A192F] focus:border-[#0F766E]"
                >
                  <option value="coord-01">Sister Nusrat Jahan, RN (Care Coordinator)</option>
                  <option value="doc-001">Prof. Dr. Aisha Rahman (Attending Physician)</option>
                  <option value="phm-301">Kazi Farhan Sadik, M.Pharm (Chief Pharmacist)</option>
                  <option value="doc-002">Dr. Tanvir Ahmed (Cardiologist)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#0A192F] block mb-1">Handoff Instructions / Reason</label>
                <textarea
                  rows={3}
                  value={reassignNote}
                  onChange={(e) => setReassignNote(e.target.value)}
                  placeholder="e.g., Assigned to clinic coordinator to execute telephone outreach and book Saturday morning slot."
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                onClick={() => setActiveActionModalType(null)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReassign}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-xs"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Update Patient Barrier Modal */}
      {activeActionModalType === 'barrier' && actionModalGap && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#B45309]" />
                <h3 className="text-base font-bold text-[#0A192F] font-display">
                  {language === 'bn' ? 'রোগীর প্রতিবন্ধকতা নথিভুক্তকরণ' : 'Document Patient Barrier'}
                </h3>
              </div>
              <button onClick={() => setActiveActionModalType(null)} className="p-1 text-[#94A3B8] hover:text-[#0A192F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#0A192F] block mb-1">Barrier Classification</label>
                <select
                  value={newBarrierType}
                  onChange={(e) => setNewBarrierType(e.target.value as PatientBarrierType)}
                  className="w-full p-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0A192F] focus:border-[#0F766E]"
                >
                  <option value="financial">Financial / Out-of-pocket Cost</option>
                  <option value="transport">Transportation / Distance / Dhaka Traffic</option>
                  <option value="scheduling_conflict">Corporate / Office Work Shift</option>
                  <option value="clinical_hesitancy">Side Effect Anxiety / Treatment Hesitancy</option>
                  <option value="system_delay">Diagnostic Processing Delay</option>
                  <option value="none">None / Resolved</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#0A192F] block mb-1">Detailed Description & Context</label>
                <textarea
                  rows={3}
                  value={newBarrierDesc}
                  onChange={(e) => setNewBarrierDesc(e.target.value)}
                  placeholder="Describe patient specific situation to enable tailored intervention heuristics."
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                onClick={() => setActiveActionModalType(null)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBarrierUpdate}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-xs"
              >
                Save Barrier Flag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Delight Celebration Burst */}
      <CelebrationBurst 
        show={showCelebration} 
        message={celebrationMsg} 
        onComplete={() => setShowCelebration(false)} 
      />
    </div>
  );
};

// Simple helper icon for guideline citations
function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
