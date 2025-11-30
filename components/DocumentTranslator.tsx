
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { translateForm, getFormExplanation, askFormQuestion } from '../services/gemini';
import { translations } from '../translations';

type Tab = 'translate' | 'ask' | 'info';

interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
}

export const DocumentTranslator = ({ language, onClose }: { language: Language; onClose: () => void }) => {
    const t = translations[language];
    const [image, setImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('translate');
    
    // Feature States
    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [formSummary, setFormSummary] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [question, setQuestion] = useState('');
    
    // Loading States
    const [loadingTranslate, setLoadingTranslate] = useState(false);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    
    // Settings & Voice
    const [targetLang, setTargetLang] = useState<Language>(language);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Stop speech on unmount
    useEffect(() => {
        return () => window.speechSynthesis.cancel();
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              setImage(e.target?.result as string);
              setTranslatedText(null);
              setFormSummary(null);
              setChatHistory([]);
              setActiveTab('translate'); // Reset to default
          };
          reader.readAsDataURL(file);
        }
    };

    const speak = (text: string) => {
        window.speechSynthesis.cancel();
        if (isSpeaking) {
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLang === 'hi' ? 'hi-IN' : targetLang === 'bn' ? 'bn-IN' : 'en-US';
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const handleVoiceInput = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice recognition not supported.");
            return;
        }
        
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : 'en-US';
        setIsListening(true);
        recognition.start();

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuestion(transcript);
            setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
    };
    
    const handleTranslate = async () => {
        if (!image) return;
        setLoadingTranslate(true);
        try {
          const result = await translateForm(image, targetLang);
          setTranslatedText(result);
        } catch (e) {
          console.error(e);
          alert('Failed to translate form.');
        } finally {
          setLoadingTranslate(false);
        }
    };

    const handleSummary = async () => {
        if (!image || formSummary) return;
        setLoadingSummary(true);
        try {
            const result = await getFormExplanation(image, targetLang);
            setFormSummary(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleAsk = async () => {
        if (!image || !question.trim()) return;
        const q = question;
        setQuestion('');
        setChatHistory(prev => [...prev, { role: 'user', text: q }]);
        setLoadingChat(true);

        try {
            const answer = await askFormQuestion(image, q, targetLang);
            setChatHistory(prev => [...prev, { role: 'ai', text: answer }]);
            // Auto speak the answer
            speak(answer);
        } catch (e) {
            console.error(e);
            setChatHistory(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't answer that." }]);
        } finally {
            setLoadingChat(false);
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    };

    // Auto fetch summary when tab changes to info
    useEffect(() => {
        if (activeTab === 'info' && image && !formSummary) {
            handleSummary();
        }
    }, [activeTab, image]);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
          <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-sm">
            <button onClick={onClose} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">{t.formTranslator}</h2>
            <div className="w-10"></div>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col relative">
             {!image ? (
                <div className="flex-1 p-6 flex flex-col items-center justify-center">
                    <div onClick={() => fileInputRef.current?.click()} className="w-full max-w-md aspect-[4/3] border-3 border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-all group bg-white dark:bg-slate-800/20 shadow-sm">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                             <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <span className="font-bold text-xl text-slate-700 dark:text-white">{t.selectForm}</span>
                        <p className="text-sm mt-2 text-slate-400">Supports PNG, JPG</p>
                    </div>
                </div>
             ) : (
                <>
                    {/* Collapsible Image Preview */}
                    <div className="bg-slate-100 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-center relative">
                        <div className="h-24 md:h-32 relative shadow-md rounded-lg overflow-hidden bg-white dark:bg-black">
                             <img src={image} className="h-full object-contain" />
                        </div>
                        <button 
                            onClick={() => { setImage(null); setTranslatedText(null); }}
                            className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-red-500 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Controls & Tabs */}
                    <div className="p-4 pb-0 bg-slate-50 dark:bg-slate-900 shrink-0 z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex space-x-2">
                                {(['en', 'hi', 'bn'] as Language[]).map(l => (
                                    <button 
                                        key={l}
                                        onClick={() => setTargetLang(l)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all border ${targetLang === l ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-400'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                            {(['translate', 'ask', 'info'] as Tab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                >
                                    {tab === 'translate' && t.tabTranslate}
                                    {tab === 'ask' && t.tabAsk}
                                    {tab === 'info' && t.tabInfo}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4 relative">
                        {/* TRANSLATE TAB */}
                        {activeTab === 'translate' && (
                            <div className="space-y-4 animate-slideUp">
                                {!translatedText && !loadingTranslate && (
                                    <button 
                                        onClick={handleTranslate} 
                                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-[1.02] transition-transform"
                                    >
                                       {t.translate}
                                    </button>
                                )}

                                {loadingTranslate && (
                                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-blue-600 dark:text-blue-400 font-medium animate-pulse">{t.translating}</p>
                                    </div>
                                )}

                                {translatedText && (
                                    <div className="relative pb-24">
                                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <div className="prose dark:prose-invert prose-sm max-w-none leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                                                {translatedText}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => speak(translatedText)}
                                            className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-20 flex items-center justify-center transition-all ${isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-500'}`}
                                        >
                                            {isSpeaking ? (
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                                            ) : (
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* INFO TAB */}
                        {activeTab === 'info' && (
                            <div className="space-y-4 animate-slideRight">
                                {loadingSummary && (
                                     <div className="space-y-3 p-6 bg-white dark:bg-slate-800 rounded-2xl">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-5/6"></div>
                                     </div>
                                )}

                                {formSummary && (
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <h3 className="text-blue-600 dark:text-blue-400 font-bold mb-3 uppercase text-xs tracking-wider">{t.formSummary}</h3>
                                        <p className="text-lg leading-relaxed text-slate-800 dark:text-slate-200">{formSummary}</p>
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                            <button 
                                                onClick={() => speak(formSummary)}
                                                className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center hover:underline"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                                {isSpeaking ? t.stopSpeaking : t.readAloud}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ASK TAB */}
                        {activeTab === 'ask' && (
                            <div className="flex flex-col h-full animate-slideRight">
                                <div className="flex-1 space-y-4 pb-20">
                                    {chatHistory.length === 0 && (
                                        <div className="text-center py-10 opacity-50">
                                            <svg className="w-12 h-12 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Ask anything about this document.</p>
                                        </div>
                                    )}
                                    {chatHistory.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'}`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {loadingChat && (
                                        <div className="flex justify-start">
                                             <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none flex space-x-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                             </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef}></div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={handleVoiceInput}
                                            className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                        </button>
                                        <input 
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                                            placeholder={t.askQuestionPlaceholder}
                                            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors placeholder-slate-400"
                                        />
                                        <button 
                                            onClick={handleAsk}
                                            disabled={!question.trim() || loadingChat}
                                            className="p-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 shadow-md shadow-blue-500/30"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
             )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
        </div>
    );
};
