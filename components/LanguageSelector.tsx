import React from 'react';
import { Language } from '../types';

export const LanguageSelector = ({ onSelect }: { onSelect: (lang: Language) => void }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 dark:shadow-blue-900/30 mb-4 transform rotate-3">
         <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">FormAssist AI</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">Select your preferred language to get started with AI-powered form filling.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 w-full max-w-xs mt-4">
        <button
          onClick={() => onSelect('en')}
          className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all font-medium text-lg flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">EN</span>
            <span className="text-slate-900 dark:text-white">English</span>
          </div>
          <span className="text-slate-300 group-hover:text-blue-500 transition-colors">→</span>
        </button>
        <button
          onClick={() => onSelect('hi')}
          className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all font-medium text-lg flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
             <span className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/50 flex items-center justify-center text-xs font-bold text-orange-600 dark:text-orange-400">HI</span>
             <span className="text-slate-900 dark:text-white">हिन्दी</span>
          </div>
          <span className="text-slate-300 group-hover:text-blue-500 transition-colors">→</span>
        </button>
        <button
          onClick={() => onSelect('bn')}
          className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all font-medium text-lg flex items-center justify-between group"
        >
           <div className="flex items-center space-x-3">
             <span className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/50 flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400">BN</span>
             <span className="text-slate-900 dark:text-white">বাংলা</span>
           </div>
          <span className="text-slate-300 group-hover:text-blue-500 transition-colors">→</span>
        </button>
      </div>
    </div>
  );
};
