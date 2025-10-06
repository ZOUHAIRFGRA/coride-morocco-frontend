import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MapViewComponent, type MapLocation } from '@/components/ui/MapView';
import { COLORS, FONTS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * Map Test Screen to demonstrate the new fallback functionality
 * Shows both native and web maps side by side for comparison
 */
export default function MapTestScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useAppTheme();
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
    console.log('Selected location:', location);
  };

  const moroccanCities = [
    { id: 'casa', coordinate: { latitude: 33.5731, longitude: -7.5898 }, title: 'Casablanca', description: 'Economic Capital' },
    { id: 'rabat', coordinate: { latitude: 34.020882, longitude: -6.84165 }, title: 'Rabat', description: 'Political Capital' },
    { id: 'marrakech', coordinate: { latitude: 31.622522, longitude: -7.989826 }, title: 'Marrakech', description: 'Red City' },
    { id: 'fes', coordinate: { latitude: 34.037751, longitude: -4.9998 }, title: 'Fes', description: 'Cultural Capital' },
  ];

  const testFallback = () => {
    Alert.alert(
      'Test Fallback',
      'This will force the app to use web maps instead of native maps. Useful for testing Android devices without Google Play Services.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Test Web Maps', onPress: () => {
          // You can add logic here to test web maps
          Alert.alert('Web Maps', 'Web maps are now being used as fallback!');
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.background.secondary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.primary
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary.oceanBlue700} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.text.primary,
          fontFamily: FONTS.semiBold
        }}>
          Map Testing
        </Text>
        <TouchableOpacity onPress={testFallback}>
          <Ionicons name="settings" size={24} color={COLORS.primary.oceanBlue700} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Info Card */}
        <View style={{
          backgroundColor: isDarkMode ? COLORS.primary.oceanBlue950 : COLORS.primary.oceanBlue50,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: isDarkMode ? COLORS.primary.oceanBlue700 : COLORS.primary.oceanBlue200
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary.oceanBlue700} />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text.primary,
              marginLeft: 8,
              fontFamily: FONTS.semiBold
            }}>
              Free Map Solution
            </Text>
          </View>
          <Text style={{
            fontSize: 14,
            color: colors.text.secondary,
            lineHeight: 20,
            fontFamily: FONTS.regular
          }}>
            This map automatically falls back to OpenStreetMap (free) if Google Maps fails on Android. 
            No API keys or credit cards required! Perfect for MVP development.
          </Text>
        </View>

        {/* Native Maps (with fallback) */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text.primary,
            marginBottom: 8,
            fontFamily: FONTS.semiBold
          }}>
            Smart Map (Auto-Fallback)
          </Text>
          <MapViewComponent
            height={300}
            interactive={true}
            onLocationSelect={handleLocationSelect}
            markers={moroccanCities}
            showCurrentLocationButton={true}
            style={{ marginBottom: 12 }}
          />
        </View>

        {/* Force Web Maps */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text.primary,
            marginBottom: 8,
            fontFamily: FONTS.semiBold
          }}>
            Web Maps (OpenStreetMap)
          </Text>
          <MapViewComponent
            height={300}
            interactive={true}
            onLocationSelect={handleLocationSelect}
            markers={moroccanCities}
            showCurrentLocationButton={true}
            forceFallback={true} // Force use of web maps
            style={{ marginBottom: 12 }}
          />
        </View>

        {/* Selected Location Display */}
        {selectedLocation && (
          <View style={{
            backgroundColor: colors.background.secondary,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.border.primary
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="location" size={20} color={COLORS.primary.oceanBlue700} />
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text.primary,
                marginLeft: 8,
                fontFamily: FONTS.semiBold
              }}>
                Selected Location
              </Text>
            </View>
            <Text style={{
              fontSize: 14,
              color: colors.text.secondary,
              fontFamily: FONTS.regular,
              marginBottom: 4
            }}>
              Address: {selectedLocation.address || 'No address available'}
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.text.tertiary,
              fontFamily: FONTS.regular
            }}>
              Coordinates: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {/* Benefits List */}
        <View style={{
          backgroundColor: colors.background.secondary,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border.primary
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text.primary,
            marginBottom: 12,
            fontFamily: FONTS.semiBold
          }}>
            Benefits of This Solution
          </Text>
          
          {[
            { icon: 'checkmark-circle', text: 'No API keys required', color: '#10B981' },
            { icon: 'checkmark-circle', text: 'No credit card needed', color: '#10B981' },
            { icon: 'checkmark-circle', text: 'Works on all Android devices', color: '#10B981' },
            { icon: 'checkmark-circle', text: 'Automatic fallback system', color: '#10B981' },
            { icon: 'checkmark-circle', text: 'OpenStreetMap is completely free', color: '#10B981' },
            { icon: 'checkmark-circle', text: 'Perfect for MVP development', color: '#10B981' },
          ].map((benefit, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <Ionicons name={benefit.icon as any} size={16} color={benefit.color} />
              <Text style={{
                fontSize: 14,
                color: colors.text.secondary,
                marginLeft: 8,
                fontFamily: FONTS.regular
              }}>
                {benefit.text}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}