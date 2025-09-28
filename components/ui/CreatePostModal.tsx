import React from "react";
import { FormModal } from "@/components/schema-forms/FormModal";

interface NewsSource {
  title: string;
  url: string;
}

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

/**
 * CreatePostModal - Migrated to schema-driven form
 * 
 * This component has been replaced with the FormModal component using formName="createPost".
 * The schema is defined in constants/formSchemas.ts and the form is rendered by FormModal.
 * 
 * Maintains backward compatibility by wrapping FormModal with the original props interface.
 */
const CreatePostModal: React.FC<CreatePostModalProps> = ({ visible, onClose, isLoading }) => {
  // Handle successful form submission
  const handleSuccess = (result: any) => {
    console.log("CreatePost Form submitted successfully:", result);
    // The FormModal already handled the API call, so we just need to close the modal
    // and let the parent know it was successful
    onClose();
  };



  // Add debug logging only when visible to reduce log spam
  if (visible) {
    console.log("CreatePostModal render - visible:", visible, "isLoading:", isLoading);
  }

  // Don't render if not visible to prevent unnecessary renders
  if (!visible) {
    return null;
  }

  return (
    <FormModal
      visible={visible}
      formName="createPost"
      onClose={onClose}
      onSuccess={handleSuccess}
      initialData={{
        action: "BUY",
        confidence: 70,
        clientMutationId: Math.random().toString(36).substring(2, 15),
        newsSources: []
      }}
    />
  );
};

export default CreatePostModal;
