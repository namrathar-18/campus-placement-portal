import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Company {
  _id: string;
  name: string;
  description: string;
  logoUrl?: string;
  industry: string;
  location: string;
  package: number;
  eligibility: string;
  deadline: string;
  roles?: string[];
  requirements?: string[];
  status: 'active' | 'closed' | 'draft';
  openings?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CompanyInsert = Omit<Company, '_id' | 'createdAt' | 'updatedAt'>;
export type CompanyUpdate = Partial<CompanyInsert>;

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/companies');
      return response.data as Company[];
    },
  });
};

export const useCompany = (id: string) => {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: async () => {
      const response = await api.get(`/companies/${id}`);
      return response.data as Company;
    },
    enabled: !!id,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (company: CompanyInsert) => {
      const response = await api.post('/companies', company);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...company }: CompanyUpdate & { id: string }) => {
      const response = await api.put(`/companies/${id}`, company);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};
