

import { Language } from './types';

type TranslationKeys = 
  | 'appTitle'
  | 'welcome'
  | 'readyToAutomate'
  | 'autoFillMagic'
  | 'savedIds'
  | 'formsFilled'
  | 'recentForms'
  | 'seeAll'
  | 'myDocuments'
  | 'history'
  | 'selectLanguage'
  | 'uploadIdCard'
  | 'uploadIdInstructions'
  | 'extracting'
  | 'verifyDetails'
  | 'fullName'
  | 'dob'
  | 'gender'
  | 'guardianName'
  | 'address'
  | 'idNumber'
  | 'aadharNumber'
  | 'panNumber'
  | 'passportNumber'
  | 'drivingLicenseNumber'
  | 'voterIdNumber'
  | 'identityNumbers'
  | 'otherDetails'
  | 'addDetail'
  | 'phone'
  | 'email'
  | 'saveProfile'
  | 'dashboard'
  | 'scanNewForm'
  | 'changeLanguage'
  | 'resetProfile'
  | 'cameraPermission'
  | 'pointAtForm'
  | 'captureAnalyze'
  | 'analyzing'
  | 'fillTheseFields'
  | 'retake'
  | 'done'
  | 'field'
  | 'value'
  | 'formTranslator'
  | 'translatorDesc'
  | 'selectForm'
  | 'translate'
  | 'original'
  | 'translatedResult'
  | 'translating'
  | 'completed'
  | 'menu'
  | 'idVault'
  | 'backupSecurity'
  | 'settings'
  | 'helpFaq'
  | 'privacyPolicy'
  | 'termsService'
  | 'version'
  | 'verifiedUser'
  | 'arCalibration'
  | 'personalInfo'
  | 'edit'
  | 'save'
  | 'cancel'
  | 'noDocuments'
  | 'addNewDoc'
  | 'templates'
  | 'saveTemplate'
  | 'useTemplate'
  | 'noTemplates'
  | 'saveTemplateDesc'
  | 'templateName'
  | 'guidedMode'
  | 'fullView'
  | 'nextField'
  | 'prevField'
  | 'step'
  | 'explainForm'
  | 'askQuestion'
  | 'askQuestionPlaceholder'
  | 'listening'
  | 'ask'
  | 'darkMode'
  | 'magicEditor'
  | 'selectImage'
  | 'promptPlaceholder'
  | 'generate'
  | 'tabTranslate'
  | 'tabAsk'
  | 'tabInfo'
  | 'readAloud'
  | 'stopSpeaking'
  | 'formSummary'
  | 'analyze'
  | 'summary'
  | 'viewList'
  | 'fieldsListTitle';

