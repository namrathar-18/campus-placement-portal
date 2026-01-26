import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface BasicUser {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'placement_officer' | 'admin';
  gpa?: number;
  registerNumber?: string;
  department?: string;
  section?: string;
  phone?: string;
  isPlaced?: boolean;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data as BasicUser[];
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<BasicUser>) => {
      const response = await api.put(`/users/${id}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
