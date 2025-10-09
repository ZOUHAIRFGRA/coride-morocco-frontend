// React Hook for Document Verification WebSocket
// Provides real-time document verification status updates

import { useState, useEffect, useRef } from 'react';
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
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;

      // Set up callbacks
      documentVerificationWebSocket.setVerificationUpdateCallback((status: VerificationStatus) => {
        setVerificationStatus(status);
      });

      documentVerificationWebSocket.setConnectionStatusCallback((connected: boolean) => {
        setIsConnected(connected);
      });

      // Auto-connect
      connect();
    }

    // Cleanup on unmount
    return () => {
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