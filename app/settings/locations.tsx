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
import { useUser } from '@/hooks/useUserProfile';
import type { UserLocation, LocationType } from '@/types/user';
import * as Haptics from 'expo-haptics';

const SavedLocations = () => {
  const router = useRouter();
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
      <View className="bg-white rounded-xl mx-4 mb-3 shadow-sm border border-gray-100">
        <View className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <View className="w-10 h-10 rounded-full bg-primary-oceanBlue50 items-center justify-center mr-3">
                  <Ionicons name={typeInfo.icon as any} size={20} color={COLORS.primary.oceanBlue700} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semiBold text-gray-900">{location.name}</Text>
                  <Text className="text-sm text-primary-oceanBlue600 capitalize">{typeInfo.label}</Text>
                </View>
              </View>
              
              <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>
                {location.address}
              </Text>
              
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                <Text className="text-xs text-gray-500 ml-1">
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
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#006389" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Saved Locations</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text className="mt-4 text-gray-500">Loading your locations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#006389" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Saved Locations</Text>
        <TouchableOpacity onPress={() => setIsFormModalVisible(true)}>
          <Ionicons name="add" size={24} color="#006389" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View className="mt-4 mx-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View className="flex-1 ml-3">
              <Text className="text-blue-800 font-medium">Quick Access Locations</Text>
              <Text className="text-blue-700 text-sm mt-1">
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
            <Text className="text-gray-500 text-lg font-medium mt-4">No saved locations</Text>
            <Text className="text-gray-400 text-center mt-2 px-8">
              Add your frequently visited places for quick ride booking
            </Text>
            <TouchableOpacity
              className="mt-6 bg-primary-oceanBlue600 py-3 px-6 rounded-xl"
              onPress={() => setIsFormModalVisible(true)}
            >
              <Text className="text-white font-semiBold">Add First Location</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Add Location Button (if locations exist) */}
        {locations.length > 0 && (
          <View className="mt-4 mx-4 mb-8">
            <TouchableOpacity
              className="bg-primary-oceanBlue600 py-4 rounded-xl flex-row items-center justify-center"
              onPress={() => setIsFormModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semiBold text-md ml-2">Add New Location</Text>
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