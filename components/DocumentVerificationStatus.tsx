// Document Verification Status Component
// Real-time progress tracking for document verification

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDocumentVerificationWebSocket } from '@/hooks/useDocumentVerificationWebSocket';

interface DocumentVerificationStatusProps {
  onVerificationComplete?: (result: any) => void;
  onVerificationFailed?: (error: string) => void;
  showConnectionStatus?: boolean;
}

export const DocumentVerificationStatus: React.FC<DocumentVerificationStatusProps> = ({
  onVerificationComplete,
  onVerificationFailed,
  showConnectionStatus = false
}) => {
  const { colors } = useAppTheme();
  const { verificationStatus, isConnected } = useDocumentVerificationWebSocket();

  // Handle verification completion
  React.useEffect(() => {
    if (verificationStatus.status === 'completed' && verificationStatus.result) {
      onVerificationComplete?.(verificationStatus.result);
    } else if (verificationStatus.status === 'failed') {
      onVerificationFailed?.(verificationStatus.message);
    }
  }, [verificationStatus.status, verificationStatus.result, verificationStatus.message]);

  const getStatusIcon = () => {
    switch (verificationStatus.status) {
      case 'processing':
        return <ActivityIndicator size="small" color={colors.primary.dark} />;
      case 'completed':
        return <Ionicons name="checkmark-circle" size={20} color={colors.success.light} />;
      case 'failed':
        return <Ionicons name="close-circle" size={20} color={colors.error.light} />;
      default:
        return <Ionicons name="document" size={20} color={colors.text.secondary} />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus.status) {
      case 'processing':
        return colors.primary.dark;
      case 'completed':
        return colors.success.light;
      case 'failed':
        return colors.error.light;
      default:
        return colors.text.secondary;
    }
  };

  const getBackgroundColor = () => {
    switch (verificationStatus.status) {
      case 'processing':
        return `${colors.primary.light}15`;
      case 'completed':
        return `${colors.success.light}15`;
      case 'failed':
        return `${colors.error.light}15`;
      default:
        return colors.background.secondary;
    }
  };

  if (verificationStatus.status === 'idle') {
    return null;
  }

  const dynamicStyles = createStyles(colors);

  return (
    <View style={[dynamicStyles.container, { backgroundColor: getBackgroundColor() }]}>
      {/* Connection Status */}
      {showConnectionStatus && (
        <View style={dynamicStyles.connectionStatus}>
          <View style={[
            dynamicStyles.connectionIndicator, 
            { backgroundColor: isConnected ? colors.success.light : colors.error.light }
          ]} />
          <Text style={[dynamicStyles.connectionText, { color: colors.text.secondary }]}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      )}

      {/* Status Header */}
      <View style={dynamicStyles.statusHeader}>
        {getStatusIcon()}
        <Text style={[dynamicStyles.statusTitle, { color: getStatusColor() }]}>
          Document Verification
        </Text>
      </View>

      {/* Status Message */}
      <Text style={[dynamicStyles.statusMessage, { color: colors.text.primary }]}>
        {verificationStatus.message}
      </Text>

      {/* Progress Bar */}
      {verificationStatus.status === 'processing' && (
        <View style={dynamicStyles.progressContainer}>
          <View style={[dynamicStyles.progressBar, { backgroundColor: colors.background.tertiary }]}>
            <View 
              style={[
                dynamicStyles.progressFill, 
                { 
                  backgroundColor: colors.primary.dark,
                  width: `${verificationStatus.progress}%`
                }
              ]} 
            />
          </View>
          <Text style={[dynamicStyles.progressText, { color: colors.text.secondary }]}>
            {verificationStatus.progress}%
          </Text>
        </View>
      )}

      {/* Task ID (for debugging) */}
      {verificationStatus.taskId && __DEV__ && (
        <Text style={[dynamicStyles.taskId, { color: colors.text.tertiary }]}>
          Task: {verificationStatus.taskId}
        </Text>
      )}

      {/* Verification Result Preview */}
      {verificationStatus.status === 'completed' && verificationStatus.result && (
        <View style={dynamicStyles.resultPreview}>
          <Text style={[dynamicStyles.resultTitle, { color: colors.text.primary }]}>
            Extracted Information:
          </Text>
          {verificationStatus.result.extracted_data && (
            <View style={dynamicStyles.extractedData}>
              {verificationStatus.result.extracted_data.cin_number && (
                <Text style={[dynamicStyles.dataItem, { color: colors.text.secondary }]}>
                  ID: {verificationStatus.result.extracted_data.cin_number}
                </Text>
              )}
              {verificationStatus.result.extracted_data.address && (
                <Text style={[dynamicStyles.dataItem, { color: colors.text.secondary }]}>
                  Address: {verificationStatus.result.extracted_data.address}
                </Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusMessage: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  taskId: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 8,
  },
  resultPreview: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  extractedData: {
    gap: 4,
  },
  dataItem: {
    fontSize: 13,
  },
});

export default DocumentVerificationStatus;