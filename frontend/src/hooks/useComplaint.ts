import { useState } from 'react';
import { fetchApi } from '../services/api';

export const useComplaint = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitComplaint = async (complaintData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi('/complaints', {
        method: 'POST',
        body: JSON.stringify(complaintData)
      });
      setLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getComplaints = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/complaints');
      setLoading(false);
      return data;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { submitComplaint, getComplaints, loading, error };
};
