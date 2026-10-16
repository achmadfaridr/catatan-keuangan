import React from 'react';
import { useFinance } from '../context/FinanceContext';

export const Toast: React.FC = () => {
  const { toast } = useFinance();

  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className={`toast-message ${toast.type}`}>
        {toast.message}
      </div>
    </div>
  );
};
