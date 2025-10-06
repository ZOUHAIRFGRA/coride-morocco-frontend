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
import { useAppTheme } from '@/hooks/useAppTheme';

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
  const { colors, isDarkMode } = useAppTheme();

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
      // Ensure we have an address and return the proper flat structure
      const addressString = selectedLocation.address || `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`;
      
      // Return the location data in the format expected by the form field handler
      const locationData = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address: addressString
      };

      onLocationSelect(locationData);
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
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background.primary }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.primary
        }}>
          <TouchableOpacity onPress={handleClose} style={{ padding: 8 }}>
            <Text style={{
              color: COLORS.primary.oceanBlue600,
              fontSize: 18
            }}>Cancel</Text>
          </TouchableOpacity>
          
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              flex: 1,
              textAlign: 'center',
              fontFamily: FONTS.semiBold,
              color: colors.text.primary
            }}
          >
            {title}
          </Text>
          
          <TouchableOpacity 
            onPress={handleConfirm} 
            disabled={!selectedLocation || isConfirming}
            style={{ padding: 8 }}
          >
            {isConfirming ? (
              <ActivityIndicator size="small" color={COLORS.primary.oceanBlue700} />
            ) : (
              <Text 
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  fontFamily: FONTS.semiBold,
                  color: selectedLocation ? COLORS.primary.oceanBlue600 : colors.text.tertiary
                }}
              >
                Done
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.secondary,
          backgroundColor: isDarkMode ? colors.background.secondary : COLORS.primary.oceanBlue50
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary.oceanBlue700} />
            <Text 
              style={{
                marginLeft: 8,
                flex: 1,
                fontFamily: FONTS.regular,
                color: colors.text.primary
              }}
            >
              Tap on the map to select your location. Use the locate button to find your current position.
            </Text>
          </View>
        </View>

        {/* Map */}
        <View style={{ flex: 1 }}>
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
        {/* {selectedLocation && (
          <View style={{
            backgroundColor: colors.background.primary,
            borderTopWidth: 1,
            borderTopColor: colors.border.primary,
            paddingHorizontal: 16,
            paddingVertical: 16
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{
                backgroundColor: COLORS.primary.oceanBlue100,
                borderRadius: 50,
                padding: 8,
                marginRight: 12
              }}>
                <Ionicons 
                  name="location" 
                  size={20} 
                  color={COLORS.primary.oceanBlue700} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text 
                  style={{
                    color: colors.text.primary,
                    fontWeight: '500',
                    fontSize: 16,
                    fontFamily: FONTS.semiBold
                  }}
                >
                  Selected Location
                </Text>
                <Text 
                  style={{
                    color: colors.text.secondary,
                    fontSize: 14,
                    marginTop: 4,
                    fontFamily: FONTS.regular
                  }}
                  numberOfLines={3}
                >
                  {selectedLocation.address || `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`}
                </Text>
                <Text 
                  style={{
                    color: colors.text.tertiary,
                    fontSize: 12,
                    marginTop: 4,
                    fontFamily: FONTS.regular
                  }}
                >
                  Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          </View>
        )} */}
      </SafeAreaView>
    </Modal>
  );
};

export default LocationPickerModal;