import React, { useState } from 'react';
import { 
  Check, 
  ShieldCheck, 
  Building2, 
  Stethoscope, 
  DollarSign, 
  Zap, 
  HelpCircle,
  ArrowRight,
  CreditCard
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SubscriptionPlans: React.FC = () => {
  const { addToast, setActiveView, t, language, formatBDT, formatNum } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [targetAudience, setTargetAudience] = useState<'individual' | 'organization'>('organization');

  const individualPlans = [
    {
      name: language === 'bn' ? 'একক কনসালটেন্ট চেম্বার' : 'Solo Consultant Chamber',
      desc: language === 'bn' ? 'ঢাকা, চট্টগ্রাম ও সিলেটের স্বাধীন বিশেষজ্ঞ চিকিৎসকদের জন্য' : 'For private practitioners and visiting consultants in Dhaka, Chattogram & Sylhet',
      monthlyPrice: 3500,
      annualPrice: 2900,
      seats: language === 'bn' ? '১ জন ডাক্তার চেম্বার সিট' : '1 Doctor Chamber Seat',
      features: [
        language === 'bn' ? 'বিএমডিসি মানসম্মত ডিজিটাল প্রেসক্রিপশন প্যাড (℞)' : 'BMDC-Compliant Digital Prescription Pad (℞)',
        language === 'bn' ? 'এসওএপি ক্লিনিক্যাল এনকাউন্টার ওয়ার্কস্পেস' : 'SOAP Clinical Encounter Workspace',
        language === 'bn' ? 'রোগী সিরিয়াল ও চেম্বার কিউ ম্যানেজার' : 'Patient Serial & Chamber Queue Manager',
        language === 'bn' ? 'সরাসরি বিকাশ ও নগদ কনসালটেশন ফি গ্রহণ' : 'Direct bKash & Nagad Consultation Fee Collection',
        language === 'bn' ? 'টেলিহেলথ বিডি এনক্রিপ্টেড ভিডিও কনসালটেশন' : 'TeleHealth BD Encrypted Video Consults',
        language === 'bn' ? 'এসএমএস গেটওয়ে ইন্টিগ্রেশন (জিপি, রবি, বাংলালিংক)' : 'SMS Gateway Integration (GP, Robi, Banglalink)',
      ],
      current: false,
    },
    {
      name: language === 'bn' ? 'স্পেশালিস্ট প্রফেসর প্রো' : 'Specialist Professor Pro',
      desc: language === 'bn' ? 'উচ্চ রোগী ভলিউম ও ডায়াগনস্টিক ল্যাব টাই-আপ বিশিষ্ট সিনিয়র চিকিৎসকদের জন্য' : 'For senior consultants with high patient volumes and diagnostic lab tie-ups',
      monthlyPrice: 6500,
      annualPrice: 5500,
      seats: language === 'bn' ? '১ জন ডাক্তার + ২ জন সহকারী সিট' : '1 Doctor + 2 Assistant/Compounder Seats',
      features: [
        language === 'bn' ? 'একক চেম্বারের সকল সুবিধাসমূহ' : 'All Solo Consultant features',
        language === 'bn' ? 'পপুলার ও এভারকেয়ার ডায়াগনস্টিক ল্যাব হাব' : 'Popular & Evercare Diagnostic Lab Direct Order Hub',
        language === 'bn' ? 'ফার্মা ডাটাবেস (স্কয়ার, বেক্সিমকো, ইনসেপ্টা, রেনেটা)' : 'Pharma Formula Database (Square, Beximco, Incepta, Renata)',
        language === 'bn' ? 'ভয়েস-টু-টেক্সট ও কুইক ক্লিনিক্যাল টেমপ্লেট' : 'Voice-to-Text & Quick Clinical Template Macros',
        language === 'bn' ? 'রোগীর দীর্ঘমেয়াদী ইএমআর ও মেডিসিন টাইমলাইন' : 'Patient Longitudinal EMR & Medication Timelines',
        language === 'bn' ? 'ডেডিকেটেড সাপোর্ট ও অফলাইন ডেস্কটপ সিঙ্ক' : 'Dedicated Support & Offline Desktop Sync',
      ],
      current: true,
    },
  ];

  const orgPlans = [
    {
      name: language === 'bn' ? 'ডায়াগনস্টিক ও পলিক্লিনিক' : 'Diagnostic & Polyclinic',
      desc: language === 'bn' ? 'ব্যক্তিগত ডায়াগনস্টিক সেন্টার ও আউটপেশেন্ট ক্লিনিকের জন্য' : 'For private diagnostic centres and outpatient clinics',
      monthlyPrice: 30000,
      annualPrice: 25000,
      seats: language === 'bn' ? '১৫ জন পর্যন্ত মেডিকেল স্টাফ · ১টি শাখা' : 'Up to 15 Medical Staff Seats · 1 Facility Branch',
      features: [
        language === 'bn' ? 'মাস্টার ডাক্তার শিডিউল ও মাল্টি-চেম্বার রোস্টার' : 'Master Doctor Schedule & Multi-Chamber Roster',
        language === 'bn' ? 'ফ্রন্ট-ডেস্ক টোকেন ট্রায়াজ ও লাইভ স্ক্রিন' : 'Front-Desk Token Triage & Live Waiting Screen',
        language === 'bn' ? 'প্যাথলজি ও রেডিওলজি টেস্ট বিলিং' : 'Pathology & Radiology Test Billing with Barcoding',
        language === 'bn' ? 'ফার্মেসি পিওএস ও স্টক সতর্কতা' : 'Pharmacy POS & Stock Restock Alerts',
        language === 'bn' ? 'রোগীর ইএমআর ও স্বাস্থ্য কার্ড যাচাই' : 'Patient EMR & Insurance Card Verification',
        language === 'bn' ? 'রোল-ভিত্তিক অ্যাক্সেস কন্ট্রোল (অ্যাডমিন, ডাক্তার, রিসেপশনিস্ট)' : 'Role-Based Access Control (Admin, Doctor, Receptionist)',
      ],
      current: false,
    },
    {
      name: language === 'bn' ? 'স্পেশালাইজড মেডিকেল সেন্টার' : 'Specialized Medical Centre',
      desc: language === 'bn' ? 'মাল্টি-ব্রাঞ্চ হাসপাতাল, হাই-ভলিউম ফার্মেসি ও হোম ডেলিভারির জন্য' : 'For multi-branch hospitals with high-volume pharmacies and home delivery',
      monthlyPrice: 90000,
      annualPrice: 75000,
      seats: language === 'bn' ? '৫০ জন পর্যন্ত ক্লিনিক্যাল স্টাফ · ৩টি হাসপাতাল শাখা' : 'Up to 50 Clinical Staff Seats · 3 Hospital Branches',
      features: [
        language === 'bn' ? 'পলিক্লিনিকের সকল সুবিধাসমূহ' : 'All Polyclinic features',
        language === 'bn' ? 'সেন্ট্রাল ফার্মেসি ব্যাচ কন্ট্রোল ও এক্সপায়ারি ট্র্যাকিং' : 'Central Pharmacy Lot Batch Control & Expiry Tracking',
        language === 'bn' ? 'ইন্টিগ্রেটেড বাইক কুরিয়ার এক্সপ্রেস লজিস্টিকস' : 'Integrated Bike Courier Express Logistics Dispatch',
        language === 'bn' ? 'হাসপাতাল বেড, ওটি ও চেম্বার অর্কেস্ট্রেশন' : 'Hospital Bed, OT & Consultation Suite Orchestration',
        language === 'bn' ? 'কর্পোরেট ইন্স্যুরেন্স ক্যাশলেস প্রসেসিং (গ্রীন ডেল্টা, মেটলাইফ)' : 'Corporate Insurance Cashless Processing (Green Delta, MetLife)',
        language === 'bn' ? 'ডিজিএইচএস ও বিএমডিসি ক্লিনিক্যাল অডিট ট্রেইল' : 'Full DGHS & BMDC Clinical Audit Trail',
      ],
      current: true,
    },
    {
      name: language === 'bn' ? 'টারশিয়ারি হসপিটাল নেটওয়ার্ক' : 'Tertiary Hospital Network',
      desc: language === 'bn' ? 'শীর্ষস্থানীয় হাসপাতাল (এভারকেয়ার, স্কয়ার, ইউনাইটেড) ও ল্যাব চেইনের জন্য' : 'For premier health systems (Evercare, Square, United) and diagnostic chains',
      monthlyPrice: 300000,
      annualPrice: 250000,
      seats: language === 'bn' ? 'সীমাহীন স্টাফ সিট · সীমাহীন হাসপাতাল শাখা' : 'Unlimited Staff Seats · Unlimited Hospital Branches',
      features: [
        language === 'bn' ? 'এন্টারপ্রাইজ লোকাল ক্লাউড (ঢাকা ডিসি-১) ও হাই অ্যাভেইলেবিলিটি' : 'Enterprise Local Cloud (Dhaka DC-1) & High Availability',
        language === 'bn' ? 'এইচএল৭ / ফায়ার ইন্টিগ্রেশন উইথ হসপিটাল পিএসিএস ও আরআইএস' : 'HL7 / FHIR Integration with Hospital PACS & RIS',
        language === 'bn' ? 'ডেডিকেটেড এন্টারপ্রাইজ সলিউশন আর্কিটেক্ট ও ২৪/৭ এসএলএ' : 'Dedicated Enterprise Solutions Architect & 24/7 On-Site SLA',
        language === 'bn' ? 'কাস্টম ডিজাস্টার রিকভারি ও সাব-সেকেন্ড ফেইলওভার' : 'Custom Disaster Recovery & Sub-Second Failover',
        language === 'bn' ? 'হোয়াইট-লেবেল হসপিটাল মোবাইল অ্যাপ (আইওএস ও অ্যান্ড্রয়েড)' : 'White-Label Hospital Mobile App (iOS & Android)',
        language === 'bn' ? '৯৯.৯৯% আপটাইম গ্যারান্টি সার্ভিস লেভেল এগ্রিমেন্ট' : 'Custom Service Level Agreement (99.99% Uptime)',
      ],
      current: false,
    },
  ];

  const activePlanList = targetAudience === 'individual' ? individualPlans : orgPlans;

  const handleSelectPlan = (planName: string) => {
    addToast({
      type: 'success',
      title: language === 'bn' ? 'সাবস্ক্রিপশন প্ল্যান নির্বাচিত হয়েছে' : 'Subscription Tier Selected',
      message: `${planName} (${billingCycle === 'annual' ? (language === 'bn' ? 'বার্ষিক' : 'Annual') : (language === 'bn' ? 'মাসিক' : 'Monthly')}).`,
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-semibold text-[#0F766E] uppercase tracking-wider">
          {language === 'bn' ? 'স্বচ্ছ ও সাশ্রয়ী কেয়ারফ্লো সাবস্ক্রিপশন প্ল্যান' : 'Transparent & Predictable Pricing'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0A192F] font-display tracking-tight">
          {t('pricingTitle')}
        </h1>
        <p className="text-sm text-[#64748B] leading-relaxed">
          {t('pricingSubtitle')}
        </p>

        {/* Audience Selector Tabs */}
        <div className="inline-flex p-1 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xs mt-2">
          <button
            onClick={() => setTargetAudience('organization')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
              targetAudience === 'organization' ? 'bg-[#0F766E] text-white shadow-2xs' : 'text-[#64748B]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            {t('forClinics')}
          </button>
          <button
            onClick={() => setTargetAudience('individual')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
              targetAudience === 'individual' ? 'bg-[#0F766E] text-white shadow-2xs' : 'text-[#64748B]'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            {t('forDoctors')}
          </button>
        </div>

        {/* Billing cycle toggle */}
        <div className="flex items-center justify-center gap-3 pt-2 text-xs">
          <span className={billingCycle === 'monthly' ? 'font-bold text-[#0A192F]' : 'text-[#64748B]'}>
            {t('monthly')}
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'annual' ? 'monthly' : 'annual')}
            className="w-11 h-6 bg-[#0F766E] rounded-full p-1 transition-colors relative"
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
              billingCycle === 'annual' ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
          <span className={billingCycle === 'annual' ? 'font-bold text-[#0A192F]' : 'text-[#64748B]'}>
            {t('annualBilling')}
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className={`grid grid-cols-1 ${targetAudience === 'individual' ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'lg:grid-cols-3'} gap-6`}>
        {activePlanList.map((plan) => {
          const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
          return (
            <div
              key={plan.name}
              className={`bg-white border rounded-3xl p-6 lg:p-7 shadow-xs flex flex-col justify-between transition-all ${
                plan.current
                  ? 'border-[#0F766E] ring-2 ring-[#0F766E]/20 relative'
                  : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
              }`}
            >
              {plan.current && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#0F766E] text-white text-[10px] font-bold tracking-wider uppercase rounded-full">
                  {language === 'bn' ? 'বর্তমান সাবস্ক্রাইবড টিয়ার' : 'Current Subscribed Tier'}
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-[#0A192F] font-display">{plan.name}</h3>
                <p className="text-xs text-[#64748B] mt-1 min-h-[32px]">{plan.desc}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#0A192F] font-mono tabular-nums">
                    {formatBDT(price)}
                  </span>
                  <span className="text-xs text-[#64748B]">{t('perMonth')}</span>
                </div>
                <span className="text-[11px] font-medium text-[#0F766E] block mt-1 font-mono">
                  {plan.seats}
                </span>

                <div className="mt-6 pt-6 border-t border-[#F1F5F9] space-y-3">
                  <span className="text-xs font-bold text-[#0A192F] uppercase tracking-wider block">
                    {t('includedFeatures')}
                  </span>
                  <ul className="space-y-2 text-xs text-[#475569]">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#F1F5F9]">
                <button
                  onClick={() => handleSelectPlan(plan.name)}
                  className={`w-full py-3 text-xs font-bold rounded-xl transition-colors shadow-2xs ${
                    plan.current
                      ? 'bg-[#0F766E] text-white hover:bg-[#115E59]'
                      : 'bg-[#F1F5F9] text-[#0A192F] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {plan.current 
                    ? (language === 'bn' ? 'সক্রিয় লাইসেন্স পরিচালনা করুন' : 'Manage Active Plan') 
                    : t('selectPlan')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Rails Guarantee Strip */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center font-bold">
            ৳
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#0A192F]">
              {language === 'bn' ? 'বাংলাদেশি পেমেন্ট চ্যানেল সরাসরি যুক্ত' : 'Supported Bangladesh Payment Rails'}
            </h4>
            <p className="text-[#64748B]">bKash Merchant, Nagad Business, Rocket, City Touch, and all local Visa/Mastercard cards</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono font-bold text-pink-600">bKash</span>
          <span className="px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono font-bold text-orange-600">Nagad</span>
          <span className="px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono font-bold text-purple-600">Rocket</span>
          <span className="px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono font-bold text-[#0F766E]">NPSB / BEFTN</span>
        </div>
      </div>
    </div>
  );
};
