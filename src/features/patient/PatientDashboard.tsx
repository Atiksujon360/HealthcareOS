import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Pill, 
  Truck, 
  Video, 
  Building2, 
  ChevronRight, 
  CheckCircle2, 
  Plus, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Download,
  ExternalLink,
  MapPin,
  RefreshCw,
  CreditCard,
  Phone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PatientDashboard: React.FC = () => {
  const { 
    currentUser, 
    appointments, 
    activeConsultation, 
    deliveries, 
    addToast, 
    addAppointment,
    dispensePrescription,
    setActiveView,
    t,
    language,
    formatBDT,
    formatNum
  } = useApp();

  // Booking Flow State
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('Prof. Dr. Aisha Rahman');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('Internal Medicine & Endocrinology');
  const [selectedConsultType, setSelectedConsultType] = useState<'In-person' | 'Virtual Video'>('In-person');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-22');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('11:00 AM');
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  // Patient appointments
  const patientAppointments = appointments.filter(a => a.patientName.includes('Rafiqul'));
  const nextAppointment = patientAppointments[0];

  // Active delivery
  const activeDelivery = deliveries.find(d => d.recipientName.includes('Rafiqul') && d.status !== 'delivered') || deliveries[0];

  const handleCompleteBooking = () => {
    addAppointment({
      patientId: 'pat-101',
      patientName: 'Mr. Rafiqul Islam',
      patientAge: 54,
      patientGender: 'Male',
      patientBloodType: 'B+',
      doctorId: 'doc-001',
      doctorName: selectedDoctor,
      doctorSpecialty: selectedSpecialty,
      date: selectedDate,
      time: selectedTimeSlot,
      durationMinutes: 30,
      type: selectedConsultType,
      clinicName: selectedConsultType === 'In-person' ? 'Evercare Hospital Dhaka' : 'CareFlow TeleHealth BD',
      room: selectedConsultType === 'In-person' ? 'Suite 408' : undefined,
      reason: 'Routine metabolic restaging and diabetic review',
      status: 'scheduled',
      priority: 'routine',
    });
    setBookingConfirmed(true);
  };

  const handleOrderPrescriptionRefill = (drugName: string, rxId: string) => {
    dispensePrescription(rxId);
    addToast({
      type: 'success',
      title: language === 'bn' ? 'ফার্মেসি ডেলিভারি অর্ডার গৃহীত হয়েছে' : 'Pharmacy Order Dispatched to Dispatch Hub',
      message: language === 'bn' 
        ? `${drugName} এর রিফিল অর্ডারটি কেয়ারফ্লো গুলশান হাব থেকে ধানমন্ডি ঠিকানায় প্রেরণের জন্য প্রস্তুত করা হচ্ছে।`
        : `Your refill request for ${drugName} has been routed to CareFlow Central Pharmacy (Gulshan) for bike courier delivery to Dhanmondi.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
            <span>{language === 'bn' ? 'কেয়ারফ্লো রোগী ড্যাশবোর্ড · ধানমন্ডি, ঢাকা' : 'CareFlow Patient Hub · Dhanmondi, Dhaka'}</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-[#0A192F] font-bold">{t('healthCardLabel')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-display tracking-tight">
            {t('patientGreeting')} {currentUser.name}
          </h1>
          <p className="text-sm text-[#64748B] mt-1.5 max-w-2xl leading-relaxed">
            {t('patientSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setBookingStep(1);
              setBookingConfirmed(false);
              setShowBookingModal(true);
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            {t('bookSpecialistChamber')}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Next Appointment, Active Prescriptions, Medical Records */}
        <div className="lg:col-span-8 space-y-6">
          {/* Next Appointment Hero Card */}
          {nextAppointment && (
            <div className="bg-gradient-to-br from-[#0A192F] via-[#132E4F] to-[#0F766E] text-white rounded-3xl p-6 lg:p-7 shadow-sm">
              <div className="flex items-center justify-between text-xs text-[#99F6E4] mb-3">
                <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#2DD4BF]" />
                  {t('nextConsultation')}
                </span>
                <span className="bg-white/10 px-2.5 py-0.5 rounded text-[11px] font-mono border border-white/10">
                  {nextAppointment.type}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <h3 className="text-xl font-bold font-display">{nextAppointment.doctorName}</h3>
                  <p className="text-xs text-[#CBD5E1] mt-0.5">
                    {nextAppointment.doctorSpecialty} · {nextAppointment.clinicName}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-[#99F6E4]">
                      <Clock className="w-4 h-4" />
                      <span>{nextAppointment.date} at {nextAppointment.time}</span>
                    </div>
                    {nextAppointment.room && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-4 h-4" />
                        <span>{nextAppointment.room}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {nextAppointment.type === 'Virtual Video' ? (
                    <button className="px-5 py-2.5 bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0A192F] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs">
                      <Video className="w-4 h-4" />
                      {t('joinTelehealth')}
                    </button>
                  ) : (
                    <button className="px-5 py-2.5 bg-white hover:bg-slate-100 text-[#0A192F] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs">
                      <Building2 className="w-4 h-4 text-[#0F766E]" />
                      {t('directionsAndQueue')}
                    </button>
                  )}
                  <span className="text-[10px] text-center text-slate-300 font-mono">
                    Chamber Serial: EVR-101 · Status: In Consultation
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Active Prescriptions & Refill Orders */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0A192F] font-display">
                  {t('activePrescriptions')}
                </h3>
                <p className="text-xs text-[#64748B]">
                  Authorized by Prof. Dr. Aisha Rahman (BMDC: A-48291)
                </p>
              </div>
              <span className="text-xs font-semibold text-[#0F766E] bg-[#E6F4F1] px-2.5 py-0.5 rounded-full">
                CareFlow Rx Home Delivery
              </span>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {activeConsultation.prescriptions.map((rx) => (
                <div key={rx.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC]">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0A192F]">{rx.drugName}</span>
                        <span className="text-xs font-mono font-semibold text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded">
                          {rx.dosage}
                        </span>
                      </div>
                      <p className="text-xs text-[#475569] mt-1">
                        {rx.frequency} · {rx.duration}
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        {rx.instructions}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {rx.dispensed ? (
                      <span className="text-xs text-[#15803D] bg-[#DCFCE7] px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {language === 'bn' ? 'ডেলিভারি প্রস্তুত' : 'Refill Active'}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOrderPrescriptionRefill(rx.drugName, rx.id)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-2xs whitespace-nowrap"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        {t('orderHomeDelivery')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Lab Reports */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#0A192F] font-display">
                  {t('recentLabReports')}
                </h3>
                <p className="text-xs text-[#64748B]">Integrated with Popular Diagnostic Centre & Evercare Laboratory</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Comprehensive Metabolic Restaging (HbA1c & Fasting Glucose)', date: '14 Oct 2026', lab: 'Popular Diagnostic Centre, Dhanmondi', status: 'Verified' },
                { title: 'Serum Lipid Profile & Renal Function Panel', date: '12 Aug 2026', lab: 'Evercare Hospital Dhaka Central Lab', status: 'Verified' },
              ].map((rep, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[#E2E8F0] flex items-center justify-between gap-4 hover:border-[#CBD5E1]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EEE9FF] text-[#4F7DF3] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-[#0A192F]">{rep.title}</h4>
                      <p className="text-[11px] text-[#64748B] mt-0.5">{rep.lab} · {rep.date}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => addToast({
                      type: 'info',
                      title: language === 'bn' ? 'পিডিএফ রিপোর্ট তৈরি হচ্ছে' : 'Generating PDF Report',
                      message: language === 'bn' ? 'পপুলার ডায়াগনস্টিক সেন্টারের অফিসিয়াল সিলসহ রিপোর্ট ডাউনলোড শুরু হয়েছে।' : 'Official signed PDF report from Popular Diagnostic Centre downloaded.',
                    })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F766E] bg-[#E6F4F1] hover:bg-[#CCFBF1] rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t('downloadPdf')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Live Medicine Delivery, Insurance, Family Dependants */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Delivery Status Card */}
          {activeDelivery && (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  {t('deliveryInTransit')}
                </span>
                <span className="text-[11px] font-mono text-[#4F7DF3] bg-[#EEE9FF] px-2 py-0.5 rounded font-semibold uppercase">
                  {activeDelivery.status}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-sm text-[#0A192F]">{activeDelivery.itemsSummary}</h4>
                  <p className="text-[#64748B] text-[11px] mt-0.5">Order #{activeDelivery.id} · CareFlow Central Pharmacy</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                  <div className="flex justify-between text-[#64748B]">
                    <span>{t('estimatedArrival')}:</span>
                    <span className="font-bold text-[#0F766E]">35 mins</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Rider:</span>
                    <span className="font-medium text-[#0A192F]">Shamim Akhter (Bike #28)</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Phone:</span>
                    <span className="font-mono text-[#0A192F]">+880 1844-992140</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setActiveView('delivery/dashboard')}
                    className="w-full py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'রাইডারের অবস্থান লাইভ ম্যাপে দেখুন' : 'Live Delivery Map'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Corporate Health Insurance Card */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-4">
              <span className="font-semibold uppercase tracking-wider">{t('corporateCardPayment')}</span>
              <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
            </div>

            <p className="text-base font-bold font-display">Green Delta Health Insurance</p>
            <p className="text-xs text-slate-400 mt-0.5">Executive Health Benefit Scheme</p>

            <div className="mt-5 pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">CARD NUMBER</span>
                <span className="text-[#99F6E4] font-bold">•••• •••• •••• 9942</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">COVERAGE</span>
                <span className="text-[#2DD4BF] font-bold">{formatBDT(500000)} / yr</span>
              </div>
            </div>
          </div>

          {/* Family Dependants Registered */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#0A192F] font-display">
                {language === 'bn' ? 'পরিবারের নির্ভরশীল সদস্যবৃন্দ' : 'Registered Family Dependants'}
              </h3>
              <button 
                onClick={() => addToast({
                  type: 'info',
                  title: language === 'bn' ? 'নতুন সদস্য যুক্ত করুন' : 'Add Dependant',
                  message: language === 'bn' ? 'আপনার কর্পোরেট স্বাস্থ্য কার্ডে পরিবারভুক্ত করুন।' : 'Add spouse, children, or elderly parents under family coverage.',
                })}
                className="text-xs font-semibold text-[#0F766E] hover:underline"
              >
                + {language === 'bn' ? 'যুক্ত করুন' : 'Add'}
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Begum Nasreen Sultana', relation: 'Spouse', age: 48, blood: 'O+' },
                { name: 'Samiur Islam', relation: 'Son', age: 21, blood: 'B+' },
              ].map((dep, idx) => (
                <div key={idx} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#0A192F]">{dep.name}</h4>
                    <p className="text-[11px] text-[#64748B]">{dep.relation} · {formatNum(dep.age)}y · Blood {dep.blood}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setBookingStep(1);
                      setShowBookingModal(true);
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#0F766E] bg-[#E6F4F1] hover:bg-[#CCFBF1] rounded-lg"
                  >
                    {language === 'bn' ? 'সিরিয়াল দিন' : 'Book'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Booking 5-Step Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            {!bookingConfirmed ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div>
                    <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider">
                      {t('step')} {formatNum(bookingStep)} {t('of')} {formatNum(5)}
                    </span>
                    <h3 className="text-base font-bold text-[#0A192F] font-display">
                      {t('bookAppointmentModalTitle')}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowBookingModal(false)}
                    className="text-[#94A3B8] hover:text-[#0F172A] text-lg font-bold"
                  >
                    ×
                  </button>
                </div>

                {/* Step 1: Doctor / Specialty */}
                {bookingStep === 1 && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#64748B]">{t('selectDoctor')}:</p>
                    <div className="space-y-2">
                      {[
                        { name: 'Prof. Dr. Aisha Rahman', specialty: 'Internal Medicine & Endocrinology (Evercare & Square)', fee: 1500 },
                        { name: 'Dr. Tanvir Ahmed', specialty: 'Cardiology (NICVD & United Hospital, Gulshan)', fee: 1500 },
                        { name: 'Dr. Farhana Yasmin', specialty: 'Gynecology & Obstetrics (DMCH & Popular Dhanmondi)', fee: 1200 },
                      ].map((doc) => (
                        <div
                          key={doc.name}
                          onClick={() => {
                            setSelectedDoctor(doc.name);
                            setSelectedSpecialty(doc.specialty);
                          }}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            selectedDoctor === doc.name
                              ? 'bg-[#E6F4F1] border-[#0F766E] text-[#0A192F]'
                              : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-[#0A192F]">{doc.name}</span>
                            <span className="text-xs font-mono font-bold text-[#0F766E]">{formatBDT(doc.fee)}</span>
                          </div>
                          <p className="text-xs text-[#64748B] mt-0.5">{doc.specialty}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Clinic Location or Virtual */}
                {bookingStep === 2 && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#64748B]">
                      {language === 'bn' ? 'পরামর্শের ধরন নির্বাচন করুন:' : 'Select consultation delivery modality:'}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setSelectedConsultType('In-person')}
                        className={`p-4 rounded-xl border cursor-pointer text-center transition-all ${
                          selectedConsultType === 'In-person'
                            ? 'bg-[#E6F4F1] border-[#0F766E]'
                            : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                        }`}
                      >
                        <Building2 className="w-8 h-8 text-[#0F766E] mx-auto mb-2" />
                        <span className="font-bold text-xs text-[#0A192F] block">
                          {language === 'bn' ? 'হাসপাতাল চেম্বার' : 'In-Person Hospital Chamber'}
                        </span>
                        <span className="text-[10px] text-[#64748B] mt-1 block">Evercare Hospital Dhaka / Square</span>
                      </div>
                      <div
                        onClick={() => setSelectedConsultType('Virtual Video')}
                        className={`p-4 rounded-xl border cursor-pointer text-center transition-all ${
                          selectedConsultType === 'Virtual Video'
                            ? 'bg-[#E6F4F1] border-[#0F766E]'
                            : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                        }`}
                      >
                        <Video className="w-8 h-8 text-[#4F7DF3] mx-auto mb-2" />
                        <span className="font-bold text-xs text-[#0A192F] block">
                          {language === 'bn' ? 'অনলাইন টেলিমেডিসিন' : 'Online Video TeleHealth'}
                        </span>
                        <span className="text-[10px] text-[#64748B] mt-1 block">CareFlow TeleHealth BD Video</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Date selection */}
                {bookingStep === 3 && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#64748B]">{t('selectDateTime')}:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-27'].map((d) => (
                        <button
                          key={d}
                          onClick={() => setSelectedDate(d)}
                          className={`p-3 rounded-xl border text-center transition-all text-xs ${
                            selectedDate === d
                              ? 'bg-[#0A192F] text-white font-bold'
                              : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Available Time Slot */}
                {bookingStep === 4 && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#64748B]">
                      {language === 'bn' ? 'উপযুক্ত চেম্বার সময় নির্বাচন করুন:' : 'Select chamber time slot:'}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {['10:00 AM', '11:00 AM', '12:15 PM', '04:00 PM', '05:30 PM', '06:45 PM'].map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`p-3 rounded-xl border font-mono text-center transition-all text-xs ${
                            selectedTimeSlot === slot
                              ? 'bg-[#0F766E] text-white font-bold'
                              : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Review & Confirm */}
                {bookingStep === 5 && (
                  <div className="space-y-3 text-xs">
                    <p className="text-[#64748B]">
                      {language === 'bn' ? 'বুকিং চূড়ান্ত করার পূর্বে বিবরণ পর্যালোচনা করুন:' : 'Review your booking details before final confirmation:'}
                    </p>
                    <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">{t('doctor')}:</span>
                        <span className="font-bold text-[#0A192F]">{selectedDoctor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Specialty:</span>
                        <span className="text-[#0A192F]">{selectedSpecialty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Modality:</span>
                        <span className="text-[#0A192F] font-medium">{selectedConsultType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">{t('date')} & {t('time')}:</span>
                        <span className="font-mono font-bold text-[#0F766E]">{selectedDate} at {selectedTimeSlot}</span>
                      </div>
                      <div className="flex justify-between border-t border-[#E2E8F0] pt-2">
                        <span className="text-[#64748B]">Consultation Fee:</span>
                        <span className="font-mono font-bold text-[#0A192F]">{formatBDT(1500)} (Pay via bKash / Cash)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                  {bookingStep > 1 ? (
                    <button
                      onClick={() => setBookingStep(bookingStep - 1)}
                      className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
                    >
                      {language === 'bn' ? 'পূর্ববর্তী' : 'Back'}
                    </button>
                  ) : (
                    <div />
                  )}

                  {bookingStep < 5 ? (
                    <button
                      onClick={() => setBookingStep(bookingStep + 1)}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl"
                    >
                      {language === 'bn' ? 'পরবর্তী' : 'Continue'}
                    </button>
                  ) : (
                    <button
                      onClick={handleCompleteBooking}
                      className="px-5 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs"
                    >
                      {t('confirmBooking')}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#0A192F] font-display">{t('appointmentConfirmed')}</h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
                  Your appointment with <strong>{selectedDoctor}</strong> is booked for <strong>{selectedDate} at {selectedTimeSlot}</strong>. SMS confirmation with token sent to +880 1711-238910.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
