import React, { useState } from 'react';
import { 
  Search, 
  Phone, 
  Mail, 
  ShieldCheck, 
  AlertTriangle,
  Stethoscope,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PatientRecord } from '../../types';

export const DoctorPatients: React.FC = () => {
  const { 
    patientRecords, 
    setActiveView, 
    language, 
    t, 
    formatNum,
    careGaps,
    setActiveCareLoopPatientId
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(patientRecords[0] || null);

  const filtered = patientRecords.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.chronicConditions.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0F766E] uppercase tracking-wider">
            {language === 'bn' ? 'রোগী রেজিস্ট্রি ও ইএমআর ডিরেক্টরি' : 'EMR Patient Registry'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-display tracking-tight">
            {t('navPatients')}
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Evercare Hospital Dhaka & Popular Diagnostic Centre authorized patient directory
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'নাম, এমআরএন বা রোগ দিয়ে খুঁজুন...' : 'Search by name, MRN, condition...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E]"
          />
        </div>
      </div>

      {/* Main Grid: Patients List (Left) & Selected Patient Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Patient Table/List (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center text-xs text-[#64748B]">
            <span className="font-semibold text-[#0A192F]">
              {language === 'bn' ? 'নিবন্ধিত রোগী' : 'Registered Patients'} ({formatNum(filtered.length)})
            </span>
            <span>MRN & {language === 'bn' ? 'সর্বশেষ সাক্ষাত' : 'Last Visit'}</span>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {filtered.map((patient) => {
              const isSelected = selectedPatient?.id === patient.id;
              const gaps = careGaps.filter(g => g.patientId === patient.id && (g.status === 'active' || g.status === 'in_progress'));
              const hasCritical = gaps.some(g => g.severity === 'critical');

              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#E6F4F1]/70 border-l-4 border-l-[#0F766E]' : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-[#E2E8F0] text-[#0A192F] flex items-center justify-center font-bold text-xs shrink-0 font-display">
                      {patient.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0A192F] truncate font-display">{patient.name}</span>
                        <span className="text-xs text-[#64748B]">{formatNum(patient.age)}y {patient.gender}</span>
                      </div>
                      <p className="text-xs text-[#64748B] truncate mt-0.5">
                        {patient.chronicConditions.join(' · ')}
                      </p>
                      {gaps.length > 0 && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                          hasCritical ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#FFFBEB] text-[#B45309]'
                        }`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          {formatNum(gaps.length)} {language === 'bn' ? 'কেয়ার গ্যাপ' : 'Care Gaps'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[#0A192F] block">{patient.mrn}</span>
                    <span className="text-[10px] text-[#0F766E] font-medium">Last: {patient.lastVisit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Patient Detail Panel (5 Cols) */}
        <div className="lg:col-span-5">
          {selectedPatient ? (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-base font-bold text-[#0A192F] font-display">{selectedPatient.name}</h3>
                  <p className="text-xs text-[#64748B] font-mono">{selectedPatient.mrn} · Blood {selectedPatient.bloodType}</p>
                </div>
                <button
                  onClick={() => setActiveView('doctor/consultations/enc-2026-101')}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  {t('openWorkspace')}
                </button>
              </div>

              {/* CareLoop Continuity Summary */}
              {(() => {
                const pGaps = careGaps.filter(g => g.patientId === selectedPatient.id && (g.status === 'active' || g.status === 'in_progress'));
                return (
                  <div className="p-4 bg-gradient-to-r from-[#F0FDFA] to-[#E6F4F1] border border-[#99F6E4] rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F766E] uppercase tracking-wider font-display">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>CareLoop Continuity</span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-[#0F766E] border border-[#99F6E4]">
                        {formatNum(pGaps.length)} {language === 'bn' ? 'সক্রিয় গ্যাপ' : 'Active Gaps'}
                      </span>
                    </div>
                    <p className="text-xs text-[#334155] leading-relaxed mb-3">
                      {pGaps.length > 0 
                        ? pGaps.map(g => g.title).join(' · ')
                        : (language === 'bn' ? 'ক্লিনিক্যাল কন্টিনিউইটি সন্তোষজনক। কোনো অমীমাংসিত কেয়ার গ্যাপ নেই।' : 'Continuity status optimal. No unresolved care gaps.')}
                    </p>
                    <button
                      onClick={() => {
                        setActiveCareLoopPatientId(selectedPatient.id);
                        setActiveView('doctor/careloop');
                      }}
                      className="w-full py-2 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                    >
                      <span>{language === 'bn' ? 'কেয়ারলুপ প্রিভেনশন কনসোল খুলুন' : 'Open CareLoop Prevention'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })()}

              {/* Allergy Warning */}
              <div className="p-3.5 bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl">
                <span className="text-xs font-bold text-[#B91C1C] flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t('allergies')}
                </span>
                <p className="text-xs text-[#7F1D1D] font-medium">
                  {selectedPatient.allergies.join(', ') || (language === 'bn' ? 'কোন ওষুধে এলার্জি নেই' : 'No known drug allergies reported')}
                </p>
              </div>

              {/* Chronic Conditions */}
              <div>
                <span className="text-xs font-bold text-[#0A192F] block uppercase tracking-wider mb-2 font-display">
                  {language === 'bn' ? 'দীর্ঘস্থায়ী রোগ ও সমস্যা' : 'Chronic Diagnoses'}
                </span>
                <div className="space-y-1.5">
                  {selectedPatient.chronicConditions.map((cond, idx) => (
                    <div key={idx} className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A]">
                      {cond}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact & Insurance */}
              <div className="space-y-2.5 pt-3 border-t border-[#F1F5F9] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {t('phone')}:
                  </span>
                  <span className="text-[#0A192F] font-mono font-medium">{selectedPatient.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {t('email')}:
                  </span>
                  <span className="text-[#0A192F]">{selectedPatient.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Insurance:
                  </span>
                  <span className="text-[#0A192F] font-medium text-right max-w-[210px] truncate">
                    {selectedPatient.insuranceProvider}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 text-center text-xs text-[#64748B]">
              Select a patient from the roster to inspect EMR details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
