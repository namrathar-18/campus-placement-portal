import api from '@/lib/api';
import type {
  ZenithProfile,
  ZenithRecommendation,
  ZenithResumeFeedback,
  ZenithUpcomingDrive,
} from '../types';

export const zenithApi = {
  async getProfile(): Promise<ZenithProfile> {
    const response = await api.get('/zenith/profile');
    return response.data;
  },

  async updateProfile(payload: Partial<ZenithProfile>): Promise<ZenithProfile> {
    const response = await api.patch('/zenith/profile', payload);
    return response.data;
  },

  async getRecommendations(): Promise<ZenithRecommendation[]> {
    const response = await api.get('/zenith/recommendations');
    return response.data;
  },

  async getUpcomingDrives(): Promise<ZenithUpcomingDrive[]> {
    const response = await api.get('/zenith/upcoming-drives');
    return response.data;
  },

  async getResumeFeedback(resumeText?: string): Promise<ZenithResumeFeedback> {
    const response = await api.post('/zenith/resume-feedback', { resumeText });
    return response.data;
  },
};
