import React, { useState, useRef } from 'react';
import { Language } from '../types';
import { editImage } from '../services/gemini';
import { translations } from '../translations';

export const MagicEditor = ({ language, onClose }: { language: Language; onClose: () => void }) => {
    const t = translations[language];
    const [image, setImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => setImage(e.target?.result as string);
          reader.readAsDataURL(file);
        }
      };
    
      const handleGenerate = async () => {
        if (!image || !prompt) return;
        setLoading(true);
        try {
          const edited = await editImage(image, prompt);
          setResultImage(edited);
        } catch (e) {
          console.error(e);
          alert('Failed to edit image. Please try again.');
        } finally {
          setLoading(false);
        }
      };

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white">
          <div className="p-6 flex items-center justify-between">
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="font-bold text-lg">{t.magicEditor}</h2>
            <div className="w-10"></div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
             {!image ? (
                <div onClick={() => fileInputRef.current?.click()} className="h-full border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:border-purple-500 hover:text-purple-400 transition-all">
                    <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="font-medium">{t.selectImage}</span>
                </div>
             ) : (
                <div className="space-y-6">
                    <div className="relative rounded-2xl overflow-hidden bg-black">
                        <img src={resultImage || image} className="w-full h-auto object-contain max-h-[50vh]" />
                        {loading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}
                    </div>
                    
                    <div className="bg-slate-800 p-4 rounded-2xl space-y-3">
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={t.promptPlaceholder} className="w-full bg-slate-900 rounded-xl p-3 text-white placeholder-slate-500 min-h-[80px]" />
                        <button onClick={handleGenerate} disabled={loading || !prompt} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-900/50 disabled:opacity-50">
                           {t.generate}
                        </button>
                    </div>
                </div>
             )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
        </div>
    );
};
