import React from "react";
import { FormModal } from "@/components/schema-forms/FormModal";

type BudgetModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (budgetData: { name: string; amount: string; account: string; range: "Daily" | "Weekly" | "Monthly" | "Quarterly" }) => void;
};

/**
 * Budget Creation Modal - Migrated to Schema-Driven Form System
 * Now uses FormModal with createBudget schema for consistency
 * Maintains backward compatibility with existing onSave prop
 */
const BudgetModal: React.FC<BudgetModalProps> = ({ visible, onClose, onSave }) => {
  // Provide initial data for the budget form
  const getInitialData = () => ({
    amount: "",
    period: "monthly"
  });

  // Handle successful form submission
  const handleSuccess = (result: any) => {
    // Transform schema data back to original onSave format for backward compatibility
    const budgetData = {
      name: result.name || result.data?.name,
      amount: result.amount || result.data?.amount,
      account: result.account || result.data?.account,
      range: (result.period || result.data?.period) as "Daily" | "Weekly" | "Monthly" | "Quarterly"
    };

    // Call original onSave prop to maintain backward compatibility
    onSave(budgetData);
  };

  return (
    <FormModal
      visible={visible}
      formName="createBudget"
      onClose={onClose}
      onSuccess={handleSuccess}
      initialData={getInitialData()}
    />
  );
};

export default BudgetModal;
