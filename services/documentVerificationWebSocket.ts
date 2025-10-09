// Document Verification WebSocket Service
// Real-time updates for document verification progress

import { authService } from './auth';
import ENV from '@/env';

export interface VerificationStatus {
  status: 'idle' | 'processing' | 'completed' | 'failed';
  message: string;
  progress: number;
  result: any | null;
  taskId?: string;
}

export interface WebSocketMessage {
  type: 'verification_started' | 'verification_progress' | 'verification_completed' | 'verification_failed' | 'ping' | 'pong';
  task_id?: string;
  progress?: number;
  message?: string;
  result?: any;
  error?: string;
  timestamp?: string;
}

type VerificationUpdateCallback = (status: VerificationStatus) => void;
type ConnectionStatusCallback = (isConnected: boolean) => void;

class DocumentVerificationWebSocket {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private pingInterval: number | null = null;
  private baseUrl: string;
  
  // Callbacks
  private onVerificationUpdate: VerificationUpdateCallback | null = null;
  private onConnectionStatusChange: ConnectionStatusCallback | null = null;

  constructor() {
    // Use environment-specific WebSocket URL from proper config
    const wsProtocol = ENV.WS_PROTOCOL || 'ws';
    const wsHost = ENV.BACKEND_WS_HOST || 'localhost';
    const wsPort = ENV.BACKEND_WS_PORT || 8000;
    
    // Construct WebSocket base URL properly
    this.baseUrl = wsPort === 80 || wsPort === 443 
      ? `${wsProtocol}://${wsHost}` 
      : `${wsProtocol}://${wsHost}:${wsPort}`;
    
    console.log('🔧 WebSocket Service Configuration:');
    console.log('   Environment:', ENV.ENVIRONMENT);
    console.log('   WS Protocol:', wsProtocol);
    console.log('   WS Host:', wsHost);
    console.log('   WS Port:', wsPort);
    console.log('   WebSocket Base URL:', this.baseUrl);
    console.log('   Using NGROK:', process.env.EXPO_PUBLIC_USING_NGROK);
    console.log('   WiFi IP:', process.env.EXPO_PUBLIC_WIFI_IP);
    console.log('   API URL:', ENV.API_URL);
    console.log('   Full ENV Config:', JSON.stringify(ENV, null, 2));
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<boolean> {
    try {
      const token = await authService.getStoredAccessToken();
      if (!token) {
        console.error('No access token available for WebSocket connection');
        return false;
      }

      const wsUrl = `${this.baseUrl}/api/users/documents/verification-updates?token=${token}`;
      
      console.log('🔌 Attempting WebSocket connection to:', wsUrl.replace(/token=.+/, 'token=***'));
      console.log('📍 Base URL:', this.baseUrl);
      console.log('🔑 Token available:', !!token);
      console.log('🔑 Token preview:', token ? `${token.substring(0, 20)}...` : 'None');
      console.log('⚙️  Current Environment Configuration:');
      console.log('   Environment:', ENV.ENVIRONMENT);
      console.log('   WS Protocol:', ENV.WS_PROTOCOL);
      console.log('   WS Host:', ENV.BACKEND_WS_HOST);
      console.log('   WS Port:', ENV.BACKEND_WS_PORT);
      console.log('   API URL:', ENV.API_URL);
      console.log('⚙️  Environment Variables:');
      console.log('   EXPO_PUBLIC_WIFI_IP:', process.env.EXPO_PUBLIC_WIFI_IP);
      console.log('   EXPO_PUBLIC_USING_NGROK:', process.env.EXPO_PUBLIC_USING_NGROK);
      console.log('   EXPO_PUBLIC_IS_PROD:', process.env.EXPO_PUBLIC_IS_PROD);
      console.log('🔗 Full WebSocket URL being used:', wsUrl);
      
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);

      return true;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      return false;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
  }

  /**
   * Set callback for verification updates
   */
  setVerificationUpdateCallback(callback: VerificationUpdateCallback): void {
    this.onVerificationUpdate = callback;
  }

  /**
   * Set callback for connection status changes
   */
  setConnectionStatusCallback(callback: ConnectionStatusCallback): void {
    this.onConnectionStatusChange = callback;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Test connection and log comprehensive diagnostic information
   */
  async testConnection(): Promise<void> {
    console.log('🔍 WebSocket Connection Diagnostics:');
    console.log('🌐 Current Environment:', ENV.ENVIRONMENT);
    console.log('🔧 WebSocket Config:');
    console.log('   Protocol:', ENV.WS_PROTOCOL);
    console.log('   Host:', ENV.BACKEND_WS_HOST);
    console.log('   Port:', ENV.BACKEND_WS_PORT);
    console.log('   Base URL:', this.baseUrl);
    
    const token = await authService.getStoredAccessToken();
    const wsUrl = `${this.baseUrl}/api/users/documents/verification-updates?token=${token ? 'PRESENT' : 'MISSING'}`;
    console.log('🔗 Full WebSocket URL (token hidden):', wsUrl.replace(/token=.+/, 'token=***'));
    
    console.log('📊 Environment Summary:');
    console.log('   WIFI IP:', process.env.EXPO_PUBLIC_WIFI_IP);
    console.log('   Using NGROK:', process.env.EXPO_PUBLIC_USING_NGROK);
    console.log('   Is Production:', process.env.EXPO_PUBLIC_IS_PROD);
    console.log('   Current Socket State:', this.socket?.readyState);
    
    if (this.socket?.readyState !== undefined) {
      const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
      console.log(`   Socket State Name: ${states[this.socket.readyState]}`);
    }
    
    console.log('🔧 Troubleshooting Steps:');
    console.log('   1. Check if backend server is running');
    console.log('   2. Verify WebSocket endpoint exists at: /api/users/documents/verification-updates');
    console.log('   3. Test HTTP API first to confirm connectivity');
    console.log('   4. Check network configuration (NGROK vs local)');
    console.log('   5. Verify token is valid and not expired');
    
    // Test HTTP endpoint first
    try {
      const httpUrl = `${ENV.API_URL}/health`;
      console.log('🧪 Testing HTTP connectivity to:', httpUrl);
      const response = await fetch(httpUrl);
      console.log('✅ HTTP test result:', response.status, response.statusText);
    } catch (httpError) {
      console.error('❌ HTTP test failed:', httpError);
    }
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
    console.log('Document verification WebSocket connected');
    this.reconnectAttempts = 0;
    
    // Start ping interval to keep connection alive
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, 30000); // Every 30 seconds

    this.onConnectionStatusChange?.(true);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);
      
      switch (data.type) {
        case 'verification_started':
          this.handleVerificationStarted(data);
          break;
        case 'verification_progress':
          this.handleVerificationProgress(data);
          break;
        case 'verification_completed':
          this.handleVerificationCompleted(data);
          break;
        case 'verification_failed':
          this.handleVerificationFailed(data);
          break;
        case 'pong':
          console.log('Received pong from server');
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
    console.log('Document verification WebSocket closed:', event.code, event.reason);
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.onConnectionStatusChange?.(false);

    // Handle specific close codes
    switch (event.code) {
      case 4001:
        console.error('Authentication failed - token invalid or expired');
        // Don't reconnect on auth failure
        break;
      case 4029:
        console.error('Rate limited - too many connections');
        // Wait longer before reconnecting
        this.reconnectDelay = 10000;
        this.handleReconnect();
        break;
      default:
        this.handleReconnect();
        break;
    }
  }

  /**
   * Handle WebSocket errors
   */
  private handleError(error: Event): void {
    console.error('🚨 Document verification WebSocket error:', error);
    console.error('🔍 WebSocket Connection Details:');
    console.error('   WebSocket URL:', this.socket?.url || 'No URL available');
    console.error('   Ready State:', this.socket?.readyState || 'No socket');
    console.error('   Protocol:', this.socket?.protocol || 'No protocol');
    console.error('🔍 Environment Details:');
    console.error('   Current ENV:', ENV.ENVIRONMENT);
    console.error('   WS Protocol:', ENV.WS_PROTOCOL);
    console.error('   WS Host:', ENV.BACKEND_WS_HOST);
    console.error('   WS Port:', ENV.BACKEND_WS_PORT);
    console.error('   Base URL:', this.baseUrl);
    console.error('   Using NGROK:', process.env.EXPO_PUBLIC_USING_NGROK);
    console.error('   WiFi IP:', process.env.EXPO_PUBLIC_WIFI_IP);
    console.error('🔍 Possible Issues:');
    console.error('   1. Backend server not running on specified port');
    console.error('   2. WebSocket endpoint not implemented on backend');
    console.error('   3. Network connectivity issues');
    console.error('   4. Incorrect host/port configuration');
    console.error('   5. CORS or WebSocket upgrade issues');
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('Max reconnection attempts reached');
      this.onVerificationUpdate?.({
        status: 'failed',
        message: 'Connection lost. Please refresh to reconnect.',
        progress: 0,
        result: null
      });
    }
  }

