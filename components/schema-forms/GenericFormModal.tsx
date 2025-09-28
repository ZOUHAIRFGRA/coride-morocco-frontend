import React from "react";
import { FormModal } from "./FormModal";

interface GenericFormModalProps {
  visible: boolean;
  formName: string;
  onClose: () => void;
  onSuccess?: (result: any) => void;
  initialData?: Record<string, any>;
}

/**
 * Generic Form Modal Wrapper
 * Simple wrapper for the FormModal component for easier integration
 */
export const GenericFormModal: React.FC<GenericFormModalProps> = (props) => {
  return <FormModal {...props} />;
};

// Export for convenience
export default GenericFormModal;
