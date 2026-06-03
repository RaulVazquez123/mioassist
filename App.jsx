import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Writer from './pages/Writer';
import Profile from './pages/Profile';
import Practice from './pages/Practice';
import AuthPage from './pages/AuthPage';
import Landing from './pages/Landing';
import PrivacyPage from './pages/PrivacyPage';
import LegalPage from './pages/LegalPage';
import InfoPage from './pages/InfoPage';
import ConsentModal from './components/auth/ConsentModal';
import React, { useState, useEffect } from 'react';
import { EMGProvider } from '@/lib/EMGContext';
import ElectrodosBanner from '@/components/layout/ElectrodosBanner';

const AuthenticatedApp = () => {
  const { user, isLoadingAuth } = useAuth();
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    setConsentGiven(localStorage.getItem("mioassist_consent") === "true");
  }, []);

  const handleAcceptConsent = () => {
    localStorage.setItem("mioassist_consent", "true");
    setConsentGiven(true);
  };

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/privacy"  element={<PrivacyPage />} />
        <Route path="/legal"    element={<LegalPage />} />
        <Route path="/info"     element={<InfoPage />} />
        <Route path="*"         element={<AuthPage />} />
      </Routes>
    );
  }

  return (
    <>
      <ElectrodosBanner />
      {!consentGiven && <ConsentModal onAccept={handleAcceptConsent} />}
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/writer"   element={<Writer />} />
        <Route path="/privacy"  element={<PrivacyPage />} />
        <Route path="/legal"    element={<LegalPage />} />
        <Route path="/info"     element={<InfoPage />} />
        <Route path="/profile"  element={<Profile />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="*"         element={<Landing />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <EMGProvider wsUrl="ws://192.168.4.1:8081">
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <SonnerToaster position="top-right" richColors />
        </EMGProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;