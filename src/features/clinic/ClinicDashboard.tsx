import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Clock, 
  Stethoscope, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  ShieldCheck, 
  ArrowUpRight,
  ChevronRight,
  Filter,
  Plus,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ClinicDashboard: React.FC = () => {
  const { 
    clinicQueue, 
    advanceQueue, 
    appointments, 
    selectedBranch, 
    setSelectedBranch,
    addToast,
    t,
    language,
    formatBDT,
    formatNum
  } = useApp();

  const [activeTab, setActiveTab] = useState<'queue' | 'staff' | 'facilities' | 'billing'>('queue');

  const doctorsRoster = [
    { name: 'Prof. Dr. Aisha Rahman', dept: 'Internal Medicine & Endocrinology', status: 'In Consultation (Suite 408)', onDuty: true, patientsSeen: 8 },
    { name: 'Dr. Tanvir Ahmed', dept: 'Cardiology (NICVD & United)', status: 'Available (Chamber 201)', onDuty: true, patientsSeen: 6 },
    { name: 'Dr. Farhana Yasmin', dept: 'Gynecology & Obstetrics (DMCH)', status: 'Labour Suite / Rounds', onDuty: true, patientsSeen: 11 },
    { name: 'Dr. Kazi Mahfuzur Rahman', dept: 'Orthopedics & Spine (BSMMU)', status: 'OT / Post-Op Review', onDuty: true, patientsSeen: 4 },
  ];

  const facilities = [
    { name: 'Consultation Suite 408', type: 'Specialist Examination', occupant: 'Prof. Dr. Aisha Rahman', status: 'Occupied' },
    { name: 'Executive Chamber 201', type: 'Cardiology Consultation', occupant: 'Dr. Tanvir Ahmed', status: 'Available' },
    { name: 'Triage Room 1', type: 'Nurse Triage & Vitals Check', occupant: 'Sister Salma Begum, RN', status: 'Occupied' },
    { name: 'Phlebotomy Bay A', type: 'Popular Diagnostic Collection', occupant: 'Lab Technologist', status: 'Occupied' },
    { name: 'Day Care Suite 3', type: 'Observation & Dialysis', occupant: 'Sterilization in progress', status: 'Maintenance' },
  ];

  return (
    <div className="space-y-6">
      {/* Clinic Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
            <span>{language === 'bn' ? 'হাসপাতাল ও ক্লিনিক অপারেশন কন্ট্রোল · ঢাকা শাখা' : 'Hospital Operations Control · Dhaka Branch'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-display tracking-tight">
            {t('clinicOpsTitle')}
          </h1>
          <p className="text-sm text-[#64748B] mt-1.5 max-w-2xl leading-relaxed">
            {t('clinicOpsSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            onClick={() => addToast({ 
              type: 'info', 
              title: language === 'bn' ? 'দৈনিক রোস্টার এক্সপোর্ট সম্পন্ন' : 'Day Roster Exported', 
              message: language === 'bn' ? 'হাসপাতালের ওপিডি সিরিয়াল তালিকা ডাউনলোড হয়েছে।' : 'Hospital OPD manifest exported with serial numbers.' 
            })}
            className="px-4 py-2.5 text-xs font-semibold text-[#0A192F] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl transition-colors whitespace-nowrap"
          >
            {t('exportManifest')}
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Active Visits Today</span>
            <div className="w-8 h-8 rounded-xl bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0A192F] font-mono tabular-nums">{formatNum(48)}</span>
            <span className="text-[11px] font-medium text-[#15803D]">+8% vs yesterday</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            {language === 'bn' ? 'ঢাকা ও চট্টগ্রাম হাসপাতাল শাখা' : 'Dhaka & Chattogram Facilities'}
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">{t('liveTokenQueue')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0A192F] font-mono tabular-nums">
              {formatNum(clinicQueue.filter(q => q.status === 'waiting' || q.status === 'in-triage').length)}
            </span>
            <span className="text-[11px] font-medium text-[#B45309]">{t('avgWait')}</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            {language === 'bn' ? 'অপেক্ষার সময়সীমা: < ২০ মিনিট' : 'Target SLA: < 20 mins'}
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">{t('activePhysicians')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0A192F] font-mono tabular-nums">{formatNum(4)} / {formatNum(4)}</span>
            <span className="text-[11px] font-medium text-[#15803D]">{formatNum(100)}% {language === 'bn' ? 'উপস্থিত' : 'active'}</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            {language === 'bn' ? 'সকল স্পেশালিস্ট উপস্থিত' : 'All Specialists Checked-In'}
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">{t('revenueSettled')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#EEE9FF] text-[#4F7DF3] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0A192F] font-mono tabular-nums">{formatBDT(71400)}</span>
            <span className="text-[11px] font-medium text-[#15803D]">+14%</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            {language === 'bn' ? 'কনসালটেশন ও ডায়াগনস্টিক ফি' : 'Consultation & Diagnostics'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E2E8F0] pb-px">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'queue' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-[#64748B]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          {t('liveTokenQueue')} ({formatNum(clinicQueue.length)})
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'staff' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-[#64748B]'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          {t('specialistRoster')}
        </button>
        <button
          onClick={() => setActiveTab('facilities')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'facilities' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-[#64748B]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          {t('suiteOccupancy')}
        </button>
      </div>

      {/* Tab 1: Live Patient Queue Manager */}
      {activeTab === 'queue' && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0A192F] font-display">
                {language === 'bn' ? 'রোগী টোকেন ট্রায়াজ ও আগমন কিউ' : 'Patient Token Triage & Arrival Queue'}
              </h3>
              <p className="text-xs text-[#64748B]">
                Centralized display for Evercare Hospital Level-4 OPD Reception
              </p>
            </div>
            <span className="text-xs text-[#0F766E] font-mono font-bold bg-[#E6F4F1] px-2.5 py-1 rounded-lg">
              Main Reception Screen
            </span>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {clinicQueue.map((item) => (
              <div key={item.ticketNumber} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-14 rounded-2xl bg-[#0A192F] text-white flex flex-col items-center justify-center font-mono font-bold text-xs shrink-0 shadow-2xs">
                    <span className="text-[9px] text-[#99F6E4] tracking-wider">{t('token')}</span>
                    <span className="text-sm">{item.ticketNumber}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0A192F] font-display">{item.patientName}</span>
                      <span className="text-xs text-[#64748B]">· {item.department}</span>
                    </div>
                    <p className="text-xs text-[#475569] mt-0.5">
                      {t('doctor')}: <strong className="text-[#0F766E]">{item.doctorName}</strong> · Arrived at {item.arrivalTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className={`text-xs px-2.5 py-1 rounded-md font-semibold capitalize block ${
                      item.status === 'with-doctor'
                        ? 'bg-[#DCFCE7] text-[#15803D]'
                        : item.status === 'in-triage'
                        ? 'bg-[#E6F4F1] text-[#0F766E]'
                        : item.status === 'completed'
                        ? 'bg-[#F1F5F9] text-[#64748B]'
                        : 'bg-[#FEF3C7] text-[#B45309]'
                    }`}>
                      {item.status === 'with-doctor' ? t('inChamber') : item.status.replace('-', ' ')}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] font-mono block mt-0.5">Wait: {formatNum(item.waitTimeMins)}m</span>
                  </div>

                  {item.status !== 'completed' && (
                    <button
                      onClick={() => advanceQueue(item.ticketNumber)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors whitespace-nowrap shadow-2xs"
                    >
                      {t('advanceSerial')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Specialists Roster */}
      {activeTab === 'staff' && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0A192F] font-display">{t('specialistRoster')}</h3>
              <p className="text-xs text-[#64748B]">BMDC verified physicians and current OPD chamber availability</p>
            </div>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {doctorsRoster.map((doc, idx) => (
              <div key={idx} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#F8FAFC]">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6F4F1] text-[#0F766E] font-bold text-xs flex items-center justify-center font-display">
                    {doc.name.slice(doc.name.indexOf(' ') + 1, doc.name.indexOf(' ') + 3).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0A192F]">{doc.name}</h4>
                    <p className="text-xs text-[#64748B]">{doc.dept}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#0F766E] bg-[#E6F4F1] px-2.5 py-1 rounded-md">
                    {doc.status}
                  </span>
                  <span className="text-xs text-[#64748B] font-mono hidden sm:inline">
                    {formatNum(doc.patientsSeen)} {language === 'bn' ? 'রোগী সম্পন্ন' : 'patients seen'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Facilities */}
      {activeTab === 'facilities' && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0]">
            <h3 className="text-base font-bold text-[#0A192F] font-display">{t('suiteOccupancy')}</h3>
            <p className="text-xs text-[#64748B]">OPD chamber status, diagnostic suites, and sanitization schedules</p>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {facilities.map((fac, idx) => (
              <div key={idx} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#F8FAFC]">
                <div>
                  <h4 className="font-bold text-sm text-[#0A192F]">{fac.name}</h4>
                  <p className="text-xs text-[#64748B]">{fac.type} · Occupant: {fac.occupant}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                  fac.status === 'Occupied' 
                    ? 'bg-[#FEF3C7] text-[#B45309]' 
                    : fac.status === 'Available'
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : 'bg-[#F1F5F9] text-[#64748B]'
                }`}>
                  {fac.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
