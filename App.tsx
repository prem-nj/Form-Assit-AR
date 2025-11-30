
import React, { useState, useEffect } from 'react';
import { UserProfile, AppView, Language, FormFieldOverlay, FormRecord, FormTemplate } from './types';
import { LanguageSelector } from './components/LanguageSelector';
import { Onboarding } from './components/Onboarding';
import { Scanner } from './components/Scanner';
import { DocumentTranslator } from './components/DocumentTranslator';
import { Dashboard } from './components/Dashboard';

// --- Styles ---
const GlobalStyles = () => (
  <style>{`
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-slideUp {
      animation: slideUp 0.3s ease-out forwards;
    }
    @keyframes slideRight {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
    .animate-slideRight {
      animation: slideRight 0.3s ease-out forwards;
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
    }
    .animate-pulse-ring {
      animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse-glow {
      0%, 100% { 
        box-shadow: 0 0 5px rgba(59, 130, 246, 0.3), inset 0 0 5px rgba(59, 130, 246, 0.1); 
        border-color: rgba(59, 130, 246, 0.6); 
        transform: scale(1);
      }
      50% { 
        box-shadow: 0 0 25px rgba(59, 130, 246, 0.6), inset 0 0 10px rgba(59, 130, 246, 0.2); 
        border-color: rgba(59, 130, 246, 1); 
        transform: scale(1.02);
      }
    }
    .animate-pulse-glow {
      animation: pulse-glow 2s ease-in-out infinite;
    }
    @keyframes bounce-horizontal {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(25%); }
    }
    .animate-bounce-horizontal {
      animation: bounce-horizontal 1s infinite;
    }
    @keyframes gentle-zoom {
      0% { transform: scale(1); }
      100% { transform: scale(1.05); }
    }
    .animate-gentle-zoom {
      animation: gentle-zoom 15s ease-in-out infinite alternate;
    }
    @keyframes scan-line-move {
      0% { top: 0%; opacity: 0; }
      15% { opacity: 1; }
      85% { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
    .animate-scan-line-move {
      animation: scan-line-move 3s ease-in-out infinite;
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .animate-shimmer {
      animation: shimmer 2.5s infinite linear;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translate(-50%, 15px) scale(0.9); }
      to { opacity: 1; transform: translate(-50%, 0) scale(1); }
    }
    .animate-fadeInUp {
      animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `}</style>
);

const App = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [view, setView] = useState<AppView>(AppView.LANGUAGE_SELECT);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formHistory, setFormHistory] = useState<FormRecord[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<FormTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleProfileSaved = (profile: UserProfile) => {
    setUserProfile(profile);
    setView(AppView.DASHBOARD);
  };

  const handleScanComplete = () => {
      // Add to history
      const newRecord: FormRecord = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
          status: 'completed'
      };
      setFormHistory(prev => [newRecord, ...prev]);
      setView(AppView.DASHBOARD);
  };

  const handleSaveTemplate = (name: string, overlays: FormFieldOverlay[]) => {
      const newTemplate: FormTemplate = {
          id: Math.random().toString(36).substr(2, 9),
          name: name,
          createdAt: new Date().toISOString(),
          overlays: overlays
      };
      setSavedTemplates(prev => [...prev, newTemplate]);
  };

  const handleSelectTemplate = (template: FormTemplate) => {
      setSelectedTemplate(template);
      setView(AppView.SCANNER);
  };

  if (view === AppView.LANGUAGE_SELECT) {
    return (
      <>
        <GlobalStyles />
        <LanguageSelector onSelect={(lang) => { setLanguage(lang); setView(AppView.ONBOARDING); }} />
      </>
    );
  }

  if (view === AppView.ONBOARDING) {
    return (
      <>
        <GlobalStyles />
        <Onboarding 
            language={language} 
            onProfileSaved={handleProfileSaved} 
            initialProfile={userProfile || undefined}
            onCancel={userProfile ? () => setView(AppView.DASHBOARD) : undefined}
        />
      </>
    );
  }

  if (view === AppView.SCANNER && userProfile) {
    return (
      <>
        <GlobalStyles />
        <Scanner 
            language={language} 
            userProfile={userProfile} 
            onClose={() => { setSelectedTemplate(undefined); setView(AppView.DASHBOARD); }}
            onComplete={handleScanComplete}
            onSaveTemplate={handleSaveTemplate}
            initialTemplate={selectedTemplate}
        />
      </>
    );
  }

  if (view === AppView.FORM_TRANSLATOR) {
      return (
          <>
            <GlobalStyles />
            <DocumentTranslator language={language} onClose={() => setView(AppView.DASHBOARD)} />
          </>
      );
  }

  if (view === AppView.DASHBOARD && userProfile) {
    return (
      <>
        <GlobalStyles />
        <Dashboard 
          language={language} 
          userProfile={userProfile} 
          onScan={() => { setSelectedTemplate(undefined); setView(AppView.SCANNER); }}
          onReset={() => setView(AppView.ONBOARDING)}
          onOpenTranslator={() => setView(AppView.FORM_TRANSLATOR)}
          onChangeLanguage={() => setView(AppView.LANGUAGE_SELECT)}
          onAddDocument={() => setView(AppView.ONBOARDING)}
          onUpdateProfile={(p) => setUserProfile(p)}
          formHistory={formHistory}
          savedTemplates={savedTemplates}
          onSelectTemplate={handleSelectTemplate}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      </>
    );
  }

  return null;
};

export default App;
