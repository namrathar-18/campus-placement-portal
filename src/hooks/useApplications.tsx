import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Application {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    registerNumber?: string;
    department?: string;
  };
  companyId: {
    _id: string;
    name: string;
    package: number;
    location: string;
    deadline: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  appliedDate: string;
  resumeUrl?: string;
  coverLetter?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ApplicationInsert = {
  companyId: string;
  resumeUrl?: string;
  coverLetter?: string;
};

export type ApplicationUpdate = {
  status?: 'pending' | 'approved' | 'rejected' | 'under_review';
  remarks?: string;
  resumeUrl?: string;
  coverLetter?: string;
};

export const useApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await api.get('/applications');
      return response.data as Application[];
    },
  });
};

export const useApplication = (id: string) => {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: async () => {
      const response = await api.get(`/applications/${id}`);
      return response.data as Application;
    },
    enabled: !!id,
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (application: ApplicationInsert) => {
      const response = await api.post('/applications', application);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...application }: ApplicationUpdate & { id: string }) => {
      const response = await api.put(`/applications/${id}`, application);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};
