import React, { useState } from 'react';
import { 
  Activity, 
  Calendar, 
  Users, 
  FileText, 
  Pill, 
  Truck, 
  Building2, 
  ShieldCheck, 
  Search, 
  Bell, 
  ChevronDown, 
  Menu, 
  X, 
  Stethoscope, 
  Clock, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  LogOut,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  DollarSign,
  Globe
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    language,
    setLanguage,
    t,
    currentRole, 
    setCurrentRole, 
    currentUser, 
    activeView, 
    setActiveView,
    selectedBranch,
    setSelectedBranch,
    toasts,
    removeToast,
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useApp();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Dynamic Navigation per Role using t(...)
  const getNavItems = (): NavItem[] => {
    switch (currentRole) {
      case 'doctor':
        return [
          { id: 'doctor/dashboard', label: t('navOverview'), icon: Activity },
          { id: 'doctor/schedule', label: t('navSchedule'), icon: Calendar, badge: '5' },
          { id: 'doctor/patients', label: t('navPatients'), icon: Users },
          { id: 'doctor/consultations/enc-2026-101', label: t('navConsultations'), icon: Stethoscope, badge: 'Draft' },
          { id: 'doctor/prescriptions', label: t('navPrescriptions'), icon: Pill },
          { id: 'doctor/reports', label: t('navReports'), icon: FileText },
        ];
      case 'patient':
        return [
          { id: 'patient/dashboard', label: t('navMyHealthHub'), icon: Activity },
          { id: 'patient/appointments', label: t('navAppointments'), icon: Calendar, badge: '10:00 AM' },
          { id: 'patient/records', label: t('navRecords'), icon: FileText },
          { id: 'patient/prescriptions', label: t('navPrescriptions'), icon: Pill },
          { id: 'patient/pharmacy', label: t('navPharmacyDeliveries'), icon: Truck, badge: '1 In-Transit' },
          { id: 'patient/billing', label: t('navBilling'), icon: DollarSign },
        ];
      case 'clinic_admin':
        return [
          { id: 'clinic/dashboard', label: t('navOperations'), icon: Building2 },
          { id: 'clinic/queue', label: t('navQueue'), icon: Clock, badge: '3 Waiting' },
          { id: 'clinic/doctors', label: t('navDoctors'), icon: Stethoscope },
          { id: 'clinic/appointments', label: t('navMasterSchedule'), icon: Calendar },
          { id: 'clinic/facilities', label: t('navFacilities'), icon: Building2 },
          { id: 'clinic/subscription', label: t('subscriptionPlans'), icon: ShieldCheck },
        ];
      case 'pharmacist':
        return [
          { id: 'pharmacy/dashboard', label: t('navDispensing'), icon: Activity },
          { id: 'pharmacy/inventory', label: t('navInventory'), icon: Pill, badge: '2 Low' },
          { id: 'pharmacy/dispensing', label: t('navPrescriptionQueue'), icon: FileText, badge: '1 Ready' },
          { id: 'pharmacy/deliveries', label: t('navLogistics'), icon: Truck },
        ];
      case 'courier':
        return [
          { id: 'delivery/dashboard', label: t('navRouteDispatch'), icon: Truck, badge: '2 Active' },
          { id: 'delivery/history', label: t('navDeliveryHistory'), icon: FileText },
          { id: 'delivery/profile', label: t('navCourierProfile'), icon: UserCheck },
        ];
      case 'saas_admin':
        return [
          { id: 'admin/dashboard', label: t('navTenantCloud'), icon: ShieldCheck },
          { id: 'admin/organizations', label: t('navHealthcareTenants'), icon: Building2, badge: '4 Orgs' },
          { id: 'admin/audit-logs', label: t('navAuditLogs'), icon: FileText },
          { id: 'admin/subscriptions', label: t('navSaaSSubscriptions'), icon: DollarSign },
        ];
      default:
        return [
          { id: 'public/home', label: t('navPlatformOverview'), icon: Activity },
          { id: 'public/pricing', label: t('navPricingPlans'), icon: DollarSign },
        ];
    }
  };

  const navItems = getNavItems();

  const roleOptions: { role: UserRole; label: string; desc: string; icon: React.ElementType }[] = [
    { 
      role: 'doctor', 
      label: language === 'bn' ? 'ডাক্তার পোর্টাল' : 'Doctor Portal', 
      desc: language === 'bn' ? 'বিএমডিসি ক্লিনিক্যাল ওয়ার্কস্পেস, কনসালটেশন ও সময়সূচি' : 'BMDC clinical workspace, consultations, schedule', 
      icon: Stethoscope 
    },
    { 
      role: 'patient', 
      label: language === 'bn' ? 'রোগী পোর্টাল' : 'Patient Portal', 
      desc: language === 'bn' ? 'মেডিকেল রেকর্ড, অ্যাপয়েন্টমেন্ট ও ঔষধ হোম ডেলিভারি' : 'Records, appointments, pharmacy delivery', 
      icon: Users 
    },
    { 
      role: 'clinic_admin', 
      label: language === 'bn' ? 'ক্লিনিক অ্যাডমিন' : 'Clinic Admin', 
      desc: language === 'bn' ? 'মাল্টি-ব্রাঞ্চ অপারেশন, সিরিয়াল কিউ ও রোস্টার' : 'Multi-branch operations, queue, staffing', 
      icon: Building2 
    },
    { 
      role: 'pharmacist', 
      label: language === 'bn' ? 'ফার্মেসি ম্যানেজমেন্ট' : 'Pharmacy Management', 
      desc: language === 'bn' ? 'ঔষধের ব্যাচ ইনভেন্টরি, প্রেসক্রিপশন যাচাই ও ডিসপেন্সিং' : 'Inventory batches, verification, dispensing', 
      icon: Pill 
    },
    { 
      role: 'courier', 
      label: language === 'bn' ? 'কুরিয়ার ও রাইডার' : 'Courier Portal', 
      desc: language === 'bn' ? 'ঢাকার রাইডার রুট, ডেলিভারি ও প্রুফ অব ডেলিভারি' : 'Dhaka bike route, dispatch, proof of delivery', 
      icon: Truck 
    },
    { 
      role: 'saas_admin', 
      label: language === 'bn' ? 'সাস অ্যাডমিনিস্ট্রেটর' : 'SaaS Administrator', 
      desc: language === 'bn' ? 'মাল্টি-টেন্যান্ট ক্লাউড, অডিট লগ ও বিলিং' : 'Multi-tenant cloud, audits, subscriptions', 
      icon: ShieldCheck 
    },
    { 
      role: 'public', 
      label: language === 'bn' ? 'পাবলিক শোকেস' : 'Public Showcase', 
      desc: language === 'bn' ? 'কেয়ারফ্লো হেলথকেয়ার প্ল্যাটফর্ম পরিচিতি' : 'CareFlow ecosystem overview & pricing', 
      icon: Activity 
    },
  ];

  const branches = [
    'Evercare Hospital Dhaka (Bashundhara R/A)',
    'Square Hospital Ltd. (Panthapath, Dhaka)',
    'Popular Diagnostic Centre (Dhanmondi-16)',
    'United Hospital (Gulshan-2, Dhaka)',
    'CareFlow TeleHealth BD (Pan-Bangladesh)'
  ];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#0F172A]">
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className="pointer-events-auto bg-white border border-[#E2E8F0] shadow-lg rounded-2xl p-3.5 flex items-start gap-3 transition-all transform animate-in fade-in slide-in-from-top-2"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#0F172A]">{toast.title}</p>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-[#94A3B8] hover:text-[#0F172A] text-sm shrink-0 p-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col border-r border-[#E2E8F0] bg-white transition-all duration-200 z-30 shrink-0 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Lockup */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E2E8F0]">
          <div 
            onClick={() => { setActiveView('public/home'); setCurrentRole('public'); }}
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F766E] to-[#115E59] flex items-center justify-center text-white shadow-sm shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="leading-tight truncate">
                <span className="font-extrabold text-base text-[#0A192F] tracking-tight font-display block">
                  CareFlow <span className="text-[#0F766E]">BD</span>
                </span>
                <span className="text-[10px] text-[#0F766E] font-medium tracking-wide">
                  {t('brandSubtitle')}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Workspace Indicator */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#64748B] uppercase tracking-wider text-[10px] font-semibold">{t('activePortal')}</span>
              <button 
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="text-[#0F766E] font-semibold hover:underline flex items-center gap-1 text-[11px]"
              >
                {t('switchRole')}
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <div className="font-bold text-sm text-[#0A192F] capitalize font-display">
              {currentRole.replace('_', ' ')}
            </div>
            <div className="text-xs text-[#64748B] truncate mt-0.5">
              {currentUser.organization || 'CareFlow Network Bangladesh'}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id || activeView.startsWith(item.id);
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                {!sidebarCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!sidebarCollapsed && item.badge && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                    isActive ? 'bg-[#115E59] text-white' : 'bg-[#E2E8F0] text-[#475569]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="p-3 border-t border-[#E2E8F0]">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              {currentUser.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#CBD5E1]"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#E6F4F1] text-[#0F766E] font-semibold flex items-center justify-center shrink-0 text-sm">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#0F172A] truncate">{currentUser.name}</p>
                <p className="text-[11px] text-[#64748B] truncate">{currentUser.title || currentUser.role}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              {currentUser.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-[#CBD5E1]"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#E6F4F1] text-[#0F766E] font-bold flex items-center justify-center text-xs">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* National Health Helpline & Emergency Banner */}
        <div className="bg-[#0A192F] text-white text-[11px] px-4 lg:px-6 py-1.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-[#99F6E4] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              {t('helplineText')}
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-300">
              {t('emergencyText')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span className="hidden md:inline">{t('bmdcCompliant')}</span>
            <span className="text-[#99F6E4] bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800 font-bold">
              {t('locationTag')}
            </span>
          </div>
        </div>

        {/* Top Header */}
        <header className="h-16 bg-white/95 backdrop-blur-xs border-b border-[#E2E8F0] px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#64748B] hover:text-[#0F172A] rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title Area */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#64748B] whitespace-nowrap">
              <span className="font-semibold text-[#0A192F] capitalize">{currentRole.replace('_', ' ')}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="text-[#0F172A] font-medium truncate capitalize">
                {activeView.split('/')[1]?.replace('-', ' ') || 'Dashboard'}
              </span>
            </div>

            {/* Branch selector */}
            <div className="relative">
              <button
                onClick={() => setShowBranchMenu(!showBranchMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#0A192F] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-lg transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-[#0F766E]" />
                <span className="hidden md:inline truncate max-w-[210px]">{selectedBranch}</span>
                <span className="md:hidden">Branch</span>
                <ChevronDown className="w-3 h-3 text-[#64748B]" />
              </button>
              {showBranchMenu && (
                <div className="absolute left-0 mt-1 w-64 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                    Select Hospital Branch
                  </div>
                  {branches.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setSelectedBranch(b);
                        setShowBranchMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F8FAFC] transition-colors ${
                        selectedBranch === b ? 'text-[#0F766E] font-semibold bg-[#E6F4F1]' : 'text-[#0F172A]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dual Language Switcher Toggle (EN | বাংলা) */}
            <div className="flex items-center p-0.5 bg-[#F1F5F9] rounded-xl border border-[#CBD5E1]/60 shadow-2xs">
              <div className="pl-2 pr-1 text-[#0F766E] hidden sm:flex items-center">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-white text-[#0F766E] shadow-2xs'
                    : 'text-[#64748B] hover:text-[#0A192F]'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all font-bengali ${
                  language === 'bn'
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'text-[#64748B] hover:text-[#0A192F]'
                }`}
                title="বাংলায় পরিবর্তন করুন"
              >
                বাংলা
              </button>
            </div>

            {/* Global Search Bar */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all"
              />
            </div>

            {/* Quick Demo Role Switcher Trigger Button */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-[#E6F4F1] text-[#0F766E] hover:bg-[#CCFBF1] rounded-xl border border-[#99F6E4] transition-colors shadow-2xs"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('role')}: {currentRole.replace('_', ' ').toUpperCase()}</span>
                <span className="sm:hidden font-mono text-[10px]">{currentRole.slice(0, 3).toUpperCase()}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* Role Switcher Dropdown */}
              {showRoleSwitcher && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-2 border-b border-[#F1F5F9]">
                    <p className="text-xs font-bold text-[#0A192F] font-display">{t('switchRoleTitle')}</p>
                    <p className="text-[11px] text-[#64748B]">{t('switchRoleSubtitle')}</p>
                  </div>
                  <div className="space-y-1 py-1 max-h-80 overflow-y-auto">
                    {roleOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = currentRole === opt.role;
                      return (
                        <button
                          key={opt.role}
                          onClick={() => {
                            setCurrentRole(opt.role);
                            setShowRoleSwitcher(false);
                          }}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors ${
                            isSelected
                              ? 'bg-[#E6F4F1] text-[#0F766E] font-medium'
                              : 'hover:bg-[#F8FAFC] text-[#0F172A]'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#0F766E] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold">{opt.label}</p>
                            <p className="text-[11px] text-[#64748B] line-clamp-1">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0F766E]"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                    <span className="text-xs font-bold text-[#0A192F] font-display">{t('notificationsTitle')}</span>
                    <span className="text-[10px] text-[#0F766E] font-medium cursor-pointer hover:underline">{t('markAllRead')}</span>
                  </div>
                  <div className="divide-y divide-[#F1F5F9] text-xs">
                    <div className="py-2.5">
                      <p className="font-medium text-[#0F172A]">Lab Results Ready: Mr. Rafiqul Islam</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">HbA1c & uACR reports ready from Popular Diagnostic Dhanmondi</p>
                      <span className="text-[10px] text-[#94A3B8] mt-1 block">12 mins ago · Popular Diagnostic</span>
                    </div>
                    <div className="py-2.5">
                      <p className="font-medium text-[#0F172A]">Courier In Transit (Dhaka Route)</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Order CFD-DHK-2026-8801 picked up by Rider Shamim Akhter</p>
                      <span className="text-[10px] text-[#94A3B8] mt-1 block">25 mins ago · Gulshan Dispatch Hub</span>
                    </div>
                    <div className="py-2.5">
                      <p className="font-medium text-[#0F172A]">Pharmacy Inventory Warning</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Bexitrol-F Inhaler at 12 canisters (below minimum of 25)</p>
                      <span className="text-[10px] text-[#94A3B8] mt-1 block">1 hour ago · Beximco Pharma Lot</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#F1F5F9] transition-colors"
              >
                {currentUser.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-[#CBD5E1]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#E6F4F1] text-[#0F766E] font-bold flex items-center justify-center text-xs">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-2 z-50">
                  <div className="p-3 border-b border-[#F1F5F9]">
                    <p className="text-xs font-bold text-[#0A192F] font-display">{currentUser.name}</p>
                    <p className="text-[11px] text-[#64748B]">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-[#E6F4F1] text-[#0F766E] rounded-md font-semibold capitalize">
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={() => { setActiveView('public/pricing'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2 rounded-lg"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-[#64748B]" />
                      {t('subscriptionPlans')}
                    </button>
                    <button 
                      onClick={() => { setActiveView('public/home'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2 rounded-lg"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
                      {t('landingPage')}
                    </button>
                    <button 
                      onClick={() => { setCurrentRole('public'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-[#B91C1C] hover:bg-[#FEF2F2] flex items-center gap-2 rounded-lg mt-1 border-t border-[#F1F5F9]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t('signOut')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 max-w-xs w-full bg-white flex flex-col p-4 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-[#0A192F] font-display">CareFlow BD</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Language Switcher in Mobile Drawer */}
              <div className="py-3 flex items-center justify-between border-b border-[#E2E8F0]">
                <span className="text-xs text-[#64748B] font-medium">Language / ভাষা</span>
                <div className="flex items-center p-0.5 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      language === 'en' ? 'bg-white text-[#0F766E] shadow-2xs' : 'text-[#64748B]'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('bn')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg font-bengali ${
                      language === 'bn' ? 'bg-[#0F766E] text-white shadow-2xs' : 'text-[#64748B]'
                    }`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              <div className="py-3">
                <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                  {t('switchRole')}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {roleOptions.map((opt) => (
                    <button
                      key={opt.role}
                      onClick={() => {
                        setCurrentRole(opt.role);
                        setMobileMenuOpen(false);
                      }}
                      className={`text-xs px-2 py-1.5 rounded-lg text-left truncate ${
                        currentRole === opt.role ? 'bg-[#0F766E] text-white font-medium' : 'bg-[#F1F5F9] text-[#0F172A]'
                      }`}
                    >
                      {opt.label.replace(' Portal', '')}
                    </button>
                  ))}
                </div>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto pt-2 border-t border-[#E2E8F0]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? 'bg-[#0F766E] text-white' : 'text-[#64748B] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
