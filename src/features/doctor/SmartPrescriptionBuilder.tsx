import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Globe, 
  Database, 
  RefreshCw, 
  X, 
  Pill, 
  FileCheck, 
  Clock, 
  Lock, 
  Unlock, 
  Eye, 
  FileText, 
  Info,
  Check,
  History,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  PrescriptionDrug, 
  MedicineCatalogItem, 
  DosageForm, 
  RouteOfAdministration 
} from '../../types';
import { searchMedicines, MedicineSearchResult } from '../../services/medicineService';
import { MOCK_PATIENT_PRESCRIPTION_HISTORY } from '../../data/mockMedicines';

interface SmartPrescriptionBuilderProps {
  onOpenPreview: () => void;
  onOpenSignModal: () => void;
}

const DOSAGE_FORMS: DosageForm[] = [
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

const ROUTES: RouteOfAdministration[] = [
  'Oral',
  'Sublingual',
  'Inhalation',
  'Topical',
  'Intravenous (IV)',
  'Intramuscular (IM)',
  'Ophthalmic',
  'Rectal'
];

export const SmartPrescriptionBuilder: React.FC<SmartPrescriptionBuilderProps> = ({
  onOpenPreview,
  onOpenSignModal
}) => {
  const { 
    activeConsultation, 
    updateConsultation, 
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

  const isSigned = activeConsultation.status === 'signed';

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchProvider, setSearchProvider] = useState<'local' | 'online'>('local');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MedicineSearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Form State (For Adding / Editing Medicine)
  const [showEditorForm, setShowEditorForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [brandName, setBrandName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState<DosageForm>('Tablet');
  const [route, setRoute] = useState<RouteOfAdministration>('Oral');
  const [dose, setDose] = useState('1 Tablet');
  const [frequency, setFrequency] = useState('1 + 0 + 1 (Twice daily after meals)');
  const [duration, setDuration] = useState('30 Days');
  const [quantity, setQuantity] = useState('60 Tablets');
  const [mealTiming, setMealTiming] = useState<'Before meals' | 'After meals' | 'With meals' | 'Empty stomach' | 'At bedtime' | 'Anytime'>('After meals');
  const [patientInstructions, setPatientInstructions] = useState('');
  const [pharmacyNotes, setPharmacyNotes] = useState('');
  const [catalogSource, setCatalogSource] = useState<'local_dgda' | 'careflow_emr' | 'online_external' | 'manual'>('local_dgda');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manufacturer, setManufacturer] = useState('');
  const [indicativePriceBDT, setIndicativePriceBDT] = useState<number | undefined>(undefined);
  const [darNo, setDarNo] = useState<string | undefined>(undefined);

  // History Tab in Secondary Column
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryEncounter, setSelectedHistoryEncounter] = useState(MOCK_PATIENT_PRESCRIPTION_HISTORY[0]);

  // Amendment modal state
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [amendmentReasonText, setAmendmentReasonText] = useState('');

  // Quick preset frequencies
  const FREQUENCY_PRESETS = [
    { label: language === 'bn' ? '১ + ০ + ০ (সকালে নাস্তার পর)' : '1 + 0 + 0 (Daily morning after meals)', value: '1 + 0 + 0 (Daily morning after breakfast)' },
    { label: language === 'bn' ? '১ + ০ + ১ (সকালে ও রাতে খাবারের পর)' : '1 + 0 + 1 (Twice daily after meals)', value: '1 + 0 + 1 (Twice daily after meals)' },
    { label: language === 'bn' ? '১ + ১ + ১ (তিন বেলা খাবারের পর)' : '1 + 1 + 1 (Three times daily after meals)', value: '1 + 1 + 1 (Three times daily after meals)' },
    { label: language === 'bn' ? '০ + ০ + ১ (রাতে খাবারের পর / শোবার আগে)' : '0 + 0 + 1 (At bedtime)', value: '0 + 0 + 1 (At bedtime)' },
    { label: language === 'bn' ? '১ + ০ + ০ (খাবারের ৩০ মিনিট পূর্বে)' : '1 + 0 + 0 (30 mins before breakfast)', value: '1 + 0 + 0 (30 mins before breakfast)' },
    { label: language === 'bn' ? '১ + ০ + ১ (খাবারের ৩০ মিনিট পূর্বে)' : '1 + 0 + 1 (30 mins before meals)', value: '1 + 0 + 1 (30 mins before meals)' },
    { label: language === 'bn' ? 'প্রয়োজনে (PRN)' : 'As needed (PRN)', value: 'As needed (PRN)' },
  ];

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setSearchError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSearching(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const results = await searchMedicines({
          query: searchQuery,
          provider: searchProvider,
          locale: language === 'bn' ? 'bn-BD' : 'en-BD',
          signal: controller.signal
        });
        setSearchResults(results);
        setHasSearched(true);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setSearchError('Search failed to respond. Please check connectivity or retry.');
        }
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, searchProvider, language]);

  // Allergy safety check
  const allergyWarning = useMemo(() => {
    const knownAllergies = activeConsultation.allergies || [];
    if (!knownAllergies.length) return null;

    const termToCheck = `${brandName} ${genericName}`.toLowerCase();
    
    for (const allergy of knownAllergies) {
      const aLower = allergy.toLowerCase();
      if (aLower.includes('penicillin') && (termToCheck.includes('amoxicillin') || termToCheck.includes('penicillin') || termToCheck.includes('moxaclav') || termToCheck.includes('augmentin') || termToCheck.includes('ampicillin'))) {
        return language === 'bn' 
          ? `সতর্কতা: রোগীর পেনিসিলিন এলার্জি রয়েছে! (${allergy})। এই ওষুধটিতে পেনিসিলিন ডেরিভেটিভ রয়েছে।` 
          : `High Risk Allergy: Patient has documented ${allergy}. This medication belongs to or cross-reacts with the Penicillin class.`;
      }
      if (aLower.includes('sulfa') && (termToCheck.includes('sulfa') || termToCheck.includes('cotrimoxazole') || termToCheck.includes('bactrim'))) {
        return language === 'bn'
          ? `সতর্কতা: রোগীর সালফা এলার্জি রয়েছে! (${allergy})`
          : `High Risk Allergy: Patient has documented ${allergy}.`;
      }
      if (aLower.includes('nsaid') && (termToCheck.includes('ibuprofen') || termToCheck.includes('naproxen') || termToCheck.includes('diclofenac') || termToCheck.includes('ketorolac'))) {
        return language === 'bn'
          ? `সতর্কতা: রোগীর এনএসএআইডি (NSAIDs) এলার্জি বা গ্যাস্ট্রিক ঝুঁকি রয়েছে! (${allergy})`
          : `High Risk Caution: Patient has documented ${allergy}.`;
      }
    }
    return null;
  }, [brandName, genericName, activeConsultation.allergies, language]);

  // Duplicate drug check
  const duplicateWarning = useMemo(() => {
    if (!brandName && !genericName) return null;
    const currentName = brandName.toLowerCase().trim();
    const currentGen = genericName.toLowerCase().trim();

    const exists = activeConsultation.prescriptions.some((rx) => {
      if (editingId && rx.id === editingId) return false;
      const rxDrug = rx.drugName.toLowerCase();
      const rxGen = (rx.genericName || '').toLowerCase();
      return (currentName && rxDrug.includes(currentName)) || (currentGen && rxGen.includes(currentGen));
    });

    if (exists) {
      return language === 'bn'
        ? `সতর্কতা: এই ওষুধ বা এর জেনেরিক উপাদান ইতোমধ্যেই প্রেসক্রিপশন তালিকায় বিদ্যমান রয়েছে।`
        : `Duplicate Warning: Similar medication or active ingredient is already prescribed in this encounter.`;
    }
    return null;
  }, [brandName, genericName, activeConsultation.prescriptions, editingId, language]);

  // Selecting a search result
  const handleSelectMedicine = (item: MedicineCatalogItem) => {
    setEditingId(null);
    setBrandName(item.brandName);
    setGenericName(item.genericName);
    setStrength(item.strength);
    setDosageForm(item.dosageForm);
    setRoute(item.route);
    setManufacturer(item.manufacturer);
    setCatalogSource(item.source);
    setIsManualEntry(false);
    setIndicativePriceBDT(item.indicativePriceBDT);
    setDarNo(item.darNo);

    // Contextual sensible defaults based on dosage form
    if (item.dosageForm === 'Inhaler') {
      setDose('2 Puffs');
      setQuantity('1 Inhaler Canister');
      setPatientInstructions(language === 'bn' ? 'ব্যবহারের পূর্বে ভালো করে ঝাঁকিয়ে নিন এবং মুখ ধুয়ে ফেলুন।' : 'Rinse mouth thoroughly with water after inhalation.');
    } else if (item.dosageForm === 'Syrup') {
      setDose('5 ml (1 tsp)');
      setQuantity('1 Bottle (100ml)');
      setPatientInstructions(language === 'bn' ? 'পরিমাপক কাপ দিয়ে মেপে সেবন করুন।' : 'Measure with provided dosage cup. Shake well.');
    } else if (item.dosageForm === 'Cream / Ointment') {
      setDose('Apply thin layer');
      setQuantity('1 Tube (15g)');
      setPatientInstructions(language === 'bn' ? 'আক্রান্ত স্থানে পরিষ্কার করে হালকাভাবে লাগান।' : 'Apply thinly to affected area twice daily.');
    } else {
      setDose(`1 ${item.dosageForm}`);
      setQuantity(item.dosageForm === 'Tablet' ? '30 Tablets' : '30 Capsules');
      setPatientInstructions(language === 'bn' ? 'পর্যাপ্ত পানি সহ সেব্য।' : 'Take orally with water.');
    }

    if (item.genericName.toLowerCase().includes('omeprazole') || item.genericName.toLowerCase().includes('esomeprazole') || item.genericName.toLowerCase().includes('pantoprazole')) {
      setFrequency('1 + 0 + 0 (30 mins before breakfast)');
      setMealTiming('Before meals');
    } else if (item.genericName.toLowerCase().includes('atorvastatin')) {
      setFrequency('0 + 0 + 1 (At bedtime)');
      setMealTiming('At bedtime');
    } else {
      setFrequency('1 + 0 + 1 (Twice daily after meals)');
      setMealTiming('After meals');
    }

    setShowEditorForm(true);
  };

  // Open clean manual entry form
  const handleOpenManualEntry = () => {
    setEditingId(null);
    setBrandName(searchQuery.trim() || '');
    setGenericName('');
    setStrength('');
    setDosageForm('Tablet');
    setRoute('Oral');
    setDose('1 Tablet');
    setFrequency('1 + 0 + 1 (Twice daily after meals)');
    setDuration('14 Days');
    setQuantity('28 Tablets');
    setMealTiming('After meals');
    setPatientInstructions(language === 'bn' ? 'নিয়মিত সেব্য।' : 'Take prescribed dose after meals.');
    setPharmacyNotes('');
    setCatalogSource('manual');
    setIsManualEntry(true);
    setManufacturer('');
    setIndicativePriceBDT(undefined);
    setDarNo(undefined);
    setShowEditorForm(true);
  };

  // Edit existing prescription entry
  const handleEditPrescription = (rx: PrescriptionDrug) => {
    setEditingId(rx.id);
    setBrandName(rx.drugName);
    setGenericName(rx.genericName || '');
    setStrength(rx.strength || rx.dosage || '');
    setDosageForm((rx.dosageForm as DosageForm) || 'Tablet');
    setRoute((rx.route as RouteOfAdministration) || 'Oral');
    setDose(rx.dose || '1 Tablet');
    setFrequency(rx.frequency);
    setDuration(rx.duration);
    setQuantity(rx.quantity || '30 Units');
    setMealTiming(rx.mealTiming || 'After meals');
    setPatientInstructions(rx.instructions);
    setPharmacyNotes(rx.pharmacyNotes || '');
    setCatalogSource(rx.catalogSource || 'local_dgda');
    setIsManualEntry(!!rx.isManualEntry);
    setManufacturer(rx.manufacturer || '');
    setIndicativePriceBDT(rx.indicativePriceBDT);
    setDarNo(rx.darNo);
    setShowEditorForm(true);
  };

  // Save entry (either add or update)
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() && !genericName.trim()) {
      addToast({
        type: 'warning',
        title: 'Validation Error',
        message: 'Please provide either a brand name or active generic substance.',
      });
      return;
    }

    const compiledDrugName = brandName.trim() || genericName.trim();
    const itemData: Omit<PrescriptionDrug, 'id'> = {
      drugName: compiledDrugName,
      genericName: genericName.trim() || undefined,
      strength: strength.trim() || undefined,
      dosage: strength.trim() || undefined,
      dosageForm,
      route,
      dose: dose.trim(),
      frequency,
      duration: duration.trim(),
      quantity: quantity.trim(),
      mealTiming,
      instructions: patientInstructions.trim() || (language === 'bn' ? 'চিকিৎসকের পরামর্শ অনুযায়ী সেব্য।' : 'Take as directed.'),
      pharmacyNotes: pharmacyNotes.trim() || undefined,
      catalogSource,
      isManualEntry,
      verified: catalogSource === 'local_dgda',
      manufacturer: manufacturer.trim() || undefined,
      indicativePriceBDT,
      darNo,
      dispensed: false
    };

    if (editingId) {
      updatePrescriptionItem(editingId, itemData);
      setEditingId(null);
    } else {
      addPrescriptionToConsultation(itemData);
    }

    setShowEditorForm(false);
  };

  // Cancel edit/add form
  const handleCancelForm = () => {
    setShowEditorForm(false);
    setEditingId(null);
  };

  // Calculate total estimated medicine price
  const totalEstimatedCost = useMemo(() => {
    return activeConsultation.prescriptions.reduce((sum, rx) => {
      return sum + (rx.indicativePriceBDT || 0);
    }, 0);
  }, [activeConsultation.prescriptions]);

  // Handle audited amendment unlock
  const handleConfirmUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amendmentReasonText.trim()) return;
    unlockConsultationForAmendment(amendmentReasonText.trim());
    setShowAmendmentModal(false);
    setAmendmentReasonText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice if Signed/Locked */}
      {isSigned && (
        <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#166534]">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#15803D] shrink-0" />
            <div>
              <span className="font-bold block sm:inline mr-2">
                {language === 'bn' ? 'প্রেসক্রিপশনটি বিএমডিসি স্বাক্ষরিত ও লক করা রয়েছে।' : 'Prescription is locked & digitally signed under BMDC Reg: A-48291.'}
              </span>
              <span className="text-[#15803D]/80">
                {language === 'bn' ? 'সংশোধন প্রয়োজন হলে অডিট অনুমোদন নিয়ে আনলক করুন।' : 'Locked records preserve medical chain of custody. Authorized clinical amendment required to modify.'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowAmendmentModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#86EFAC] text-[#15803D] hover:bg-[#DCFCE7] font-bold rounded-xl transition-colors shadow-2xs whitespace-nowrap self-start sm:self-auto"
          >
            <Unlock className="w-3.5 h-3.5" />
            {t('unlockAmendment')}
          </button>
        </div>
      )}

      {/* Main Two-Column Prescription Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================
            MAIN COLUMN (8 COLS): Search, Results, Form, Prescription List
           ======================================================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Search & Catalog Selector */}
          {!isSigned && (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#0A192F] font-display flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#0F766E]" />
                    {language === 'bn' ? 'স্মার্ট ঔষধ অনুসন্ধান ও ক্যাটালগ' : 'Smart Medicine Search & Clinical Catalog'}
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    {language === 'bn' 
                      ? 'ডিজিডিএ নিবন্ধিত ওষুধ, ব্র্যান্ড, জেনেরিক নাম ও পাওয়ার দিয়ে খুঁজুন' 
                      : 'Search DGDA-approved Bangladesh pharma brands, generics, strengths & forms'}
                  </p>
                </div>

                {/* Local vs Online Provider Selector */}
                <div className="flex items-center p-1 bg-[#F1F5F9] rounded-xl self-start sm:self-auto text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSearchProvider('local')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      searchProvider === 'local'
                        ? 'bg-white text-[#0F766E] shadow-2xs font-bold'
                        : 'text-[#64748B] hover:text-[#0A192F]'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    {t('localCatalogTab')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchProvider('online')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      searchProvider === 'online'
                        ? 'bg-[#0A192F] text-white shadow-2xs font-bold'
                        : 'text-[#64748B] hover:text-[#0A192F]'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {t('onlineSearchTab')}
                  </button>
                </div>
              </div>

              {/* Online Provider Trust Banner */}
              {searchProvider === 'online' && (
                <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-xs text-[#92400E] flex items-start gap-2 animate-in fade-in">
                  <Info className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="font-semibold block sm:inline mr-1">
                      {language === 'bn' ? 'অনলাইন অনুসন্ধান সক্রিয়:' : 'Online Web Search Active:'}
                    </strong>
                    {t('onlineDisclaimer')}
                  </p>
                </div>
              )}

              {/* Search Input Box */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#94A3B8]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchMedicinePlaceholder')}
                  className="w-full pl-10 pr-24 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl text-xs text-[#0A192F] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all font-medium"
                />

                <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                  {isSearching && (
                    <RefreshCw className="w-4 h-4 text-[#0F766E] animate-spin mr-1" />
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 hover:bg-[#E2E8F0] rounded-lg text-[#64748B] transition-colors"
                      title={t('clearSearch')}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={handleOpenManualEntry}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#0F766E] bg-[#E6F4F1] hover:bg-[#CCFBF1] rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="hidden sm:inline">{t('addMedicineManually')}</span>
                    <span className="sm:hidden">{language === 'bn' ? 'ম্যানুয়াল' : 'Manual'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Sample Search Tags */}
              {!searchQuery && (
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-[#94A3B8] font-medium mr-1">
                    {language === 'bn' ? 'জনপ্রিয় অনুসন্ধান:' : 'Quick search:'}
                  </span>
                  {['Napa Extra', 'Seclo 20mg', 'Togent 10mg', 'Compath 500/50', 'Monas 10mg', 'Camlodin 5mg', 'Bexitrol Inhaler', 'Fexo 120mg'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchQuery(tag)}
                      className="px-2.5 py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] hover:text-[#0A192F] rounded-lg transition-colors font-mono text-[11px]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Search Error State */}
              {searchError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl text-xs text-[#B91C1C] flex items-center justify-between">
                  <span>{searchError}</span>
                  <button
                    onClick={() => {
                      setSearchQuery((q) => q + ' ');
                    }}
                    className="font-bold underline ml-2"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Search Results Dropdown / Panel */}
              {searchQuery && (
                <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden bg-white divide-y divide-[#F1F5F9] max-h-80 overflow-y-auto shadow-inner">
                  {searchResults.length > 0 ? (
                    searchResults.map(({ item, matchScore }) => {
                      const isExternal = item.source === 'online_external';
                      return (
                        <div
                          key={item.id}
                          className="p-3.5 hover:bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-xs sm:text-sm text-[#0A192F] font-display">
                                {item.brandName}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded">
                                {item.strength}
                              </span>
                              <span className="text-[10px] text-[#475569] font-medium bg-[#F1F5F9] px-2 py-0.5 rounded">
                                {item.dosageForm} ({item.route})
                              </span>
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                isExternal ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#DCFCE7] text-[#15803D]'
                              }`}>
                                {item.sourceLabel}
                              </span>
                            </div>

                            <p className="text-xs text-[#334155] font-medium">
                              {language === 'bn' ? 'মূল উপাদান:' : 'Generic:'} <span className="text-[#0F766E] font-semibold">{item.genericName}</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#64748B]">
                              <span>🏢 {item.manufacturer}</span>
                              {item.indicativePriceBDT && (
                                <span className="font-mono text-[#0A192F] font-semibold">
                                  MRP: {formatBDT(item.indicativePriceBDT)} / unit
                                </span>
                              )}
                              {item.darNo && <span className="font-mono text-[10px]">DAR: {item.darNo}</span>}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectMedicine(item)}
                            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shrink-0 shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {language === 'bn' ? 'বাছাই ও প্রেসক্রাইব' : 'Select & Prescribe'}
                          </button>
                        </div>
                      );
                    })
                  ) : hasSearched && !isSearching ? (
                    <div className="p-8 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center mx-auto">
                        <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#0A192F]">{t('noResultsTitle')}</h4>
                        <p className="text-[11px] text-[#64748B] max-w-sm mx-auto mt-0.5">
                          {t('noResultsHint')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenManualEntry}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] text-white text-xs font-bold rounded-xl hover:bg-[#115E59] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {t('addMedicineManually')}
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Structured Medicine Addition / Edit Form */}
          {showEditorForm && !isSigned && (
            <form onSubmit={handleSaveEntry} className="p-5 sm:p-6 bg-[#F8FAFC] border-2 border-[#0F766E]/30 rounded-3xl space-y-5 animate-in fade-in shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h4 className="text-sm font-bold text-[#0A192F] font-display flex items-center gap-2">
                    <Pill className="w-4 h-4 text-[#0F766E]" />
                    {editingId ? (language === 'bn' ? 'প্রেসক্রিপশন এডিট করুন' : 'Edit Prescribed Medicine') : (language === 'bn' ? 'নতুন ঔষধ যুক্ত করুন' : 'Configure Medication Instructions (℞)')}
                  </h4>
                  <span className="text-[11px] text-[#64748B]">
                    {catalogSource === 'local_dgda' ? 'DGDA Bangladesh Pharmacopeia Standard' : catalogSource === 'online_external' ? 'External Web Reference (Requires Doctor Review)' : 'Manual Prescribing Entry'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="p-1 hover:bg-[#E2E8F0] rounded-lg text-[#64748B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Safety Alert Banners */}
              {allergyWarning && (
                <div className="p-3 bg-[#FEF2F2] border border-[#F87171] rounded-2xl flex items-start gap-2.5 text-xs text-[#991B1B]">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626] mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">{t('allergyWarning')}</span>
                    <p className="leading-relaxed">{allergyWarning}</p>
                  </div>
                </div>
              )}

              {duplicateWarning && (
                <div className="p-3 bg-[#FFFBEB] border border-[#FBBF24] rounded-2xl flex items-start gap-2.5 text-xs text-[#92400E]">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">{t('duplicateWarning')}</span>
                    <p className="leading-relaxed">{duplicateWarning}</p>
                  </div>
                </div>
              )}

              {/* Medicine Basic Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-bold text-[#0A192F] mb-1 font-display">
                    {t('brandName')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Napa Extra, Seclo, Togent..."
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0A192F]"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-[#0A192F] mb-1 font-display">
                    {t('genericName')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paracetamol, Omeprazole..."
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#334155]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-[#0A192F] mb-1 font-display">
                    {t('strength')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500 mg, 20 mg"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-mono font-medium"
                  />
                </div>
              </div>

              {/* Form & Route & Manufacturer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#0A192F] mb-1 font-display">
                    {t('dosageForm')}
                  </label>
                  <select
                    value={dosageForm}
                    onChange={(e) => setDosageForm(e.target.value as DosageForm)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs"
                  >
                    {DOSAGE_FORMS.map((form) => (
                      <option key={form} value={form}>{form}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0A192F] mb-1 font-display">
                    {t('route')}
                  </label>
                  <select
                    value={route}
                    onChange={(e) => setRoute(e.target.value as RouteOfAdministration)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs"
                  >
                    {ROUTES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0A192F] mb-1 font-display">
                    {language === 'bn' ? 'প্রস্তুতকারক প্রতিষ্ঠান' : 'Manufacturer'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Square, Beximco, Incepta..."
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Dose, Frequency, Duration, Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-[#0A192F] mb-1 font-display">
                    {t('dose')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Tablet, 5 ml"
                    value={dose}
                    onChange={(e) => setDose(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-[#0A192F] mb-1 font-display">
                    {t('frequencyLabel')} *
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F766E]"
                  >
                    {FREQUENCY_PRESETS.map((fp) => (
                      <option key={fp.value} value={fp.value}>{fp.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-[#0A192F] mb-1 font-display">
                    {t('durationLabel')} *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14 Days, 30 Days"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#0A192F] mb-1 font-display">
                    {t('quantity')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 30 Tabs"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Meal Relation & Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-[#0A192F] mb-1 font-display">
                    {t('mealTiming')}
                  </label>
                  <select
                    value={mealTiming}
                    onChange={(e) => setMealTiming(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs"
                  >
                    <option value="After meals">{language === 'bn' ? 'খাবারের পর' : 'After meals'}</option>
                    <option value="Before meals">{language === 'bn' ? 'খাবারের পূর্বে' : 'Before meals'}</option>
                    <option value="With meals">{language === 'bn' ? 'খাবারের সাথে' : 'With meals'}</option>
                    <option value="Empty stomach">{language === 'bn' ? 'খালি পেটে' : 'Empty stomach'}</option>
                    <option value="At bedtime">{language === 'bn' ? 'ঘুমানোর আগে' : 'At bedtime'}</option>
                    <option value="Anytime">{language === 'bn' ? 'যে কোনো সময়' : 'Anytime'}</option>
                  </select>
                </div>

                <div className="sm:col-span-8">
                  <label className="block text-[11px] font-bold text-[#0A192F] mb-1 font-display">
                    {t('instructionsLabel')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Take with plenty of water, do not crush tablet..."
                    value={patientInstructions}
                    onChange={(e) => setPatientInstructions(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Pharmacy Notes / Dispensing instructions */}
              <div>
                <label className="block text-[11px] font-bold text-[#0A192F] mb-1 font-display">
                  {t('pharmacyNotes')} ({language === 'bn' ? 'ঐচ্ছিক' : 'Optional'})
                </label>
                <input
                  type="text"
                  placeholder="e.g. Must dispense in original foil blister pack, verify expiry date..."
                  value={pharmacyNotes}
                  onChange={(e) => setPharmacyNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-mono text-[#475569]"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0A192F] rounded-xl"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {editingId ? (language === 'bn' ? 'আপডেট সম্পন্ন করুন' : 'Update Medication') : t('addToPrescription')}
                </button>
              </div>
            </form>
          )}

          {/* Section 3: Prescribed Medicines List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0A192F] font-display flex items-center gap-2">
                  <span className="text-[#0F766E] text-lg font-serif font-black">℞</span>
                  {language === 'bn' ? 'প্রেসক্রিপশন তালিকাভুক্ত ঔষধ' : 'Active Prescribed Regimen'}
                  <span className="text-xs font-mono font-bold bg-[#E6F4F1] text-[#0F766E] px-2 py-0.5 rounded-full">
                    {formatNum(activeConsultation.prescriptions.length)}
                  </span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  {language === 'bn' 
                    ? 'প্রয়োজনে ওষুধের ক্রম পরিবর্তন করুন, অনুলিপি তৈরি করুন অথবা এডিট করুন' 
                    : 'Reorder medications for clinical priority, duplicate for titration, or edit dosage.'}
                </p>
              </div>
            </div>

            {/* List of Medicines */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-xs divide-y divide-[#F1F5F9] overflow-hidden">
              {activeConsultation.prescriptions.length > 0 ? (
                activeConsultation.prescriptions.map((rx, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === activeConsultation.prescriptions.length - 1;

                  return (
                    <div 
                      key={rx.id}
                      className="p-4 sm:p-5 hover:bg-[#F8FAFC] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center font-bold text-xs shrink-0 font-display">
                          {formatNum(idx + 1)}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-sm text-[#0A192F] font-display">
                              {rx.drugName}
                            </span>
                            {rx.dosage && (
                              <span className="text-xs font-mono font-bold text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded">
                                {rx.dosage}
                              </span>
                            )}
                            {rx.dosageForm && (
                              <span className="text-[10px] text-[#475569] font-medium bg-[#F1F5F9] px-2 py-0.5 rounded">
                                {rx.dosageForm}
                              </span>
                            )}
                            {rx.isManualEntry ? (
                              <span className="text-[9px] font-bold bg-[#FEF3C7] text-[#B45309] px-2 py-0.5 rounded uppercase">
                                {t('manualEntryBadge')}
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 rounded uppercase">
                                {t('verifiedCatalogBadge')}
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-bold text-[#0F766E] flex items-center gap-2">
                            <span>{rx.frequency}</span>
                            {rx.mealTiming && (
                              <span className="text-[11px] font-medium text-[#64748B]">
                                · ({rx.mealTiming})
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#475569] leading-relaxed">
                            {rx.instructions}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#94A3B8] font-mono">
                            <span>{t('durationLabel')}: <strong className="text-[#0A192F]">{rx.duration}</strong></span>
                            {rx.quantity && (
                              <span>Qty: <strong className="text-[#0A192F]">{rx.quantity}</strong></span>
                            )}
                            {rx.manufacturer && (
                              <span className="font-sans text-[#64748B]">🏢 {rx.manufacturer}</span>
                            )}
                            {rx.indicativePriceBDT && (
                              <span className="text-[#0F766E] font-sans font-semibold">
                                MRP: {formatBDT(rx.indicativePriceBDT)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {!isSigned && (
                          <>
                            {/* Reorder Buttons */}
                            <div className="flex items-center bg-[#F1F5F9] rounded-xl p-0.5">
                              <button
                                type="button"
                                disabled={isFirst}
                                onClick={() => reorderPrescriptionItem(rx.id, 'up')}
                                className="p-1.5 text-[#64748B] hover:text-[#0A192F] disabled:opacity-30 disabled:hover:text-[#64748B]"
                                title={t('reorderUp')}
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={isLast}
                                onClick={() => reorderPrescriptionItem(rx.id, 'down')}
                                className="p-1.5 text-[#64748B] hover:text-[#0A192F] disabled:opacity-30 disabled:hover:text-[#64748B]"
                                title={t('reorderDown')}
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Duplicate Button */}
                            <button
                              type="button"
                              onClick={() => duplicatePrescriptionItem(rx.id)}
                              className="p-2 text-[#64748B] hover:text-[#0F766E] hover:bg-[#E6F4F1] rounded-xl transition-colors"
                              title={t('duplicateRx')}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleEditPrescription(rx)}
                              className="p-2 text-[#64748B] hover:text-[#0F766E] hover:bg-[#E6F4F1] rounded-xl transition-colors"
                              title={t('edit')}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => removePrescriptionItem(rx.id)}
                              className="p-2 text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl transition-colors"
                              title={t('delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {isSigned && (
                          <span className="text-[11px] font-semibold text-[#15803D] bg-[#DCFCE7] px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {language === 'bn' ? 'অনুমোদিত' : 'Authorized'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center mx-auto">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0A192F]">
                      {language === 'bn' ? 'কোন ঔষধ প্রেসক্রিপশন তালিকায় নেই' : 'No medicines in draft prescription'}
                    </h4>
                    <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
                      {language === 'bn' 
                        ? 'উপরের সার্চ বক্স ব্যবহার করে ঔষধ খুঁজুন অথবা ম্যানুয়ালি যুক্ত করুন।' 
                        : 'Search Bangladesh pharmacopeia medicines above or click Add Medicine Manually.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            SECONDARY COLUMN (4 COLS): Patient Snapshot, Status, History, Actions
           ======================================================== */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Patient & Encounter Snapshot */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-mono">
                {language === 'bn' ? 'রোগী ও এনকাউন্টার সামারি' : 'Encounter Context'}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                isSigned ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEF3C7] text-[#B45309]'
              }`}>
                {isSigned ? (language === 'bn' ? 'স্বাক্ষরিত' : 'Signed') : (language === 'bn' ? 'খসড়া' : 'Draft')}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-[#0A192F] font-display">
                {activeConsultation.patientName}
              </h4>
              <p className="text-xs text-[#64748B] font-mono">
                MRN: EVR-DHK-784920 · 54Y / Male / B+
              </p>
              <p className="text-[11px] text-[#0F766E] font-medium">
                {activeConsultation.doctorName} · BMDC: A-48291
              </p>
            </div>

            {/* Known Allergies Warning */}
            <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-[#B91C1C] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t('allergies')}
              </span>
              <p className="text-xs text-[#7F1D1D] font-medium">
                {activeConsultation.allergies.join(', ')}
              </p>
            </div>

            {/* Quick Vitals */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
                <span className="text-[10px] text-[#64748B] block font-mono">{t('bloodPressure')}</span>
                <span className="font-bold font-mono text-[#0A192F]">{activeConsultation.vitals.bloodPressure}</span>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
                <span className="text-[10px] text-[#64748B] block font-mono">{t('heartRate')}</span>
                <span className="font-bold font-mono text-[#0A192F]">{formatNum(activeConsultation.vitals.heartRate)} bpm</span>
              </div>
            </div>
          </div>

          {/* Prescription Operations & Primary Actions Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <span className="text-[11px] font-bold text-[#0A192F] uppercase tracking-wider font-display">
                {language === 'bn' ? 'প্রেসক্রিপশন নিয়ন্ত্রণ' : 'Prescription Controls'}
              </span>
              <span className="text-xs font-mono font-bold text-[#0F766E] bg-[#E6F4F1] px-2.5 py-0.5 rounded-full">
                {formatNum(activeConsultation.prescriptions.length)} {language === 'bn' ? 'টি ঔষধ' : 'Meds'}
              </span>
            </div>

            {/* Approximate DGDA Retail Cost */}
            {totalEstimatedCost > 0 && (
              <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-[#64748B] block">
                    {language === 'bn' ? 'ফার্মেসি আনুমানিক মূল্য (MRP)' : 'Estimated Retail Cost (MRP)'}
                  </span>
                  <span className="font-extrabold text-sm text-[#0A192F] font-mono">
                    {formatBDT(totalEstimatedCost)}
                  </span>
                </div>
                <span className="text-[10px] text-[#0F766E] font-semibold bg-[#E6F4F1] px-2 py-0.5 rounded">
                  DGDA Indicative
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onOpenPreview}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-[#0A192F] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-2xl transition-colors shadow-2xs"
              >
                <Eye className="w-4 h-4 text-[#0F766E]" />
                {t('previewChart')}
              </button>

              {!isSigned ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      updateConsultation({});
                      addToast({
                        type: 'info',
                        title: language === 'bn' ? 'খসড়া সংরক্ষিত হয়েছে' : 'Prescription Draft Saved',
                        message: language === 'bn' ? 'প্রেসক্রিপশন খসড়া টাইমস্ট্যাম্প সহ নিরাপদে সংরক্ষিত হয়েছে।' : 'Draft prescription synced with active consultation encounter.',
                      });
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-[#0F766E] bg-[#E6F4F1] hover:bg-[#CCFBF1] rounded-2xl transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    {t('saveDraft')}
                  </button>

                  <button
                    type="button"
                    onClick={onOpenSignModal}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-2xl transition-colors shadow-xs"
                  >
                    <FileCheck className="w-4 h-4" />
                    {t('signAndFinalize')}
                  </button>
                </>
              ) : (
                <div className="p-3 bg-[#DCFCE7] text-[#15803D] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 text-center">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'বিএমডিসি স্বাক্ষরিত ও লক করা' : 'BMDC Finalized & Locked'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Historical Prescriptions Quick Drawer / Accordion */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider font-display flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#0F766E]" />
                {t('patientRxHistoryTitle')}
              </h4>
              <span className="text-[10px] text-[#64748B] font-mono">
                {formatNum(MOCK_PATIENT_PRESCRIPTION_HISTORY.length)} Visits
              </span>
            </div>

            <div className="space-y-2.5">
              {MOCK_PATIENT_PRESCRIPTION_HISTORY.map((hist) => (
                <div 
                  key={hist.id}
                  className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl hover:border-[#0F766E]/40 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0A192F] font-mono">{hist.date}</span>
                    <span className="text-[10px] text-[#15803D] font-bold bg-[#DCFCE7] px-2 py-0.5 rounded">
                      Signed
                    </span>
                  </div>

                  <p className="text-[11px] text-[#475569]">
                    {hist.diagnoses.join(', ')}
                  </p>

                  <div className="text-[11px] text-[#64748B] space-y-0.5">
                    {hist.prescriptions.map((p, i) => (
                      <div key={i} className="truncate">
                        · {p.drugName} ({p.frequency})
                      </div>
                    ))}
                  </div>

                  {!isSigned && (
                    <button
                      type="button"
                      onClick={() => copyPrescriptionFromHistory(hist.prescriptions)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold text-[#0F766E] bg-white border border-[#CBD5E1] hover:bg-[#E6F4F1] rounded-xl transition-colors mt-2"
                    >
                      <Copy className="w-3 h-3" />
                      {t('represcribeBtn')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audited Amendment Modal */}
      {showAmendmentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
                <Unlock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A192F] font-display">
                  {t('unlockAmendment')}
                </h3>
                <p className="text-xs text-[#64748B]">Encounter #{activeConsultation.id} · Audited Override</p>
              </div>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              {language === 'bn'
                ? 'আইনগত ও ক্লিনিক্যাল কারণে স্বাক্ষরিত প্রেসক্রিপশন পরিবর্তন করার পূর্বে কারণ উল্লেখ করা বাধ্যতামূলক। আপনার কারণ অডিট লগে সংরক্ষিত হবে।'
                : 'Medical records regulation requires an auditable clinical rationale before unlocking a finalized prescription pad.'}
            </p>

            <form onSubmit={handleConfirmUnlock} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#0A192F] mb-1">
                  {t('amendmentReason')} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={amendmentReasonText}
                  onChange={(e) => setAmendmentReasonText(e.target.value)}
                  placeholder="e.g. Patient reported intolerance to Amlodipine; substituting with ARB..."
                  className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowAmendmentModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0A192F]"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#B45309] hover:bg-[#92400E] rounded-xl shadow-xs"
                >
                  {t('confirmAmendmentUnlock')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
