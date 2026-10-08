import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import CitizenChatbot from './CitizenChatbot';
import AdminChatbot from './AdminChatbot';

const RoleBasedChatbot = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // Don't show chatbot if not logged in, or show a generic one
  }

  if (user.role === 'admin') {
    return <AdminChatbot />;
  }

  // Default to citizen chatbot
  return <CitizenChatbot />;
};

export default RoleBasedChatbot;
