export type UserRole = 'student' | 'placement_officer' | 'admin';
export type Gender = 'male' | 'female';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  gender?: Gender;
  registerNumber?: string;
  phone?: string;
  department?: string;
  section?: string;
  gpa?: number;
  resumeUrl?: string;
  photoUrl?: string;
}

export interface Company {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  logoUrl?: string;
  industry: string;
  location: string;
  package: number;
  salary?: string;
  min_gpa: number;
  eligibility: string;
  deadline: Date | string;
  role?: string;
  roles?: string[];
  requirements?: string[];
  job_type?: 'full-time' | 'internship' | 'both';
  status?: 'active' | 'closed' | 'draft';
  openings?: number;
  createdBy?: string;
  [key: string]: any;
}

export interface Application {
  _id?: string;
  id?: string;
  studentId: any;
  studentName?: string;
  companyId: any;
  companyName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  appliedAt?: string;
  appliedDate?: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  type: 'info' | 'success' | 'warning';
}

export interface PlacementStats {
  totalStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  averageSalary: string;
  topCompany: string;
  companiesVisited: number;
}
