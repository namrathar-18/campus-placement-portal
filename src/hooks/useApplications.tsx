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
  status: 'pending' | 'placed' | 'rejected' | 'ongoing';
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
  status?: 'pending' | 'placed' | 'rejected' | 'ongoing';
  remarks?: string;
  resumeUrl?: string;
  coverLetter?: string;
};

function extractData<T>(response: any, fallback: T): T {
  if (response && typeof response === 'object') {
    if ('success' in response && 'data' in response) {
      return (response.data ?? fallback) as T;
    }

    if ('data' in response && response.data && typeof response.data === 'object' && 'data' in response.data) {
      return (response.data.data ?? fallback) as T;
    }

    if ('data' in response && !('success' in response)) {
      return (response.data ?? fallback) as T;
    }
  }

  return (response ?? fallback) as T;
}

export const useApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await api.get('/applications');
      return extractData<Application[]>(response, []);
    },
    staleTime: 0,
    refetchOnMount: true,
    initialData: [], // Prevent undefined errors
  });
};

export const useApplication = (id: string) => {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: async () => {
      const response = await api.get(`/applications/${id}`);
      return extractData<Application | null>(response, null) as Application;
    },
    enabled: !!id,
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (application: ApplicationInsert) => {
      const response = await api.post('/applications', application);
      return extractData<Application | null>(response, null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      await queryClient.refetchQueries({ queryKey: ['applications'] });
    },
  });
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...application }: ApplicationUpdate & { id: string }) => {
      const response = await api.put(`/applications/${id}`, application);
      return extractData<Application | null>(response, null);
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
