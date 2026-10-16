import React, { useState } from 'react';
import { 
  Pill, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Plus, 
  Minus, 
  Truck, 
  FileCheck, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  ArrowUpRight,
  PackageCheck,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PharmacyDashboard: React.FC = () => {
  const { 
    pharmacyInventory, 
    updateInventoryStock, 
    activeConsultation, 
    dispensePrescription,
    addToast,
    t,
    language,
    formatBDT,
    formatNum
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory' | 'dispensing'>('inventory');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const pendingPrescriptions = activeConsultation.prescriptions.filter((p) => !p.dispensed);

  const filteredInventory = pharmacyInventory.filter((item) => {
    if (filterStatus === 'low-stock') return item.status === 'low-stock';
    if (filterStatus === 'near-expiry') return item.status === 'near-expiry';
    return true;
  });

  const lowStockCount = pharmacyInventory.filter((i) => i.status === 'low-stock').length;
  const nearExpiryCount = pharmacyInventory.filter((i) => i.status === 'near-expiry').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
            <span>{language === 'bn' ? 'কেয়ারফ্লো সেন্ট্রাল ডিসপেন্সিং ফার্মেসি · গুলশান-২, ঢাকা' : 'CareFlow Central Dispensing Pharmacy · Gulshan-2, Dhaka'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-display tracking-tight">
            {t('pharmacyTitle')}
          </h1>
          <p className="text-sm text-[#64748B] mt-1.5 max-w-2xl leading-relaxed">
            {t('pharmacySubtitle')}
          </p>
        </div>
      </div>

      {/* Warnings & Alerts Strip */}
      {(lowStockCount > 0 || nearExpiryCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lowStockCount > 0 && (
            <div className="p-4 bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#92400E]">
                  {language === 'bn' ? `কম স্টকের সতর্কতা: ${formatNum(lowStockCount)}টি ঔষধ নির্ধারিত সীমার নিচে` : `Low Stock Warning: ${lowStockCount} items below threshold`}
                </p>
                <p className="text-xs text-[#B45309] mt-0.5">
                  Bexitrol-F Inhaler 100/6 (Beximco Pharma): {formatNum(12)} canisters remaining (Min: {formatNum(25)}).
                </p>
              </div>
            </div>
          )}
          {nearExpiryCount > 0 && (
            <div className="p-4 bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#991B1B]">
                  {language === 'bn' ? `মেয়াদোত্তীর্ণের সতর্কতা: ${formatNum(nearExpiryCount)}টি ব্যাচের মেয়াদ শেষ হচ্ছে` : `Near-Expiry Batch Alert: ${nearExpiryCount} lot expiring soon`}
                </p>
                <p className="text-xs text-[#B91C1C] mt-0.5">
                  Monas 10mg (Acme Laboratories, Lot BT-ACM-3301): Expiry date 20 Nov 2026.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">
              {language === 'bn' ? 'যাচাই অপেক্ষমান প্রেসক্রিপশন' : 'Prescriptions To Verify'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0A192F] font-mono tabular-nums">
              {formatNum(pendingPrescriptions.length)}
            </span>
            <span className="text-[11px] font-medium text-[#B45309]">Awaiting pharmacist check</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            {language === 'bn' ? 'ডাঃ আয়েশা রহমানের প্রেসক্রিপশন' : "Prof. Dr. Aisha Rahman's Rx"}
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">{t('todayDispatched')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0A192F] font-mono tabular-nums">{formatNum(38)}</span>
            <span className="text-[11px] font-medium text-[#15803D]">{formatNum(100)}% verified</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Direct from Gulshan dispensary</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">
              {language === 'bn' ? 'পথে থাকা রাইডার' : 'Bike Riders In Transit'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0A192F] font-mono tabular-nums">{formatNum(2)}</span>
            <span className="text-[11px] font-medium text-[#0F766E]">With Rider Shamim Akhter</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            {language === 'bn' ? 'ধানমন্ডি ও মিরপুর ডিওএইচএস রুট' : 'Dhanmondi & Mirpur DOHS Routes'}
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">
              {language === 'bn' ? 'ফার্মেসি বিক্রয় (আজকের মোট)' : 'Dispensary Sales Today'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EEE9FF] text-[#4F7DF3] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0A192F] font-mono tabular-nums">{formatBDT(46500)}</span>
            <span className="text-[11px] font-medium text-[#15803D]">+15%</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            {language === 'bn' ? 'বিকাশ ও নগদ সেটেলমেন্ট সহ' : 'Settled via bKash & POS'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E2E8F0] pb-px">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'inventory' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-[#64748B]'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          {t('pharmacyCatalog')} ({formatNum(pharmacyInventory.length)})
        </button>
        <button
          onClick={() => setActiveTab('dispensing')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'dispensing' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-[#64748B]'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          {t('pendingVerificationQueue')} ({formatNum(pendingPrescriptions.length)})
        </button>
      </div>

      {/* Tab 1: Medication Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0A192F] font-display">
                {t('pharmacyCatalog')}
              </h3>
              <p className="text-xs text-[#64748B]">
                Registered pharmaceutical brands in Bangladesh (Square, Incepta, Beximco, Renata)
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  filterStatus === 'all' ? 'bg-white text-[#0A192F] font-semibold shadow-2xs' : 'text-[#64748B]'
                }`}
              >
                {t('all')}
              </button>
              <button
                onClick={() => setFilterStatus('low-stock')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  filterStatus === 'low-stock' ? 'bg-white text-[#B45309] font-semibold shadow-2xs' : 'text-[#64748B]'
                }`}
              >
                {t('lowStockAlerts')}
              </button>
              <button
                onClick={() => setFilterStatus('near-expiry')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  filterStatus === 'near-expiry' ? 'bg-white text-[#B91C1C] font-semibold shadow-2xs' : 'text-[#64748B]'
                }`}
              >
                {t('expiringWithin90')}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Medicine Brand & Manufacturer</th>
                  <th className="px-4 py-3.5 font-semibold">Lot / Batch #</th>
                  <th className="px-4 py-3.5 font-semibold">Available Stock</th>
                  <th className="px-4 py-3.5 font-semibold">Expiry Date</th>
                  <th className="px-4 py-3.5 font-semibold">Unit Price</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[#0A192F] font-display text-sm">{item.name}</div>
                      <div className="text-[11px] text-[#64748B]">{item.genericName} · {item.supplier}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[#475569]">
                      {item.batchNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold font-mono text-[#0A192F] tabular-nums">{formatNum(item.stock)}</span>
                      <span className="text-[11px] text-[#64748B] ml-1">{item.unit}</span>
                      <span className="text-[10px] text-[#94A3B8] block">Min: {formatNum(item.minThreshold)}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[#475569]">
                      {item.expiryDate}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-[#0F766E]">
                      {formatBDT(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold capitalize ${
                        item.status === 'in-stock'
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : item.status === 'low-stock'
                          ? 'bg-[#FEF3C7] text-[#B45309]'
                          : item.status === 'near-expiry'
                          ? 'bg-[#FEF2F2] text-[#B91C1C]'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}>
                        {item.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-0.5 border border-[#E2E8F0]">
                        <button
                          onClick={() => updateInventoryStock(item.id, -1)}
                          className="p-1 hover:bg-white text-[#64748B] hover:text-[#0A192F] rounded"
                          title="Reduce stock"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => updateInventoryStock(item.id, 10)}
                          className="px-2 py-0.5 hover:bg-white text-[11px] font-bold text-[#0F766E] rounded"
                          title="Restock +10"
                        >
                          +{formatNum(10)}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Prescription Verification & Dispensing Workflow */}
      {activeTab === 'dispensing' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#0A192F] font-display">
                {t('pendingVerificationQueue')}
              </h3>
              <p className="text-xs text-[#64748B]">
                Verify BMDC registration, dosage safety, and trigger bike courier dispatch across Dhaka
              </p>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {pendingPrescriptions.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-semibold text-[#0A192F]">
                    {language === 'bn' ? 'সকল প্রেসক্রিপশন ডিসপেন্স সম্পন্ন হয়েছে' : 'All Prescriptions Dispensed'}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">All clinical e-prescriptions verified and dispatched.</p>
                </div>
              ) : (
                pendingPrescriptions.map((rx) => (
                  <div key={rx.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0A192F]">{rx.drugName}</span>
                        <span className="font-mono text-xs font-semibold text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded">
                          {rx.dosage}
                        </span>
                        <span className="text-xs text-[#0F766E] font-medium">· {rx.frequency}</span>
                      </div>
                      <p className="text-xs text-[#475569] mt-1">{rx.instructions}</p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-[#64748B]">
                        <span>{t('patient')}: <strong>{activeConsultation.patientName}</strong> (Dhanmondi, Dhaka)</span>
                        <span aria-hidden="true">·</span>
                        <span>{t('doctor')}: <strong>{activeConsultation.doctorName} (BMDC A-48291)</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => dispensePrescription(rx.id)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-xs"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        {t('verifyAndDispatch')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
