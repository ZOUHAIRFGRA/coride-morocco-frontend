// Emergency Alert Screen
// Phase 8: Panic button and emergency management

import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput, View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { liveTrackingApiService } from '@/services/liveTrackingApi';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { EmergencyType } from '@/types/liveTracking';
import type { EmergencyAlert, EmergencyStatus } from '@/types/liveTracking';
import { Text } from 'react-native';

export default function EmergencyScreen() {
  const router = useRouter();
  
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);
  
  // New alert form
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<EmergencyType>(EmergencyType.PANIC_BUTTON);
  const [description, setDescription] = useState('');
  
  useEffect(() => {
    fetchAlerts();
  }, []);
  
  /**
   * Fetch emergency alerts
   */
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await liveTrackingApiService.getEmergencyAlerts({
        page: 1,
        page_size: 50,
      });
      
      if (response.success && response.data) {
        setAlerts(response.data.alerts);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Refresh alerts
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  };
  
  /**
   * Send panic button alert
   */
  const handlePanicButton = async () => {
    Alert.alert(
      'Emergency Alert',
      'This will immediately notify:\n• Your emergency contacts\n• Nearby authorities\n• CoRide support team\n\nContinue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: sendEmergencyAlert,
        },
      ]
    );
  };
  
  /**
   * Send emergency alert
   */
  const sendEmergencyAlert = async () => {
    setSendingAlert(true);
    
    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Location permission denied');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      
      // Send alert
      const response = await liveTrackingApiService.createEmergencyAlert({
        emergency_type: selectedType,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        description: description || 'Emergency assistance needed',
        severity: 'critical',
      });
      
      if (response.success) {
        Alert.alert(
          'Alert Sent',
          'Emergency services and your contacts have been notified'
        );
        setShowForm(false);
        setDescription('');
        fetchAlerts();
      }
    } catch (error) {
      console.error('Failed to send alert:', error);
      Alert.alert('Error', 'Failed to send emergency alert');
    } finally {
      setSendingAlert(false);
    }
  };
  
  /**
   * Cancel an alert
   */
  const handleCancelAlert = (alert: EmergencyAlert) => {
    Alert.alert(
      'Cancel Alert',
      'Mark this emergency as resolved?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const response = await liveTrackingApiService.cancelEmergencyAlert(
                alert.id,
                'False alarm / Resolved'
              );
              
              if (response.success) {
                Alert.alert('Success', 'Emergency alert cancelled');
                fetchAlerts();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel alert');
            }
          },
        },
      ]
    );
  };
  
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
        <View className="flex-row items-center">
          <Ionicons name="warning" size={24} color="#ef4444" />
          <Text className="text-lg font-bold text-red-600 dark:text-red-400 ml-2">
            Emergency System
          </Text>
        </View>
        <Text className="text-sm text-muted-foreground mt-1">
          Your safety is our priority
        </Text>
      </View>
      
      {/* Panic Button */}
      <View className="p-4">
        <TouchableOpacity
          onPress={handlePanicButton}
          disabled={sendingAlert}
          className="bg-red-500 p-6 rounded-2xl items-center shadow-lg"
          style={{
            shadowColor: '#ef4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {sendingAlert ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <>
              <Ionicons name="warning" size={48} color="white" />
              <Text className="text-2xl font-bold text-white mt-3">
                EMERGENCY
              </Text>
              <Text className="text-sm text-white/90 mt-1">
                Tap to send immediate alert
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        {/* Other Emergency Types */}
        <View className="mt-4 flex-row flex-wrap gap-2">
          <EmergencyTypeButton
            icon="car-outline"
            label="Accident"
            color="#f59e0b"
            onPress={() => {
              setSelectedType(EmergencyType.ACCIDENT);
              setShowForm(true);
            }}
          />
          <EmergencyTypeButton
            icon="build-outline"
            label="Breakdown"
            color="#8b5cf6"
            onPress={() => {
              setSelectedType(EmergencyType.VEHICLE_BREAKDOWN);
              setShowForm(true);
            }}
          />
          <EmergencyTypeButton
            icon="medkit-outline"
            label="Medical"
            color="#ef4444"
            onPress={() => {
              setSelectedType(EmergencyType.MEDICAL_EMERGENCY);
              setShowForm(true);
            }}
          />
        </View>
      </View>
      
      {/* Form Modal */}
      {showForm && (
        <View className="p-4 bg-card border-t border-border">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Describe the situation
          </Text>
          <TextInput
            placeholder="What happened?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            className="mb-3"
          />
          <View className="flex-row gap-2">
            <Button
              onPress={() => setShowForm(false)}
              variant="outline"
              className="flex-1"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              onPress={sendEmergencyAlert}
              disabled={sendingAlert}
              className="flex-1 bg-red-500"
            >
              {sendingAlert ? (
                <ActivityIndicator color="white" />
              ) : (
                <ButtonText>Send Alert</ButtonText>
              )}
            </Button>
          </View>
        </View>
      )}
      
      {/* Alerts List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Recent Alerts
          </Text>
          
          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" />
            </View>
          ) : alerts.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="shield-checkmark-outline" size={64} color="#10b981" />
              <Text className="text-md text-muted-foreground mt-4">
                No emergency alerts
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                You're all safe!
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {alerts.map((alert) => (
                <EmergencyAlertCard
                  key={alert.id}
                  alert={alert}
                  onCancel={handleCancelAlert}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Emergency type button
 */
function EmergencyTypeButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 min-w-[100px] p-3 rounded-lg items-center"
      style={{ backgroundColor: `${color}20` }}
    >
      <Ionicons name={icon} size={24} color={color} />
      <Text className="text-sm font-medium mt-1" style={{ color }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Emergency alert card
 */
function EmergencyAlertCard({
  alert,
  onCancel,
}: {
  alert: EmergencyAlert;
  onCancel: (alert: EmergencyAlert) => void;
}) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    }
  };
  
  const getStatusColor = (status: EmergencyStatus) => {
    switch (status) {
      case 'active':
        return 'text-red-600 dark:text-red-400';
      case 'acknowledged':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'resolved':
        return 'text-green-600 dark:text-green-400';
      case 'false_alarm':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-muted-foreground';
    }
  };
  
  return (
    <View className="p-4">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center">
            <View className={`px-2 py-1 rounded ${getSeverityColor(alert.severity)}`}>
              <Text className={`text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                {alert.severity.toUpperCase()}
              </Text>
            </View>
            <Text className={`text-xs ml-2 font-medium ${getStatusColor(alert.status)}`}>
              {alert.status}
            </Text>
          </View>
          <Text className="text-md font-semibold text-foreground mt-2">
            {alert.emergency_type.replace(/_/g, ' ').toUpperCase()}
          </Text>
        </View>
        <Text className="text-xs text-muted-foreground">
          {new Date(alert.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      {/* Description */}
      {alert.description && (
        <Text className="text-sm text-foreground mb-3">
          {alert.description}
        </Text>
      )}
      
      {/* Notifications */}
      <View className="mb-3 p-2 bg-background rounded">
        <Text className="text-xs text-muted-foreground mb-1">Notified:</Text>
        {alert.contacts_notified && alert.contacts_notified.length > 0 && (
          <Text className="text-xs text-foreground">
            • {alert.contacts_notified.length} emergency contact(s)
          </Text>
        )}
        {alert.authorities_notified && (
          <Text className="text-xs text-foreground">• Local authorities</Text>
        )}
      </View>
      
      {/* Actions */}
      {alert.status === 'active' && (
        <Button
          onPress={() => onCancel(alert)}
          variant="outline"
          className="w-full"
        >
          <ButtonText>Mark as Resolved</ButtonText>
        </Button>
      )}
    </View>
  );
}
