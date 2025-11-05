// React Hook for Tribe WebSocket
// Provides real-time communication for tribes

import { useState, useEffect, useRef, useCallback } from 'react';
import { tribeWebSocketService, TribeWebSocketCallbacks } from '@/services/tribeWebSocket';
import type {
  TribeMessage,
  TribeMember,
  TribeRole,
} from '@/types/tribe';

export interface UseTribeWebSocketReturn {
  // Connection state
  isConnected: boolean;
  
  // Data states
  messages: TribeMessage[];
  typingUsers: Map<number, string>;
  
  // Actions
  connect: (tribeId: number) => Promise<boolean>;
  disconnect: () => void;
  sendTypingIndicator: (isTyping: boolean) => void;
  addMessage: (message: TribeMessage) => void;
  clearMessages: () => void;
  
  // Event callbacks (can be overridden)
  onNewMessage?: (message: TribeMessage) => void;
  onMemberJoined?: (member: TribeMember) => void;
  onMemberLeft?: (userId: number, userName: string) => void;
  onMemberRoleChanged?: (userId: number, newRole: TribeRole, changedBy: number) => void;
  onError?: (error: string, errorCode?: string) => void;
}

export interface UseTribeWebSocketOptions {
  autoConnect?: boolean;
  tribeId?: number;
  onNewMessage?: (message: TribeMessage) => void;
  onMemberJoined?: (member: TribeMember) => void;
  onMemberLeft?: (userId: number, userName: string) => void;
  onMemberRoleChanged?: (userId: number, newRole: TribeRole, changedBy: number) => void;
  onError?: (error: string, errorCode?: string) => void;
}

export const useTribeWebSocket = (
  options: UseTribeWebSocketOptions = {}
): UseTribeWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<TribeMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());
  
  const typingTimeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const isInitialized = useRef(false);

  // Handle new message
  const handleNewMessage = useCallback((message: TribeMessage) => {
    console.log('📨 New message received via WebSocket:', message.id);
    
    setMessages((prevMessages) => {
      // Check if message already exists
      const exists = prevMessages.some((m) => m.id === message.id);
      if (exists) {
        return prevMessages;
      }
      
      // Add new message
      return [...prevMessages, message];
    });

    // Call custom callback if provided
    options.onNewMessage?.(message);
  }, [options]);

  // Handle member joined
  const handleMemberJoined = useCallback((member: TribeMember) => {
    console.log('👋 Member joined:', member.first_name, member.last_name);
    options.onMemberJoined?.(member);
  }, [options]);

  // Handle member left
  const handleMemberLeft = useCallback((userId: number, userName: string) => {
    console.log('👋 Member left:', userName);
    
    // Remove from typing users if present
    setTypingUsers((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });

    options.onMemberLeft?.(userId, userName);
  }, [options]);

  // Handle member role changed
  const handleMemberRoleChanged = useCallback(
    (userId: number, newRole: TribeRole, changedBy: number) => {
      console.log('🔄 Member role changed:', userId, 'to', newRole, 'by', changedBy);
      options.onMemberRoleChanged?.(userId, newRole, changedBy);
    },
    [options]
  );

  // Handle typing indicator
  const handleTypingIndicator = useCallback(
    (userId: number, userName: string, isTyping: boolean) => {
      if (isTyping) {
        // Add to typing users
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.set(userId, userName);
          return next;
        });

        // Clear existing timeout
        const existingTimeout = typingTimeouts.current.get(userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Set timeout to remove typing indicator after 3 seconds
        const timeout = setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Map(prev);
            next.delete(userId);
            return next;
          });
          typingTimeouts.current.delete(userId);
        }, 3000);

        typingTimeouts.current.set(userId, timeout);
      } else {
        // Remove from typing users
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(userId);
          return next;
        });

        // Clear timeout
        const existingTimeout = typingTimeouts.current.get(userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          typingTimeouts.current.delete(userId);
        }
      }
    },
    []
  );

  // Handle error
  const handleError = useCallback(
    (error: string, errorCode?: string) => {
      console.error('WebSocket error:', error, errorCode);
      options.onError?.(error, errorCode);
    },
    [options]
  );

  // Handle connection status change
  const handleConnectionStatusChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
  }, []);

  // Connect to tribe WebSocket
  const connect = useCallback(async (tribeId: number): Promise<boolean> => {
    console.log('🔌 Connecting to tribe WebSocket:', tribeId);

    const callbacks: TribeWebSocketCallbacks = {
      onConnectionEstablished: (tId, userId) => {
        console.log('✅ WebSocket connection established:', tId, userId);
      },
      onNewMessage: handleNewMessage,
      onMemberJoined: handleMemberJoined,
      onMemberLeft: handleMemberLeft,
      onMemberRoleChanged: handleMemberRoleChanged,
      onTypingIndicator: handleTypingIndicator,
      onError: handleError,
      onConnectionStatusChange: handleConnectionStatusChange,
    };

    const success = await tribeWebSocketService.connect(tribeId, callbacks);
    return success;
  }, [
    handleNewMessage,
    handleMemberJoined,
    handleMemberLeft,
    handleMemberRoleChanged,
    handleTypingIndicator,
    handleError,
    handleConnectionStatusChange,
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting from tribe WebSocket');
    
    // Clear all typing timeouts
    typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    typingTimeouts.current.clear();
    
    tribeWebSocketService.disconnect();
  }, []);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    tribeWebSocketService.sendTypingIndicator(isTyping);
  }, []);

  // Manually add a message (useful after sending a message via API)
  const addMessage = useCallback((message: TribeMessage) => {
    setMessages((prevMessages) => {
      const exists = prevMessages.some((m) => m.id === message.id);
      if (exists) {
        return prevMessages;
      }
      return [...prevMessages, message];
    });
  }, []);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Auto-connect on mount if tribeId provided
  useEffect(() => {
    if (!isInitialized.current && options.autoConnect && options.tribeId) {
      isInitialized.current = true;
      connect(options.tribeId);
    }

    // Cleanup on unmount
    return () => {
      if (isInitialized.current) {
        disconnect();
      }
    };
  }, [options.autoConnect, options.tribeId, connect, disconnect]);

  return {
    isConnected,
    messages,
    typingUsers,
    connect,
    disconnect,
    sendTypingIndicator,
    addMessage,
    clearMessages,
    onNewMessage: options.onNewMessage,
    onMemberJoined: options.onMemberJoined,
    onMemberLeft: options.onMemberLeft,
    onMemberRoleChanged: options.onMemberRoleChanged,
    onError: options.onError,
  };
};
