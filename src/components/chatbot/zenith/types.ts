export type ZenithSender = 'user' | 'assistant';

export interface ZenithMessage {
  id: string;
  sender: ZenithSender;
  text: string;
  createdAt: string;
}

export interface ZenithProfile {
  id: string;
  name: string;
  email: string;
  isPlaced?: boolean;
  registerNumber?: string;
  phone?: string;
  department?: string;
  section?: string;
  gpa?: number;
  gpaLocked: boolean;
  skills: string[];
  certifications: string[];
  projects: string[];
  resumeText?: string;
}

export interface ZenithRecommendation {
  companyId: string;
  name: string;
  role: string;
  package?: number;
  salary?: string;
  minGpa: number;
  deadline: string;
  skillMatchPercent: number;
  gpaEligible: boolean;
  branchMatch: boolean;
  overallScore: number;
  reasons: string[];
}

export interface ZenithUpcomingDrive {
  companyId: string;
  name: string;
  role: string;
  deadline: string;
  minGpa: number;
  package?: number;
  salary?: string;
}

export interface ZenithResumeFeedback {
  missingKeywords: string[];
  improvements: string[];
}

export interface PendingProfileUpdate {
  payload: Partial<Pick<ZenithProfile, 'phone' | 'skills' | 'department' | 'section' | 'resumeText'>>;
  summary: string;
}
