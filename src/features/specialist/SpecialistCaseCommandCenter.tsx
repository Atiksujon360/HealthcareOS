import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Stethoscope, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Check, 
  Lock, 
  Award,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  Chamber, 
  InvestigationReport, 
  ReferralSecondOpinion, 
  ReferralLifecycleStatus, 
  DuplicatePatientCandidate
} from '../../types/specialist';
import { 
  MOCK_CHAMBERS, 
  MOCK_DUPLICATE_CANDIDATES, 
  MOCK_INVESTIGATIONS, 
  MOCK_REFERRALS,
  MOCK_SPECIALIST_PATIENT_BRIEF
} from '../../data/mockSpecialistData';

export const SpecialistCaseCommandCenter: React.FC = () => {
  const { 
    patientRecords, 
    activeCareLoopPatientId, 
    setActiveCareLoopPatientId,
    setActiveView, 
    addToast, 
    language, 
    formatNum, 
    formatBDT
  } = useApp();

  // Mode: Segment 1 (Solo Consultant Chamber) vs Segment 2 (Specialist Professor Pro)
  const [activeSegment, setActiveSegment] = useState<'specialist_pro' | 'solo_chamber'>('specialist_pro');

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<'brief' | 'longitudinal' | 'investigations' | 'referrals' | 'careloop_queue' | 'chamber_ops'>('brief');

  // Multi-chamber state
  const [chambers] = useState<Chamber[]>(MOCK_CHAMBERS);
  const [selectedChamberId, setSelectedChamberId] = useState<string>('chm-001');
  const selectedChamber = useMemo(() => chambers.find(c => c.id === selectedChamberId) || chambers[0], [chambers, selectedChamberId]);

  // Investigations state
  const [investigations, setInvestigations] = useState<InvestigationReport[]>(MOCK_INVESTIGATIONS);
  const [selectedInvestigationId, setSelectedInvestigationId] = useState<string>(MOCK_INVESTIGATIONS[0]?.id || '');
  const [invFilter, setInvFilter] = useState<'all' | 'pending' | 'reviewed' | 'draft_extraction'>('all');
  const selectedInvestigation = useMemo(() => investigations.find(i => i.id === selectedInvestigationId) || investigations[0], [investigations, selectedInvestigationId]);

  // Referrals state
  const [referrals, setReferrals] = useState<ReferralSecondOpinion[]>(MOCK_REFERRALS);
  const [selectedReferralId, setSelectedReferralId] = useState<string>(MOCK_REFERRALS[0]?.id || '');
  const selectedReferral = useMemo(() => referrals.find(r => r.id === selectedReferralId) || referrals[0], [referrals, selectedReferralId]);

  // Duplicate candidate review modal state
  const [duplicateCandidates, setDuplicateCandidates] = useState<DuplicatePatientCandidate[]>(MOCK_DUPLICATE_CANDIDATES);
  const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);
  const [duplicateActionNote, setDuplicateActionNote] = useState<string>('');

  // Referral response approval modal state
  const [showReferralResponseModal, setShowReferralResponseModal] = useState<boolean>(false);
  const [responseFindings, setResponseFindings] = useState<string>(selectedReferral?.response?.findings || '');
  const [responseRecommendations, setResponseRecommendations] = useState<string>(selectedReferral?.response?.recommendations || '');

  // Annotation modal state
  const [showAnnotationModal, setShowAnnotationModal] = useState<boolean>(false);
  const [annotationText, setAnnotationText] = useState<string>('');

  // Selected Patient
  const currentPatient = useApp().patientRecords.find(p => p.id === activeCareLoopPatientId) || patientRecords[0];

  // Brief
  const brief = MOCK_SPECIALIST_PATIENT_BRIEF;

  // Filtered Investigations
  const filteredInvestigations = useMemo(() => {
    return investigations.filter(inv => {
      if (invFilter === 'all') return true;
      if (invFilter === 'pending') return inv.status === 'pending_review';
      if (invFilter === 'reviewed') return inv.status === 'reviewed';
      if (invFilter === 'draft_extraction') return inv.isDraftOcrExtraction;
      return true;
    });
  }, [investigations, invFilter]);

  // Handler: Review and Confirm Duplicate Candidate (Anti-Auto-Merge Decision)
  const handleResolveDuplicate = (decision: 'confirmed_distinct' | 'merged') => {
    if (!duplicateCandidates[0]) return;
    setDuplicateCandidates(prev => prev.map(dc => dc.id === duplicateCandidates[0].id ? {
      ...dc,
      reviewStatus: decision,
      reviewedBy: 'Prof. Dr. Aisha Rahman (BMDC A-48291)',
      reviewNotes: duplicateActionNote || (decision === 'confirmed_distinct' 
        ? 'Verified distinct patients: DOB and national identification mismatch confirmed by clinician.' 
        : 'Authorized merge completed with complete audit trail.')
    } : dc));

    setShowDuplicateModal(false);
    addToast({
      type: 'info',
      title: decision === 'confirmed_distinct' ? 'Identity Disambiguated' : 'Record Merged',
      message: decision === 'confirmed_distinct'
        ? 'Patient profiles confirmed as distinct individuals. Auto-merge override logged.'
        : 'Patient identities linked under supervision with preserved historical audit logs.'
    });
  };

  // Handler: Clinician Sign-Off for Investigation
  const handleApproveInvestigation = (invId: string) => {
    setInvestigations(prev => prev.map(inv => inv.id === invId ? {
      ...inv,
      status: 'reviewed',
      isDraftOcrExtraction: false,
      verifiedByPhysician: 'Prof. Dr. Aisha Rahman (BMDC A-48291)',
      verifiedAt: new Date().toLocaleString(),
      clinicianAnnotations: [
        ...(inv.clinicianAnnotations || []),
        `Physician review completed on ${new Date().toLocaleDateString()}. Verified against diagnostic lab reference standard.`
      ]
    } : inv));

    addToast({
      type: 'success',
      title: 'Investigation Formally Signed Off',
      message: 'Report status updated to Reviewed with digital physician stamp.'
    });
  };

  // Handler: Add Clinician Annotation to Investigation
  const handleAddAnnotation = () => {
    if (!annotationText.trim() || !selectedInvestigation) return;
    setInvestigations(prev => prev.map(inv => inv.id === selectedInvestigation.id ? {
      ...inv,
      clinicianAnnotations: [...(inv.clinicianAnnotations || []), annotationText.trim()]
    } : inv));

    setAnnotationText('');
    setShowAnnotationModal(false);
    addToast({
      type: 'info',
      title: 'Clinical Annotation Saved',
      message: 'Physician clinical note appended to investigation record.'
    });
  };

  // Handler: Approve and Transmit Referral Second Opinion
  const handleApproveReferralResponse = () => {
    if (!selectedReferral) return;
    const now = new Date().toLocaleString();

    setReferrals(prev => prev.map(ref => ref.id === selectedReferral.id ? {
      ...ref,
      currentStatus: 'Response Approved',
      response: {
        ...ref.response,
        draftedAt: ref.response?.draftedAt || now,
        draftedBy: ref.response?.draftedBy || 'Prof. Dr. Aisha Rahman',
        approvedAt: now,
        approvedBy: 'Prof. Dr. Aisha Rahman (BMDC Reg: A-48291)',
        isClinicianApproved: true,
        findings: responseFindings,
        recommendations: responseRecommendations,
        suggestedFollowUp: ref.response?.suggestedFollowUp || '30-day metabolic review'
      },
      statusHistory: [
        ...ref.statusHistory,
        {
          status: 'Response Approved',
          timestamp: now,
          actorName: 'Prof. Dr. Aisha Rahman',
          actorRole: 'Specialist Professor',
          note: 'Clinician formal signature applied. Referral response sealed and dispatched.'
        }
      ]
    } : ref));

    setShowReferralResponseModal(false);
    addToast({
      type: 'success',
      title: 'Referral Response Approved & Sealed',
      message: 'Formal second-opinion dispatched to referring physician Dr. Mahbubur Rahman.'
    });
  };

  // Lifecycle status badge helper
  const getReferralBadge = (status: ReferralLifecycleStatus) => {
    switch (status) {
      case 'Draft':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475569]">Draft</span>;
      case 'Sent':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E0F2FE] text-[#0369A1]">Sent · Pending Ack</span>;
      case 'Acknowledged':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B45309]">Acknowledged</span>;
      case 'Under Review':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E0E7FF] text-[#4338CA]">Under Review</span>;
      case 'Response Drafted':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C]">Response Drafted</span>;
      case 'Response Approved':
      case 'Completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#15803D]">Approved & Completed</span>;
      case 'Rejected':
      case 'Cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#B91C1C]">{status}</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#64748B]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Dual Segment Selector & Case Command Center Header */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#0E2A47] to-[#0F766E] rounded-3xl p-6 lg:p-8 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#0F766E]/40 border border-[#2DD4BF]/30 text-[#5EEAD4]">
                <Award className="w-3.5 h-3.5 text-[#5EEAD4]" />
                HealthcareOS Specialist & Chamber Suite
              </span>
              <span className="text-[11px] text-white/70 font-mono">
                BMDC Medico-Legal EMR v2.6
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display text-white">
              {activeSegment === 'specialist_pro' 
                ? (language === 'bn' ? 'স্পেশালিস্ট প্রফেসর কেস কমান্ড সেন্টার' : 'Specialist Professor Case Command Center')
                : (language === 'bn' ? 'সোলো কনসালটেন্ট চেম্বার ও মাল্টি-লোকেশন ম্যানেজার' : 'Solo Consultant Multi-Chamber Practice')
              }
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-3xl mt-1.5 leading-relaxed">
              {activeSegment === 'specialist_pro'
                ? 'Longitudinal patient case timeline, source-linked pre-consultation brief, investigation comparisons, second-opinion referrals, and CareLoop prevention queues.'
                : 'Manage patient queues, multi-chamber appointment schedules, chamber-specific fees in BDT, and delegated secretary permissions without compromising clinical privacy.'
              }
            </p>
          </div>

          {/* Segment Mode Toggle */}
          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
            <span className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">
              Select Practice Segment
            </span>
            <div className="p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveSegment('specialist_pro');
                  setActiveTab('brief');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSegment === 'specialist_pro'
                    ? 'bg-white text-[#0A192F] shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Specialist Professor Pro</span>
              </button>
              <button
                onClick={() => {
                  setActiveSegment('solo_chamber');
                  setActiveTab('chamber_ops');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSegment === 'solo_chamber'
                    ? 'bg-white text-[#0A192F] shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Solo Consultant Chamber</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Header & Duplicate Alert Ribbon */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-[#E6F4F1] text-[#0F766E] border border-[#99F6E4] flex items-center justify-center font-bold text-lg font-display shrink-0">
              {currentPatient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#0A192F] font-display">
                  {currentPatient.name}
                </h2>
                <span className="text-xs font-mono font-semibold text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded">
                  MRN: {currentPatient.mrn}
                </span>
                <span className="text-xs text-[#64748B]">
                  {formatNum(currentPatient.age)}y {currentPatient.gender} · Blood {currentPatient.bloodType}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                {currentPatient.chronicConditions.join(' · ')} · Phone: {currentPatient.phone}
              </p>
            </div>
          </div>

          {/* Patient Selector & Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={currentPatient.id}
              onChange={(e) => setActiveCareLoopPatientId(e.target.value)}
              className="text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-[#0A192F] focus:outline-none"
            >
              {patientRecords.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>
              ))}
            </select>

            <button
              onClick={() => setActiveView('doctor/consultations/enc-2026-101')}
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'কনসালটেশন ওয়ার্কস্পেস' : 'Open Consultation Encounter'}</span>
            </button>
          </div>
        </div>

        {/* Anti-Auto-Merge Duplicate Warning Banner */}
        {duplicateCandidates.length > 0 && duplicateCandidates[0].reviewStatus === 'unreviewed' && (
          <div className="bg-[#FFFBEB] border border-[#FCD34D] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-xl bg-[#D97706] text-white shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#92400E] uppercase tracking-wider text-[11px]">
                    Suspected Duplicate Identity Flagged (Auto-Merge Blocked)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-[#B45309] text-white">
                    84% Match Score
                  </span>
                </div>
                <p className="text-[#78350F] mt-0.5">
                  Another profile exists with phone <strong>+880 1711-238910</strong> but different DOB (1974 vs 1972). BMDC guidelines prohibit silent merging.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDuplicateModal(true)}
              className="px-3 py-1.5 bg-[#B45309] hover:bg-[#92400E] text-white font-bold rounded-xl transition-colors whitespace-nowrap self-start sm:self-center shadow-2xs text-[11px]"
            >
              Review Duplicate Candidate →
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E2E8F0] pb-px overflow-x-auto">
        {activeSegment === 'specialist_pro' ? (
          <>
            <button
              onClick={() => setActiveTab('brief')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'brief' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Specialist Patient Brief</span>
            </button>

            <button
              onClick={() => setActiveTab('longitudinal')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'longitudinal' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Longitudinal Case File</span>
            </button>

            <button
              onClick={() => setActiveTab('investigations')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'investigations' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Investigation Review & Trends</span>
              {investigations.filter(i => i.status === 'pending_review').length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FFEDD5] text-[#C2410C]">
                  {investigations.filter(i => i.status === 'pending_review').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('referrals')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'referrals' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Referral & Second-Opinion Hub</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#E6F4F1] text-[#0F766E]">
                {referrals.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('careloop_queue')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'careloop_queue' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>CareLoop Action Queue</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('chamber_ops')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'chamber_ops' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Chamber Operations & Queue</span>
            </button>

            <button
              onClick={() => setActiveTab('brief')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'brief' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Quick Patient Brief</span>
            </button>

            <button
              onClick={() => setActiveTab('investigations')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'investigations' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Patient Lab Reports</span>
            </button>
          </>
        )}
      </div>

      {/* ================= TAB CONTENT 1: Specialist Patient Brief ================= */}
      {activeTab === 'brief' && (
        <div className="space-y-6">
          {/* Header Callout: Source Linking Non-Hallucinatory Guarantee */}
          <div className="bg-[#F0FDFA] border border-[#99F6E4] rounded-2xl p-4 flex items-center justify-between text-xs text-[#0F766E]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                <strong>Clinical Integrity Guarantee:</strong> Every brief statement below is mapped directly to a verifiable EMR record, prescription, or diagnostic report. Unverified claims are explicitly labeled.
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold bg-white px-2 py-0.5 rounded border border-[#99F6E4] shrink-0 hidden md:inline">
              Source-Linked Clinical AI
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (8 cols): Today's Reason, Highlights, Medications, Previous Visits */}
            <div className="lg:col-span-8 space-y-5">
              {/* Today Visit Reason */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider font-display">
                    Reason for Today's Visit
                  </h3>
                  <span className="text-[10px] font-mono font-semibold text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded">
                    Source: {brief.todayVisitReason.sourceRef}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#0A192F] leading-relaxed">
                  "{brief.todayVisitReason.statement}"
                </p>
              </div>

              {/* Investigation Highlights (Structured Results with Source Links) */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider font-display">
                    Critical Investigation Highlights
                  </h3>
                  <button 
                    onClick={() => setActiveTab('investigations')}
                    className="text-xs font-semibold text-[#0F766E] hover:underline"
                  >
                    View All Reports →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {brief.investigationHighlights.map((inv, idx) => (
                    <div key={idx} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-[#0A192F]">{inv.parameter}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          inv.status === 'abnormal' ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#DCFCE7] text-[#15803D]'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <div className="text-sm font-extrabold text-[#0A192F] font-mono">
                        {inv.value}
                      </div>
                      <div className="text-[10px] text-[#64748B] flex justify-between items-center pt-1 border-t border-[#E2E8F0]">
                        <span>{inv.date}</span>
                        <span className="font-mono text-[#0F766E]">{inv.sourceRef}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Verified vs Unverified Medications */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
                <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-3 font-display">
                  Current Medications & Compliance
                </h3>
                <div className="space-y-2">
                  {brief.activeMedications.map((med, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      med.status === 'unverified' ? 'bg-[#FFFBEB] border-[#FDE68A]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
                    }`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0A192F]">{med.drugName}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            med.status === 'verified' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEF3C7] text-[#B45309]'
                          }`}>
                            {med.status}
                          </span>
                        </div>
                        <span className="text-[#475569]">{med.dose}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#64748B] shrink-0">
                        {med.sourceRef}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Missing/Conflicting Warnings, Outstanding Tasks, Allergies */}
            <div className="lg:col-span-4 space-y-5">
              {/* Explicit Labels for Unknown, Missing, and Conflicting Information */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#D97706]" />
                  <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider font-display">
                    Missing & Conflicting Data Flags
                  </h3>
                </div>
                <div className="space-y-2.5">
                  {brief.missingOrConflictingItems.map((item, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border text-xs ${
                      item.category === 'missing' ? 'bg-[#FEF2F2] border-[#FEE2E2]' :
                      item.category === 'conflicting' ? 'bg-[#FFFBEB] border-[#FDE68A]' :
                      'bg-[#F8FAFC] border-[#E2E8F0]'
                    }`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block mb-0.5 ${
                        item.category === 'missing' ? 'text-[#DC2626]' :
                        item.category === 'conflicting' ? 'text-[#B45309]' :
                        'text-[#0F766E]'
                      }`}>
                        [{item.category.toUpperCase()} RECORD]
                      </span>
                      <strong className="text-[#0A192F] block">{item.label}</strong>
                      <p className="text-[#475569] mt-0.5 text-[11px] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outstanding CareLoop Actions */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider font-display">
                  Outstanding Patient Tasks
                </h3>
                <div className="space-y-2">
                  {brief.outstandingTasks.map((task, idx) => (
                    <div key={idx} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-[#0A192F]">{task.task}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          task.severity === 'critical' ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#FFEDD5] text-[#C2410C]'
                        }`}>
                          {task.severity}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-[#64748B]">
                        <span>Due: {task.dueDate}</span>
                        <span className="font-mono text-[#0F766E]">{task.sourceRef}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documented Allergies */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-2">
                <h3 className="text-xs font-bold text-[#B91C1C] uppercase tracking-wider font-display flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Verified Drug Allergies
                </h3>
                <div className="space-y-2">
                  {brief.allergies.map((all, idx) => (
                    <div key={idx} className="p-2.5 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl text-xs">
                      <strong className="text-[#991B1B] block">{all.allergen}</strong>
                      <span className="text-[#7F1D1D] text-[11px]">{all.reaction}</span>
                      <span className="text-[10px] font-mono text-[#64748B] block mt-1">Source: {all.sourceRef}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB CONTENT 2: Longitudinal Record Timeline ================= */}
      {activeTab === 'longitudinal' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-6">
              <div>
                <h3 className="text-base font-bold text-[#0A192F] font-display">
                  Patient Longitudinal Case History
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Chronological synthesis of encounters, signed diagnoses, dispensed prescriptions, and external investigation reports.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-[#0F766E] bg-[#E6F4F1] px-2.5 py-1 rounded">
                Patient UUID: pat-101 (MRN: EVR-DHK-784920)
              </span>
            </div>

            <div className="relative border-l-2 border-[#CBD5E1] ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
              {[
                {
                  date: '2026-10-16 10:15 AM',
                  type: 'Encounter',
                  title: 'Endocrinology Consultation & e-Prescription (Encounter #enc-2026-101)',
                  author: 'Prof. Dr. Aisha Rahman (BMDC A-48291)',
                  facility: 'Evercare Hospital Dhaka (Suite 408)',
                  details: 'Chief Complaint: Fasting sugar spikes (140-158 mg/dL) & dependent pedal edema. Titrated Compath 500/50 BID and initiated Togent (Empagliflozin) 10mg morning.',
                  status: 'Draft / Under Consultation'
                },
                {
                  date: '2026-10-14 04:20 PM',
                  type: 'Laboratory',
                  title: 'Comprehensive Renal Function & Glycemic Panel (Report #POP-BIO-99214)',
                  author: 'Dr. Shamim Reza, MD (Biochemistry)',
                  facility: 'Popular Diagnostic Centre (Dhanmondi)',
                  details: 'HbA1c 8.4%, Serum Creatinine 1.34 mg/dL, eGFR 58 mL/min/1.73m² (CKD 3a). Flagged for physician sign-off.',
                  status: 'Pending Physician Review'
                },
                {
                  date: '2026-10-08 11:30 AM',
                  type: 'Cardiology',
                  title: 'Transthoracic Echocardiogram (Report #EVR-IMG-88192)',
                  author: 'Dr. Tanvir Ahmed, FCPS (Cardiology)',
                  facility: 'Evercare Hospital Dhaka',
                  details: 'LVEF 55%, concentric LV remodeling with IVSd 12.2mm, Grade-1 diastolic dysfunction.',
                  status: 'Draft AI Extraction (Verified)'
                },
                {
                  date: '2026-09-02 11:30 AM',
                  type: 'Referral',
                  title: 'Specialist Referral Issued to National Institute of Ophthalmology (REF-EYE-4812)',
                  author: 'Prof. Dr. Aisha Rahman',
                  facility: 'Evercare Hospital Dhaka',
                  details: 'Annual Diabetic Retinopathy screening referral. Currently status Sent, awaiting external clinic acknowledgement.',
                  status: 'Sent / Unacknowledged'
                },
                {
                  date: '2026-08-22 10:00 AM',
                  type: 'Encounter',
                  title: 'Quarterly Diabetic Follow-Up Encounter (Encounter #enc-2026-081)',
                  author: 'Prof. Dr. Aisha Rahman',
                  facility: 'Evercare Hospital Dhaka',
                  details: 'HbA1c was 7.9%. Blood pressure controlled at 130/84 mmHg with Camlodin 5mg.',
                  status: 'Signed & Archived'
                }
              ].map((rec, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-8 h-8 rounded-full border-2 border-[#0F766E] bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F766E] rounded-2xl p-5 shadow-2xs transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E2E8F0]">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-white text-[#0F766E] border border-[#E2E8F0]">
                          {rec.type}
                        </span>
                        <span className="text-xs font-bold text-[#0A192F] font-display">
                          {rec.title}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#64748B]">{rec.date}</span>
                    </div>

                    <p className="text-xs text-[#334155] mt-2 leading-relaxed">
                      {rec.details}
                    </p>

                    <div className="flex items-center justify-between text-xs text-[#64748B] mt-3 pt-2 border-t border-[#E2E8F0]/70">
                      <span>Author: <strong className="text-[#0A192F]">{rec.author}</strong> ({rec.facility})</span>
                      <span className="font-semibold text-[#0F766E]">{rec.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB CONTENT 3: Investigation Review & Trends ================= */}
      {activeTab === 'investigations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Reports Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider font-display">
                    Diagnostic Reports ({formatNum(filteredInvestigations.length)})
                  </h3>
                  <select
                    value={invFilter}
                    onChange={(e) => setInvFilter(e.target.value as any)}
                    className="text-[11px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2 py-1 text-[#0A192F]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending Review</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="draft_extraction">Draft AI OCR</option>
                  </select>
                </div>

                <div className="space-y-2">
                  {filteredInvestigations.map((inv) => {
                    const isSelected = selectedInvestigation.id === inv.id;
                    return (
                      <div
                        key={inv.id}
                        onClick={() => setSelectedInvestigationId(inv.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-[#E6F4F1] border-[#0F766E]' 
                            : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-[#0F766E]">{inv.reportNumber}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            inv.status === 'reviewed' ? 'bg-[#DCFCE7] text-[#15803D]' :
                            inv.status === 'pending_review' ? 'bg-[#FFEDD5] text-[#C2410C]' :
                            'bg-[#E0E7FF] text-[#4338CA]'
                          }`}>
                            {inv.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#0A192F] mt-1 line-clamp-1">{inv.testName}</h4>
                        <div className="text-[11px] text-[#64748B] flex justify-between items-center mt-1">
                          <span>{inv.facility.split('(')[0]}</span>
                          <span>{inv.testDate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Report Structured Results & Trends (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs space-y-5">
                {/* Report Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded">
                        {selectedInvestigation.reportNumber}
                      </span>
                      {selectedInvestigation.isDraftOcrExtraction && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                          Draft AI OCR Extraction ({selectedInvestigation.ocrConfidencePercentage}% confidence)
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-[#0A192F] mt-1 font-display">
                      {selectedInvestigation.testName}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Facility: {selectedInvestigation.facility} · Date: {selectedInvestigation.testDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAnnotationModal(true)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#0A192F] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl transition-colors"
                    >
                      + Annotation
                    </button>
                    {selectedInvestigation.status !== 'reviewed' ? (
                      <button
                        onClick={() => handleApproveInvestigation(selectedInvestigation.id)}
                        className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sign Off & Confirm</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-xs font-bold text-[#15803D] bg-[#DCFCE7] px-3 py-1.5 rounded-xl">
                        <Check className="w-4 h-4" />
                        <span>Signed Off</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Structured Result Items Table with Unit Compatibility Check */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] font-semibold border-b border-[#E2E8F0]">
                      <tr>
                        <th className="py-2.5 px-3">Test Parameter</th>
                        <th className="py-2.5 px-3">Result Value</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3">Reference Range</th>
                        <th className="py-2.5 px-3">Historical Trend (Comparable Units)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {selectedInvestigation.results.map((res) => (
                        <tr key={res.id} className={res.isAbnormal ? 'bg-[#FEF2F2]/40' : ''}>
                          <td className="py-3 px-3 font-semibold text-[#0A192F]">
                            {res.parameter}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-sm">
                            <span className={res.isAbnormal ? 'text-[#DC2626]' : 'text-[#0A192F]'}>
                              {res.value}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#64748B] font-mono">
                            {res.unit}
                          </td>
                          <td className="py-3 px-3 text-[#64748B]">
                            {res.referenceRangeText}
                          </td>
                          <td className="py-3 px-3">
                            {res.historicalTrend && res.historicalTrend.length > 1 ? (
                              <div className="flex items-center gap-2 text-[11px] font-mono">
                                {res.historicalTrend.map((t, tidx) => (
                                  <span key={tidx} className={`px-1.5 py-0.5 rounded border ${
                                    tidx === res.historicalTrend!.length - 1
                                      ? 'bg-white font-bold text-[#0F766E] border-[#0F766E]'
                                      : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
                                  }`}>
                                    {t.value} {t.unit} ({t.date.slice(5)})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-[#94A3B8] italic">Single measurement</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Clinician Annotations Box */}
                {selectedInvestigation.clinicianAnnotations && selectedInvestigation.clinicianAnnotations.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-2 text-xs">
                    <span className="font-bold text-[#0A192F] uppercase text-[10px] tracking-wider block">
                      Clinician Annotations & Oversight
                    </span>
                    {selectedInvestigation.clinicianAnnotations.map((anno, aidx) => (
                      <p key={aidx} className="text-[#334155] italic">
                        "{anno}"
                      </p>
                    ))}
                    {selectedInvestigation.verifiedByPhysician && (
                      <span className="text-[10px] text-[#15803D] block pt-1 font-semibold">
                        Verified by {selectedInvestigation.verifiedByPhysician} on {selectedInvestigation.verifiedAt}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB CONTENT 4: Referral & Second-Opinion Hub ================= */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Referral List (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider font-display">
                    Referral Case Files ({formatNum(referrals.length)})
                  </h3>
                </div>

                <div className="space-y-2">
                  {referrals.map((ref) => {
                    const isSelected = selectedReferral.id === ref.id;
                    return (
                      <div
                        key={ref.id}
                        onClick={() => setSelectedReferralId(ref.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected ? 'bg-[#E6F4F1] border-[#0F766E]' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-[#0F766E]">{ref.referralNumber}</span>
                          <span className="text-[10px] font-bold uppercase text-[#475569] bg-white px-1.5 py-0.2 rounded border">
                            {ref.direction}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#0A192F] mt-1 line-clamp-1">{ref.reasonForReferral}</h4>
                        <div className="mt-1 flex items-center justify-between">
                          {getReferralBadge(ref.currentStatus)}
                          <span className="text-[10px] text-[#64748B]">Due: {ref.dueDate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Referral Detail & End-to-End Lifecycle (8 cols) */}
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded">
                        {selectedReferral.referralNumber}
                      </span>
                      {getReferralBadge(selectedReferral.currentStatus)}
                      <span className="text-xs font-bold text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded">
                        Priority: {selectedReferral.priority}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#0A192F] mt-1.5 font-display">
                      {selectedReferral.reasonForReferral}
                    </h3>
                  </div>

                  {selectedReferral.direction === 'inbound' && selectedReferral.currentStatus !== 'Response Approved' && (
                    <button
                      onClick={() => {
                        setResponseFindings(selectedReferral.response?.findings || '');
                        setResponseRecommendations(selectedReferral.response?.recommendations || '');
                        setShowReferralResponseModal(true);
                      }}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-2xs whitespace-nowrap self-start sm:self-center"
                    >
                      Draft & Approve Second Opinion →
                    </button>
                  )}
                </div>

                {/* End-to-End Referral Lifecycle Visualization */}
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block mb-3">
                    Referral Governance Lifecycle State Machine
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
                    {(['Draft', 'Sent', 'Acknowledged', 'Under Review', 'Response Drafted', 'Response Approved', 'Completed'] as ReferralLifecycleStatus[]).map((step, sidx) => {
                      const isReached = selectedReferral.statusHistory.some(h => h.status === step) || selectedReferral.currentStatus === step;
                      const isCurrent = selectedReferral.currentStatus === step;
                      return (
                        <div key={step} className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                          isCurrent ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-2xs' :
                          isReached ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]' :
                          'bg-white text-[#94A3B8] border-[#E2E8F0]'
                        }`}>
                          <span className="block text-[9px] uppercase font-mono opacity-80">Step {sidx + 1}</span>
                          <span className="truncate block">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Clinician Overview Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#0F766E]">Referring Clinician</span>
                    <h4 className="font-bold text-[#0A192F]">{selectedReferral.referringClinician.name}</h4>
                    <p className="text-[#64748B]">{selectedReferral.referringClinician.title}</p>
                    <p className="text-[#64748B]">{selectedReferral.referringClinician.organization} (BMDC: {selectedReferral.referringClinician.bmdc})</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#0F766E]">Receiving Clinician</span>
                    <h4 className="font-bold text-[#0A192F]">{selectedReferral.receivingClinician.name}</h4>
                    <p className="text-[#64748B]">{selectedReferral.receivingClinician.title}</p>
                    <p className="text-[#64748B]">{selectedReferral.receivingClinician.organization} ({selectedReferral.receivingClinician.specialty})</p>
                  </div>
                </div>

                {/* Clinical Summary */}
                <div className="space-y-1.5 text-xs">
                  <strong className="text-[#0A192F] uppercase text-[10px] tracking-wider block">Clinical Case Summary:</strong>
                  <p className="text-[#334155] leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                    {selectedReferral.clinicalSummary}
                  </p>
                </div>

                {/* Formal Second Opinion Response Section */}
                {selectedReferral.response && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#F0FDFA] to-[#E6F4F1] border border-[#99F6E4] space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0F766E] uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-display">
                        <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                        Official Specialist Second-Opinion Response
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        selectedReferral.response.isClinicianApproved 
                          ? 'bg-[#DCFCE7] text-[#15803D]' 
                          : 'bg-[#FEF3C7] text-[#B45309]'
                      }`}>
                        {selectedReferral.response.isClinicianApproved ? 'Clinician Signed & Approved' : 'Draft Response (Requires Approval)'}
                      </span>
                    </div>

                    <div>
                      <strong className="text-[#0A192F] block mb-0.5">Specialist Findings:</strong>
                      <p className="text-[#334155]">{selectedReferral.response.findings}</p>
                    </div>

                    <div>
                      <strong className="text-[#0A192F] block mb-0.5">Recommendations:</strong>
                      <p className="text-[#334155]">{selectedReferral.response.recommendations}</p>
                    </div>

                    <div className="text-[10px] text-[#64748B] pt-2 border-t border-[#99F6E4]/50 flex justify-between">
                      <span>Drafted by: {selectedReferral.response.draftedBy} ({selectedReferral.response.draftedAt})</span>
                      {selectedReferral.response.approvedBy && (
                        <span className="font-bold text-[#0F766E]">Approved by: {selectedReferral.response.approvedBy}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB CONTENT 5: Solo Consultant Chamber & Multi-Location Manager ================= */}
      {activeTab === 'chamber_ops' && (
        <div className="space-y-6">
          {/* Chamber Switcher */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chambers.map((chm) => {
              const isSelected = selectedChamber.id === chm.id;
              return (
                <div
                  key={chm.id}
                  onClick={() => setSelectedChamberId(chm.id)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-white border-[#0F766E] shadow-md ring-2 ring-[#0F766E]/20' 
                      : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded">
                      {chm.branch}
                    </span>
                    {chm.activeToday && (
                      <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                        Chamber Active
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#0A192F] font-display">
                    {chm.name}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">{chm.room} · {chm.address}</p>

                  <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Operating Hours:</span>
                      <strong className="text-[#0A192F] font-mono">{chm.operatingHours}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Consultation Fee:</span>
                      <strong className="text-[#0F766E] font-bold">{formatBDT(chm.consultationFeeBDT)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Assistant:</span>
                      <span className="text-[#0A192F] font-medium">{chm.assignedAssistantName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chamber Assistant Operations & Privacy Delegation Overview */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
              <div>
                <h3 className="text-base font-bold text-[#0A192F] font-display">
                  Chamber Assistant & Staff Roles (Strict Privacy Guardrails)
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Assistants possess administrative queue & booking tools. Clinical consultation notes, diagnostic values, and prescription authoring are strictly restricted.
                </p>
              </div>

              <button
                onClick={() => setActiveView('assistant/workspace')}
                className="px-4 py-2 text-xs font-bold text-[#0F766E] bg-[#E6F4F1] hover:bg-[#CCFBF1] rounded-xl transition-colors whitespace-nowrap"
              >
                Open Assistant Workspace →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-2">
                <span className="font-bold text-[#0A192F] uppercase text-[10px] tracking-wider block">
                  Permitted Secretarial Functions
                </span>
                <ul className="space-y-1.5 text-[#334155]">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#15803D]" /> Booking appointment slots and registering phone bookings</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#15803D]" /> Marking patient arrival & issuing token serial numbers</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#15803D]" /> Managing real-time serial queue display in chamber lobby</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#15803D]" /> Collecting consultation fees and printing payment slips</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#15803D]" /> Document logistics: scanning paper files into physician inbox</li>
                </ul>
              </div>

              <div className="p-4 bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl space-y-2">
                <span className="font-bold text-[#991B1B] uppercase text-[10px] tracking-wider block">
                  Strictly Prohibited & Protected Clinical Information
                </span>
                <ul className="space-y-1.5 text-[#7F1D1D]">
                  <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-[#DC2626]" /> Doctor confidential consultation notes & mental health notes</li>
                  <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-[#DC2626]" /> Investigation parameter values (e.g., Creatinine, biopsy)</li>
                  <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-[#DC2626]" /> Prescription authoring or modification of drug dosages</li>
                  <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-[#DC2626]" /> Access to medical records of other hospital chambers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: Suspected Duplicate Candidate Review ================= */}
      {showDuplicateModal && duplicateCandidates[0] && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                <h3 className="text-base font-bold text-[#0A192F] font-display">
                  Suspected Duplicate Identity Review
                </h3>
              </div>
              <button onClick={() => setShowDuplicateModal(false)} className="text-[#94A3B8] hover:text-[#0A192F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              Under BMDC clinical governance, patient identities must never be merged automatically based on telephone or partial name matching. Please inspect both candidate profiles below:
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-[#F8FAFC] border border-[#0F766E] rounded-xl space-y-1">
                <span className="font-bold text-[#0F766E] block text-[11px]">Primary Active Record</span>
                <strong className="text-[#0A192F] block">{currentPatient.name}</strong>
                <p className="text-[#64748B]">MRN: {currentPatient.mrn}</p>
                <p className="text-[#64748B]">DOB: {currentPatient.dob} (Age 54)</p>
                <p className="text-[#64748B]">Phone: {currentPatient.phone}</p>
                <p className="text-[#64748B]">Address: Dhanmondi Road 12</p>
              </div>

              <div className="p-3.5 bg-[#FFFBEB] border border-[#FCD34D] rounded-xl space-y-1">
                <span className="font-bold text-[#B45309] block text-[11px]">Candidate Match (84%)</span>
                <strong className="text-[#0A192F] block">{duplicateCandidates[0].candidateName}</strong>
                <p className="text-[#64748B]">MRN: {duplicateCandidates[0].candidateMRN}</p>
                <p className="text-[#DC2626] font-bold">DOB: {duplicateCandidates[0].candidateDOB} (Age 52)</p>
                <p className="text-[#64748B]">Phone: {duplicateCandidates[0].candidatePhone}</p>
                <p className="text-[#64748B]">{duplicateCandidates[0].candidateAddress}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-[#0A192F] block">Supervisor Review Note</label>
              <textarea
                rows={2}
                value={duplicateActionNote}
                onChange={(e) => setDuplicateActionNote(e.target.value)}
                placeholder="Document verification reason (e.g. verified distinct individuals due to different national ID and birth dates)."
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                onClick={() => handleResolveDuplicate('confirmed_distinct')}
                className="px-4 py-2 text-xs font-bold text-[#0F766E] bg-[#E6F4F1] hover:bg-[#CCFBF1] rounded-xl transition-colors"
              >
                Confirm as Distinct Individuals (Keep Separate)
              </button>
              <button
                onClick={() => handleResolveDuplicate('merged')}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0A192F] hover:bg-[#1E293B] rounded-xl transition-colors shadow-xs"
              >
                Authorize Record Merge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: Referral Response Draft & Approval ================= */}
      {showReferralResponseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#0F766E]" />
                <h3 className="text-base font-bold text-[#0A192F] font-display">
                  Sign & Approve Second Opinion Response
                </h3>
              </div>
              <button onClick={() => setShowReferralResponseModal(false)} className="text-[#94A3B8] hover:text-[#0A192F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#0A192F] block mb-1">Clinical Findings</label>
                <textarea
                  rows={3}
                  value={responseFindings}
                  onChange={(e) => setResponseFindings(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#0A192F] block mb-1">Formal Recommendations to Referring Physician</label>
                <textarea
                  rows={3}
                  value={responseRecommendations}
                  onChange={(e) => setResponseRecommendations(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E]"
                />
              </div>

              <div className="p-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl text-[#14532D] text-[11px]">
                <strong>BMDC Digital Signature:</strong> By clicking approve, your BMDC digital verification stamp (Prof. Dr. Aisha Rahman, A-48291) will be affixed and transmitted to Chittagong Medical College Hospital.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                onClick={() => setShowReferralResponseModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveReferralResponse}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-xs"
              >
                Approve & Seal Second Opinion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: Clinical Annotation on Investigation ================= */}
      {showAnnotationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <h3 className="text-sm font-bold text-[#0A192F] font-display">
                Append Clinical Annotation
              </h3>
              <button onClick={() => setShowAnnotationModal(false)} className="text-[#94A3B8] hover:text-[#0A192F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-[#0A192F] block">Physician Clinical Annotation</label>
              <textarea
                rows={3}
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
                placeholder="e.g., Verified borderline Creatinine 1.34 mg/dL. Ordered repeat in 30 days. SGLT2i dose safe."
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
              <button
                onClick={() => setShowAnnotationModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAnnotation}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs"
              >
                Save Annotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
