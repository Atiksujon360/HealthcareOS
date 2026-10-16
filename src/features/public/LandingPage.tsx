import React from 'react';
import { 
  Activity, 
  Stethoscope, 
  Users, 
  Building2, 
  Pill, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Zap, 
  Calendar,
  Layers,
  FileCheck,
  PhoneCall,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const LandingPage: React.FC = () => {
  const { setCurrentRole, setActiveView, t, language, formatBDT } = useApp();

  const handleLaunchRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const portalCards: { role: UserRole; title: string; subtitle: string; icon: React.ElementType; color: string; badge: string; highlights: string[] }[] = [
    {
      role: 'doctor',
      title: language === 'bn' ? 'ডাক্তার পোর্টাল ও চেম্বার ওয়ার্কস্পেস' : 'Doctor Portal & BMDC Workspace',
      subtitle: language === 'bn' 
        ? 'ডিজিটাল প্রেসক্রিপশন প্যাড (℞), বিএমডিসি রেজিস্ট্রেশন এবং চেম্বার সময়সূচি সহ আধুনিক ক্লিনিক্যাল ওয়ার্কস্পেস।'
        : 'The clinical benchmark for Bangladeshi doctors with digital prescription pads (℞), BMDC registration codes, and chamber scheduling.',
      icon: Stethoscope,
      color: '#0F766E',
      badge: 'Flagship Benchmark',
      highlights: [
        language === 'bn' ? 'অফিসিয়াল বিএমডিসি প্রেসক্রিপশন প্যাড' : 'Official BMDC prescription generator',
        language === 'bn' ? 'স্কয়ার, ইনসেপ্টা ও রেনেটা ঔষধ তালিকা' : 'Square, Incepta & Renata drug formulas',
        language === 'bn' ? 'চেম্বার কিউ ও অ্যাপয়েন্টমেন্ট শিডিউল' : 'Chamber queue and appointment manager'
      ],
    },
    {
      role: 'patient',
      title: language === 'bn' ? 'রোগী স্বাস্থ্য পোর্টাল ও বুকিং' : 'Patient Health Hub & Booking',
      subtitle: language === 'bn'
        ? 'বিশেষজ্ঞ ডাক্তার বুকিং, পপুলার ডায়াগনস্টিক ল্যাব রিপোর্ট এবং বিকাশ তাৎক্ষণিক পেমেন্ট সহ সমন্বিত হেলথ হাব।'
        : 'Patient-centric mobile health app with specialist booking in Dhaka, Popular Diagnostic lab reports, and bKash instant payments.',
      icon: Users,
      color: '#4F7DF3',
      badge: 'Interactive Flow',
      highlights: [
        language === 'bn' ? '৫-ধাপের বিশেষজ্ঞ ডাক্তার বুকিং' : '5-step Dhaka specialist booking',
        language === 'bn' ? 'ডিজিটাল ল্যাব পিডিএফ রিপোর্ট ডাউনলোড' : 'Popular Diagnostic digital lab PDF reports',
        language === 'bn' ? 'বিকাশ ও নগদ পেমেন্ট গেটওয়ে' : 'bKash & Nagad instant co-pay'
      ],
    },
    {
      role: 'clinic_admin',
      title: language === 'bn' ? 'হাসপাতাল ও ক্লিনিক অপারেশন' : 'Hospital & Clinic Operations',
      subtitle: language === 'bn'
        ? 'এভারকেয়ার, স্কয়ার ও পপুলার হাসপাতালের জন্য লাইভ টোকেন ট্রায়াজ এবং ডাক্তার ডিউটি রোস্টার।'
        : 'Multi-branch operations for hospital networks (Evercare, Square, Popular) with live token triage screens and doctor duty rosters.',
      icon: Building2,
      color: '#0A192F',
      badge: 'Multi-Branch',
      highlights: [
        language === 'bn' ? 'লাইভ টোকেন আগমন কিউ ডিসপ্লে' : 'Live patient token arrival queue',
        language === 'bn' ? 'চেম্বার ও রুমের অকুপ্যান্সি ট্র্যাকিং' : 'Chamber suite occupancy tracking',
        language === 'bn' ? 'মাল্টি-ব্রাঞ্চ ডাক্তার ডিউটি রোস্টার' : 'Multi-facility doctor shift rosters'
      ],
    },
    {
      role: 'pharmacist',
      title: language === 'bn' ? 'ফার্মেসি ডিসপেন্সিং ও ইনভেন্টরি' : 'Pharmacy Dispensing & Lots',
      subtitle: language === 'bn'
        ? 'স্কয়ার, ইনসেপ্টা, বেক্সিমকোর ঔষধের ব্যাচ কন্ট্রোল, মেয়াদোত্তীর্ণ সতর্কতা এবং এক্সপ্রেস রাইডার হ্যান্ডঅফ।'
        : 'Pharmacy inventory management tracking batch lots from Beximco, Square, Incepta, near-expiry alerts, and express courier dispatch.',
      icon: Pill,
      color: '#0F766E',
      badge: 'Lot Controlled',
      highlights: [
        language === 'bn' ? 'প্রেসক্রিপশন নিরাপত্তা যাচাই' : 'Prescription safety verification',
        language === 'bn' ? 'কম স্টক ও মেয়াদ শেষের নোটিফিকেশন' : 'Near-expiry & low-stock alerts',
        language === 'bn' ? 'সরাসরি বাইক রাইডার ডেলিভারি হ্যান্ডঅফ' : 'Direct bike courier handoff'
      ],
    },
    {
      role: 'courier',
      title: language === 'bn' ? 'ঢাকা এক্সপ্রেস বাইক কুরিয়ার' : 'Dhaka Express Bike Courier',
      subtitle: language === 'bn'
        ? 'ধানমন্ডি, গুলশান, বনানী ও উত্তরায় ঔষধ ডেলিভারির জন্য মোবাইল-ফার্স্ট রাইডার রুট।'
        : 'Mobile-first driver route for motorcycle riders delivering medicine packages across Dhanmondi, Gulshan, Banani, and Uttara.',
      icon: Truck,
      color: '#15803D',
      badge: 'Mobile-First',
      highlights: [
        language === 'bn' ? 'ঢাকার জিপিএস ট্রাফিক রুট গাইড' : 'Traffic-aware GPS guidance',
        language === 'bn' ? 'ইনসুলিন কোল্ড-পাউচ সুরক্ষিত পার্সেল' : 'Tamper-proof medical parcel handoff',
        language === 'bn' ? 'ওটিপি ও ডিজিটাল প্রুফ অব ডেলিভারি' : 'OTP and digital proof of delivery (POD)'
      ],
    },
    {
      role: 'saas_admin',
      title: language === 'bn' ? 'সাস প্ল্যাটফর্ম ও সিকিউরিটি ক্লাউড' : 'SaaS Platform & Security Cloud',
      subtitle: language === 'bn'
        ? 'এন্টারপ্রাইজ হেলথ ক্লাউড নিয়ন্ত্রণ, টাকা (৳) রেভিনিউ ট্র্যাকিং এবং স্বাস্থ্য অধিদপ্তর মানসম্মত অডিট লগ।'
        : 'Enterprise health cloud operations monitoring healthcare systems, MRR in Bangladeshi Taka (৳), and DGHS-compliant audit logs.',
      icon: ShieldCheck,
      color: '#0A192F',
      badge: 'Enterprise Cloud',
      highlights: [
        language === 'bn' ? 'মাল্টি-টেন্যান্ট হাসপাতাল আইসোলেশন' : 'Multi-tenant hospital isolation',
        language === 'bn' ? 'ডিজিএইচএস ও বিএমডিসি অডিট ট্রেইল' : 'DGHS & BMDC audit trail logging',
        language === 'bn' ? 'উচ্চ সক্ষমতার ঢাকা ক্লাউড ক্লাস্টার' : 'High-availability Dhaka cloud cluster'
      ],
    },
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs text-center max-w-5xl mx-auto space-y-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-[#CCFBF1]/50 blur-3xl rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E6F4F1] text-[#0F766E] rounded-full text-xs font-semibold tracking-wide">
          <Activity className="w-4 h-4" />
          <span>{language === 'bn' ? 'কেয়ারফ্লো হেলথ বাংলাদেশ · ডিজিটাল হেলথ ওএস' : 'CareFlow Health Bangladesh · Digital Health OS'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0A192F] font-display tracking-tight leading-tight">
          {language === 'bn' ? (
            <>বাংলাদেশের আধুনিক ডিজিটাল <span className="text-[#0F766E]">স্বাস্থ্য অপারেটিং সিস্টেম</span></>
          ) : (
            <>Modern Healthcare Operating System for <span className="text-[#0F766E]">Bangladesh</span></>
          )}
        </h1>

        <p className="text-base sm:text-lg text-[#64748B] max-w-3xl mx-auto leading-relaxed">
          {t('heroSubtitle')}
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => handleLaunchRole('doctor')}
            className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition-colors"
          >
            {t('launchDoctorPortal')}
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveView('public/pricing')}
            className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#0A192F] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl transition-colors"
          >
            {t('explorePricing')}
          </button>
        </div>

        {/* Credibility Trust Bar */}
        <div className="pt-6 border-t border-[#F1F5F9] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#64748B]">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            <span>BMDC Standard Rx</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-[#0F766E]" />
            <span>DGHS Data Compliant</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Building2 className="w-4 h-4 text-[#0F766E]" />
            <span>Evercare, Square, Popular</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-[#0F766E]" />
            <span>bKash & Nagad Integrated</span>
          </div>
        </div>
      </div>

      {/* Interactive 6-Stakeholder Portals Grid */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-display">
            {t('interactivePortals')}
          </h2>
          <p className="text-sm text-[#64748B]">
            {t('clickToSimulate')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portalCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.role}
                onClick={() => handleLaunchRole(card.role)}
                className="bg-white border border-[#E2E8F0] hover:border-[#0F766E] rounded-3xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                      style={{ backgroundColor: card.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#0F766E] bg-[#E6F4F1] px-2.5 py-0.5 rounded-full">
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#0A192F] font-display group-hover:text-[#0F766E] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-[#F1F5F9]">
                    {card.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-[#475569]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#0F766E]">
                  <span>{language === 'bn' ? 'পোর্টাল চালু করুন' : 'Launch Portal'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
