import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants/theme';
import { LocationPickerModal } from './LocationPickerModal';
import { MapLocation } from './MapView';
import { useAppTheme } from '@/hooks/useAppTheme';

interface LocationFieldProps {
  value?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  placeholder?: string;
  title?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

/**
 * Location picker field component for forms
 * Opens a map modal to select location instead of manual entry
 */
export const LocationField: React.FC<LocationFieldProps> = ({
  value,
  onLocationSelect,
  placeholder = "Tap to select location on map",
  title = "Location",
  required = false,
  error,
  disabled = false,
}) => {
  const { colors, isDarkMode } = useAppTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleLocationSelect = (location: MapLocation & { address: string }) => {
    onLocationSelect({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
    });
    setIsModalVisible(false);
  };

  const handlePress = () => {
    if (!disabled) {
      setIsModalVisible(true);
    }
  };

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Field Label */}
      <Text 
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: colors.text.primary,
          marginBottom: 8,
          fontFamily: FONTS.semiBold
        }}
      >
        {title}{required && <Text style={{ color: '#EF4444' }}> *</Text>}
      </Text>

      {/* Location Picker Button */}
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
          borderColor: error 
            ? '#FCA5A5' 
            : value 
              ? COLORS.primary.oceanBlue200 
              : (isDarkMode ? colors.border.primary : '#D1D5DB'),
          backgroundColor: error 
            ? (isDarkMode ? colors.background.secondary : '#FEF2F2') 
            : value 
              ? (isDarkMode ? colors.background.tertiary : COLORS.primary.oceanBlue50) 
              : (isDarkMode ? colors.background.secondary : '#F9FAFB'),
          opacity: disabled ? 0.5 : 1
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            backgroundColor: value 
              ? COLORS.primary.oceanBlue600 
              : (isDarkMode ? colors.text.tertiary : '#9CA3AF')
          }}>
            <Ionicons 
              name={value ? "location" : "location-outline"} 
              size={18} 
              color="white" 
            />
          </View>
          
          <View style={{ flex: 1 }}>
            {value ? (
              <View>
                <Text 
                  style={{
                    color: colors.text.primary,
                    fontWeight: '500',
                    fontFamily: FONTS.semiBold
                  }}
                  numberOfLines={2}
                >
                  {value.address}
                </Text>
                <Text 
                  style={{
                    color: colors.text.secondary,
                    fontSize: 12,
                    marginTop: 4,
                    fontFamily: FONTS.regular
                  }}
                >
                  {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
                </Text>
              </View>
            ) : (
              <Text 
                style={{
                  color: colors.text.secondary,
                  fontFamily: FONTS.regular
                }}
              >
                {placeholder}
              </Text>
            )}
          </View>

          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={colors.text.tertiary} 
          />
        </View>
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <Text 
          style={{
            color: '#EF4444',
            fontSize: 14,
            marginTop: 4,
            fontFamily: FONTS.regular
          }}
        >
          {error}
        </Text>
      )}

      {/* Help Text */}
      {!error && (
        <Text 
          style={{
            color: colors.text.secondary,
            fontSize: 12,
            marginTop: 4,
            fontFamily: FONTS.regular
          }}
        >
          Tap to open map and select your exact location
        </Text>
      )}

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={value ? {
          latitude: value.latitude,
          longitude: value.longitude,
          address: value.address,
        } : undefined}
        title={`Select ${title}`}
      />
    </View>
  );
};

export default LocationField;