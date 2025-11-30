import React from 'react';
import { UserProfile, Language, DashboardTab } from '../types';
import { translations } from '../translations';

const Sidebar = ({ 
    isOpen, 
    onClose, 
    userProfile, 
    language,
    onNavigate,
    onToggleDarkMode,
    isDarkMode
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    userProfile: UserProfile; 
    language: Language;
    onNavigate: (tab: DashboardTab) => void;
    onToggleDarkMode: () => void;
    isDarkMode: boolean;
}) => {
    const t = translations[language];
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-3/4 max-w-xs h-full bg-white dark:bg-slate-900 shadow-2xl animate-slideRight flex flex-col">
                <div className="p-6 bg-blue-600 dark:bg-slate-800 text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mb-3 border-2 border-white/30">
                        {userProfile.fullName.charAt(0)}
                    </div>
                    <h2 className="text-xl font-bold">{userProfile.fullName}</h2>
                    <div className="flex items-center text-blue-100 dark:text-blue-300 text-xs mt-1">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        {t.verifiedUser}
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mt-2 mb-1">{t.menu}</div>
                    <button onClick={() => { onNavigate(DashboardTab.DOCUMENTS); onClose(); }} className="w-full flex items-center p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors">
                        <span className="w-6 mr-3">📂</span> {t.idVault}
                    </button>
                    <button onClick={() => { onNavigate(DashboardTab.TEMPLATES); onClose(); }} className="w-full flex items-center p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors">
                        <span className="w-6 mr-3">📄</span> {t.templates}
                    </button>
                    <button onClick={() => { onNavigate(DashboardTab.HISTORY); onClose(); }} className="w-full flex items-center p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors">
                        <span className="w-6 mr-3">🕒</span> {t.history}
                    </button>
                    <button className="w-full flex items-center p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors">
                        <span className="w-6 mr-3">☁️</span> {t.backupSecurity}
                    </button>

                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>

                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mt-2 mb-1">{t.settings}</div>
                    <button className="w-full flex items-center p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors">
                        <span className="w-6 mr-3">⚙️</span> {t.settings}
                    </button>
                    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors">
                        <div className="flex items-center"><span className="w-6 mr-3">🌙</span> {t.darkMode}</div>
                        <div 
                           onClick={onToggleDarkMode} 
                           className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${isDarkMode ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : ''}`}></div>
                        </div>
                    </div>
                     <button className="w-full flex items-center p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors">
                        <span className="w-6 mr-3">❓</span> {t.helpFaq}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
