// React Hook for Document Verification WebSocket
// Provides real-time document verification status updates

import { useState, useEffect } from 'react';
import { documentVerificationWebSocket, VerificationStatus } from '@/services/documentVerificationWebSocket';

export interface UseDocumentVerificationWebSocketReturn {
  verificationStatus: VerificationStatus;
  isConnected: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  resetStatus: () => void;
  testConnection: () => Promise<void>;
}

export const useDocumentVerificationWebSocket = (): UseDocumentVerificationWebSocketReturn => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    status: 'idle',
    message: '',
    progress: 0,
    result: null
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Each mounted consumer subscribes with its own callback, so updates
    // reach every component using this hook (not just the last one mounted).
    const unsubscribeVerification = documentVerificationWebSocket.subscribeVerificationUpdate(setVerificationStatus);
    const unsubscribeConnection = documentVerificationWebSocket.subscribeConnectionStatus(setIsConnected);

    connect();

    // Cleanup on unmount — unsubscribe this consumer, then disconnect() is a
    // no-op unless it was the last one, so other mounted consumers keep working.
    return () => {
      unsubscribeVerification();
      unsubscribeConnection();
      documentVerificationWebSocket.disconnect();
    };
  }, []);

  const connect = async (): Promise<boolean> => {
    try {
      const success = await documentVerificationWebSocket.connect();
      return success;
    } catch (error) {
      console.error('Failed to connect to document verification WebSocket:', error);
      return false;
    }
  };

  const disconnect = (): void => {
    documentVerificationWebSocket.disconnect();
  };

  const resetStatus = (): void => {
    setVerificationStatus({
      status: 'idle',
      message: '',
      progress: 0,
      result: null
    });
  };

  const testConnection = async (): Promise<void> => {
    await documentVerificationWebSocket.testConnection();
  };

  return {
    verificationStatus,
    isConnected,
    connect,
    disconnect,
    resetStatus,
    testConnection
  };
};