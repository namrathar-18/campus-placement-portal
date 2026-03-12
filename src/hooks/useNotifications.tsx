import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface NotifUser {
  _id: string;
  name: string;
  email: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetRole: 'all' | 'student' | 'placement_officer' | 'specific';
  isRead: boolean;
  userId?: NotifUser | string;
  userIds?: NotifUser[] | string[];
  relatedTo?: string;
  relatedId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationInsert = {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  targetRole?: 'all' | 'student' | 'placement_officer' | 'specific';
  userId?: string;
  userIds?: string[];
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications');
      return response.data as Notification[];
    },
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notification: NotificationInsert) => {
      const response = await api.post('/notifications', notification);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/notifications/${id}`, { isRead: true });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
