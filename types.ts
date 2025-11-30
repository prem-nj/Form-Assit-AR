

export type Language = 'en' | 'hi' | 'bn';

export interface UploadedDocument {
  type: string;
  date: string;
  verified: boolean;
}

export interface ExtraField {
  label: string;
  value: string;
}

export interface UserProfile {
  fullName: string;
  dateOfBirth: string;
  gender?: string;
  guardianName?: string; // Father's/Husband's Name
  address: string;
  phoneNumber: string;
  email: string;
  
  // Specific Identity Numbers
  aadharNumber?: string;
  panNumber?: string;
  passportNumber?: string;
  drivingLicenseNumber?: string;
  voterIdNumber?: string;
  
  // Fallback/Legacy
  idNumber?: string; 
  
  // Dynamic fields for any other data found (Blood Group, District, etc.)
  extraFields?: ExtraField[];

  documents: UploadedDocument[];
}

export interface FormRecord {
  id: string;
  date: string;
  status: 'completed';
}

export interface FormFieldOverlay {
  fieldName: string;
  valueToFill: string;
  boundingBox: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
}

export interface FormTemplate {
  id: string;
  name: string;
  createdAt: string;
  overlays: FormFieldOverlay[];
}

export enum AppView {
  LANGUAGE_SELECT = 'LANGUAGE_SELECT',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  SCANNER = 'SCANNER',
  FORM_TRANSLATOR = 'FORM_TRANSLATOR',
}

export enum DashboardTab {
  HOME = 'HOME',
  DOCUMENTS = 'DOCUMENTS',
  HISTORY = 'HISTORY',
  TEMPLATES = 'TEMPLATES',
}

export interface ScanResult {
  image: string; // base64
  overlays: FormFieldOverlay[];
}