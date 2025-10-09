# WebSocket Integration Guide for Document Verification

## Overview
The backend now supports real-time WebSocket updates for document verification progress. This eliminates the need for frontend polling and provides instant status updates.

## WebSocket Endpoint
- **URL**: `ws://localhost:8000/users/documents/verification-updates`
- **Authentication**: JWT token required in query parameter
- **Protocol**: WebSocket with JSON message format

## Frontend Integration

### 1. JavaScript/React WebSocket Connection

```javascript
class DocumentVerificationWebSocket {
    constructor(jwtToken) {
        this.token = jwtToken;
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }
    
    connect() {
        const wsUrl = `ws://localhost:8000/users/documents/verification-updates?token=${this.token}`;
        
        try {
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = (event) => {
                console.log('WebSocket connected for document verification updates');
                this.reconnectAttempts = 0;
            };
            
            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };
            
            this.socket.onclose = (event) => {
                console.log('WebSocket connection closed:', event.code, event.reason);
                this.handleReconnect();
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
        }
    }
    
    handleMessage(data) {
        switch (data.type) {
            case 'verification_started':
                this.onVerificationStarted(data);
                break;
            case 'verification_progress':
                this.onVerificationProgress(data);
                break;
            case 'verification_completed':
                this.onVerificationCompleted(data);
                break;
            case 'verification_failed':
                this.onVerificationFailed(data);
                break;
            case 'pong':
                console.log('Received pong from server');
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }
    
    onVerificationStarted(data) {
        console.log('Verification started:', data.task_id);
        // Update UI to show verification in progress
        this.updateUI({
            status: 'processing',
            message: 'Document verification started...',
            progress: 0
        });
    }
    
    onVerificationProgress(data) {
        console.log('Verification progress:', data.progress, data.message);
        // Update progress bar
        this.updateUI({
            status: 'processing',
            message: data.message,
            progress: data.progress
        });
    }
    
    onVerificationCompleted(data) {
        console.log('Verification completed:', data.result);
        // Show success message and extracted data
        this.updateUI({
            status: 'completed',
            message: 'Document verification completed successfully!',
            progress: 100,
            result: data.result
        });
    }
    
    onVerificationFailed(data) {
        console.error('Verification failed:', data.error);
        // Show error message
        this.updateUI({
            status: 'failed',
            message: `Verification failed: ${data.error}`,
            progress: 0
        });
    }
    
    updateUI(statusData) {
        // Implement your UI update logic here
        // Example: dispatch Redux action, update React state, etc.
        console.log('UI Update:', statusData);
        
        // Example React state update
        // setVerificationStatus(statusData);
        
        // Example progress bar update
        // const progressBar = document.getElementById('verification-progress');
        // if (progressBar) {
        //     progressBar.style.width = `${statusData.progress}%`;
        // }
    }
    
    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), 3000 * this.reconnectAttempts);
        } else {
            console.log('Max reconnection attempts reached');
        }
    }
    
    sendPing() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'ping' }));
        }
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

// Usage Example
const token = localStorage.getItem('jwt_token'); // Get your JWT token
const documentWs = new DocumentVerificationWebSocket(token);
documentWs.connect();

// Optional: Send periodic pings to keep connection alive
setInterval(() => {
    documentWs.sendPing();
}, 30000); // Every 30 seconds
```

### 2. React Hook Implementation

```javascript
import { useState, useEffect, useRef } from 'react';

export const useDocumentVerificationWebSocket = (jwtToken) => {
    const [verificationStatus, setVerificationStatus] = useState({
        status: 'idle', // idle, processing, completed, failed
        message: '',
        progress: 0,
        result: null
    });
    
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    
    useEffect(() => {
        if (!jwtToken) return;
        
        const wsUrl = `ws://localhost:8000/users/documents/verification-updates?token=${jwtToken}`;
        
        try {
            socketRef.current = new WebSocket(wsUrl);
            
            socketRef.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
            };
            
            socketRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handleMessage(data);
            };
            
            socketRef.current.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
            };
            
            socketRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
            };
            
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
        }
        
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [jwtToken]);
    
    const handleMessage = (data) => {
        switch (data.type) {
            case 'verification_started':
                setVerificationStatus({
                    status: 'processing',
                    message: 'Document verification started...',
                    progress: 0,
                    result: null
                });
                break;
                
            case 'verification_progress':
                setVerificationStatus(prev => ({
                    ...prev,
                    message: data.message,
                    progress: data.progress
                }));
                break;
                
            case 'verification_completed':
                setVerificationStatus({
                    status: 'completed',
                    message: 'Document verification completed successfully!',
                    progress: 100,
                    result: data.result
                });
                break;
                
            case 'verification_failed':
                setVerificationStatus({
                    status: 'failed',
                    message: `Verification failed: ${data.error}`,
                    progress: 0,
                    result: null
                });
                break;
        }
    };
    
    const sendPing = () => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'ping' }));
        }
    };
    
    return {
        verificationStatus,
        isConnected,
        sendPing
    };
};

