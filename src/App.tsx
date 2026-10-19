import React from 'react';
import { useApp } from './context/AppContext';
import { Shell } from './components/layout/Shell';
import { DoctorDashboard } from './features/doctor/DoctorDashboard';
import { ConsultationWorkspace } from './features/doctor/ConsultationWorkspace';
import { DoctorSchedule } from './features/doctor/DoctorSchedule';
import { DoctorPatients } from './features/doctor/DoctorPatients';
import { PatientDashboard } from './features/patient/PatientDashboard';
import { ClinicDashboard } from './features/clinic/ClinicDashboard';
import { PharmacyDashboard } from './features/pharmacy/PharmacyDashboard';
import { CourierDashboard } from './features/courier/CourierDashboard';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { LandingPage } from './features/public/LandingPage';
import { SubscriptionPlans } from './features/billing/SubscriptionPlans';
import { CareLoopDashboard } from './features/careloop/CareLoopDashboard';
import { SpecialistCaseCommandCenter } from './features/specialist/SpecialistCaseCommandCenter';
import { AssistantWorkspace } from './features/assistant/AssistantWorkspace';

const MainRouter: React.FC = () => {
  const { activeView } = useApp();

  const renderCurrentView = () => {
    // Specialist Professor Case Command Center & Solo Chamber Operations
    if (activeView.includes('specialist') || activeView === 'doctor/chamber' || activeView === 'chamber/operations') {
      return <SpecialistCaseCommandCenter />;
    }

    // Delegated Chamber Assistant & Secretary Workspace
    if (activeView.includes('assistant')) {
      return <AssistantWorkspace />;
    }

    // CareLoop AI Universal Route
    if (activeView.includes('careloop')) return <CareLoopDashboard />;

    // Doctor Views
    if (activeView === 'doctor/dashboard') return <DoctorDashboard />;
    if (activeView.startsWith('doctor/consultations')) return <ConsultationWorkspace />;
    if (activeView === 'doctor/schedule') return <DoctorSchedule />;
    if (activeView === 'doctor/patients' || activeView === 'doctor/reports') return <DoctorPatients />;
    if (activeView === 'doctor/prescriptions') return <ConsultationWorkspace />;

    // Patient Views
    if (activeView.startsWith('patient/')) return <PatientDashboard />;

    // Clinic Admin Views
    if (activeView.startsWith('clinic/subscription')) return <SubscriptionPlans />;
    if (activeView.startsWith('clinic/appointments')) return <DoctorSchedule />;
    if (activeView.startsWith('clinic/')) return <ClinicDashboard />;

    // Pharmacy Views
    if (activeView.startsWith('pharmacy/')) return <PharmacyDashboard />;

    // Courier Views
    if (activeView.startsWith('delivery/')) return <CourierDashboard />;

    // SaaS Admin Views
    if (activeView.startsWith('admin/')) return <AdminDashboard />;

    // Public & Billing Views
    if (activeView === 'public/pricing') return <SubscriptionPlans />;
    if (activeView === 'public/home' || activeView === '/') return <LandingPage />;

    // Fallback to flagship doctor dashboard
    return <DoctorDashboard />;
  };

  return (
    <Shell>
      {renderCurrentView()}
    </Shell>
  );
};

export default MainRouter;
