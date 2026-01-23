import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PlacementStats {
  totalApplications?: number;
  pendingApplications?: number;
  approvedApplications?: number;
  rejectedApplications?: number;
  activeCompanies?: number;
  totalCompanies?: number;
  totalStudents?: number;
  placedStudents?: number;
  placementRate?: string;
}

export const usePlacementStats = () => {
  return useQuery({
    queryKey: ['placementStats'],
    queryFn: async () => {
      const response = await api.get('/stats');
      return response.data as PlacementStats;
    },
  });
};
