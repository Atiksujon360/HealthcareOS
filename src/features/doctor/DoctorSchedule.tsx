import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Video, 
  Building2, 
  Plus, 
  CheckCircle2, 
  User, 
  Filter,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DoctorSchedule: React.FC = () => {
  const { appointments, setActiveView, language, t, formatNum, formatBDT } = useApp();
  const [selectedDay, setSelectedDay] = useState<string>('Thu Oct 16');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const days = [
    { label: language === 'bn' ? 'রবিবার' : 'Sun', full: 'Sun Oct 12', count: 18 },
    { label: language === 'bn' ? 'সোমবার' : 'Mon', full: 'Mon Oct 13', count: 16 },
    { label: language === 'bn' ? 'মঙ্গলবার' : 'Tue', full: 'Tue Oct 14', count: 20 },
    { label: language === 'bn' ? 'বুধবার' : 'Wed', full: 'Wed Oct 15', count: 15 },
    { label: language === 'bn' ? 'বৃহস্পতিবার' : 'Thu', full: 'Thu Oct 16', count: 14, current: true },
  ];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', 
    '11:30 AM', '12:00 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
  ];

  return (
    <div className="space-y-6">
      {/* Schedule Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0F766E] uppercase tracking-wider">
            {language === 'bn' ? 'ডাক্তার চেম্বার ক্যালেন্ডার ও সিরিয়াল তালিকা' : 'Physician Chamber Schedule & Serials'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-display tracking-tight">
            {t('chamberSchedule')}
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Evercare Hospital Dhaka (Level 4, Suite 408) & CareFlow TeleHealth BD
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-white border border-[#E2E8F0] rounded-xl shadow-2xs">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'day' ? 'bg-[#0F766E] text-white' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {language === 'bn' ? 'দৈনিক ভিউ' : 'Day Grid'}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-[#0F766E] text-white' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {language === 'bn' ? 'সাপ্তাহিক ভিউ' : 'Weekly Overview'}
            </button>
          </div>

          <button
            onClick={() => setActiveView('doctor/dashboard')}
            className="px-4 py-2 text-xs font-semibold text-[#0F766E] bg-[#E6F4F1] hover:bg-[#CCFBF1] rounded-xl transition-colors"
          >
            {t('navOverview')}
          </button>
        </div>
      </div>

      {/* Week Strip Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {days.map((day) => (
          <button
            key={day.full}
            onClick={() => setSelectedDay(day.full)}
            className={`p-4 rounded-3xl border text-left transition-all ${
              selectedDay === day.full
                ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-sm'
                : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#CBD5E1]'
            }`}
          >
            <span className={`text-xs block ${selectedDay === day.full ? 'text-[#99F6E4]' : 'text-[#64748B]'}`}>
              {day.label}
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-lg font-bold font-mono tabular-nums">{formatNum(day.count)} {language === 'bn' ? 'সিরিয়াল' : 'Serials'}</span>
              {day.current && (
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  selectedDay === day.full ? 'bg-[#0F766E] text-white' : 'bg-[#E6F4F1] text-[#0F766E]'
                }`}>
                  {language === 'bn' ? 'আজ' : 'Today'}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Hourly Chamber Grid */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#0F766E]" />
            <h3 className="font-bold text-sm text-[#0A192F] font-display">
              {language === 'bn' ? 'চেম্বার স্লট তালিকা:' : 'Chamber Slots for'} {selectedDay}
            </h3>
          </div>
          <span className="text-xs text-[#64748B] font-mono">
            {language === 'bn' ? 'চেম্বার ভিজিট ফি:' : 'Consultation Fee:'} {formatBDT(1500)} (Evercare OPD)
          </span>
        </div>

        <div className="divide-y divide-[#F1F5F9]">
          {timeSlots.map((slot) => {
            const matchedAppointment = appointments.find((a) => a.time.startsWith(slot.slice(0, 5)));

            return (
              <div key={slot} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC]">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 font-mono font-bold text-xs text-[#0A192F] tabular-nums shrink-0">
                    {formatNum(slot)}
                  </div>

                  {matchedAppointment ? (
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        matchedAppointment.type === 'Virtual Video' ? 'bg-[#EEE9FF] text-[#4F7DF3]' : 'bg-[#E6F4F1] text-[#0F766E]'
                      }`}>
                        {matchedAppointment.type === 'Virtual Video' ? <Video className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#0A192F] truncate">{matchedAppointment.patientName}</span>
                          <span className="text-[10px] text-[#64748B] font-mono">{formatNum(matchedAppointment.patientAge)}y / {matchedAppointment.patientBloodType}</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] truncate">{matchedAppointment.reason}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-[#94A3B8] italic">
                      {language === 'bn' ? 'স্লট উন্মুক্ত (অপেক্ষায়)' : 'Slot Available for Booking'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {matchedAppointment ? (
                    <button
                      onClick={() => setActiveView('doctor/consultations/enc-2026-101')}
                      className="px-3 py-1.5 text-xs font-semibold text-[#0F766E] bg-[#E6F4F1] hover:bg-[#CCFBF1] rounded-xl transition-colors whitespace-nowrap"
                    >
                      {t('openWorkspace')}
                    </button>
                  ) : (
                    <button 
                      onClick={() => setActiveView('doctor/dashboard')}
                      className="px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0A192F] hover:bg-[#F1F5F9] rounded-xl transition-colors"
                    >
                      + {t('bookPatient')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
