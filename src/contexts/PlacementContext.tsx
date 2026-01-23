import { createContext, useContext, ReactNode } from 'react';
import { useApplications, useCreateApplication, Application } from '@/hooks/useApplications';
import api from '@/lib/api';

interface PlacementContextType {
  isStudentPlaced: (studentId: string) => boolean;
  applyToCompany: (companyId: string, studentId: string) => Promise<void>;
  getStudentApplications: (studentId: string) => Application[];
}

const PlacementContext = createContext<PlacementContextType | undefined>(undefined);

export const PlacementProvider = ({ children }: { children: ReactNode }) => {
  const { data: applications = [] } = useApplications();
  const createApplication = useCreateApplication();

  const isStudentPlaced = (studentId: string): boolean => {
    // This would need to be fetched from the user profile
    // For now, return false or implement a separate API call
    return false;
  };

  const getStudentApplications = (studentId: string): Application[] => {
    return applications.filter(app => app.studentId._id === studentId);
  };

  const applyToCompany = async (companyId: string, studentId: string) => {
    await createApplication.mutateAsync({ companyId });
  };

  return (
    <PlacementContext.Provider value={{
      isStudentPlaced,
      applyToCompany,
      getStudentApplications,
    }}>
      {children}
    </PlacementContext.Provider>
  );
};

export const usePlacement = () => {
  const context = useContext(PlacementContext);
  if (context === undefined) {
    throw new Error('usePlacement must be used within a PlacementProvider');
  }
  return context;
};