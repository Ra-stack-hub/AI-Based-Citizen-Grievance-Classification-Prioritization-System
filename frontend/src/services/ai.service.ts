import { fetchApi } from './api';

export const aiService = {
  analyzeComplaint: async (complaintData: any) => {
    return fetchApi('/analytics/analyze', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
  },
  
  chatWithBot: async (message: string) => {
    return fetchApi('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
};
