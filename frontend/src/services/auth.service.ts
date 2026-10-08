import { fetchApi } from './api';

export const authService = {
  login: async (credentials: any) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    
    return fetchApi('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
  },
  
  register: async (userData: any) => {
    return fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getCurrentUser: async () => {
    return fetchApi('/auth/me', {
      method: 'GET',
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
