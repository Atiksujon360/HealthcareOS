import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  DollarSign, 
  FileText, 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { organizations, auditLogs, addToast, t, language, formatBDT, formatNum } = useApp();
  const [activeTab, setActiveTab] = useState<'organizations' | 'audit' | 'plans' | 'security'>('organizations');
  const [searchQuery] = useState('');

  const filteredOrgs = organizations.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMRR = organizations.reduce((acc, o) => acc + o.mrr, 0);
  const totalClinics = organizations.reduce((acc, o) => acc + o.branches, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
            <span>{language === 'bn' ? 'কেয়ারফ্লো ক্লাউড ঢাকা · প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেশন' : 'CareFlow Cloud Dhaka · Platform Administration'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-display tracking-tight">
            {t('saasAdminTitle')}
          </h1>
          <p className="text-sm text-[#64748B] mt-1.5 max-w-2xl leading-relaxed">
            {t('saasAdminSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            onClick={() => addToast({ 
              type: 'info', 
              title: language === 'bn' ? 'অডিট ট্রেইল রিপোর্ট ডাউনলোড সম্পন্ন' : 'Audit Trail Exported', 
              message: language === 'bn' ? 'ডিজিএইচএস কমপ্লায়েন্স রিপোর্ট সফলভাবে ডাউনলোড হয়েছে।' : 'DGHS compliance report with cryptographic hashes downloaded.' 
            })}
            className="px-4 py-2.5 text-xs font-semibold text-[#0A192F] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl transition-colors whitespace-nowrap"
          >
            {language === 'bn' ? 'ডিজিএইচএস অডিট রিপোর্ট ডাউনলোড' : 'Export DGHS Compliance Audit'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">{t('mrrArr')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0A192F] font-mono tabular-nums">
              {formatBDT(totalMRR)}
            </span>
            <span className="text-[11px] font-medium text-[#15803D]">+28% YoY</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1 font-mono">
            {language === 'bn' ? 'মাসিক প্ল্যাটফর্ম রেভিনিউ' : 'Monthly platform subscription run-rate'}
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">{t('totalTenants')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0A192F] font-mono tabular-nums">
              {formatNum(organizations.length)}
            </span>
            <span className="text-[11px] font-medium text-[#0F766E]">99.99% Uptime</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            {formatNum(totalClinics)} {language === 'bn' ? 'টি হাসপাতাল শাখা' : 'hospital branches'}
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">{t('activeUsers')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#EEE9FF] text-[#4F7DF3] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0A192F] font-mono tabular-nums">{formatNum(1535)}</span>
            <span className="text-[11px] font-medium text-[#15803D]">Zero breaches</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            {language === 'bn' ? 'সমগ্র বাংলাদেশে নিবন্ধিত চিকিৎসক' : 'Specialists across Bangladesh'}
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">{t('dghsCompliance')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#15803D] font-mono">DGHS-CERT</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Audit trail active</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E2E8F0] pb-px">
        <button
          onClick={() => setActiveTab('organizations')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'organizations' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-[#64748B]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          {t('navHealthcareTenants')} ({formatNum(organizations.length)})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'audit' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-[#64748B]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          {t('navAuditLogs')} ({formatNum(auditLogs.length)})
        </button>
      </div>

      {/* Tab 1: Organizations Table */}
      {activeTab === 'organizations' && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0A192F] font-display">
                {language === 'bn' ? 'নিবন্ধিত স্বাস্থ্যসেবা প্রতিষ্ঠানসমূহ' : 'Subscribed Healthcare Systems in Bangladesh'}
              </h3>
              <p className="text-xs text-[#64748B]">
                Hospital network isolation, license seat quotas, and branch allocations
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Hospital / Diagnostic Network</th>
                  <th className="px-4 py-3.5 font-semibold">Classification</th>
                  <th className="px-4 py-3.5 font-semibold">Subscription Tier</th>
                  <th className="px-4 py-3.5 font-semibold">Branches & Seats</th>
                  <th className="px-4 py-3.5 font-semibold">Monthly MRR</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Renewal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[#0A192F] font-display text-sm">{org.name}</div>
                      <div className="text-[11px] text-[#64748B] font-mono">ID: {org.id}</div>
                    </td>
                    <td className="px-4 py-3.5 text-[#475569]">
                      {org.type}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-[#0F766E]">{org.plan}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[#475569]">
                      {formatNum(org.branches)} {language === 'bn' ? 'শাখা' : 'branches'} · {formatNum(org.staffCount)} {language === 'bn' ? 'সিট' : 'seats'}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-[#0A192F]">
                      {formatBDT(org.mrr)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        org.status === 'active' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEF3C7] text-[#B45309]'
                      }`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[#64748B]">
                      {org.renewalDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0]">
            <h3 className="text-base font-bold text-[#0A192F] font-display">
              {language === 'bn' ? 'ক্রিপ্টোগ্রাফিক ডিজিএইচএস ক্লিনিক্যাল অডিট ট্রেইল' : 'Cryptographic DGHS Clinical Audit Trail'}
            </h3>
            <p className="text-xs text-[#64748B]">
              Tamper-evident logs of physician e-prescriptions, pharmacy dispensing, and delivery OTP handoffs
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Timestamp (BST)</th>
                  <th className="px-4 py-3.5 font-semibold">Actor & Role</th>
                  <th className="px-4 py-3.5 font-semibold">Module</th>
                  <th className="px-4 py-3.5 font-semibold">Action Event</th>
                  <th className="px-4 py-3.5 font-semibold">Details</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Origin IP (Dhaka)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3.5 font-mono text-[#64748B]">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-[#0A192F]">{log.actor}</span>
                      <span className="text-[10px] text-[#64748B] block">{log.role}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F1F5F9] text-[#0A192F] font-medium">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#0A192F]">
                      {log.action}
                    </td>
                    <td className="px-4 py-3.5 text-[#475569] max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[#64748B]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
