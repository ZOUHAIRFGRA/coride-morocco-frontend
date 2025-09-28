import React from "react";
import { FormModal } from "@/components/schema-forms/FormModal";

interface PriceAlertModalProps {
  visible: boolean;
  onClose: () => void;
  onSetAlert: (price: string, type: string) => void;
}

/**
 * Price Alert Modal - Migrated to Schema-Driven Form System
 * Now uses FormModal with createPriceAlert schema for consistency
 * Maintains backward compatibility with existing onSetAlert prop
 */
const PriceAlertModal = ({ visible, onClose, onSetAlert }: PriceAlertModalProps) => {
  // Provide initial data for the price alert form
  const getInitialData = () => ({
    ticker: "BTC", // Default to Bitcoin since that's what was shown in original modal
    alertType: "price",
    targetPrice: "96.345",
    condition: "below"
  });

  // Handle successful form submission
  const handleSuccess = (result: any) => {
    // Transform schema data back to original onSetAlert format for backward compatibility
    const price = result.targetPrice || result.data?.targetPrice;
    const type = result.alertType || result.data?.alertType;

    // Call original onSetAlert prop to maintain backward compatibility
    onSetAlert(price, type);
  };

  return (
    <FormModal
      visible={visible}
      formName="createPriceAlert"
      onClose={onClose}
      onSuccess={handleSuccess}
      initialData={getInitialData()}
    />
  );
};

export default PriceAlertModal;