// Usage in React Component
function DocumentVerification() {
    const token = localStorage.getItem('jwt_token');
    const { verificationStatus, isConnected } = useDocumentVerificationWebSocket(token);
    
    return (
        <div>
            <h2>Document Verification</h2>
            <div>Status: {verificationStatus.status}</div>
            <div>Message: {verificationStatus.message}</div>
            <div>Progress: {verificationStatus.progress}%</div>
            <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
            
            {verificationStatus.result && (
                <div>
                    <h3>Extracted Information:</h3>
                    <pre>{JSON.stringify(verificationStatus.result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
```

## Message Types

### 1. Verification Started
```json
{
    "type": "verification_started",
    "task_id": "identity_verification_123_abc12345",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Verification Progress
```json
{
    "type": "verification_progress",
    "task_id": "identity_verification_123_abc12345",
    "progress": 60,
    "message": "Processing OCR for text extraction...",
    "timestamp": "2024-01-15T10:30:15Z"
}
```

### 3. Verification Completed
```json
{
    "type": "verification_completed",
    "task_id": "identity_verification_123_abc12345",
    "result": {
        "document_id": 123,
        "extracted_data": {
            "cin_number": "EE94991",
            "address": "HAY HASSANI",
            "text_content": "ROYAUME DU MAROC..."
        },
        "verification_status": "completed"
    },
    "timestamp": "2024-01-15T10:30:45Z"
}
```

### 4. Verification Failed
```json
{
    "type": "verification_failed",
    "task_id": "identity_verification_123_abc12345",
    "error": "OCR processing failed: Unable to extract text from image",
    "timestamp": "2024-01-15T10:30:30Z"
}
```

## Error Handling

### Common WebSocket Errors
1. **Authentication Error (4001)**: Invalid or expired JWT token
2. **Connection Error (1006)**: Network issues or server unavailable
3. **Rate Limiting (4029)**: Too many connection attempts

### Recommended Error Handling
```javascript
socket.onclose = (event) => {
    switch (event.code) {
        case 4001:
            console.error('Authentication failed - token invalid or expired');
            // Redirect to login or refresh token
            break;
        case 4029:
            console.error('Rate limited - too many connections');
            // Wait before reconnecting
            break;
        case 1006:
            console.error('Connection lost - attempting reconnect');
            // Automatic reconnection logic
            break;
        default:
            console.log('Connection closed:', event.code, event.reason);
    }
};
```

## Testing the Integration

### 1. Upload a Document
```javascript
// Upload identity document
const formData = new FormData();
formData.append('front_image', frontImageFile);
formData.append('back_image', backImageFile); // optional

fetch('/users/documents/identity', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${jwtToken}`
    },
    body: formData
})
.then(response => response.json())
.then(data => {
    console.log('Document uploaded:', data);
    // WebSocket updates will start automatically
});
```

### 2. Monitor Real-time Updates
Once the document is uploaded, you should receive WebSocket messages in this sequence:
1. `verification_started` - Immediately after upload
2. `verification_progress` (30%) - Downloading/processing started
3. `verification_progress` (60%) - OCR processing
4. `verification_completed` or `verification_failed` - Final result

## Benefits
- **Real-time Updates**: Instant notification of verification progress
- **Better UX**: No need for manual refresh or polling
- **Efficient**: Reduced server load compared to polling
- **Reliable**: Automatic reconnection and error handling
- **Scalable**: WebSocket connections are lightweight and efficient

## Production Considerations
1. Use secure WebSocket (`wss://`) in production
2. Implement proper authentication token refresh
3. Add connection pooling for high traffic
4. Monitor WebSocket connection metrics
5. Implement proper logging for debugging