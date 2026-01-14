import { useState, useCallback } from 'react';
import { updateInfo } from '../constants/updateInfo';

export const useUpdateNotification = () => {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const acknowledgedVersion = localStorage.getItem('update_acknowledged_version');
      return acknowledgedVersion !== updateInfo.version;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      // If error (e.g. private browsing), default to showing it
      return true;
    }
  });

  const handleClose = useCallback((doNotShowAgain) => {
    if (doNotShowAgain) {
      try {
        localStorage.setItem('update_acknowledged_version', updateInfo.version);
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    }
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    handleClose,
    updateInfo
  };
};
