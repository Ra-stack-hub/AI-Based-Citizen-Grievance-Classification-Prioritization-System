import { useNotificationContext } from '../context/NotificationContext';

export const useNotification = () => {
  const { addNotification, removeNotification, notifications } = useNotificationContext();
  
  const notifySuccess = (message: string) => addNotification('success', message);
  const notifyError = (message: string) => addNotification('error', message);
  const notifyInfo = (message: string) => addNotification('info', message);
  const notifyWarning = (message: string) => addNotification('warning', message);

  return {
    notifications,
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
    removeNotification
  };
};
