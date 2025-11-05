// Tribe WebSocket Service
// Real-time communication for Trajectory Tribes

import { authService } from './auth';
import ENV from '@/env';
import type {
  TribeWebSocketMessage,
  OutgoingWebSocketMessage,
  TribeMessage,
  TribeMember,
  TribeRole,
} from '@/types/tribe';

export interface TribeWebSocketCallbacks {
  onConnectionEstablished?: (tribeId: number, userId: number) => void;
  onNewMessage?: (message: TribeMessage) => void;
  onMemberJoined?: (member: TribeMember) => void;
  onMemberLeft?: (userId: number, userName: string) => void;
  onMemberRoleChanged?: (userId: number, newRole: TribeRole, changedBy: number) => void;
  onTypingIndicator?: (userId: number, userName: string, isTyping: boolean) => void;
  onError?: (error: string, errorCode?: string) => void;
  onConnectionStatusChange?: (isConnected: boolean) => void;
}

class TribeWebSocketService {
  private socket: WebSocket | null = null;
  private tribeId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private callbacks: TribeWebSocketCallbacks = {};
  private baseUrl: string;
  private isIntentionalDisconnect = false;

  constructor() {
    // Use environment-specific WebSocket URL
    const wsProtocol = ENV.WS_PROTOCOL || 'ws';
    const wsHost = ENV.BACKEND_WS_HOST || 'localhost';
    const wsPort = ENV.BACKEND_WS_PORT || 8000;
    
    this.baseUrl = wsPort === 80 || wsPort === 443 
      ? `${wsProtocol}://${wsHost}` 
      : `${wsProtocol}://${wsHost}:${wsPort}`;
    
    console.log('🔧 Tribe WebSocket Configuration:');
    console.log('   WS Protocol:', wsProtocol);
    console.log('   WS Host:', wsHost);
    console.log('   WS Port:', wsPort);
    console.log('   Base URL:', this.baseUrl);
  }

  /**
   * Connect to a tribe's WebSocket
   */
  async connect(tribeId: number, callbacks: TribeWebSocketCallbacks = {}): Promise<boolean> {
    try {
      // Store callbacks
      this.callbacks = callbacks;
      this.tribeId = tribeId;
      this.isIntentionalDisconnect = false;

      // Get authentication token
      const token = await authService.getStoredAccessToken();
      if (!token) {
        console.error('No access token available for WebSocket connection');
        this.callbacks.onError?.('Authentication failed: No token available');
        return false;
      }

      // Construct WebSocket URL
      const wsUrl = `${this.baseUrl}/api/tribes/${tribeId}/ws?token=${token}`;
      
      console.log('🔌 Connecting to Tribe WebSocket:', tribeId);
      console.log('📍 WebSocket URL:', wsUrl.replace(/token=.+/, 'token=***'));

      // Create WebSocket connection
      this.socket = new WebSocket(wsUrl);

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);

      return true;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.callbacks.onError?.('Connection failed', 'CONNECTION_ERROR');
      return false;
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.isIntentionalDisconnect = true;
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }

    this.tribeId = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(isTyping: boolean): void {
    if (!this.isConnected()) {
      console.warn('Cannot send typing indicator: WebSocket not connected');
      return;
    }

    const message: OutgoingWebSocketMessage = {
      type: 'typing',
      is_typing: isTyping,
    };

    this.socket?.send(JSON.stringify(message));
  }

  /**
   * Send ping to keep connection alive
   */
  private sendPing(): void {
    if (this.isConnected()) {
      this.socket?.send(JSON.stringify({ type: 'ping' }));
    }
  }

  /**
   * Handle WebSocket connection open
   */
  private handleOpen(): void {
    console.log('✅ Tribe WebSocket connected:', this.tribeId);
    this.reconnectAttempts = 0;
    
    // Start ping interval to keep connection alive
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, 30000); // Every 30 seconds

    this.callbacks.onConnectionStatusChange?.(true);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data: TribeWebSocketMessage = JSON.parse(event.data);
      
      console.log('📨 Received WebSocket message:', data.type);

      switch (data.type) {
        case 'connection_established':
          this.callbacks.onConnectionEstablished?.(data.tribe_id, data.user_id);
          break;

        case 'new_message':
          this.callbacks.onNewMessage?.(data.message);
          break;

        case 'member_joined':
          this.callbacks.onMemberJoined?.(data.member);
          break;

        case 'member_left':
          this.callbacks.onMemberLeft?.(data.user_id, data.user_name);
          break;

        case 'member_role_changed':
          this.callbacks.onMemberRoleChanged?.(data.user_id, data.new_role, data.changed_by);
          break;

        case 'typing_indicator':
          this.callbacks.onTypingIndicator?.(data.user_id, data.user_name, data.is_typing);
          break;

        case 'announcement':
          // Treat announcements as special messages
          console.log('📢 Received announcement:', data.announcement);
          break;

        case 'error':
          this.callbacks.onError?.(data.error, data.error_code);
          break;

        default:
          console.log('Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket connection close
   */
  private handleClose(event: CloseEvent): void {
    console.log('🔌 Tribe WebSocket closed:', event.code, event.reason);
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.callbacks.onConnectionStatusChange?.(false);

    // Don't reconnect if it was an intentional disconnect
    if (this.isIntentionalDisconnect) {
      console.log('Intentional disconnect - not reconnecting');
      return;
    }

    // Handle specific close codes
    switch (event.code) {
      case 1000: // Normal closure
        console.log('WebSocket closed normally');
        break;

      case 4001: // Authentication failed
        console.error('Authentication failed - token invalid or expired');
        this.callbacks.onError?.('Authentication failed', 'AUTH_ERROR');
        // Don't reconnect on auth failure
        break;

      case 4003: // Not a member
        console.error('Not a member of this tribe');
        this.callbacks.onError?.('Not a member', 'PERMISSION_ERROR');
        // Don't reconnect if not a member
        break;

      case 4029: // Rate limited
        console.error('Rate limited - too many connections');
        this.reconnectDelay = 10000; // Wait 10 seconds
        this.handleReconnect();
        break;

      default:
        // Attempt to reconnect for other errors
        this.handleReconnect();
        break;
    }
  }

  /**
   * Handle WebSocket errors
   */
  private handleError(error: Event): void {
    console.error('🚨 Tribe WebSocket error:', error);
    console.error('🔍 Connection Details:');
    console.error('   WebSocket URL:', this.socket?.url || 'No URL available');
    console.error('   Ready State:', this.socket?.readyState || 'No socket');
    console.error('   Tribe ID:', this.tribeId);
    
    this.callbacks.onError?.('WebSocket error occurred', 'WEBSOCKET_ERROR');
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      this.callbacks.onError?.('Connection lost. Please refresh to reconnect.', 'MAX_RECONNECT_ATTEMPTS');
      return;
    }

    if (!this.tribeId) {
      console.log('No tribe ID - cannot reconnect');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      if (this.tribeId) {
        this.connect(this.tribeId, this.callbacks);
      }
    }, delay);
  }

  /**
   * Update callbacks
   */
  setCallbacks(callbacks: TribeWebSocketCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Get current tribe ID
   */
  getCurrentTribeId(): number | null {
    return this.tribeId;
  }
}

// Singleton instance
export const tribeWebSocketService = new TribeWebSocketService();

// Export class for testing
export { TribeWebSocketService };
