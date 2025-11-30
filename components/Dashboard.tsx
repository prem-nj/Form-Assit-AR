
import React, { useState } from 'react';
import { UserProfile, Language, DashboardTab, FormRecord, FormTemplate, FormFieldOverlay } from '../types';
import { translations } from '../translations';
import Sidebar from './Sidebar';
import { TemplatesView } from './TemplatesView';

export const Dashboard = ({ 
  language, 
  userProfile, 
  onScan, 
  onReset, 
  onOpenTranslator,
  onChangeLanguage,
  onAddDocument,
  onUpdateProfile,
  onSelectTemplate,
  formHistory,
  savedTemplates,
  isDarkMode,
  onToggleDarkMode
}: { 
  language: Language; 
  userProfile: UserProfile; 
  onScan: () => void;
  onReset: () => void;
  onOpenTranslator: () => void;
  onChangeLanguage: () => void;
  onAddDocument: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onSelectTemplate: (template: FormTemplate) => void;
  formHistory: FormRecord[];
  savedTemplates: FormTemplate[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<DashboardTab>(DashboardTab.HOME);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Views ---

  const HomeView = () => (
    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
            <div>
                <div className="flex items-center space-x-3 mb-1">
                   <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                   </button>
                   <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.welcome}, {userProfile.fullName.split(' ')[0]}</h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400">{t.readyToAutomate}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold border-2 border-white dark:border-slate-700 shadow-sm cursor-pointer" onClick={() => setActiveTab(DashboardTab.DOCUMENTS)}>
                {userProfile.fullName.charAt(0)}
            </div>
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-500/20 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
            
            <div className="relative z-10 text-center py-4">
                <h2 className="text-2xl font-bold mb-6">{t.autoFillMagic}</h2>
                <button 
                  onClick={onScan}
                  className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all w-full flex items-center justify-center"
                >
                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                   {t.scanNewForm}
                </button>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{userProfile.documents?.length || 0}</span>
                    <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">{t.savedIds}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{formHistory.length}</span>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">{t.formsFilled}</p>
            </div>
        </div>

        {/* Recent Forms */}
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t.recentForms}</h3>
            <button onClick={() => setActiveTab(DashboardTab.HISTORY)} className="text-blue-600 dark:text-blue-400 text-sm font-semibold">{t.seeAll}</button>
        </div>
        <div className="space-y-3">
            {formHistory.slice(0, 2).map((form) => (
                <div key={form.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center space-x-4 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-2xl">📝</div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Form #{form.id.slice(0,6)}</h4>
                        <p className="text-slate-400 text-xs">{new Date(form.date).toLocaleDateString()}</p>
                    </div>
                </div>
            ))}
             {formHistory.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">No recent forms. Scan one to get started!</div>
             )}
        </div>
    </div>
  );

  const DocumentsView = () => (
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-center mb-6">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
             </button>
             <h2 className="ml-2 text-2xl font-bold text-slate-900 dark:text-white">{t.myDocuments}</h2>
          </div>

          <div className="space-y-4 mb-8">
              {!userProfile.documents || userProfile.documents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                      <p>{t.noDocuments}</p>
                  </div>
              ) : (
                  userProfile.documents.map((doc, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-all hover:scale-[1.01]">
                          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-10 -mt-10 opacity-20 ${idx % 2 === 0 ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                          
                          <div className="flex items-center space-x-4 mb-6 relative z-10">
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md ${idx % 2 === 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                              <div>
                                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{doc.type}</h3>
                                  <p className="text-slate-400 text-xs">Verified • {doc.date}</p>
                              </div>
                          </div>

                          <div className="space-y-3 relative z-10">
                              <div className="flex items-center space-x-3">
                                  <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-400">👤</div>
                                  <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">{userProfile.fullName}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                   <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-400">📅</div>
                                  <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">{userProfile.dateOfBirth}</span>
                              </div>
                              {/* Display key IDs if relevant for this doc type (approximation) */}
                              {doc.type.includes('PAN') && userProfile.panNumber && (
                                  <div className="flex items-center space-x-3">
                                      <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-400">🆔</div>
                                      <span className="text-slate-700 dark:text-slate-300 font-medium text-sm font-mono">{userProfile.panNumber}</span>
                                  </div>
                              )}
                              {doc.type.includes('Aadhar') && userProfile.aadharNumber && (
                                  <div className="flex items-center space-x-3">
                                      <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-400">🆔</div>
                                      <span className="text-slate-700 dark:text-slate-300 font-medium text-sm font-mono">{userProfile.aadharNumber}</span>
                                  </div>
                              )}
                          </div>
                      </div>
                  ))
              )}
          </div>

          <div className="mb-8">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">{t.personalInfo}</h3>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 space-y-4 border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
                      <span className="text-slate-400 text-sm">{t.phone}</span>
                      <span className="text-slate-900 dark:text-white font-medium text-sm">{userProfile.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
                      <span className="text-slate-400 text-sm">{t.email}</span>
                      <span className="text-slate-900 dark:text-white font-medium text-sm">{userProfile.email}</span>
                  </div>
                   <div className="py-2">
                      <span className="text-slate-400 text-sm block mb-1">{t.address}</span>
                      <span className="text-slate-900 dark:text-white font-medium text-sm">{userProfile.address}</span>
                  </div>
                  
                  {/* Aggregated IDs Section */}
                  {(userProfile.panNumber || userProfile.aadharNumber || userProfile.passportNumber || userProfile.drivingLicenseNumber) && (
                      <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-700">
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-3 mt-1">{t.identityNumbers}</span>
                          <div className="grid grid-cols-1 gap-2">
                              {userProfile.aadharNumber && (
                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                                    <span className="text-slate-500 dark:text-slate-400 text-xs">Aadhar</span>
                                    <span className="text-slate-900 dark:text-white font-mono text-xs">{userProfile.aadharNumber}</span>
                                </div>
                              )}
                              {userProfile.panNumber && (
                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                                    <span className="text-slate-500 dark:text-slate-400 text-xs">PAN</span>
                                    <span className="text-slate-900 dark:text-white font-mono text-xs">{userProfile.panNumber}</span>
                                </div>
                              )}
                               {userProfile.drivingLicenseNumber && (
                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                                    <span className="text-slate-500 dark:text-slate-400 text-xs">License</span>
                                    <span className="text-slate-900 dark:text-white font-mono text-xs">{userProfile.drivingLicenseNumber}</span>
                                </div>
                              )}
                          </div>
                      </div>
                  )}

                  <button onClick={onAddDocument} className="w-full py-3 mt-2 bg-slate-50 dark:bg-slate-700 text-blue-600 dark:text-blue-300 font-bold rounded-xl text-sm">
                      {t.edit}
                  </button>
              </div>
          </div>
          
           <div 
             onClick={onAddDocument}
             className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer"
           >
               <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
               <span className="font-bold text-sm">{t.addNewDoc}</span>
           </div>
      </div>
  );

  const HistoryView = () => (
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-center mb-6">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
             </button>
             <h2 className="ml-2 text-2xl font-bold text-slate-900 dark:text-white">{t.history}</h2>
          </div>

          <div className="space-y-4">
               {formHistory.map((form) => (
                   <div key={form.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <div>
                              <h4 className="font-bold text-slate-900 dark:text-white">Form #{form.id.slice(0,4)}</h4>
                              <p className="text-slate-400 text-xs">{new Date(form.date).toLocaleDateString()}</p>
                          </div>
                      </div>
                      <button className="text-slate-300 dark:text-slate-600">•••</button>
                   </div>
               ))}
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden relative">
      <Sidebar 
         isOpen={isSidebarOpen} 
         onClose={() => setIsSidebarOpen(false)} 
         userProfile={userProfile} 
         language={language} 
         onNavigate={setActiveTab}
         isDarkMode={isDarkMode}
         onToggleDarkMode={onToggleDarkMode}
      />

      {activeTab === DashboardTab.HOME && <HomeView />}
      {activeTab === DashboardTab.DOCUMENTS && <DocumentsView />}
      {activeTab === DashboardTab.HISTORY && <HistoryView />}
      {activeTab === DashboardTab.TEMPLATES && <TemplatesView language={language} templates={savedTemplates} onSelectTemplate={onSelectTemplate} onOpenSidebar={() => setIsSidebarOpen(true)} />}

      {/* Bottom Nav */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 p-4 pb-8 flex justify-around items-center z-10 rounded-t-[2rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <button onClick={() => setActiveTab(DashboardTab.HOME)} className={`p-2 rounded-xl transition-all ${activeTab === DashboardTab.HOME ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
        <button onClick={() => setActiveTab(DashboardTab.DOCUMENTS)} className={`p-2 rounded-xl transition-all ${activeTab === DashboardTab.DOCUMENTS ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </button>
        
        {/* Floating Action Button */}
        <div className="relative -top-8">
            <button 
              onClick={onScan}
              className="w-16 h-16 bg-black dark:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 hover:scale-110 transition-transform"
            >
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
        </div>

        <button onClick={() => onOpenTranslator()} className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A9.957 9.957 0 0112 15m-7-2h14l-3 3m0 0l-3-3m3 3V4" /></svg>
        </button>
        <button onClick={() => setActiveTab(DashboardTab.HISTORY)} className={`p-2 rounded-xl transition-all ${activeTab === DashboardTab.HISTORY ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>
      </div>
    </div>
  );
};
