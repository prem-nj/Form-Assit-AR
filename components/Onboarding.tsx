

import React, { useState, useEffect, useRef } from 'react';
import { Language, UserProfile, UploadedDocument, ExtraField } from '../types';
import { extractProfileFromImage } from '../services/gemini';
import { translations } from '../translations';

export const Onboarding = ({ 
  language, 
  onProfileSaved,
  onCancel,
  initialProfile
}: { 
  language: Language; 
  onProfileSaved: (profile: UserProfile) => void;
  onCancel?: () => void;
  initialProfile?: UserProfile;
}) => {
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile> | null>(null);
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [selectedDocType, setSelectedDocType] = useState('Auto-Detect');
  const [pendingDocs, setPendingDocs] = useState<UploadedDocument[]>([]);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [extractedFieldsInfo, setExtractedFieldsInfo] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialProfile && !formData) {
        setFormData(initialProfile);
        if (initialProfile.extraFields) {
            setExtraFields(initialProfile.extraFields);
        }
    }
  }, [initialProfile]);

  // Clear update message after 5 seconds
  useEffect(() => {
    if (updateMessage) {
        const timer = setTimeout(() => {
            setUpdateMessage(null);
            setExtractedFieldsInfo([]);
        }, 5000);
        return () => clearTimeout(timer);
    }
  }, [updateMessage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    let mergedProfile = { ...(formData || initialProfile || {}) };
    let mergedExtraFields = [...(extraFields || [])];
    const newDocs: UploadedDocument[] = [];
    const newExtractedInfo: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const { profile: extracted, documentType } = await extractProfileFromImage(base64);
        
        // Smart Merge Helper: Aggregate data from multiple documents
        const smartMerge = (key: keyof UserProfile, newValue: string | undefined) => {
             const existing = mergedProfile[key];
             // If we already have a value, keep it. 
             if (!existing || (typeof existing === 'string' && existing.trim() === '')) {
                 if (newValue && newValue.trim() !== '') {
                     return newValue;
                 }
             }
             return existing;
        };

        mergedProfile = {
          ...mergedProfile,
          fullName: smartMerge('fullName', extracted.fullName) as string,
          dateOfBirth: smartMerge('dateOfBirth', extracted.dateOfBirth) as string,
          gender: smartMerge('gender', extracted.gender) as string,
          guardianName: smartMerge('guardianName', extracted.guardianName) as string,
          address: smartMerge('address', extracted.address) as string,
          phoneNumber: smartMerge('phoneNumber', extracted.phoneNumber) as string,
          email: smartMerge('email', extracted.email) as string,
          
          // Specific IDs
          aadharNumber: smartMerge('aadharNumber', extracted.aadharNumber) as string,
          panNumber: smartMerge('panNumber', extracted.panNumber) as string,
          passportNumber: smartMerge('passportNumber', extracted.passportNumber) as string,
          drivingLicenseNumber: smartMerge('drivingLicenseNumber', extracted.drivingLicenseNumber) as string,
          voterIdNumber: smartMerge('voterIdNumber', extracted.voterIdNumber) as string,
        };
        
        // Merge Extra Fields
        if (extracted.extraFields && Array.isArray(extracted.extraFields)) {
            extracted.extraFields.forEach(newField => {
                // Avoid duplicates by checking labels
                if (!mergedExtraFields.some(ef => ef.label.toLowerCase() === newField.label.toLowerCase())) {
                     mergedExtraFields.push(newField);
                }
            });
        }

        // Determine the final document type label
        // If user manually selected a type (other than Auto), use it. Otherwise use AI detected type.
        const finalDocType = selectedDocType !== 'Auto-Detect' ? selectedDocType : documentType;

        newDocs.push({
            type: finalDocType,
            date: new Date().toLocaleDateString(),
            verified: true
        });

        // Track what we found for feedback
        const foundFields = Object.keys(extracted).filter(k => k !== 'extraFields' && extracted[k as keyof UserProfile] && extracted[k as keyof UserProfile] !== '');
        let infoStr = `${finalDocType}: Found ${foundFields.length} main fields`;
        if (extracted.extraFields && extracted.extraFields.length > 0) {
            infoStr += ` + ${extracted.extraFields.length} extra details`;
        }
        newExtractedInfo.push(infoStr);
      }

      setFormData(mergedProfile);
      setExtraFields(mergedExtraFields);
      setPendingDocs(prev => [...prev, ...newDocs]);
      
      setUpdateMessage(`Successfully processed ${newDocs.length} document(s).`);
      setExtractedFieldsInfo(newExtractedInfo);

    } catch (err) {
      console.error(err);
      alert("Failed to extract data. Please try again.");
    } finally {
      setLoading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePendingDoc = (index: number) => {
      setPendingDocs(prev => prev.filter((_, i) => i !== index));
  };

  const addExtraField = () => {
      setExtraFields([...extraFields, { label: '', value: '' }]);
  };

  const updateExtraField = (index: number, key: 'label' | 'value', val: string) => {
      const updated = [...extraFields];
      updated[index][key] = val;
      setExtraFields(updated);
  };

  const removeExtraField = (index: number) => {
      setExtraFields(extraFields.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    // Combine existing documents with new pending documents
    const existingDocs = initialProfile?.documents || [];
    const updatedDocs = [...existingDocs, ...pendingDocs];

    // Filter empty extra fields
    const validExtraFields = extraFields.filter(f => f.label.trim() !== '' && f.value.trim() !== '');

    const profile: UserProfile = {
      fullName: (form.elements.namedItem('fullName') as HTMLInputElement).value,
      dateOfBirth: (form.elements.namedItem('dateOfBirth') as HTMLInputElement).value,
      gender: (form.elements.namedItem('gender') as HTMLInputElement).value,
      guardianName: (form.elements.namedItem('guardianName') as HTMLInputElement).value,
      address: (form.elements.namedItem('address') as HTMLTextAreaElement).value,
      phoneNumber: (form.elements.namedItem('phoneNumber') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      
      aadharNumber: (form.elements.namedItem('aadharNumber') as HTMLInputElement).value,
      panNumber: (form.elements.namedItem('panNumber') as HTMLInputElement).value,
      passportNumber: (form.elements.namedItem('passportNumber') as HTMLInputElement).value,
      drivingLicenseNumber: (form.elements.namedItem('drivingLicenseNumber') as HTMLInputElement).value,
      voterIdNumber: (form.elements.namedItem('voterIdNumber') as HTMLInputElement).value,
      
      extraFields: validExtraFields,

      documents: updatedDocs
    };
    onProfileSaved(profile);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-inner flex items-center justify-center">
                 <span className="animate-pulse">🤖</span>
             </div>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{t.extracting}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Identifying document type & aggregating data...</p>
        </div>
      </div>
    );
  }

  if (formData) {
    return (
      <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="p-6 pb-32">
          <div className="flex items-center mb-6">
             {onCancel && (
                <button onClick={onCancel} className="p-2 -ml-2 mr-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
             )}
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                 {initialProfile ? t.personalInfo : t.verifyDetails}
             </h2>
          </div>
          
          {updateMessage && (
              <div className="mb-6 animate-slideUp">
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl flex items-center mb-2">
                      <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm font-medium">{updateMessage}</span>
                  </div>
                  {extractedFieldsInfo.map((info, idx) => (
                      <div key={idx} className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                          • {info}
                      </div>
                  ))}
              </div>
          )}
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none space-y-5 border border-slate-100 dark:border-slate-700">
              
              {/* Personal Details */}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Basic Information</h3>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.fullName}</label>
                <input name="fullName" defaultValue={formData.fullName} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:bg-blue-50 dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold text-slate-900 dark:text-white" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.dob}</label>
                    <input name="dateOfBirth" defaultValue={formData.dateOfBirth} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:bg-blue-50 dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.gender}</label>
                    <input name="gender" defaultValue={formData.gender} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:bg-blue-50 dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 dark:text-white" />
                  </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.guardianName}</label>
                <input name="guardianName" defaultValue={formData.guardianName} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:bg-blue-50 dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.address}</label>
                <textarea name="address" defaultValue={formData.address} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:bg-blue-50 dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 dark:text-white" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.phone}</label>
                    <input name="phoneNumber" defaultValue={formData.phoneNumber} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:bg-blue-50 dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.email}</label>
                    <input name="email" defaultValue={formData.email} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:bg-blue-50 dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 dark:text-white" />
                  </div>
              </div>

              {/* Identity Numbers */}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 pt-2">{t.identityNumbers}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.aadharNumber}</label>
                  <input name="aadharNumber" defaultValue={formData.aadharNumber} placeholder="XXXX XXXX XXXX" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:bg-blue-50 dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 dark:text-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.panNumber}</label>
                  <input name="panNumber" defaultValue={formData.panNumber} placeholder="ABCDE1234F" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:bg-blue-50 dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 dark:text-white font-mono" />
                </div>
                 <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.drivingLicenseNumber}</label>
                  <input name="drivingLicenseNumber" defaultValue={formData.drivingLicenseNumber} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:bg-blue-50 dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 dark:text-white font-mono" />
                </div>
                 <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.passportNumber}</label>
                  <input name="passportNumber" defaultValue={formData.passportNumber} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:bg-blue-50 dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 dark:text-white font-mono" />
                </div>
                 <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.voterIdNumber}</label>
                  <input name="voterIdNumber" defaultValue={formData.voterIdNumber} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:bg-blue-50 dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 dark:text-white font-mono" />
                </div>
              </div>

               {/* Extra / Other Details */}
               <div className="pt-2">
                   <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 mb-3">
                       <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.otherDetails}</h3>
                       <button type="button" onClick={addExtraField} className="text-xs font-bold text-blue-600 dark:text-blue-400">+ {t.addDetail}</button>
                   </div>
                   
                   <div className="space-y-3">
                       {extraFields.map((field, index) => (
                           <div key={index} className="flex space-x-2 items-center">
                               <input 
                                  value={field.label} 
                                  onChange={(e) => updateExtraField(index, 'label', e.target.value)}
                                  placeholder="Label (e.g. Blood Group)"
                                  className="w-1/3 p-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-bold text-slate-500 uppercase focus:ring-2 focus:ring-blue-500/20"
                               />
                               <input 
                                  value={field.value} 
                                  onChange={(e) => updateExtraField(index, 'value', e.target.value)}
                                  placeholder="Value"
                                  className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                               />
                               <button type="button" onClick={() => removeExtraField(index)} className="p-2 text-slate-400 hover:text-red-500">
                                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                               </button>
                           </div>
                       ))}
                       {extraFields.length === 0 && (
                           <p className="text-xs text-slate-400 italic">No extra details found. Add manually if needed.</p>
                       )}
                   </div>
               </div>

               {/* New Documents Section */}
               <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                   <div className="flex justify-between items-center mb-4">
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Session Uploads</label>
                       <button 
                         type="button" 
                         onClick={() => {
                             setSelectedDocType('Auto-Detect');
                             fileInputRef.current?.click();
                         }}
                         className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                       >
                           + Add Another Document
                       </button>
                   </div>
                   
                   {pendingDocs.length === 0 ? (
                       <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400 text-sm">
                           No new documents added this session.
                       </div>
                   ) : (
                       <div className="space-y-3">
                           {pendingDocs.map((doc, idx) => (
                               <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                   <div className="flex items-center">
                                       <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                       </div>
                                       <div>
                                           <div className="text-sm font-bold text-slate-900 dark:text-white">{doc.type}</div>
                                           <div className="text-xs text-slate-500">{doc.date}</div>
                                       </div>
                                   </div>
                                   <button 
                                      type="button" 
                                      onClick={() => removePendingDoc(idx)}
                                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                   >
                                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                   </button>
                               </div>
                           ))}
                       </div>
                   )}
               </div>
            </div>
            
            <button type="submit" className="fixed bottom-8 left-6 right-6 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all z-20">
              {t.saveProfile}
            </button>
          </form>
          
          <input 
            type="file" 
            accept="image/*" 
            multiple
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
       <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.uploadIdCard}</h2>
          {onCancel && (
             <button onClick={onCancel} className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm text-slate-500 dark:text-slate-400">
               <svg className="w-5 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          )}
       </div>

       <div className="flex-1 flex flex-col px-6 pb-8">
          <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">{t.uploadIdInstructions}</p>
          
          <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar mb-4">
             {['Auto-Detect', 'Aadhar Card', 'PAN Card', 'Passport', 'Driver\'s License', 'Other'].map(type => (
                <button 
                  key={type} 
                  onClick={() => {
                    setSelectedDocType(type);
                    // For Auto-Detect, just select it. For others, maybe trigger upload immediately or wait for click?
                    // Let's trigger upload for all for smoother UX
                    fileInputRef.current?.click();
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${type === selectedDocType ? 'bg-slate-900 dark:bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  {type}
                </button>
             ))}
          </div>

          <div 
             className="flex-1 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-400 transition-colors cursor-pointer"
             onClick={() => fileInputRef.current?.click()}
          >
             <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
             </div>
             <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                 {selectedDocType === 'Auto-Detect' ? 'Smart Upload' : `Upload ${selectedDocType}`}
             </h3>
             <p className="text-slate-400 text-xs max-w-[200px] text-center">
                 {selectedDocType === 'Auto-Detect' 
                    ? "We'll detect the document type and extract your details automatically." 
                    : `Upload your ${selectedDocType} to extract details.`}
             </p>
             
             <div className="absolute bottom-10">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 dark:shadow-blue-900/50">
                   Select Images
                </button>
             </div>
          </div>
       </div>

      <input 
        type="file" 
        accept="image/*" 
        multiple
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};