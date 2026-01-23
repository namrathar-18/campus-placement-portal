export type UserRole = 'student' | 'placement_officer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  registerNumber?: string;
  phone?: string;
  department?: string;
  section?: string;
  gpa?: number;
  resumeUrl?: string;
  photoUrl?: string;
}

export interface Company {
  id: string;
  name: string;
  role: string;
  salary: string;
  qualifications: string;
  minGpa: number;
  description: string;
  deadline: string;
  logo?: string;
  location?: string;
  jobType: 'Full-time' | 'Internship' | 'Part-time';
}

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  companyId: string;
  companyName: string;
  status: 'applied' | 'shortlisted' | 'interview' | 'selected' | 'rejected';
  appliedAt: string;
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
