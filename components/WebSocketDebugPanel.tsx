// WebSocket Debug Component
// Shows detailed connection information for troubleshooting

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDocumentVerificationWebSocket } from '@/hooks/useDocumentVerificationWebSocket';
import ENV from '@/env';

interface WebSocketDebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const WebSocketDebugPanel: React.FC<WebSocketDebugPanelProps> = ({ visible, onClose }) => {
  const { colors } = useAppTheme();
  const { isConnected, testConnection } = useDocumentVerificationWebSocket();
  const [debugInfo, setDebugInfo] = useState<string>('');

  const runDiagnostics = async () => {
    console.log('🔍 Running comprehensive WebSocket diagnostics...');
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        current: ENV.ENVIRONMENT,
        ws_protocol: ENV.WS_PROTOCOL,
        ws_host: ENV.BACKEND_WS_HOST,
        ws_port: ENV.BACKEND_WS_PORT,
        api_url: ENV.API_URL,
      },
      runtime_vars: {
        expo_public_wifi_ip: process.env.EXPO_PUBLIC_WIFI_IP,
        expo_public_using_ngrok: process.env.EXPO_PUBLIC_USING_NGROK,
        expo_public_is_prod: process.env.EXPO_PUBLIC_IS_PROD,
      },
      connection: {
        is_connected: isConnected,
        websocket_url: `${ENV.WS_PROTOCOL}://${ENV.BACKEND_WS_HOST}:${ENV.BACKEND_WS_PORT}/users/documents/verification-updates`,
      }
    };

    const formattedInfo = JSON.stringify(diagnostics, null, 2);
    setDebugInfo(formattedInfo);
    
    console.log('📊 WebSocket Diagnostics:', diagnostics);
    
    // Test the connection
    await testConnection();
    
    Alert.alert(
      'Diagnostics Complete',
      'Check console for detailed WebSocket connection information.',
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ 
        flex: 1, 
        backgroundColor: colors.background.primary,
        paddingTop: 50 
      }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.primary
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text.primary
          }}>
            WebSocket Debug Panel
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={{ flex: 1, padding: 20 }}>
          {/* Connection Status */}
          <View style={{
            backgroundColor: colors.background.secondary,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 12
            }}>
              Connection Status
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: isConnected ? '#10B981' : '#EF4444',
                marginRight: 8
              }} />
              <Text style={{
                color: colors.text.secondary,
                fontSize: 14
              }}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>

          {/* Environment Info */}
          <View style={{
            backgroundColor: colors.background.secondary,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 12
            }}>
              Environment Configuration
            </Text>
            <Text style={{ color: colors.text.secondary, fontSize: 12, fontFamily: 'monospace' }}>
              Environment: {ENV.ENVIRONMENT}{'\n'}
              WS Protocol: {ENV.WS_PROTOCOL}{'\n'}
              WS Host: {ENV.BACKEND_WS_HOST}{'\n'}
              WS Port: {ENV.BACKEND_WS_PORT}{'\n'}
              API URL: {ENV.API_URL}{'\n'}
              {'\n'}
              Runtime Variables:{'\n'}
              WIFI_IP: {process.env.EXPO_PUBLIC_WIFI_IP}{'\n'}
              USING_NGROK: {process.env.EXPO_PUBLIC_USING_NGROK}{'\n'}
              IS_PROD: {process.env.EXPO_PUBLIC_IS_PROD}
            </Text>
          </View>

          {/* WebSocket URL */}
          <View style={{
            backgroundColor: colors.background.secondary,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 12
            }}>
              WebSocket URL
            </Text>
            <Text style={{ 
              color: colors.text.secondary, 
              fontSize: 12, 
              fontFamily: 'monospace',
              backgroundColor: colors.background.primary,
              padding: 8,
              borderRadius: 4
            }}>
              {ENV.WS_PROTOCOL}://{ENV.BACKEND_WS_HOST}:{ENV.BACKEND_WS_PORT}/users/documents/verification-updates?token=***
            </Text>
          </View>

          {/* Debug Info */}
          {debugInfo && (
            <View style={{
              backgroundColor: colors.background.secondary,
              borderRadius: 12,
              padding: 16,
              marginBottom: 20
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: 12
              }}>
                Diagnostic Results
              </Text>
              <ScrollView style={{ maxHeight: 300 }}>
                <Text style={{ 
                  color: colors.text.secondary, 
                  fontSize: 10, 
                  fontFamily: 'monospace',
                  backgroundColor: colors.background.primary,
                  padding: 8,
                  borderRadius: 4
                }}>
                  {debugInfo}
                </Text>
              </ScrollView>
            </View>
          )}

          {/* Run Diagnostics Button */}
          <TouchableOpacity
            onPress={runDiagnostics}
            style={{
              backgroundColor: colors.primary.dark,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginBottom: 20
            }}
          >
            <Ionicons name="bug" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600'
            }}>
              Run Full Diagnostics
            </Text>
          </TouchableOpacity>

          {/* Troubleshooting Tips */}
          <View style={{
            backgroundColor: '#FEF3C7',
            borderRadius: 12,
            padding: 16,
            marginBottom: 40
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#92400E',
              marginBottom: 12
            }}>
              Troubleshooting Tips
            </Text>
            <Text style={{ color: '#92400E', fontSize: 14, lineHeight: 20 }}>
              1. Check if backend server is running{'\n'}
              2. Verify WebSocket endpoint exists{'\n'}
              3. Test HTTP API connectivity first{'\n'}
              4. Check NGROK vs local network settings{'\n'}
              5. Verify authentication token is valid{'\n'}
              6. Check firewall/network restrictions{'\n'}
              7. Try switching between WiFi and mobile data
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};