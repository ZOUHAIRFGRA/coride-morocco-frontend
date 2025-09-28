import React, { useEffect } from "react";
import { FormModal } from "@/components/schema-forms/FormModal";

type AccountModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (accountData: { name: string; currency: string; initialBalance: string; initialDate: string; icon: string }) => void;
};

/**
 * Account Creation Modal - Migrated to Schema-Driven Form System
 * Now uses FormModal with createAccount schema for consistency
 * Maintains backward compatibility with existing onSave prop
 */
const AccountModal: React.FC<AccountModalProps> = ({ visible, onClose, onSave }) => {
  // Get current date for initial balance date
  const getInitialData = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return {
      initialDate: `${year}-${month}-${day}`, // ISO format for date input
      currency: "US Dollar",
      icon: "cash"
    };
  };

  // Handle successful form submission
  const handleSuccess = (result: any) => {
    // Transform schema data back to original onSave format for backward compatibility
    const accountData = {
      name: result.name || result.data?.name,
      currency: result.currency || result.data?.currency,
      initialBalance: result.initialBalance || result.data?.initialBalance,
      initialDate: result.initialDate || result.data?.initialDate,
      icon: result.icon || result.data?.icon
    };

    // Call original onSave prop to maintain backward compatibility
    onSave(accountData);
  };

  return (
    <FormModal
      visible={visible}
      formName="createAccount"
      onClose={onClose}
      onSuccess={handleSuccess}
      initialData={getInitialData()}
    />
  );
};

export default AccountModal;