  /**
   * Handle verification started message
   */
  private handleVerificationStarted(data: WebSocketMessage): void {
    console.log('Verification started:', data.task_id);
    
    this.onVerificationUpdate?.({
      status: 'processing',
      message: 'Document verification started...',
      progress: 0,
      result: null,
      taskId: data.task_id
    });
  }

  /**
   * Handle verification progress message
   */
  private handleVerificationProgress(data: WebSocketMessage): void {
    console.log('Verification progress:', data.progress, data.message);
    
    this.onVerificationUpdate?.({
      status: 'processing',
      message: data.message || 'Processing...',
      progress: data.progress || 0,
      result: null,
      taskId: data.task_id
    });
  }

  /**
   * Handle verification completed message
   */
  private handleVerificationCompleted(data: WebSocketMessage): void {
    console.log('Verification completed:', data.result);
    
    this.onVerificationUpdate?.({
      status: 'completed',
      message: 'Document verification completed successfully!',
      progress: 100,
      result: data.result,
      taskId: data.task_id
    });
  }

  /**
   * Handle verification failed message
   */
  private handleVerificationFailed(data: WebSocketMessage): void {
    console.error('Verification failed:', data.error);
    
    this.onVerificationUpdate?.({
      status: 'failed',
      message: data.error || 'Document verification failed',
      progress: 0,
      result: null,
      taskId: data.task_id
    });
  }
}

// Singleton instance
export const documentVerificationWebSocket = new DocumentVerificationWebSocket();