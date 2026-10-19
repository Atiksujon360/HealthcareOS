import React, { useState } from 'react';
import { 
  Lock, 
  Plus, 
  Upload, 
  EyeOff, 
  Ticket
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MOCK_CHAMBERS, MOCK_CHAMBER_ASSISTANTS } from '../../data/mockSpecialistData';

export const AssistantWorkspace: React.FC = () => {
  const { 
    addAppointment,
    addToast, 
    formatBDT
  } = useApp();

  const assistant = MOCK_CHAMBER_ASSISTANTS[0];
  const [selectedChamberId, setSelectedChamberId] = useState<string>('chm-001');
  const selectedChamber = MOCK_CHAMBERS.find(c => c.id === selectedChamberId) || MOCK_CHAMBERS[0];

  // Serial queue state
  const [queueItems, setQueueItems] = useState([
    { token: 'T-101', patientName: 'Mr. Rafiqul Islam', phone: '+880 1711-238910', chamber: 'Evercare Suite 408', feeStatus: 'Paid (৳2,000)', arrivalTime: '09:45 AM', status: 'With Doctor' },
    { token: 'T-102', patientName: 'Begum Tahmina Akhter', phone: '+880 1819-492381', chamber: 'Evercare Suite 408', feeStatus: 'Paid (৳2,000)', arrivalTime: '10:10 AM', status: 'Waiting' },
    { token: 'T-103', patientName: 'Alhaj Ashraful Haque', phone: '+880 1912-831290', chamber: 'Evercare Suite 408', feeStatus: 'Due (৳2,000)', arrivalTime: '10:25 AM', status: 'In Triage' },
    { token: 'T-104', patientName: 'Kazi Mahfuzur Rahman', phone: '+880 1715-392810', chamber: 'Evercare Suite 408', feeStatus: 'Due (৳1,200 Follow-up)', arrivalTime: 'Not Arrived', status: 'Scheduled' },
  ]);

  // Restricted Access Attempt Modal State
  const [restrictedAttemptType, setRestrictedAttemptType] = useState<string | null>(null);

  // New Booking State
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookPatientName, setBookPatientName] = useState<string>('');
  const [bookPhone, setBookPhone] = useState<string>('');
  const [bookTime, setBookTime] = useState<string>('11:00 AM');

  // Document Upload State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [docPatientName, setDocPatientName] = useState<string>('Mr. Rafiqul Islam');
  const [docTestName, setDocTestName] = useState<string>('Biochemistry Lab Paper Strip (Outside Diagnostic)');

  const handleMarkArrival = (token: string) => {
    setQueueItems(prev => prev.map(item => item.token === token ? {
      ...item,
      status: item.status === 'Scheduled' ? 'Waiting' : item.status === 'Waiting' ? 'With Doctor' : 'Completed',
      arrivalTime: item.arrivalTime === 'Not Arrived' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : item.arrivalTime
    } : item));

    addToast({
      type: 'success',
      title: 'Patient Queue Updated',
      message: `Token ${token} updated in Chamber serial queue.`
    });
  };

  const handleCreateAppointment = () => {
    if (!bookPatientName.trim() || !bookPhone.trim()) {
      addToast({
        type: 'error',
        title: 'Missing Details',
        message: 'Please provide patient name and phone number.'
      });
      return;
    }

    const nextTokenNum = 100 + queueItems.length + 1;
    const newToken = `T-${nextTokenNum}`;

    setQueueItems(prev => [
      ...prev,
      {
        token: newToken,
        patientName: bookPatientName.trim(),
        phone: bookPhone.trim(),
        chamber: selectedChamber.name,
        feeStatus: `Due (${formatBDT(selectedChamber.consultationFeeBDT)})`,
        arrivalTime: 'Not Arrived',
        status: 'Scheduled'
      }
    ]);

    addAppointment({
      patientId: `pat-new-${Date.now().toString().slice(-4)}`,
      patientName: bookPatientName.trim(),
      patientAge: 45,
      patientGender: 'Male',
      doctorId: 'doc-001',
      doctorName: 'Prof. Dr. Aisha Rahman',
      doctorSpecialty: 'Internal Medicine & Endocrinology',
      date: '2026-10-16',
      time: bookTime,
      durationMinutes: selectedChamber.slotDurationMinutes,
      type: 'In-person',
      clinicName: selectedChamber.institution,
      room: selectedChamber.room,
      reason: 'General Chamber Consultation',
      status: 'scheduled',
      priority: 'routine'
    });

    setBookPatientName('');
    setBookPhone('');
    setShowBookingModal(false);

    addToast({
      type: 'success',
      title: 'Chamber Serial Issued',
      message: `Serial Token ${newToken} registered for ${bookPatientName.trim()}.`
    });
  };

  const handleUploadDocument = () => {
    setShowUploadModal(false);
    addToast({
      type: 'success',
      title: 'Document Transferred to Physician Inbox',
      message: `Physical report logged for ${docPatientName}. Awaiting doctor clinical review.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
            <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider font-display">
              Delegated Chamber Assistant Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-display">
            {assistant.name}
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            {assistant.title} · Managing: {selectedChamber.name} ({selectedChamber.operatingHours})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedChamberId}
            onChange={(e) => setSelectedChamberId(e.target.value)}
            className="text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-[#0A192F]"
          >
            {MOCK_CHAMBERS.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({formatBDT(c.consultationFeeBDT)})</option>
            ))}
          </select>

          <button
            onClick={() => setShowBookingModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue New Token Serial</span>
          </button>
        </div>
      </div>

      {/* Role-Based Access Control Shield Banner */}
      <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl p-4 flex items-start gap-3.5 text-xs shadow-2xs">
        <div className="p-2 bg-[#DC2626] text-white rounded-xl shrink-0 mt-0.5">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-[#991B1B] uppercase tracking-wider text-[11px] block">
            BMDC Healthcare Privacy & Assistant Access Boundaries
          </span>
          <p className="text-[#7F1D1D] mt-0.5 leading-relaxed">
            As a Chamber Assistant/Secretary, your permissions are strictly limited to booking, arrival marking, fee collection, and paper document logistics. 
            <strong> Access to confidential doctor clinical consultation notes, psychiatric notes, and prescription authoring is protected and blocked by server-side policy.</strong>
          </p>
        </div>
      </div>

      {/* Chamber Live Queue & Serial Management */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
          <div>
            <h3 className="text-base font-bold text-[#0A192F] font-display flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#0F766E]" />
              Today's Live Serial Queue ({selectedChamber.branch})
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Consultation Fee: {formatBDT(selectedChamber.consultationFeeBDT)} · Follow-up: {formatBDT(selectedChamber.followUpFeeBDT)}
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#0F766E] bg-[#E6F4F1] hover:bg-[#CCFBF1] rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-center"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Log Patient Report for Doctor</span>
          </button>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-2.5 px-3">Token Serial</th>
                <th className="py-2.5 px-3">Patient Name</th>
                <th className="py-2.5 px-3">Contact Phone</th>
                <th className="py-2.5 px-3">Fee Collection</th>
                <th className="py-2.5 px-3">Arrival Time</th>
                <th className="py-2.5 px-3">Queue Status</th>
                <th className="py-2.5 px-3 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {queueItems.map((item) => (
                <tr key={item.token} className="hover:bg-[#F8FAFC]/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-extrabold text-[#0F766E] text-sm">
                    {item.token}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#0A192F]">
                    {item.patientName}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#64748B]">
                    {item.phone}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.feeStatus.includes('Paid') ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEF3C7] text-[#B45309]'
                    }`}>
                      {item.feeStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#64748B] font-mono">
                    {item.arrivalTime}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status === 'With Doctor' ? 'bg-[#DCFCE7] text-[#15803D]' :
                      item.status === 'In Triage' ? 'bg-[#E0E7FF] text-[#4338CA]' :
                      item.status === 'Waiting' ? 'bg-[#FFEDD5] text-[#C2410C]' :
                      'bg-[#F1F5F9] text-[#64748B]'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => handleMarkArrival(item.token)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#0F766E] bg-[#E6F4F1] hover:bg-[#CCFBF1] rounded-lg transition-colors"
                    >
                      {item.status === 'Scheduled' ? 'Mark Arrived' : item.status === 'Waiting' ? 'Send In' : 'Advance'}
                    </button>

                    {/* Attempt Confidential View Button (Demonstrates Security Boundary) */}
                    <button
                      onClick={() => setRestrictedAttemptType(item.patientName)}
                      title="Inspect Confidential Clinical Chart"
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#64748B] hover:text-[#DC2626] bg-[#F1F5F9] rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <EyeOff className="w-3 h-3 text-[#DC2626]" />
                      <span>Chart</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: Restricted Access Attempt (Security Boundary Enforcement) ================= */}
      {restrictedAttemptType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#FEE2E2] space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#991B1B] font-display">
                  Confidential Clinical Access Denied
                </h3>
                <span className="text-xs text-[#64748B]">Security Event #SEC-AUTH-403</span>
              </div>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              Chamber Assistant <strong>Md. Rashedul Alam</strong> does not have authorized clinical credentials to inspect private consultation chart notes, diagnoses, or prescriptions for <strong>{restrictedAttemptType}</strong>.
            </p>

            <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs space-y-1">
              <span className="font-bold text-[#0A192F] block">BMDC Legal Principle:</span>
              <p className="text-[#64748B] text-[11px]">
                Under BMDC Code of Medical Ethics (Section 7), patient health records must remain privileged between licensed physician and patient. Only authorized doctors possess clinical chart decryption tokens.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#F1F5F9]">
              <button
                onClick={() => setRestrictedAttemptType(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0A192F] hover:bg-[#1E293B] rounded-xl"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: Issue New Token Serial ================= */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <h3 className="text-sm font-bold text-[#0A192F] font-display">
                Issue Serial Token for Chamber Visit
              </h3>
              <button onClick={() => setShowBookingModal(false)} className="text-[#94A3B8] hover:text-[#0A192F]">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#0A192F] block mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={bookPatientName}
                  onChange={(e) => setBookPatientName(e.target.value)}
                  placeholder="e.g., Alhaj Mofizur Rahman"
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#0A192F] block mb-1">Mobile Contact (+880)</label>
                <input
                  type="text"
                  value={bookPhone}
                  onChange={(e) => setBookPhone(e.target.value)}
                  placeholder="+880 1700-000000"
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F] focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#0A192F] block mb-1">Estimated Slot Time</label>
                <input
                  type="text"
                  value={bookTime}
                  onChange={(e) => setBookTime(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F]"
                />
              </div>

              <div className="p-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl text-[11px] text-[#166534]">
                Fee: <strong>{formatBDT(selectedChamber.consultationFeeBDT)}</strong> will be logged for collection upon arrival.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
              <button
                onClick={() => setShowBookingModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAppointment}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs"
              >
                Register & Issue Serial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: Upload / Scan Paper Report ================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <h3 className="text-sm font-bold text-[#0A192F] font-display">
                Log Physical Diagnostic Document
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-[#94A3B8] hover:text-[#0A192F]">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#0A192F] block mb-1">Select Patient</label>
                <input
                  type="text"
                  value={docPatientName}
                  onChange={(e) => setDocPatientName(e.target.value)}
                  className="w-full p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F]"
                />
              </div>

              <div>
                <label className="font-bold text-[#0A192F] block mb-1">Document Description</label>
                <input
                  type="text"
                  value={docTestName}
                  onChange={(e) => setDocTestName(e.target.value)}
                  className="w-full p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0A192F]"
                />
              </div>

              <div className="border-2 border-dashed border-[#CBD5E1] p-6 rounded-2xl text-center space-y-1 bg-[#F8FAFC]">
                <Upload className="w-6 h-6 text-[#0F766E] mx-auto" />
                <span className="text-xs font-semibold text-[#0A192F] block">Camera Scan / Attach PDF</span>
                <span className="text-[10px] text-[#64748B]">Assigned to Prof. Aisha Rahman's review inbox</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B]"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadDocument}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs"
              >
                Dispatch to Doctor Inbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
