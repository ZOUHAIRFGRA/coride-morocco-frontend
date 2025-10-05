import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants/theme';
import { MapViewComponent, MapLocation } from '@/components/ui/MapView';
import * as Haptics from 'expo-haptics';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: MapLocation & { address: string }) => void;
  initialLocation?: MapLocation;
  title?: string;
}

/**
 * Modal component for picking a location using the map
 * Integrates with the form-driven schema system
 */
export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  onLocationSelect,
  initialLocation,
  title = "Select Location"
}) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    initialLocation || null
  );
  const [isConfirming, setIsConfirming] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedLocation(initialLocation || null);
      setIsConfirming(false);
    }
  }, [visible, initialLocation]);

  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleConfirm = async () => {
    if (!selectedLocation) {
      Alert.alert('No Location Selected', 'Please select a location on the map first.');
      return;
    }

    setIsConfirming(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Ensure we have an address
      const locationWithAddress = {
        ...selectedLocation,
        address: selectedLocation.address || `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`
      };

      onLocationSelect(locationWithAddress);
      onClose();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error confirming location:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={handleClose} className="p-2">
            <Text className="text-primary-oceanBlue600 text-lg">Cancel</Text>
          </TouchableOpacity>
          
          <Text
            className="text-lg font-semibold text-gray-900 flex-1 text-center"
            style={{ fontFamily: FONTS.semiBold }}
          >
            {title}
          </Text>
          
          <TouchableOpacity 
            onPress={handleConfirm} 
            disabled={!selectedLocation || isConfirming}
            className="p-2"
          >
            {isConfirming ? (
              <ActivityIndicator size="small" color={COLORS.primary.oceanBlue700} />
            ) : (
              <Text 
                className={`text-lg font-semibold ${
                  selectedLocation ? 'text-primary-oceanBlue600' : 'text-gray-400'
                }`}
                style={{ fontFamily: FONTS.semiBold }}
              >
                Done
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View className="px-4 py-3 bg-blue-50 border-b border-blue-100">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={20} color={COLORS.primary.oceanBlue700} />
            <Text 
              className="ml-2 text-blue-800 flex-1"
              style={{ fontFamily: FONTS.regular }}
            >
              Tap on the map to select your location. Use the locate button to find your current position.
            </Text>
          </View>
        </View>

        {/* Map */}
        <View className="flex-1">
          <MapViewComponent
            height="100%"
            interactive={true}
            onLocationSelect={handleLocationSelect}
            initialLocation={initialLocation}
            showCurrentLocationButton={true}
            style={{ borderRadius: 0 }}
          />
        </View>

        {/* Selection Info */}
        {selectedLocation && (
          <View className="bg-white border-t border-gray-200 px-4 py-4">
            <View className="flex-row items-start">
              <View className="bg-primary-oceanBlue100 rounded-full p-2 mr-3">
                <Ionicons 
                  name="location" 
                  size={20} 
                  color={COLORS.primary.oceanBlue700} 
                />
              </View>
              <View className="flex-1">
                <Text 
                  className="text-gray-900 font-medium text-base"
                  style={{ fontFamily: FONTS.semiBold }}
                >
                  Selected Location
                </Text>
                <Text 
                  className="text-gray-600 text-sm mt-1"
                  style={{ fontFamily: FONTS.regular }}
                  numberOfLines={3}
                >
                  {selectedLocation.address || `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`}
                </Text>
                <Text 
                  className="text-gray-500 text-xs mt-1"
                  style={{ fontFamily: FONTS.regular }}
                >
                  Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default LocationPickerModal;