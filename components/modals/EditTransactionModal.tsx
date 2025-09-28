/**
 * Edit Transaction Modal
 * 
 * Modal for editing transactions within a journal entry.
 * Now uses the FormModal component with the updateJournalEntryTransactions schema
 * for consistent UI and validation.
 * 
 * @author VoxProfit Development Team
 * @version 2.0.0
 */

import React, { useMemo } from "react";
import { FormModal } from "@/components/schema-forms/FormModal";
import { Transaction } from "@/redux/bookkeeping/bookkeepingTypes";

interface EditTransactionModalProps {
  visible: boolean;
  transaction: Transaction | null;
  selectedEntity: any; // Entity context for fetching accounts
  journalEntryUuid: string; // UUID of the journal entry being edited
  onClose: () => void;
  onSave: (updatedTransaction: Transaction) => void;
}

export default function EditTransactionModal({
  visible,
  transaction,
  selectedEntity,
  journalEntryUuid,
  onClose,
  onSave,
}: EditTransactionModalProps) {
  // Prepare initial data for the form based on the transaction
  const initialData = useMemo(() => {
    if (!transaction) return {};

    // Transform the single transaction into the array format expected by the schema
    return {
      uuid: journalEntryUuid, // Journal entry UUID for updating
      journalEntryUuid: journalEntryUuid, // Also pass as journalEntryUuid for easier access
      selectedEntity, // Pass entity for account fetching
      description: transaction.description || "", // Pass the transaction description
      transactions: [
        {
          txUuid: transaction.uuid, // Include transaction UUID for updates
          accountUuid: transaction.accountUuid || "",
          description: transaction.description || "",
          transactionType: transaction.txType || "debit",
          amount: Math.abs(parseFloat(transaction.amount?.toString() || "0") || 0),
        }
      ]
    };
  }, [transaction, selectedEntity, journalEntryUuid]);

  /**
   * Handle successful form submission
   * Transform the form data back to transaction format and call onSave
   */
  const handleSuccess = (result: any, formData?: any) => {
    console.log("🎉 EditTransactionModal - Form submission successful:", result);
    console.log("📝 EditTransactionModal - Form data:", formData);

    if (formData && formData.transactions && formData.transactions.length > 0 && transaction) {
      // Take the first transaction from the form data (we're editing a single transaction)
      const updatedTransactionData = formData.transactions[0];
      
      // Transform back to Transaction format
      const updatedTransaction: Transaction = {
        ...transaction, // Preserve all original transaction data
        description: updatedTransactionData.description,
        amount: updatedTransactionData.amount,
        txType: updatedTransactionData.transactionType,
        accountUuid: updatedTransactionData.accountUuid,
        // Include txUuid for backend updates
        uuid: transaction.uuid,
      };

      console.log("💾 EditTransactionModal - Calling onSave with:", updatedTransaction);
      onSave(updatedTransaction);
    }
    
    onClose();
  };

  return (
    <FormModal
      visible={visible}
      formName="editSingleTransaction"
      onClose={onClose}
      onSuccess={handleSuccess}
      initialData={initialData}
    />
  );
}


