import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { FormModal } from '@/components/schema-forms/FormModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUser } from '@/hooks/useUserProfile';
import type { UserLocation, LocationType } from '@/types/user';
import * as Haptics from 'expo-haptics';

const SavedLocations = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useAppTheme();
  const { getLocations, deleteLocation } = useUser();

  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);



  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await getLocations();
        if (response.success && response.data) {
          setLocations(response.data);
        }
      } catch (error) {
        console.error('Failed to load locations:', error);
        Alert.alert('Error', 'Failed to load saved locations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleFormSubmit = async (result: any, formData: any) => {
    try {
      console.log('🚗 Locations - Form submitted with result:', result);
      
      // The FormModal has already handled the API call
      // Just update the UI with the result
      if (result.success && result.data) {
        setLocations(prev => [...prev, result.data]);
        setIsFormModalVisible(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error(result.error?.message || 'Failed to create location');
      }
    } catch (error: any) {
      console.error('Failed to create location:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to save location. Please try again.');
    }
  };

  const handleDeleteLocation = (location: UserLocation) => {
    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete "${location.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              const response = await deleteLocation(location.id);
              if (response.success) {
                setLocations(prev => prev.filter(loc => loc.id !== location.id));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } else {
                throw new Error(response.error || 'Failed to delete location');
              }
            } catch (error) {
              console.error('Failed to delete location:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to delete location. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getLocationTypeInfo = (type: string) => {
    const types: Record<string, { value: string, label: string, icon: string }> = {
      home: { value: 'home', label: 'Home', icon: 'home' },
      work: { value: 'work', label: 'Work', icon: 'business' },
      university: { value: 'university', label: 'University', icon: 'school' },
      other: { value: 'other', label: 'Other', icon: 'location' }
    };
    return types[type] || types.other;
  };

  const LocationCard = ({ location }: { location: UserLocation }) => {
    const typeInfo = getLocationTypeInfo(location.location_type);
    
    return (
      <View style={{
        backgroundColor: colors.background.secondary,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border.primary,
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <View className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: COLORS.primary.oceanBlue50,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Ionicons name={typeInfo.icon as any} size={20} color={COLORS.primary.oceanBlue700} />
                </View>
                <View className="flex-1">
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: colors.text.primary
                  }}>{location.name}</Text>
                  <Text style={{
                    fontSize: 14,
                    color: COLORS.primary.oceanBlue700,
                    textTransform: 'capitalize'
                  }}>{typeInfo.label}</Text>
                </View>
              </View>
              
              <Text style={{
                color: colors.text.secondary,
                fontSize: 14,
                marginBottom: 12
              }} numberOfLines={2}>
                {location.address}
              </Text>
              
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                <Text style={{
                  fontSize: 12,
                  color: colors.text.secondary,
                  marginLeft: 4
                }}>
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              onPress={() => handleDeleteLocation(location)}
              className="p-2 ml-2"
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };



  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.background.secondary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.primary,
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#006389" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary
          }}>Saved Locations</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text style={{
            marginTop: 16,
            color: colors.text.secondary
          }}>Loading your locations...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        borderBottomColor: colors.border.primary,
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#006389" />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.text.primary
        }}>Saved Locations</Text>
        <TouchableOpacity onPress={() => setIsFormModalVisible(true)}>
          <Ionicons name="add" size={24} color="#006389" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={{
          marginTop: 16,
          marginHorizontal: 16,
          backgroundColor: isDarkMode ? colors.background.secondary : '#EFF6FF',
          borderWidth: 1,
          borderColor: isDarkMode ? colors.border.primary : '#BFDBFE',
          borderRadius: 12,
          padding: 16
        }}>
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color={COLORS.primary.oceanBlue700} />
            <View className="flex-1 ml-3">
              <Text style={{
                color: isDarkMode ? colors.text.primary : '#1E40AF',
                fontWeight: '500'
              }}>Quick Access Locations</Text>
              <Text style={{
                color: isDarkMode ? colors.text.secondary : '#1D4ED8',
                fontSize: 14,
                marginTop: 4
              }}>
                Save frequently visited places for faster ride booking. You can save up to 10 locations.
              </Text>
            </View>
          </View>
        </View>

        {/* Locations List */}
        {locations.length > 0 ? (
          <View className="mt-4">
            {locations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </View>
        ) : (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="location-outline" size={60} color="#9CA3AF" />
            <Text style={{
              color: colors.text.secondary,
              fontSize: 18,
              fontWeight: '500',
              marginTop: 16
            }}>No saved locations</Text>
            <Text style={{
              color: colors.text.tertiary,
              textAlign: 'center',
              marginTop: 8,
              paddingHorizontal: 32
            }}>
              Add your frequently visited places for quick ride booking
            </Text>
            <TouchableOpacity
              style={{
                marginTop: 24,
                backgroundColor: COLORS.primary.oceanBlue600,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 12
              }}
              onPress={() => setIsFormModalVisible(true)}
            >
              <Text style={{
                color: '#FFFFFF',
                fontWeight: '600',
                textAlign: 'center'
              }}>Add First Location</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Add Location Button (if locations exist) */}
        {locations.length > 0 && (
          <View className="mt-4 mx-4 mb-8">
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primary.oceanBlue600,
                paddingVertical: 16,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={() => setIsFormModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={{
                color: '#FFFFFF',
                fontWeight: '600',
                fontSize: 16,
                marginLeft: 8
              }}>Add New Location</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
      {/* THIS IS CAUSING AN ISSUE: INFINITE LOOP */}
      <FormModal
        visible={isFormModalVisible}
        onClose={() => setIsFormModalVisible(false)}
        formName="addLocation"
        onSuccess={handleFormSubmit}
      />
    </SafeAreaView>
  );
};

export default SavedLocations;