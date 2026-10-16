"use client";

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
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

const MainRouter: React.FC = () => {
  const { activeView } = useApp();

  const renderCurrentView = () => {
    if (activeView === 'doctor/dashboard') return <DoctorDashboard />;
    if (activeView.startsWith('doctor/consultations')) return <ConsultationWorkspace />;
    if (activeView === 'doctor/schedule') return <DoctorSchedule />;
    if (activeView === 'doctor/patients' || activeView === 'doctor/reports') return <DoctorPatients />;
    if (activeView === 'doctor/prescriptions') return <ConsultationWorkspace />;

    if (activeView.startsWith('patient/')) return <PatientDashboard />;

    if (activeView.startsWith('clinic/subscription')) return <SubscriptionPlans />;
    if (activeView.startsWith('clinic/appointments')) return <DoctorSchedule />;
    if (activeView.startsWith('clinic/')) return <ClinicDashboard />;

    if (activeView.startsWith('pharmacy/')) return <PharmacyDashboard />;
    if (activeView.startsWith('delivery/')) return <CourierDashboard />;
    if (activeView.startsWith('admin/')) return <AdminDashboard />;

    if (activeView === 'public/pricing') return <SubscriptionPlans />;
    if (activeView === 'public/home' || activeView === '/') return <LandingPage />;

    return <DoctorDashboard />;
  };

  return <Shell>{renderCurrentView()}</Shell>;
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
