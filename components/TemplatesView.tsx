import React from 'react';
import { Language, FormTemplate } from '../types';
import { translations } from '../translations';

export const TemplatesView = ({
    language,
    templates,
    onSelectTemplate,
    onOpenSidebar
}: {
    language: Language;
    templates: FormTemplate[];
    onSelectTemplate: (t: FormTemplate) => void;
    onOpenSidebar: () => void;
}) => {
    const t = translations[language];

    return (
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="flex items-center mb-6">
                <button onClick={onOpenSidebar} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <h2 className="ml-2 text-2xl font-bold text-slate-900 dark:text-white">{t.templates}</h2>
            </div>

            {templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{t.noTemplates}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {templates.map(temp => (
                        <div key={temp.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">{temp.name}</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Saved on {new Date(temp.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={() => onSelectTemplate(temp)}
                                className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-bold hover:bg-blue-200 dark:hover:bg-blue-800"
                            >
                                {t.useTemplate}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
