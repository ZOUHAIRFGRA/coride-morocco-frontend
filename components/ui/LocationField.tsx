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
    <View className="mb-4">
      {/* Field Label */}
      <Text 
        className="text-sm font-semibold text-gray-700 mb-2"
        style={{ fontFamily: FONTS.semiBold }}
      >
        {title}{required && <Text className="text-red-500"> *</Text>}
      </Text>

      {/* Location Picker Button */}
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        className={`border rounded-xl p-4 ${
          error 
            ? 'border-red-300 bg-red-50' 
            : value 
              ? 'border-primary-oceanBlue300 bg-primary-oceanBlue50' 
              : 'border-gray-300 bg-gray-50'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <View className="flex-row items-center">
          <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
            value 
              ? 'bg-primary-oceanBlue600' 
              : 'bg-gray-400'
          }`}>
            <Ionicons 
              name={value ? "location" : "location-outline"} 
              size={18} 
              color="white" 
            />
          </View>
          
          <View className="flex-1">
            {value ? (
              <View>
                <Text 
                  className="text-gray-900 font-medium"
                  style={{ fontFamily: FONTS.semiBold }}
                  numberOfLines={2}
                >
                  {value.address}
                </Text>
                <Text 
                  className="text-gray-500 text-xs mt-1"
                  style={{ fontFamily: FONTS.regular }}
                >
                  {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
                </Text>
              </View>
            ) : (
              <Text 
                className="text-gray-500"
                style={{ fontFamily: FONTS.regular }}
              >
                {placeholder}
              </Text>
            )}
          </View>

          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color="#9CA3AF" 
          />
        </View>
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <Text 
          className="text-red-500 text-sm mt-1"
          style={{ fontFamily: FONTS.regular }}
        >
          {error}
        </Text>
      )}

      {/* Help Text */}
      {!error && (
        <Text 
          className="text-gray-500 text-xs mt-1"
          style={{ fontFamily: FONTS.regular }}
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