import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  AlertTriangle, 
  ShieldCheck, 
  Globe, 
  Database, 
  RefreshCw, 
  X, 
  Pill, 
  Unlock, 
  Eye, 
  FileText, 
  Check,
  History,
  Info
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { 
  PrescriptionDrug, 
  MedicineCatalogItem, 
  DosageForm, 
  RouteOfAdministration 
} from '../../../types';
import { searchMedicines, MedicineSearchResult } from '../../../services/medicineService';
import { MOCK_PATIENT_PRESCRIPTION_HISTORY } from '../../../data/mockMedicines';

export const DOSAGE_FORMS: DosageForm[] = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Suspension',
  'Injection',
  'Inhaler',
  'Eye Drop',
  'Ear Drop',
  'Cream / Ointment',
  'Suppository'
];

export const ROUTES: RouteOfAdministration[] = [
  'Oral',
  'Sublingual',
  'Inhalation',
  'Topical',
  'Intravenous (IV)',
  'Intramuscular (IM)',
  'Ophthalmic',
  'Rectal'
];

// Frequency presets widely recognized in Bangladesh healthcare
export const FREQUENCY_PRESETS = [
  { value: '1 + 0 + 0', labelEn: '1 + 0 + 0 (Daily morning after breakfast)', labelBn: '১ + ০ + ০ (সকালে নাস্তার পর)' },
  { value: '0 + 0 + 1', labelEn: '0 + 0 + 1 (Daily at bedtime)', labelBn: '০ + ০ + ১ (রাতে ঘুমানোর আগে)' },
  { value: '1 + 0 + 1', labelEn: '1 + 0 + 1 (Twice daily after meals)', labelBn: '১ + ০ + ১ (সকাল ও রাতে আহারের পর)' },
  { value: '1 + 1 + 1', labelEn: '1 + 1 + 1 (Three times daily after meals)', labelBn: '১ + ১ + ১ (তিন বেলা আহারের পর)' },
  { value: '1 + 0 + 0 (Empty stomach)', labelEn: '1 + 0 + 0 (Morning empty stomach 30 min before food)', labelBn: '১ + ০ + ০ (সকালে খালি পেটে খাওয়ার ৩০ মিনিট আগে)' },
  { value: '1 + 0 + 1 (Empty stomach)', labelEn: '1 + 0 + 1 (Twice daily 30 min before meals)', labelBn: '১ + ০ + ১ (সকাল ও রাতে খাওয়ার ৩০ মিনিট আগে)' },
  { value: 'SOS / As needed', labelEn: 'SOS / As needed for symptoms', labelBn: 'প্রয়োজন অনুযায়ী (SOS)' }
];

/* =========================================================================
   1. MedicineSearch Component
   Search input, Local Catalog vs Online Search toggle, debounced query,
   keyboard navigation, loading state, error retry, result cards
   ========================================================================= */

export interface MedicineSearchProps {
  onSelectMedicine: (medicine: MedicineCatalogItem) => void;
  onManualEntryClick?: () => void;
  disabled?: boolean;
}

