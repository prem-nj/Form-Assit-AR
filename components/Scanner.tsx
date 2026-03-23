


import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - Vite specific import
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { UserProfile, Language, FormFieldOverlay, FormTemplate, ScanResult } from '../types';
import { analyzeFormAndMapData, getFormExplanation, askFormQuestion } from '../services/gemini';
import { translations } from '../translations';

// Set worker path for PDF.js using Vite's asset handling
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const Scanner = ({ 
  language, 
  userProfile, 
  onClose,
  onComplete,
  onSaveTemplate,
  initialTemplate,
}: { 
  language: Language; 
  userProfile: UserProfile; 
  onClose: () => void; 
  onComplete: () => void;
  onSaveTemplate: (name: string, overlays: FormFieldOverlay[]) => void;
  initialTemplate?: FormTemplate;
}) => {
  const t = translations[language];
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<{ message: string, isQuota: boolean } | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showFieldList, setShowFieldList] = useState(false);
  
  // Camera Error States
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isSecureContextState, setIsSecureContextState] = useState(true);
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string | null>(null);
  
  // Guided Mode State
  const [isGuidedMode, setIsGuidedMode] = useState(true);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);

  // Speech Toggle State
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [responseText, setResponseText] = useState<string | null>(null);

  const applyMappingFallback = useCallback((overlays: FormFieldOverlay[]) => {
    return overlays.map(overlay => {
        if (overlay.valueToFill && overlay.valueToFill.trim() !== '') return overlay;
        
        const key = overlay.fieldName.toLowerCase();
        let newValue = overlay.valueToFill;
        
        if (key.includes('name')) newValue = userProfile.fullName;
        else if (key.includes('birth') || key.includes('dob')) newValue = userProfile.dateOfBirth;
        else if (key.includes('address')) newValue = userProfile.address;
        else if (key.includes('phone') || key.includes('mobile')) newValue = userProfile.phoneNumber;
        else if (key.includes('pan')) newValue = userProfile.panNumber || '';
        else if (key.includes('aadhar') || key.includes('uid')) newValue = userProfile.aadharNumber || '';
        else if (key.includes('email')) newValue = userProfile.email;
        else if (key.includes('gender') || key.includes('sex')) newValue = userProfile.gender || '';
        
        return { ...overlay, valueToFill: newValue || '' };
    });
  }, [userProfile]);

  // Cleanup Camera Function
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
  }, []);

  // Start Camera Function
  const startCamera = useCallback(async () => {
    // 1. Secure Context Check
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
         setIsSecureContextState(false);
         return;
    }
    setIsSecureContextState(true);

    // Stop any existing streams first
    stopCamera();
    setPermissionDenied(false);
    setCameraErrorMsg(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
         throw new Error("Camera API not supported in this browser");
      }
      
      let stream: MediaStream | null = null;

      try {
          // 2. Primary Attempt: Environment camera (Back Camera)
          stream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: 'environment' },
              audio: false
          });
      } catch (err) {
          console.warn("Environment camera failed, trying generic fallback", err);
          // 3. Fallback Attempt: Any available video camera
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          } catch (fallbackErr) {
            console.error("Fallback camera failed", fallbackErr);
            throw fallbackErr; // Re-throw to be caught by outer block
          }
      }

      if (!stream) throw new Error("No stream available");

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          // IMPORTANT: play() returns a Promise. Handle interruptions.
          await videoRef.current.play();
        } catch (playErr: any) {
          // Ignore AbortError which happens when play() is interrupted by a new load or pause
          if (playErr.name !== 'AbortError') {
            console.error("Video play error:", playErr);
          }
        }
      }
      
    } catch (err: any) {
      // If the error is because the component unmounted or stream was stopped during setup
      if (err.name === 'AbortError') return;

      console.error("Camera access error:", err);
      
      const errorName = err.name || '';
      
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
          setPermissionDenied(true);
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
          setCameraErrorMsg("No camera device found.");
      } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
          setCameraErrorMsg("Camera is in use by another application.");
      } else {
           // Treat generic errors as permission/availability issues
           setPermissionDenied(true); 
      }
    }
  }, [stopCamera]);

  // Initial Camera Start
  useEffect(() => {
    if (!result) {
        startCamera();
    }
    
    // Cleanup on unmount
    return () => {
        stopCamera();
    };
  }, [result, startCamera, stopCamera]);


  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    setImageDimensions({ width: video.videoWidth, height: video.videoHeight });
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg');
    
    // Pause video
    video.pause();
    
    if (initialTemplate) {
        // Template Mode: Use stored overlays but re-map values from current profile
        const remappedOverlays = initialTemplate.overlays.map(overlay => {
            let newValue = overlay.valueToFill;
            const key = overlay.fieldName.toLowerCase();
            if (key.includes('name')) newValue = userProfile.fullName;
            else if (key.includes('birth') || key.includes('dob')) newValue = userProfile.dateOfBirth;
            else if (key.includes('address')) newValue = userProfile.address;
            else if (key.includes('phone')) newValue = userProfile.phoneNumber;
            else if (key.includes('pan') || key.includes('id') || key.includes('aadhar')) newValue = userProfile.idNumber || userProfile.aadharNumber || userProfile.panNumber || '';
            else if (key.includes('email')) newValue = userProfile.email;
            
            return { ...overlay, valueToFill: newValue };
        });

        setResult({ image: base64, overlays: remappedOverlays });
        return;
    }

    setAnalyzing(true);
    setError(null);
    try {
      const overlays = await analyzeFormAndMapData(base64, userProfile);
      const finalOverlays = applyMappingFallback(overlays);
      setResult({ image: base64, overlays: finalOverlays });
    } catch (err: any) {
      console.error(err);
      const errStr = JSON.stringify(err).toLowerCase();
      const isQuota = errStr.includes('429') || errStr.includes('quota') || errStr.includes('resource_exhausted') || err.status === 429;
      setError({
        message: isQuota 
          ? "AI Service Limit Reached: The AI is currently at its free usage limit. Please wait a few minutes or try again later today."
          : "Analysis failed. Please ensure the form is clear and try again.",
        isQuota
      });
      video.play();
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setCurrentFieldIndex(0);
    setImageDimensions(null);
    setPermissionDenied(false);
    setResponseText(null);
    // startCamera will be triggered by useEffect when result becomes null
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setError(null);
    stopCamera();

    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) throw new Error("Could not create canvas context");
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport, canvas }).promise;
        
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        setImageDimensions({ width: canvas.width, height: canvas.height });
        
        const overlays = await analyzeFormAndMapData(base64, userProfile);
        const finalOverlays = applyMappingFallback(overlays);
        setResult({ image: base64, overlays: finalOverlays });
      } else {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          
          const img = new Image();
          img.onload = async () => {
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            try {
              const overlays = await analyzeFormAndMapData(base64, userProfile);
              const finalOverlays = applyMappingFallback(overlays);
              setResult({ image: base64, overlays: finalOverlays });
            } catch (err: any) {
              console.error(err);
              const errStr = JSON.stringify(err).toLowerCase();
              const isQuota = errStr.includes('429') || errStr.includes('quota') || errStr.includes('resource_exhausted') || err.status === 429;
              setError({
                message: isQuota 
                  ? "AI Service Limit Reached: The AI is currently at its free usage limit. Please wait a few minutes or try again later today."
                  : "Analysis failed. Please ensure the form is clear and try again.",
                isQuota
              });
            } finally {
              setAnalyzing(false);
            }
          };
          img.src = base64;
        };
        reader.readAsDataURL(file);
        return; // Exit early as FileReader is async
      }
    } catch (err: any) {
      console.error("File processing error:", err);
      const errStr = JSON.stringify(err).toLowerCase();
      const isQuota = errStr.includes('429') || errStr.includes('quota') || errStr.includes('resource_exhausted') || err.status === 429;
      setError({
        message: isQuota 
          ? "AI Service Limit Reached: The AI is currently at its free usage limit. Please wait a few minutes or try again later today."
          : "Failed to process file. Please try an image instead.",
        isQuota
      });
    } finally {
      // Only set false if not using FileReader which has its own finally/catch
      if (file.type === 'application/pdf') {
        setAnalyzing(false);
      }
    }
  };

  const handleExplainForm = async () => {
    if (!result) return;
    setSpeaking(true);
    setError(null);
    try {
        const text = await getFormExplanation(result.image, language);
        setResponseText(text);
        speak(text);
    } catch (err: any) {
        console.error(err);
        const errStr = JSON.stringify(err).toLowerCase();
        const isQuota = errStr.includes('429') || errStr.includes('quota') || errStr.includes('resource_exhausted') || err.status === 429;
        setError({
            message: isQuota 
                ? "AI Service Limit Reached: The AI is currently at its free usage limit. Please wait a few minutes or try again later today."
                : "Could not explain the form. Please try again.",
            isQuota
        });
    } finally {
        setSpeaking(false);
    }
  };

  const handleAskQuestion = async () => {
      if (!result) return;
      setListening(true);
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
          alert("Voice recognition not supported in this browser.");
          setListening(false);
          return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : 'en-US';
      recognition.start();

      recognition.onresult = async (event: any) => {
          const question = event.results[0][0].transcript;
          setListening(false);
          setSpeaking(true);
          setError(null);
          try {
              const answer = await askFormQuestion(result.image, question, language);
              setResponseText(answer);
              speak(answer);
          } catch (err: any) {
              console.error(err);
              const errStr = JSON.stringify(err).toLowerCase();
              const isQuota = errStr.includes('429') || errStr.includes('quota') || errStr.includes('resource_exhausted') || err.status === 429;
              setError({
                  message: isQuota 
                      ? "AI Service Limit Reached: The AI is currently at its free usage limit. Please wait a few minutes or try again later today."
                      : "Could not answer the question. Please try again.",
                  isQuota
              });
          } finally {
              setSpeaking(false);
          }
      };

      recognition.onerror = () => {
          setListening(false);
          alert("Could not hear you.");
      };
  };

  const speak = (text: string) => {
      if (!speechEnabled) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
  };

  if (!isSecureContextState) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white p-6 text-center">
             <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
             <h2 className="text-2xl font-bold mb-2">HTTPS Required</h2>
             <p className="text-slate-400 mb-6 max-w-xs mx-auto">
                 The camera only works on secure (HTTPS) connections. Please check your URL.
             </p>
             <div className="flex flex-col space-y-3 w-full max-w-xs">
                <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full px-6 py-3 bg-blue-600 rounded-xl font-bold shadow-lg flex items-center justify-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    {t.uploadForm}
                </button>
                <button onClick={onClose} className="w-full px-6 py-3 bg-slate-800 rounded-xl font-bold">Go Back</button>
             </div>
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,application/pdf" 
                onChange={handleFileUpload}
             />
        </div>
      );
  }

  if (permissionDenied || cameraErrorMsg) {
      return (
          <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white p-6 text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">{cameraErrorMsg || t.cameraPermission}</h2>
              <p className="text-slate-400 mb-6 max-w-xs mx-auto">
                 {cameraErrorMsg ? "Please fix the issue and retry." : (
                    <>
                     Camera access was denied. <br/><br/>
                     <span className="text-white font-bold">To fix this:</span><br/>
                     1. Tap the 🔒 <span className="text-white font-bold">Lock Icon</span> in your address bar.<br/>
                     2. Click "Permissions" or "Site Settings".<br/>
                     3. Set Camera to <span className="text-green-400 font-bold">Allow</span>.
                    </>
                 )}
              </p>
              <div className="flex flex-col space-y-3 w-full max-w-xs mx-auto">
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full px-6 py-3 bg-blue-600 rounded-xl font-bold shadow-lg flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    {t.uploadForm}
                  </button>
                  <div className="flex space-x-3">
                      <button onClick={onClose} className="flex-1 px-4 py-3 bg-slate-800 rounded-xl font-bold">Go Back</button>
                      <button 
                        onClick={startCamera} 
                        className="flex-1 px-4 py-3 bg-slate-700 rounded-xl font-bold shadow-lg hover:bg-slate-600"
                      >
                          Retry Camera
                      </button>
                  </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,application/pdf" 
                onChange={handleFileUpload}
              />
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-black relative">
       {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={onClose} className="p-2 rounded-full bg-white/20 text-white backdrop-blur-md">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        {result && (
            <div className="flex space-x-2">
                 {/* Speech Toggle */}
                 <button 
                    onClick={() => setSpeechEnabled(!speechEnabled)}
                    className={`p-2 rounded-full backdrop-blur-md text-white transition-all ${speechEnabled ? 'bg-blue-600/50' : 'bg-white/20'}`}
                 >
                    {speechEnabled ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                    )}
                 </button>

                 <button 
                    onClick={() => setIsGuidedMode(!isGuidedMode)}
                    className="p-2 px-4 rounded-full bg-white/20 text-white backdrop-blur-md text-sm font-bold flex items-center hover:bg-white/30 transition-all"
                 >
                    {isGuidedMode ? (
                        <>
                           {/* Expert Toggle: Switch to Full View */}
                           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                           {t.fullView}
                        </>
                    ) : (
                        <>
                            {/* Toggle back to Guided View */}
                           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                           {t.guidedMode}
                        </>
                    )}
                 </button>
                 <button onClick={handleRetake} className="p-2 rounded-full bg-white/20 text-white backdrop-blur-md text-sm font-bold hover:bg-white/30 transition-all">
                    {t.retake}
                 </button>
            </div>
        )}
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ${result ? 'hidden' : 'block animate-gentle-zoom'}`} 
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Alignment Overlay - Only visible when not analyzing and no result */}
        {!result && !analyzing && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                {/* Error Message if any */}
                {error && (
                    <div className="absolute top-20 left-6 right-6 pointer-events-auto animate-slideUp z-50">
                        <div className={`p-4 rounded-xl flex items-start ${error.isQuota ? 'bg-amber-100/90 backdrop-blur-md text-amber-900' : 'bg-red-100/90 backdrop-blur-md text-red-900'}`}>
                            <div className="mr-3 mt-0.5">
                                {error.isQuota ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold mb-1">{error.isQuota ? "AI Limit Reached" : "Error"}</p>
                                <p className="text-[10px] opacity-90 leading-tight">{error.message}</p>
                                <div className="flex space-x-3 mt-2">
                                    {error.isQuota && (
                                        <button onClick={() => { setError(null); captureAndAnalyze(); }} className="text-[10px] font-bold uppercase tracking-wider underline">Try Again</button>
                                    )}
                                    <button onClick={() => setError(null)} className="text-[10px] font-bold uppercase tracking-wider underline opacity-60">Dismiss</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Darkened backdrop (Simulated via large shadow on the frame) */}
                <div className="relative w-[85%] aspect-[3/4] max-w-md rounded-3xl overflow-hidden shadow-[0_0_0_100vmax_rgba(0,0,0,0.5)]">
                    {/* Corner Indicators */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-white/80 rounded-tl-3xl"></div>
                    <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-white/80 rounded-tr-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-white/80 rounded-bl-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-white/80 rounded-br-3xl"></div>
                    
                    {/* Scanning Line Animation */}
                    <div className="absolute left-0 right-0 h-0.5 bg-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan-line-move"></div>
                </div>
                
                {/* Floating Instruction Badge */}
                <div className="mt-8 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                    <p className="text-white text-sm font-medium flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {t.pointAtForm}
                    </p>
                </div>
            </div>
        )}

        {/* Result Image & Overlays */}
        {result && (
             <div className="relative w-full h-full flex items-center justify-center bg-black">
                {/* Error Message if any */}
                {error && (
                    <div className="absolute top-20 left-6 right-6 pointer-events-auto animate-slideUp z-50">
                        <div className={`p-4 rounded-xl flex items-start ${error.isQuota ? 'bg-amber-100/90 backdrop-blur-md text-amber-900' : 'bg-red-100/90 backdrop-blur-md text-red-900'}`}>
                            <div className="mr-3 mt-0.5">
                                {error.isQuota ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold mb-1">{error.isQuota ? "AI Limit Reached" : "Error"}</p>
                                <p className="text-[10px] opacity-90 leading-tight">{error.message}</p>
                                <div className="flex space-x-3 mt-2">
                                    {error.isQuota && (
                                        <button onClick={() => { setError(null); captureAndAnalyze(); }} className="text-[10px] font-bold uppercase tracking-wider underline">Try Again</button>
                                    )}
                                    <button onClick={() => setError(null)} className="text-[10px] font-bold uppercase tracking-wider underline opacity-60">Dismiss</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div 
                    className="relative"
                    style={{
                        aspectRatio: imageDimensions ? `${imageDimensions.width}/${imageDimensions.height}` : 'auto',
                        width: '100%',
                        maxHeight: '100%'
                    }}
                >
                    <img src={result.image} className="w-full h-full object-contain" />
                    
                    {/* Overlays */}
                    {result.overlays.map((overlay, index) => {
                        const isActive = isGuidedMode && index === currentFieldIndex;
                        const isHidden = isGuidedMode && index !== currentFieldIndex;
                        
                        // Parse coordinates (0-1000 scale)
                        const top = overlay.boundingBox.ymin / 10;
                        const left = overlay.boundingBox.xmin / 10;
                        const width = (overlay.boundingBox.xmax - overlay.boundingBox.xmin) / 10;
                        const height = (overlay.boundingBox.ymax - overlay.boundingBox.ymin) / 10;

                        if (isHidden) return null;

                        return (
                            <div
                                key={index}
                                className={`absolute flex items-end justify-start transition-all duration-300 
                                    ${isActive 
                                        ? 'z-20' 
                                        : 'z-10'
                                    }
                                `}
                                style={{
                                    top: `${top}%`,
                                    left: `${left}%`,
                                    width: `${width}%`,
                                    height: `${height}%`,
                                }}
                            >
                                {/* The "Filled" Text - No more green box, just the data */}
                                <div className={`w-full h-full flex items-end justify-start`}>
                                    <span 
                                        className={`font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap transition-all duration-300 ${isActive ? 'opacity-100 scale-105' : 'opacity-90'}`}
                                        style={{ 
                                            fontSize: `min(${height * 1.2}vh, 20px)`, // Reduced size
                                            textShadow: '1px 1px 0px rgba(255,255,255,0.8)',
                                            letterSpacing: '0.02em',
                                            transform: 'translateY(2px)', // Adjusted nudge
                                            display: 'block',
                                            lineHeight: '1.2'
                                        }}
                                    >
                                        {overlay.valueToFill}
                                    </span>
                                </div>

                                {isActive && (
                                    <>
                                        {/* Minimal Active Indicator - Subtle glow under the text */}
                                        <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></div>

                                        <div className="absolute -top-10 left-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-30 animate-modalEnter flex items-center">
                                            <span className="mr-1">✏️</span>
                                            <span>{overlay.fieldName}</span>
                                            {/* Arrow */}
                                            <div className="absolute -bottom-1 left-2 w-2 h-2 bg-blue-600 rotate-45"></div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
             </div>
        )}

        {/* Scanning Animation */}
        {analyzing && (
           <div className="absolute inset-0 z-10">
              <div className="w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-[scan_2s_ease-in-out_infinite]" style={{ animationName: 'scan' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-2xl text-white font-medium animate-pulse">
                    {t.analyzing}
                 </div>
              </div>
           </div>
        )}

        {/* Response Text Overlay */}
        {responseText && (
            <div className="absolute bottom-40 left-4 right-4 bg-black/80 backdrop-blur-md text-white p-4 rounded-xl z-50 animate-slideUp">
                <p className="text-sm font-medium pr-6">{responseText}</p>
                <button 
                    onClick={() => setResponseText(null)} 
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white rounded-full bg-white/10"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        )}
        
        <style>{`
            @keyframes scan {
                0% { transform: translateY(0); }
                50% { transform: translateY(100vh); }
                100% { transform: translateY(0); }
            }
        `}</style>
      </div>

      {/* Bottom Controls */}
      <div className="p-6 pb-10 bg-gradient-to-t from-black to-transparent space-y-4">
         {!result && !analyzing && (
            <div className="flex flex-col items-center">
               <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,application/pdf" 
                  onChange={handleFileUpload}
               />
               <div className="flex items-center space-x-8 mb-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-95 transition-transform"
                    title={t.uploadForm}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </button>

                  <button 
                    onClick={captureAndAnalyze}
                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform bg-white/20 backdrop-blur-sm"
                  >
                    <div className="w-16 h-16 bg-white rounded-full shadow-inner"></div>
                  </button>

                  <div className="w-14 h-14"></div> {/* Spacer for symmetry */}
               </div>
               <p className="text-white/60 text-xs font-medium uppercase tracking-widest">{t.captureAnalyze}</p>
            </div>
         )}
         
         {result && (
             <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-xl">
                 {/* Guided Controls */}
                 {isGuidedMode && (
                     <div className="flex items-center justify-between mb-4">
                         <button 
                            disabled={currentFieldIndex === 0}
                            onClick={() => setCurrentFieldIndex(Math.max(0, currentFieldIndex - 1))}
                            className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full disabled:opacity-30"
                         >
                            <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                         </button>
                         <div className="text-center">
                             <p className="text-xs text-slate-400 font-bold uppercase">{t.step} {currentFieldIndex + 1} of {result.overlays.length}</p>
                             <p className="text-slate-900 dark:text-white font-bold text-lg">{result.overlays[currentFieldIndex]?.fieldName}</p>
                         </div>
                         <button 
                            disabled={currentFieldIndex === result.overlays.length - 1}
                            onClick={() => setCurrentFieldIndex(Math.min(result.overlays.length - 1, currentFieldIndex + 1))}
                            className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full disabled:opacity-30"
                         >
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                         </button>
                     </div>
                 )}

                 <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleExplainForm} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 py-3 rounded-xl font-bold text-sm">
                            {speaking ? 'Speaking...' : t.explainForm}
                        </button>
                        <button onClick={handleAskQuestion} className={`py-3 rounded-xl font-bold text-sm ${listening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                            {listening ? t.listening : t.askQuestion}
                        </button>
                        <button onClick={() => setShowFieldList(true)} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold text-sm flex items-center justify-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            {t.viewList}
                        </button>
                        <button onClick={() => setShowSaveTemplate(true)} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold text-sm">
                            {t.saveTemplate}
                        </button>
                    </div>
                    <button onClick={onComplete} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30">
                        {t.done}
                    </button>
                 </div>
             </div>
         )}
      </div>

      {/* Field List Modal */}
      {showFieldList && result && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="bg-slate-900 w-full max-w-lg max-h-[85vh] rounded-[2.5rem] flex flex-col p-6 shadow-2xl border border-white/10 animate-modalEnter">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">{t.fieldsListTitle}</h2>
                    <button onClick={() => setShowFieldList(false)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {result.overlays.map((item, idx) => (
                        <div key={idx} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">{t.field}: {item.fieldName}</p>
                            <div className="bg-blue-900/20 p-3 rounded-xl border border-blue-500/20 flex items-start mt-2">
                                <span className="text-blue-400 mr-3 mt-0.5">✏️</span>
                                <span className="text-blue-100 font-mono font-medium text-base break-words">{item.valueToFill}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pt-6 mt-2">
                    <button onClick={() => setShowFieldList(false)} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
                        Close List
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Save Template Dialog */}
      {showSaveTemplate && result && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 z-50 animate-fadeIn">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl w-full max-w-sm animate-modalEnter">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t.saveTemplate}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{t.saveTemplateDesc}</p>
                  <input 
                    id="templateName"
                    placeholder={t.templateName}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-blue-500 mb-4"
                  />
                  <div className="flex space-x-3">
                      <button onClick={() => setShowSaveTemplate(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300">{t.cancel}</button>
                      <button 
                        onClick={() => {
                            const nameInput = document.getElementById('templateName') as HTMLInputElement;
                            const name = nameInput?.value?.trim() || `Form Template ${new Date().toLocaleDateString()}`;
                            onSaveTemplate(name, result.overlays);
                            setShowSaveTemplate(false);
                            alert('Template Saved!');
                        }} 
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold"
                      >
                          {t.save}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};