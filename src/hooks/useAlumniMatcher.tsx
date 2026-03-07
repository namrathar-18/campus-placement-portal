import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { AlumniMatchResponse, AlumniRecord } from '@/types';

interface AlumniMatchRequest {
  company: string;
  alumniData?: AlumniRecord[];
}

export const useAlumniMatcher = () => {
  return useMutation({
    mutationFn: async ({ company, alumniData }: AlumniMatchRequest) => {
      const payload: AlumniMatchRequest = { company };

      if (Array.isArray(alumniData)) {
        payload.alumniData = alumniData;
      }

      return (await api.post('/alumni/company-match', payload)) as AlumniMatchResponse;
    },
  });
};