export const MedicineSearch: React.FC<MedicineSearchProps> = ({
  onSelectMedicine,
  onManualEntryClick,
  disabled = false
}) => {
  const { language, formatBDT } = useApp();
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState<'local' | 'online'>('local');
  const [results, setResults] = useState<MedicineSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultsContainerRef = useRef<HTMLDivElement | null>(null);

  // Debounced Search Effect
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setError(null);
      setHasSearched(false);
      setSelectedIndex(-1);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const data = await searchMedicines({
          query: trimmed,
          provider,
          locale: language === 'bn' ? 'bn-BD' : 'en-BD',
          signal: controller.signal
        });
        setResults(data);
        setHasSearched(true);
        setSelectedIndex(-1);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to search medicines');
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, provider, language]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      onSelectMedicine(results[selectedIndex].item);
      setQuery('');
      setResults([]);
    } else if (e.key === 'Escape') {
      setResults([]);
    }
  };

  const handleSelect = (item: MedicineCatalogItem) => {
    onSelectMedicine(item);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="space-y-3">
      {/* Search Header & Provider Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-[#0F766E]" />
          {language === 'bn' ? 'ঔষধ অনুসন্ধান ও ক্যাটালগ' : 'Medicine Search & Formulary'}
        </label>

        {/* Local Catalog vs Online Search Selector */}
        <div className="inline-flex p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setProvider('local')}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              provider === 'local'
                ? 'bg-white text-[#0F766E] shadow-2xs font-bold'
                : 'text-[#64748B] hover:text-[#0A192F]'
            }`}
          >
            <Database className="w-3 h-3 text-[#0F766E]" />
            <span>{language === 'bn' ? 'স্থানীয় ক্যাটালগ (DGDA)' : 'Local Catalog (DGDA)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setProvider('online')}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              provider === 'online'
                ? 'bg-white text-[#2563EB] shadow-2xs font-bold'
                : 'text-[#64748B] hover:text-[#0A192F]'
            }`}
          >
            <Globe className="w-3 h-3 text-[#2563EB]" />
            <span>{language === 'bn' ? 'অনলাইন অনুসন্ধান' : 'Online Search'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#DBEAFE] text-[#1E40AF] font-mono">
              API
            </span>
          </button>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-[#94A3B8]" />
        </div>
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            language === 'bn' 
              ? 'ব্র্যান্ড, জেনেরিক বা ক্ষমতা দিয়ে অনুসন্ধান করুন (যেমন Napa, Seclo 20mg)...'
              : 'Search medicine by brand, generic name, or strength (e.g. Napa, Seclo 20mg)...'
          }
          className="w-full pl-10 pr-24 py-2.5 bg-white border border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 rounded-2xl text-xs sm:text-sm text-[#0A192F] shadow-2xs placeholder-[#94A3B8] transition-all disabled:bg-[#F8FAFC] disabled:cursor-not-allowed"
        />

        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
          {loading && (
            <RefreshCw className="w-4 h-4 text-[#0F766E] animate-spin" />
          )}
          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="p-1 text-[#94A3B8] hover:text-[#0A192F] rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md font-mono border border-[#E2E8F0]">
            {provider === 'local' ? 'DGDA' : 'Web API'}
          </span>
        </div>
      </div>

      {/* Provider Context Notice */}
      {provider === 'online' && (
        <div className="p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl flex items-start gap-2 text-[11px] text-[#1E40AF]">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Online Medicine Search Mode: </span>
            External backend-mediated query simulation. Online results are reference items that require deliberate doctor verification before prescribing.
          </div>
        </div>
      )}

      {/* Search Error State */}
      {error && (
        <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl flex items-center justify-between text-xs text-[#B91C1C]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const currentQuery = query;
              setQuery('');
              setTimeout(() => setQuery(currentQuery), 50);
            }}
            className="text-[11px] font-bold text-[#0F766E] underline hover:no-underline"
          >
            {language === 'bn' ? 'পুনরায় চেষ্টা' : 'Retry'}
          </button>
        </div>
      )}

      {/* Search Results Dropdown/List */}
      {query.trim().length > 0 && !loading && (
        <div 
          ref={resultsContainerRef}
          className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xl overflow-hidden divide-y divide-[#F1F5F9] max-h-80 overflow-y-auto z-20"
        >
          {results.length > 0 ? (
            results.map((res, index) => {
              const item = res.item;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#E6F4F1]' : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.source === 'local_dgda' 
                        ? 'bg-[#E6F4F1] text-[#0F766E]' 
                        : 'bg-[#EFF6FF] text-[#2563EB]'
                    }`}>
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-sm text-[#0A192F]">{item.brandName}</span>
                        <span className="text-xs font-mono font-semibold bg-[#F1F5F9] text-[#0A192F] px-2 py-0.5 rounded border border-[#E2E8F0]">
                          {item.strength}
                        </span>
                        <span className="text-xs text-[#64748B]">· {item.dosageForm}</span>
                        {item.source === 'local_dgda' ? (
                          <span className="text-[10px] font-semibold bg-[#DCFCE7] text-[#15803D] px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" />
                            DGDA
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold bg-[#DBEAFE] text-[#1E40AF] px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <Globe className="w-3 h-3" />
                            {item.sourceLabel || 'Online'}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-[#475569] mt-0.5">
                        <span className="font-medium text-[#0F766E]">{item.genericName}</span>
                        <span className="text-[#94A3B8]"> — {item.manufacturer}</span>
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-[#64748B] mt-1 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {item.indicativePriceBDT && (
                      <span className="text-xs font-mono font-bold text-[#0A192F]">
                        {formatBDT(item.indicativePriceBDT)}
                        <span className="text-[10px] font-normal text-[#64748B] block text-right">/ unit</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(item);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {language === 'bn' ? 'বাছাই করুন' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : hasSearched ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-xs text-[#64748B]">
                {language === 'bn' 
                  ? `"${query}" এর জন্য কোনো ঔষধ পাওয়া যায়নি।` 
                  : `No verified medicines found matching "${query}".`}
              </p>
              {onManualEntryClick && (
                <button
                  type="button"
                  onClick={onManualEntryClick}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#0F766E] bg-[#E6F4F1] hover:bg-[#CCECE5] rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {language === 'bn' ? 'ম্যানুয়ালি ঔষধের বিবরণ লিখুন' : 'Add Medicine Manually'}
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Always accessible Add Medicine Manually button */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-[#64748B]">
          {language === 'bn' ? 'ক্যাটালগে না থাকলে ম্যানুয়ালি যোগ করুন:' : 'Can’t find in catalog?'}
        </span>
        {onManualEntryClick && !disabled && (
          <button
            type="button"
            onClick={onManualEntryClick}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-[#0F766E] hover:text-[#115E59] hover:bg-[#E6F4F1] rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ম্যানুয়ালি যোগ করুন' : 'Add medicine manually'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   2. PrescriptionBuilder Component
   Full Smart Prescription Builder supporting adding medicines from search or manual,
   editing dosage/frequency, maintaining prescription list, safety checks,
   summary sidebar, printable preview, and signing workflow.
   ========================================================================= */

export interface PrescriptionBuilderProps {
  onOpenPreview?: () => void;
  onOpenSignModal?: () => void;
  prescriptions?: PrescriptionDrug[];
  onPrescriptionsChange?: (items: PrescriptionDrug[]) => void;
  isSigned?: boolean;
}

export const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({
  onOpenPreview,
  onOpenSignModal,
  prescriptions: propPrescriptions,
  onPrescriptionsChange,
  isSigned: propIsSigned
}) => {
  const { 
    activeConsultation, 
    addPrescriptionToConsultation,
    updatePrescriptionItem,
    removePrescriptionItem,
    reorderPrescriptionItem,
    duplicatePrescriptionItem,
    unlockConsultationForAmendment,
    copyPrescriptionFromHistory,
    addToast,
    language,
    t,
    formatNum,
    formatBDT
  } = useApp();

  // Determine whether to sync with context or use local state
  const isContextMode = Boolean(activeConsultation && activeConsultation.prescriptions);
  const isSigned = propIsSigned !== undefined ? propIsSigned : activeConsultation?.status === 'signed';
  const prescriptionList: PrescriptionDrug[] = propPrescriptions !== undefined 
    ? propPrescriptions 
    : (activeConsultation?.prescriptions || []);

  // Form Drawer / Editor State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [brandName, setBrandName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState<DosageForm>('Tablet');
  const [route, setRoute] = useState<RouteOfAdministration>('Oral');
  const [frequency, setFrequency] = useState('1 + 0 + 1 (Twice daily after meals)');
  const [duration, setDuration] = useState('14 Days');
  const [instructions, setInstructions] = useState('Take after breakfast and dinner with water.');
  const [quantity, setQuantity] = useState('28 Tablets');
  const [pharmacyNotes, setPharmacyNotes] = useState('');
  const [catalogSource, setCatalogSource] = useState<'local_dgda' | 'careflow_emr' | 'online_external' | 'manual'>('local_dgda');
  const [indicativePriceBDT, setIndicativePriceBDT] = useState<number | undefined>(undefined);

  // History Tab Modal/Drawer
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Open Form with Pre-filled Data from Search
  const handleSelectFromSearch = (item: MedicineCatalogItem) => {
    setEditingId(null);
    setBrandName(item.brandName);
    setGenericName(item.genericName);
    setStrength(item.strength);
    setDosageForm(item.dosageForm);
    setRoute(item.route);
    setCatalogSource(item.source);
    setIndicativePriceBDT(item.indicativePriceBDT);

    // Apply sensible default instructions
    if (item.dosageForm === 'Tablet' || item.dosageForm === 'Capsule') {
      if (item.genericName.toLowerCase().includes('omeprazole') || item.genericName.toLowerCase().includes('pantoprazole')) {
        setFrequency('1 + 0 + 0 (Morning empty stomach 30 min before food)');
        setDuration('14 Days');
        setQuantity('14 Capsules');
        setInstructions('Take 30 minutes before breakfast with a glass of water.');
      } else if (item.genericName.toLowerCase().includes('paracetamol')) {
        setFrequency('1 + 0 + 1 (Twice daily after meals)');
        setDuration('5 Days');
        setQuantity('10 Tablets');
        setInstructions('Take for fever or pain. Do not exceed 4000mg/day.');
      } else if (item.genericName.toLowerCase().includes('metformin')) {
        setFrequency('1 + 0 + 1 (Twice daily after meals)');
        setDuration('30 Days');
        setQuantity('60 Tablets');
        setInstructions('Take with or immediately after meals to reduce GI upset.');
      } else {
        setFrequency('1 + 0 + 1 (Twice daily after meals)');
        setDuration('14 Days');
        setQuantity('28 Tablets');
        setInstructions('Take after meals with water as directed.');
      }
    } else if (item.dosageForm === 'Inhaler') {
      setFrequency('2 puffs twice daily');
      setDuration('30 Days');
      setQuantity('1 Inhaler');
      setInstructions('Rinse mouth with water after inhalation.');
    } else {
      setFrequency('1 + 0 + 1 (Twice daily after meals)');
      setDuration('7 Days');
      setQuantity('1 Unit');
      setInstructions('Follow doctor’s administration advice.');
    }

    setIsFormOpen(true);
  };

  // Open Manual Blank Entry Form
  const handleOpenManualEntry = () => {
    setEditingId(null);
    setBrandName('');
    setGenericName('');
    setStrength('');
    setDosageForm('Tablet');
    setRoute('Oral');
    setFrequency('1 + 0 + 1 (Twice daily after meals)');
    setDuration('7 Days');
    setQuantity('');
    setInstructions('');
    setPharmacyNotes('');
    setCatalogSource('manual');
    setIndicativePriceBDT(undefined);
    setIsFormOpen(true);
  };

  // Edit Existing Prescription
  const handleEditMedicine = (item: PrescriptionDrug) => {
    setEditingId(item.id);
    setBrandName(item.drugName);
    setGenericName(item.genericName || '');
    setStrength(item.strength || item.dosage || '');
    setDosageForm((item.dosageForm as DosageForm) || 'Tablet');
    setRoute((item.route as RouteOfAdministration) || 'Oral');
    setFrequency(item.frequency);
    setDuration(item.duration);
    setInstructions(item.instructions);
    setQuantity(item.quantity || '');
    setPharmacyNotes(item.pharmacyNotes || '');
    setCatalogSource(item.catalogSource || 'manual');
    setIndicativePriceBDT(item.indicativePriceBDT);
    setIsFormOpen(true);
  };

  // Form Submission
  const handleSavePrescriptionForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing Medicine Name',
        message: 'Please provide at least a brand or drug name.'
      });
      return;
    }

    const payload: Omit<PrescriptionDrug, 'id'> = {
      drugName: brandName.trim(),
      genericName: genericName.trim() || undefined,
      strength: strength.trim() || undefined,
      dosage: strength.trim() || 'Standard Dose',
      dosageForm,
      route,
      frequency,
      duration,
      instructions,
      quantity: quantity.trim() || undefined,
      pharmacyNotes: pharmacyNotes.trim() || undefined,
      catalogSource,
      isManualEntry: catalogSource === 'manual',
      indicativePriceBDT,
      dispensed: false
    };

    if (editingId) {
      if (isContextMode && updatePrescriptionItem) {
        updatePrescriptionItem(editingId, payload);
      } else if (onPrescriptionsChange) {
        onPrescriptionsChange(prescriptionList.map(p => p.id === editingId ? { ...p, ...payload } : p));
      }
    } else {
      if (isContextMode && addPrescriptionToConsultation) {
        addPrescriptionToConsultation(payload);
      } else if (onPrescriptionsChange) {
        const newItem: PrescriptionDrug = { ...payload, id: `rx-${Date.now().toString().slice(-4)}` };
        onPrescriptionsChange([...prescriptionList, newItem]);
      }
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  // Duplicate an item
  const handleDuplicate = (id: string) => {
    if (isContextMode && duplicatePrescriptionItem) {
      duplicatePrescriptionItem(id);
    } else if (onPrescriptionsChange) {
      const existing = prescriptionList.find(p => p.id === id);
      if (existing) {
        const copy: PrescriptionDrug = {
          ...existing,
          id: `rx-${Date.now().toString().slice(-4)}`,
          drugName: `${existing.drugName} (Copy)`
        };
        onPrescriptionsChange([...prescriptionList, copy]);
      }
    }
  };

  // Remove an item
  const handleRemove = (id: string) => {
    if (isContextMode && removePrescriptionItem) {
      removePrescriptionItem(id);
    } else if (onPrescriptionsChange) {
      onPrescriptionsChange(prescriptionList.filter(p => p.id !== id));
    }
  };

  // Reorder up/down
  const handleReorder = (id: string, direction: 'up' | 'down') => {
    if (isContextMode && reorderPrescriptionItem) {
      reorderPrescriptionItem(id, direction);
    } else if (onPrescriptionsChange) {
      const idx = prescriptionList.findIndex(p => p.id === id);
      if (idx < 0) return;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prescriptionList.length) return;
      const updated = [...prescriptionList];
      const [item] = updated.splice(idx, 1);
      updated.splice(targetIdx, 0, item);
      onPrescriptionsChange(updated);
    }
  };

  // Duplicate Drug Clinical Alert Check
  const duplicateAlerts = useMemo(() => {
    const alerts: string[] = [];
    const seenGenerics = new Set<string>();
    prescriptionList.forEach(item => {
      const gen = (item.genericName || '').trim().toLowerCase();
      if (gen) {
        if (seenGenerics.has(gen)) {
          alerts.push(`Multiple medications with active ingredient "${item.genericName}" detected!`);
        } else {
          seenGenerics.add(gen);
        }
      }
    });
    return alerts;
  }, [prescriptionList]);

  // Allergy Alert Check against Active Consultation allergies
  const allergyAlerts = useMemo(() => {
    const alerts: string[] = [];
    const patientAllergies = (activeConsultation?.allergies || ['Penicillin', 'Sulfa']).map((a: string) => a.toLowerCase());
    
    prescriptionList.forEach(item => {
      const name = item.drugName.toLowerCase();
      const gen = (item.genericName || '').toLowerCase();
      patientAllergies.forEach((all: string) => {
        if (name.includes(all) || gen.includes(all)) {
          alerts.push(`Potential allergy conflict: Patient is allergic to "${all}", matching "${item.drugName}"!`);
        }
      });
    });
    return alerts;
  }, [prescriptionList, activeConsultation]);

  // Total Estimated Price
  const totalEstimatedCost = useMemo(() => {
    return prescriptionList.reduce((acc, curr) => acc + (curr.indicativePriceBDT || 0), 0);
  }, [prescriptionList]);

  return (
    <div className="space-y-6">
      {/* Status Banner when Finalized */}
      {isSigned && (
        <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#065F46]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#059669] shrink-0" />
            <div>
              <span className="font-bold block text-sm">Prescription Officially Signed & Finalized</span>
              <span>BMDC Digital Certificate Registered. Modifications are locked to preserve medical-legal integrity.</span>
            </div>
          </div>
          {unlockConsultationForAmendment && (
            <button
              type="button"
              onClick={() => unlockConsultationForAmendment('Clinical adjustment requested by attending physician')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#0F766E] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-xl transition-all self-start sm:self-auto shadow-2xs"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সংশোধনের জন্য আনলক করুন' : 'Unlock for Amendment'}</span>
            </button>
          )}
        </div>
      )}

      {/* Safety Clinical Alerts */}
      {(duplicateAlerts.length > 0 || allergyAlerts.length > 0) && (
        <div className="space-y-2">
          {allergyAlerts.map((msg, i) => (
            <div key={`allergy-${i}`} className="p-3 bg-[#FEF2F2] border-l-4 border-[#DC2626] rounded-r-xl flex items-center gap-2.5 text-xs text-[#991B1B]">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span className="font-bold">{msg}</span>
            </div>
          ))}
          {duplicateAlerts.map((msg, i) => (
            <div key={`dup-${i}`} className="p-3 bg-[#FFFBEB] border-l-4 border-[#F59E0B] rounded-r-xl flex items-center gap-2.5 text-xs text-[#92400E]">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#F59E0B]" />
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Column (8 cols): Search, Add/Edit Form, Prescription List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Medicine Search Card */}
          {!isSigned && (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <MedicineSearch 
                onSelectMedicine={handleSelectFromSearch}
                onManualEntryClick={handleOpenManualEntry}
                disabled={isSigned}
              />
            </div>
          )}

          {/* Add / Edit Medicine Form Drawer */}
          {isFormOpen && !isSigned && (
            <form 
              onSubmit={handleSavePrescriptionForm}
              className="p-5 sm:p-6 bg-[#F8FAFC] border-2 border-[#0F766E]/40 rounded-3xl space-y-5 animate-in fade-in shadow-md"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold font-serif text-sm">
                    ℞
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0A192F] font-display">
                      {editingId 
                        ? (language === 'bn' ? 'ঔষধের নির্দেশাবলী সম্পাদনা করুন' : 'Edit Prescribed Medicine')
                        : (language === 'bn' ? 'প্রেসক্রিপশনে ঔষধ যুক্ত করুন' : 'Add Medication to Prescription (℞)')
                      }
                    </h4>
                    <span className="text-[11px] text-[#64748B]">
                      {catalogSource === 'local_dgda' 
                        ? 'DGDA Bangladesh Pharmacopeia Verified Entry' 
                        : catalogSource === 'online_external'
                        ? 'External Web Verified Reference'
                        : 'Manual Physician Clinical Entry'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#0A192F] rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Medicine Brand & Strength */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#0A192F] mb-1">
                    {language === 'bn' ? 'ঔষধের ব্র্যান্ড নাম *' : 'Medicine Brand Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Napa Extra, Seclo 20mg, Monas 10mg..."
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0A192F] focus:border-[#0F766E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0A192F] mb-1">
                    {language === 'bn' ? 'ক্ষমতা / শক্তি (Strength)' : 'Strength'}
                  </label>
                  <input
                    type="text"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    placeholder="e.g. 500mg, 20mg, 10mg"
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-mono text-[#0A192F] focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Generic Name & Dosage Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#0A192F] mb-1">
                    {language === 'bn' ? 'জেনেরিক / মূল উপাদান' : 'Generic / Active Ingredient'}
                  </label>
                  <input
                    type="text"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    placeholder="e.g. Paracetamol + Caffeine, Omeprazole..."
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0F766E] font-medium focus:border-[#0F766E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0A192F] mb-1">
                    {language === 'bn' ? 'ডোজের ধরণ' : 'Dosage Form'}
                  </label>
                  <select
                    value={dosageForm}
                    onChange={(e) => setDosageForm(e.target.value as DosageForm)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E] focus:outline-none"
                  >
                    {DOSAGE_FORMS.map((form) => (
                      <option key={form} value={form}>{form}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Route & Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#0A192F] mb-1">
                    {language === 'bn' ? 'প্রয়োগের পথ (Route)' : 'Route of Administration'}
                  </label>
                  <select
                    value={route}
                    onChange={(e) => setRoute(e.target.value as RouteOfAdministration)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E] focus:outline-none"
                  >
                    {ROUTES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0A192F] mb-1">
                    {language === 'bn' ? 'খাওয়ার নিয়ম / সময় (Frequency) *' : 'Frequency *'}
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E] focus:outline-none"
                  >
                    {FREQUENCY_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {language === 'bn' ? p.labelBn : p.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#0A192F] mb-1">
                    {language === 'bn' ? 'মেয়াদ (Duration) *' : 'Duration *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 7 Days, 14 Days, 1 Month..."
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0A192F] mb-1">
                    {language === 'bn' ? 'মোট পরিমাণ (Quantity)' : 'Total Dispense Quantity'}
                  </label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 14 Tablets, 1 Bottle..."
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Patient Instructions */}
              <div>
                <label className="block text-[11px] font-semibold text-[#0A192F] mb-1">
                  {language === 'bn' ? 'রোগীর জন্য বিশেষ নির্দেশনা' : 'Patient Instructions'}
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Take after meal with plenty of water. Do not chew."
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              {/* Optional Pharmacy Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                  {language === 'bn' ? 'ফার্মাসিস্টের জন্য নোট (ঐচ্ছিক)' : 'Pharmacy Dispensing Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={pharmacyNotes}
                  onChange={(e) => setPharmacyNotes(e.target.value)}
                  placeholder="e.g. Generic substitution permitted by physician..."
                  className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#64748B] focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0A192F] rounded-xl transition-colors"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {editingId 
                    ? (language === 'bn' ? 'সংরক্ষণ করুন' : 'Update Medicine') 
                    : (language === 'bn' ? 'প্রেসক্রিপশনে যুক্ত করুন' : 'Add to Prescription')}
                </button>
              </div>
            </form>
          )}

          {/* List of Prescribed Medicines */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#0A192F] font-display">
                  {language === 'bn' ? 'প্রেসক্রিপশন তালিকা' : 'Prescription Medicine List'}
                </span>
                <span className="text-xs font-mono font-bold bg-[#E6F4F1] text-[#0F766E] px-2.5 py-0.5 rounded-full">
                  {formatNum(prescriptionList.length)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F766E] hover:bg-[#E6F4F1] rounded-xl transition-colors"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'পূর্ববর্তী প্রেসক্রিপশন' : 'Past Prescriptions'}</span>
                </button>
              </div>
            </div>

            {prescriptionList.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-[#E2E8F0] rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] text-[#94A3B8] mx-auto flex items-center justify-center">
                  <Pill className="w-6 h-6" />
                </div>
                <div className="text-xs text-[#64748B]">
                  <p className="font-semibold text-[#0A192F]">
                    {language === 'bn' ? 'প্রেসক্রিপশনে কোনো ঔষধ যোগ করা হয়নি।' : 'No medicines added to this prescription yet.'}
                  </p>
                  <p className="mt-0.5">
                    {language === 'bn' 
                      ? 'উপরের সার্চ বক্স থেকে ঔষধ খুঁজুন অথবা ম্যানুয়ালি যোগ করুন।' 
                      : 'Search from verified DGDA catalog or enter medications manually above.'}
                  </p>
                </div>
                {!isSigned && (
                  <button
                    type="button"
                    onClick={handleOpenManualEntry}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'প্রথম ঔষধ যোগ করুন' : 'Add First Medicine'}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptionList.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl transition-all shadow-2xs group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Medicine details */}
                    <div className="flex items-start gap-3">
                      {/* Position & Reorder handles */}
                      <div className="flex flex-col items-center justify-center pt-0.5">
                        <span className="font-mono text-xs font-bold text-[#64748B]">
                          #{index + 1}
                        </span>
                        {!isSigned && (
                          <div className="flex flex-col gap-0.5 mt-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleReorder(item.id, 'up')}
                              className="p-1 text-[#94A3B8] hover:text-[#0F766E] disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                              title="Move up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={index === prescriptionList.length - 1}
                              onClick={() => handleReorder(item.id, 'down')}
                              className="p-1 text-[#94A3B8] hover:text-[#0F766E] disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                              title="Move down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Pill Badge */}
                      <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center shrink-0">
                        <Pill className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-[#0A192F]">{item.drugName}</span>
                          <span className="text-xs font-mono font-semibold text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded">
                            {item.dosage || item.strength}
                          </span>
                          <span className="text-xs text-[#64748B]">
                            · {item.dosageForm || 'Tablet'}
                          </span>
                          {item.route && (
                            <span className="text-[10px] bg-[#F1F5F9] text-[#475569] px-1.5 py-0.2 rounded font-mono">
                              {item.route}
                            </span>
                          )}
                          {item.catalogSource === 'local_dgda' && (
                            <span className="text-[10px] bg-[#DCFCE7] text-[#15803D] font-bold px-1.5 py-0.2 rounded">
                              DGDA Verified
                            </span>
                          )}
                          {item.catalogSource === 'online_external' && (
                            <span className="text-[10px] bg-[#DBEAFE] text-[#1E40AF] font-bold px-1.5 py-0.2 rounded">
                              Online Ref
                            </span>
                          )}
                          {item.catalogSource === 'manual' && (
                            <span className="text-[10px] bg-[#FEF3C7] text-[#B45309] font-bold px-1.5 py-0.2 rounded">
                              Manual Entry
                            </span>
                          )}
                        </div>

                        {item.genericName && (
                          <div className="text-xs text-[#475569]">
                            <span className="font-medium text-[#0F766E]">{item.genericName}</span>
                          </div>
                        )}

                        <div className="text-xs text-[#0A192F] font-semibold flex flex-wrap gap-2 pt-0.5">
                          <span className="text-[#0F766E]">℞ {item.frequency}</span>
                          <span className="text-[#64748B]">· {item.duration}</span>
                          {item.quantity && <span className="text-[#64748B] font-mono">· Qty: {item.quantity}</span>}
                        </div>

                        {item.instructions && (
                          <p className="text-xs text-[#64748B] italic">
                            "{item.instructions}"
                          </p>
                        )}

                        {item.pharmacyNotes && (
                          <p className="text-[11px] text-[#2563EB]">
                            Rx Note: {item.pharmacyNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {item.indicativePriceBDT && (
                        <span className="text-xs font-mono font-bold text-[#0A192F] mr-2">
                          {formatBDT(item.indicativePriceBDT)}
                        </span>
                      )}

                      {!isSigned && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(item.id)}
                            className="p-2 text-[#64748B] hover:text-[#0F766E] hover:bg-[#E6F4F1] rounded-xl transition-colors"
                            title="Duplicate entry"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditMedicine(item)}
                            className="p-2 text-[#64748B] hover:text-[#0F766E] hover:bg-[#E6F4F1] rounded-xl transition-colors"
                            title="Edit details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            className="p-2 text-[#64748B] hover:text-[#B91C1C] hover:bg-[#FEE2E2] rounded-xl transition-colors"
                            title="Remove from prescription"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Secondary Column (4 cols): Patient & Encounter Summary, Stats, Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Patient and Encounter Summary Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider font-display">
              {language === 'bn' ? 'রোগী ও এনকাউন্টার সারসংক্ষেপ' : 'Patient & Encounter Summary'}
            </h4>

            <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">{t('patient')}:</span>
                <span className="font-bold text-[#0A192F]">{activeConsultation?.patientName || 'Mohammad Rafiqul Islam'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Age / Sex / Blood:</span>
                <span className="font-semibold text-[#0A192F]">{formatNum(54)}Y / Male / B+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">MRN:</span>
                <span className="font-mono font-bold text-[#0F766E]">EVR-DHK-784920</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Encounter ID:</span>
                <span className="font-mono text-[#0A192F]">#{activeConsultation?.id || 'ENC-9021'}</span>
              </div>
            </div>

            {/* Known Allergies */}
            <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl">
              <span className="text-[11px] font-bold text-[#B91C1C] flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t('allergies')}
              </span>
              <p className="text-xs text-[#7F1D1D] font-medium">
                {(activeConsultation?.allergies || ['Penicillin', 'Sulfa']).join(', ')}
              </p>
            </div>
          </div>

          {/* Prescription Status & Statistics */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider font-display">
              {language === 'bn' ? 'প্রেসক্রিপশন স্থিতি ও মূল্যায়ন' : 'Prescription Status & Metrics'}
            </h4>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                <span className="text-[11px] text-[#64748B] block">Medicines</span>
                <span className="text-xl font-extrabold text-[#0A192F] font-mono">
                  {formatNum(prescriptionList.length)}
                </span>
              </div>
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                <span className="text-[11px] text-[#64748B] block">Status</span>
                <span className={`text-xs font-bold block mt-1 ${isSigned ? 'text-[#15803D]' : 'text-[#B45309]'}`}>
                  {isSigned ? 'Finalized' : 'Draft'}
                </span>
              </div>
            </div>

            {totalEstimatedCost > 0 && (
              <div className="p-3.5 bg-[#E6F4F1] border border-[#CCECE5] rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#0F766E] block">Est. Pharmacy Cost</span>
                  <span className="text-[10px] text-[#64748B]">Retail BDT estimation</span>
                </div>
                <span className="text-base font-extrabold text-[#0F766E] font-mono">
                  {formatBDT(totalEstimatedCost)}
                </span>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {/* Preview Prescription Button */}
              {onOpenPreview && (
                <button
                  type="button"
                  onClick={onOpenPreview}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-[#0A192F] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-2xl transition-all shadow-2xs"
                >
                  <Eye className="w-4 h-4 text-[#0F766E]" />
                  <span>{language === 'bn' ? 'প্রেসক্রিপশন প্রিভিউ ও প্রিন্ট' : 'Preview Printable Prescription'}</span>
                </button>
              )}

              {/* Save Draft Action */}
              {!isSigned && (
                <button
                  type="button"
                  onClick={() => {
                    addToast({
                      type: 'success',
                      title: 'Draft Saved',
                      message: 'Prescription draft saved to consultation encounter.'
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0A192F] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-2xl transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>{language === 'bn' ? 'খসড়া সংরক্ষণ করুন' : 'Save Draft'}</span>
                </button>
              )}

              {/* Sign and Finalize Action */}
              {!isSigned && onOpenSignModal && (
                <button
                  type="button"
                  disabled={prescriptionList.length === 0}
                  onClick={onOpenSignModal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] disabled:bg-[#94A3B8] disabled:cursor-not-allowed rounded-2xl transition-all shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'bn' ? 'স্বাক্ষর ও চূড়ান্ত অনুমোদন' : 'Sign & Finalize Prescription'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Past Prescriptions History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#0F766E]" />
                <span className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                  {language === 'bn' ? 'রোগীর পূর্ববর্তী প্রেসক্রিপশন ইতিহাস' : 'Patient Past Prescription History'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {MOCK_PATIENT_PRESCRIPTION_HISTORY.map((hist) => (
                <div key={hist.id} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#0A192F] font-mono">{hist.encounterId}</span>
                      <span className="text-xs text-[#64748B]"> · {hist.date} · {hist.doctorName}</span>
                    </div>
                    {copyPrescriptionFromHistory && !isSigned && (
                      <button
                        type="button"
                        onClick={() => {
                          copyPrescriptionFromHistory(hist.prescriptions);
                          setShowHistoryModal(false);
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-[#0F766E] bg-white border border-[#CBD5E1] hover:bg-[#E6F4F1] rounded-xl transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'এই প্রেসক্রিপশন কপি করুন' : 'Copy All to Current'}</span>
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-[#E2E8F0] bg-white rounded-xl border border-[#E2E8F0] p-3 text-xs space-y-2">
                    {hist.prescriptions.map((m) => (
                      <div key={m.id} className="pt-2 first:pt-0 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#0A192F]">{m.drugName} {m.dosage || m.strength}</span>
                          <span className="text-[#0F766E] ml-2">({m.frequency})</span>
                          <p className="text-[11px] text-[#64748B]">{m.instructions}</p>
                        </div>
                        <span className="font-mono text-[#64748B] text-[11px]">{m.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
