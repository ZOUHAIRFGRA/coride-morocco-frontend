import React from "react";
import { FormModal } from "@/components/schema-forms/FormModal";
import { CreateAlpacaAccountInput } from "@/redux/investment/investmentTypes";

/**
 * Props for KycFormModal
 */
type KycFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateAlpacaAccountInput) => void;
  isLoading?: boolean;
};

/**
 * KYC Form Modal - Migrated to schema-driven form
 * 
 * This component has been replaced with the FormModal component using formName="createKycAlpacaAccount".
 * The schema is defined in constants/formSchemas.ts and the form is rendered by FormModal.
 * 
 * Maintains backward compatibility by wrapping FormModal with the original props interface.
 */
const KycFormModal: React.FC<KycFormModalProps> = ({ visible, onClose, onSubmit, isLoading }) => {
  // Handle successful form submission
  const handleSuccess = (result: any, formData: any) => {
    console.log("🔍 KycFormModal - onSuccess called with result:", result);
    console.log("🔍 KycFormModal - onSuccess called with formData:", formData);
    
    // Call the onSubmit callback with the form data so the parent can handle it
    if (onSubmit && formData) {
      console.log("🔍 KycFormModal - Calling onSubmit with formData:", formData);
      onSubmit(formData);
    } else {
      console.log("🔍 KycFormModal - onSubmit not available or formData missing");
    }
    
    // Close the modal
    onClose();
  };

  // Add debug logging
  console.log("KycFormModal render - visible:", visible, "isLoading:", isLoading);

  // Don't render if not visible to prevent unnecessary renders
  if (!visible) {
    return null;
  }

  return (
    <FormModal
      visible={visible}
      formName="createKycAlpacaAccount"
      onClose={onClose}
      onSuccess={handleSuccess}
      initialData={{
        country: "USA",
        citizenship: "USA", 
        countryOfBirth: "USA",
        countryOfTaxResidence: "USA",
        taxIdType: "USA_SSN",
        fundingSources: ["EMPLOYMENT_INCOME"],
        isControlPerson: false,
        isAffiliatedExchangeOrFinra: false,
        isPoliticallyExposed: false,
        immediateFamilyExposed: false,
        ipAddress: "185.13.21.99", // Default IP
        investmentExperience: "none",
        annualIncome: "under_25k",
        netWorth: "under_25k",
        riskTolerance: "low"
      }}
    />
  );
};

export default KycFormModal;
