import React from 'react';
import { FormModal } from './FormModal';

interface AddFundsModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (result: any, formData?: any) => void;
  accountType: 'ledger_cash' | 'budgeting_cash';
}

/**
 * Add Funds Modal Component
 * Wrapper around FormModal for adding funds to cash accounts
 */
export const AddFundsModal: React.FC<AddFundsModalProps> = ({
  visible,
  onClose,
  onSuccess,
  accountType,
}) => {
  const initialData = accountType ? { accountType } : undefined;
  return (
    <FormModal
      visible={visible}
      formName="fundCash"
      onClose={onClose}
      onSuccess={onSuccess}
      initialData={initialData}
    />
  );
};