export const translations: Record<Language, Record<TranslationKeys, string>> = {
  en: {
    appTitle: "FormAssist AI",
    welcome: "Hello",
    readyToAutomate: "Ready to automate your forms?",
    autoFillMagic: "Smart Form Assistant",
    savedIds: "Saved IDs",
    formsFilled: "Forms Filled",
    recentForms: "Recent Forms",
    seeAll: "See All",
    myDocuments: "My ID Vault",
    history: "History",
    selectLanguage: "Select Language",
    uploadIdCard: "Add Document",
    uploadIdInstructions: "Upload any ID document (Aadhar, PAN, etc.) and we will detect it automatically.",
    extracting: "Extracting details...",
    verifyDetails: "Verify Your Details",
    fullName: "Full Name",
    dob: "Date of Birth",
    gender: "Gender",
    guardianName: "Guardian / Father's Name",
    address: "Address",
    idNumber: "Generic ID",
    aadharNumber: "Aadhar Number",
    panNumber: "PAN Number",
    passportNumber: "Passport Number",
    drivingLicenseNumber: "Driving License",
    voterIdNumber: "Voter ID",
    identityNumbers: "Identity Numbers",
    otherDetails: "Other Details",
    addDetail: "Add Detail",
    phone: "Phone Number",
    email: "Email",
    saveProfile: "Save Profile",
    dashboard: "Dashboard",
    scanNewForm: "Scan & Fill Form",
    changeLanguage: "Change Language",
    resetProfile: "Reset Profile",
    cameraPermission: "Camera access is required.",
    pointAtForm: "Point camera at the blank form",
    captureAnalyze: "Capture & Analyze",
    analyzing: "Analyzing form structure...",
    fillTheseFields: "Fill these details on your form:",
    retake: "Retake",
    done: "Done",
    field: "Field",
    value: "Value to Write",
    formTranslator: "Form Translator",
    translatorDesc: "Translate documents instantly",
    selectForm: "Select Form Image",
    translate: "Translate Form",
    original: "Original",
    translatedResult: "Translated Content",
    translating: "Translating...",
    completed: "Completed",
    menu: "Menu",
    idVault: "My ID Vault",
    backupSecurity: "Data Backup & Security",
    settings: "App Settings",
    helpFaq: "Help & FAQ",
    privacyPolicy: "Privacy Policy",
    termsService: "Terms of Service",
    version: "Version",
    verifiedUser: "Verified User",
    arCalibration: "AR Calibration",
    personalInfo: "Personal Information",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    noDocuments: "No documents in vault.",
    addNewDoc: "Add New Document",
    templates: "Form Templates",
    saveTemplate: "Save as Template",
    useTemplate: "Use Template",
    noTemplates: "No saved templates.",
    saveTemplateDesc: "Save this layout to use offline next time.",
    templateName: "Template Name",
    guidedMode: "Guided Mode",
    fullView: "Full View",
    nextField: "Next",
    prevField: "Prev",
    step: "Step",
    explainForm: "Explain Form",
    askQuestion: "Ask a Question",
    askQuestionPlaceholder: "e.g., Where do I sign?",
    listening: "Listening...",
    ask: "Ask",
    darkMode: "Dark Mode",
    magicEditor: "Magic Editor",
    selectImage: "Select Image",
    promptPlaceholder: "Describe what you want to change...",
    generate: "Generate",
    tabTranslate: "Translate",
    tabAsk: "Ask AI",
    tabInfo: "Info",
    readAloud: "Read Aloud",
    stopSpeaking: "Stop",
    formSummary: "Form Summary",
    analyze: "Analyze Form",
    summary: "Summary",
    viewList: "List View",
    fieldsListTitle: "Fields to Fill"
  },
  hi: {
    appTitle: "फ़ॉर्म असिस्ट AI",
    welcome: "नमस्ते",
    readyToAutomate: "क्या आप अपने फ़ॉर्म स्वचालित करने के लिए तैयार हैं?",
    autoFillMagic: "स्मार्ट फॉर्म सहायक",
    savedIds: "सहेजी गई आईडी",
    formsFilled: "भरे गए फ़ॉर्म",
    recentForms: "हाल के फ़ॉर्म",
    seeAll: "सभी देखें",
    myDocuments: "मेरा आईडी वॉल्ट",
    history: "इतिहास",
    selectLanguage: "भाषा चुनें",
    uploadIdCard: "दस्तावेज़ जोड़ें",
    uploadIdInstructions: "कोई भी आईडी दस्तावेज़ (आधार, पैन, आदि) अपलोड करें, हम उसे स्वचालित रूप से पहचान लेंगे।",
    extracting: "विवरण निकाला जा रहा है...",
    verifyDetails: "अपना विवरण जांचें",
    fullName: "पूरा नाम",
    dob: "जन्म तिथि",
    gender: "लिंग",
    guardianName: "अभिभावक / पिता का नाम",
    address: "पता",
    idNumber: "जेनेरिक आईडी",
    aadharNumber: "आधार नंबर",
    panNumber: "पैन नंबर",
    passportNumber: "पासपोर्ट नंबर",
    drivingLicenseNumber: "ड्राइविंग लाइसेंस",
    voterIdNumber: "मतदाता पहचान पत्र",
    identityNumbers: "पहचान संख्या",
    otherDetails: "अन्य विवरण",
    addDetail: "विवरण जोड़ें",
    phone: "फ़ोन नंबर",
    email: "ईमेल",
    saveProfile: "प्रोफ़ाइल सहेजें",
    dashboard: "डैशबोर्ड",
    scanNewForm: "स्कैन और फ़ॉर्म भरें",
    changeLanguage: "भाषा बदलें",
    resetProfile: "प्रोफ़ाइल रीसेट करें",
    cameraPermission: "कैमरा एक्सेस आवश्यक है।",
    pointAtForm: "कैमरे को खाली फ़ॉर्म पर इंगित करें",
    captureAnalyze: "कैप्चर और विश्लेषण करें",
    analyzing: "फ़ॉर्म संरचना का विश्लेषण किया जा रहा है...",
    fillTheseFields: "अपने फ़ॉर्म पर ये विवरण भरें:",
    retake: "फिर से लें",
    done: "हो गया",
    field: "क्षेत्र",
    value: "लिखने का मान",
    formTranslator: "फ़ॉर्म अनुवादक",
    translatorDesc: "दस्तावेज़ों का तुरंत अनुवाद करें",
    selectForm: "फ़ॉर्म छवि चुनें",
    translate: "फ़ॉर्म अनुवाद करें",
    original: "असली",
    translatedResult: "अनुवादित सामग्री",
    translating: "अनुवाद किया जा रहा है...",
    completed: "पूरा हुआ",
    menu: "मेनू",
    idVault: "मेरा आईडी वॉल्ट",
    backupSecurity: "डेटा बैकअप और सुरक्षा",
    settings: "ऐप सेटिंग्स",
    helpFaq: "सहायता और प्रश्न",
    privacyPolicy: "गोपनीयता नीति",
    termsService: "सेवा की शर्तें",
    version: "संस्करण",
    verifiedUser: "सत्यापित उपयोगकर्ता",
    arCalibration: "AR कैलिब्रेशन",
    personalInfo: "व्यक्तिगत जानकारी",
    edit: "संपादित करें",
    save: "सहेजें",
    cancel: "रद्द करें",
    noDocuments: "वॉल्ट में कोई दस्तावेज़ नहीं।",
    addNewDoc: "नया दस्तावेज़ जोड़ें",
    templates: "फ़ॉर्म टेम्प्लेट्स",
    saveTemplate: "टेम्पलेट के रूप में सहेजें",
    useTemplate: "टेम्पलेट का उपयोग करें",
    noTemplates: "कोई सहेजे गए टेम्पलेट नहीं।",
    saveTemplateDesc: "अगली बार ऑफ़लाइन उपयोग के लिए इस लेआउट को सहेजें।",
    templateName: "टेम्पलेट का नाम",
    guidedMode: "गाइडेड मोड",
    fullView: "पूर्ण दृश्य",
    nextField: "अगला",
    prevField: "पिछला",
    step: "चरण",
    explainForm: "फ़ॉर्म समझाएं",
    askQuestion: "प्रश्न पूछें",
    askQuestionPlaceholder: "जैसे, मुझे कहाँ हस्ताक्षर करना है?",
    listening: "सुन रहा हूँ...",
    ask: "पूछें",
    darkMode: "डार्क मोड",
    magicEditor: "मैजिक एडिटर",
    selectImage: "छवि चुनें",
    promptPlaceholder: "वर्णन करें कि आप क्या बदलना चाहते हैं...",
    generate: "उत्पन्न करें",
    tabTranslate: "अनुवाद",
    tabAsk: "AI से पूछें",
    tabInfo: "जानकारी",
    readAloud: "पढ़कर सुनाओ",
    stopSpeaking: "रुको",
    formSummary: "फॉर्म सारांश",
    analyze: "विश्लेषण करें",
    summary: "सारांश",
    viewList: "सूची देखें",
    fieldsListTitle: "भरने के लिए फ़ील्ड"
  },
  bn: {
    appTitle: "ফর্ম অ্যাসিস্ট AI",
    welcome: "হ্যালো",
    readyToAutomate: "আপনার ফর্ম স্বয়ংক্রিয় করতে প্রস্তুত?",
    autoFillMagic: "স্মার্ট ফর্ম অ্যাসিস্ট্যান্ট",
    savedIds: "সংরক্ষিত আইডি",
    formsFilled: "পূরণ করা ফর্ম",
    recentForms: "সাম্প্রতিক ফর্ম",
    seeAll: "সব দেখুন",
    myDocuments: "আমার আইডি ভল্ট",
    history: "ইতিহাস",
    selectLanguage: "ভাষা নির্বাচন করুন",
    uploadIdCard: "নথি যোগ করুন",
    uploadIdInstructions: "যেকোনো আইডি নথি (আধার, প্যান, ইত্যাদি) আপলোড করুন এবং আমরা এটি স্বয়ংক্রিয়ভাবে শনাক্ত করব।",
    extracting: "বিবরণ বের করা হচ্ছে...",
    verifyDetails: "আপনার বিবরণ যাচাই করুন",
    fullName: "পুরো নাম",
    dob: "জন্ম তারিখ",
    gender: "লিঙ্গ",
    guardianName: "অভিভাবক / পিতার নাম",
    address: "ঠিকানা",
    idNumber: "জেনেরিক আইডি",
    aadharNumber: "আধার নম্বর",
    panNumber: "প্যান নম্বর",
    passportNumber: "পাসপোর্ট নম্বর",
    drivingLicenseNumber: "ড্রাইভিং লাইসেন্স",
    voterIdNumber: "ভোটার আইডি",
    identityNumbers: "পরিচয় নম্বর",
    otherDetails: "অন্যান্য বিবরণ",
    addDetail: "বিবরণ যোগ করুন",
    phone: "ফোন নম্বর",
    email: "ইমেল",
    saveProfile: "প্রোফাইল সংরক্ষণ করুন",
    dashboard: "ড্যাশবোর্ড",
    scanNewForm: "স্ক্যান এবং ফর্ম পূরণ",
    changeLanguage: "भाषा পরিবর্তন করুন",
    resetProfile: "প্রোফাইল রিসেট করুন",
    cameraPermission: "ক্যামেরা অ্যাক্সেস প্রয়োজন।",
    pointAtForm: "খালি ফর্মের দিকে ক্যামেরা ধরুন",
    captureAnalyze: "ক্যাপচার এবং বিশ্লেষণ",
    analyzing: "ফর্মের গঠন বিশ্লেষণ করা হচ্ছে...",
    fillTheseFields: "আপনার ফর্মে এই বিবরণগুলি পূরণ করুন:",
    retake: "পুনরায় নিন",
    done: "সম্পন্ন",
    field: "ক্ষেত্র",
    value: "লেখার মান",
    formTranslator: "ফর্ম অনুবাদক",
    translatorDesc: "নথিগুলি অবিলম্বে অনুবাদ করুন",
    selectForm: "ফর্ম ছবি নির্বাচন করুন",
    translate: "ফর্ম অনুবাদ করুন",
    original: "আসল",
    translatedResult: "অনুবাদিত বিষয়বস্তু",
    translating: "অনুবাদ করা হচ্ছে...",
    completed: "সম্পন্ন",
    menu: "মেনু",
    idVault: "আমার আইডি ভল্ট",
    backupSecurity: "ডেটা ব্যাকআপ এবং নিরাপত্তা",
    settings: "অ্যাপ সেটিংস",
    helpFaq: "সাহায্য এবং প্রশ্ন",
    privacyPolicy: "গোপনীয়তা নীতি",
    termsService: "সেবানির্দেশাবলী",
    version: "সংস্করণ",
    verifiedUser: "যাচাইকৃত ব্যবহারকারী",
    arCalibration: "AR ক্যালিব্রেশন",
    personalInfo: "ব্যক্তিগত তথ্য",
    edit: "এডিট",
    save: "সংরক্ষণ",
    cancel: "বাতিল",
    noDocuments: "ভল্টে কোনো নথি নেই।",
    addNewDoc: "নতুন নথি যোগ করুন",
    templates: "ফর্ম টেমপ্লেট",
    saveTemplate: "টেমপ্লেট হিসেবে সংরক্ষণ করুন",
    useTemplate: "টেমপ্লেট ব্যবহার করুন",
    noTemplates: "কোনো সংরক্ষিত টেমপ্লেট নেই।",
    saveTemplateDesc: "পরবর্তীতে অফলাইনে ব্যবহারের জন্য এই লেআউটটি সংরক্ষণ করুন।",
    templateName: "টেমপ্লেটের নাম",
    guidedMode: "গাইডেড মোড",
    fullView: "সম্পূর্ণ দৃশ্য",
    nextField: "পরবর্তী",
    prevField: "পূর্ববর্তী",
    step: "ধাপ",
    explainForm: "ফর্ম ব্যাখ্যা করুন",
    askQuestion: "প্রশ্ন জিজ্ঞাসা করুন",
    askQuestionPlaceholder: "যেমন, আমি কোথায় স্বাক্ষর করব?",
    listening: "শুনছি...",
    ask: "জিজ্ঞাসা করুন",
    darkMode: "ডার্ক মোড",
    magicEditor: "ম্যাজিক এডিটর",
    selectImage: "ছবি নির্বাচন করুন",
    promptPlaceholder: "আপনি কী পরিবর্তন করতে চান তা বর্ণনা করুন...",
    generate: "তৈরি করুন",
    tabTranslate: "অনুবাদ",
    tabAsk: "AI কে জিজ্ঞাসা করুন",
    tabInfo: "তথ্য",
    readAloud: "পড়ে শোনান",
    stopSpeaking: "থামুন",
    formSummary: "ফর্মের সারাংশ",
    analyze: "বিশ্লেষণ করুন",
    summary: "सारांश",
    viewList: "তালিকা দেখুন",
    fieldsListTitle: "পূরণ করার ক্ষেত্র"
  },
};