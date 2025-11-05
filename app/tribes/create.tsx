// Create Tribe Modal/Screen
// Create a new trajectory tribe

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { tribesApiService } from '@/services';
import type { CreateTribeRequest } from '@/types/tribe';
import * as Location from 'expo-location';

const CreateTribeScreen = () => {
  const router = useRouter();
  const { colors } = useAppTheme();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [routeStartName, setRouteStartName] = useState('');
  const [routeEndName, setRouteEndName] = useState('');
  const [routeStartCoords, setRouteStartCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [routeEndCoords, setRouteEndCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [maxMembers, setMaxMembers] = useState('500');

  const [isLoading, setIsLoading] = useState(false);

  const handleUseCurrentLocation = async (isStart: boolean) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      // Get address from coordinates
      const addresses = await Location.reverseGeocodeAsync({
        latitude: coords.lat,
        longitude: coords.lng,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        const locationName = [address.street, address.city, address.region]
          .filter(Boolean)
          .join(', ');

        if (isStart) {
          setRouteStartName(locationName);
          setRouteStartCoords(coords);
        } else {
          setRouteEndName(locationName);
          setRouteEndCoords(coords);
        }

        Alert.alert('Success', 'Location set successfully');
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Tribe name is required');
      return false;
    }

    if (name.trim().length < 3) {
      Alert.alert('Validation Error', 'Tribe name must be at least 3 characters');
      return false;
    }

    if (!routeStartName.trim()) {
      Alert.alert('Validation Error', 'Route start location is required');
      return false;
    }

    if (!routeEndName.trim()) {
      Alert.alert('Validation Error', 'Route end location is required');
      return false;
    }

    if (!routeStartCoords || !routeEndCoords) {
      Alert.alert('Validation Error', 'Please set both route locations using the map');
      return false;
    }

    const maxMembersNum = parseInt(maxMembers, 10);
    if (isNaN(maxMembersNum) || maxMembersNum < 2 || maxMembersNum > 10000) {
      Alert.alert('Validation Error', 'Max members must be between 2 and 10,000');
      return false;
    }

    return true;
  };

  const handleCreateTribe = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const request: CreateTribeRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        route_start_name: routeStartName.trim(),
        route_end_name: routeEndName.trim(),
        route_start_latitude: routeStartCoords!.lat,
        route_start_longitude: routeStartCoords!.lng,
        route_end_latitude: routeEndCoords!.lat,
        route_end_longitude: routeEndCoords!.lng,
        is_public: isPublic,
        requires_approval: requiresApproval,
        max_members: parseInt(maxMembers, 10),
      };

      const response = await tribesApiService.createTribe(request);

      if (response.success && response.data) {
        Alert.alert('Success', 'Tribe created successfully!', [
          {
            text: 'View Tribe',
            onPress: () => {
              router.replace(`/tribes/${response.data!.id}` as any);
            },
          },
        ]);
      } else {
        throw new Error(response.error?.message || 'Failed to create tribe');
      }
    } catch (error: any) {
      console.error('Failed to create tribe:', error);
      Alert.alert('Error', error.message || 'Failed to create tribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.background.secondary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.primary,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary,
          }}
        >
          Create Tribe
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Tribe Name */}
        <View className="mb-6">
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 8,
            }}
          >
            Tribe Name *
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g., Agdal to Mohammed V University"
            placeholderTextColor={colors.text.secondary}
            style={{
              backgroundColor: colors.background.secondary,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 15,
              color: colors.text.primary,
              borderWidth: 1,
              borderColor: colors.border.secondary,
            }}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 8,
            }}
          >
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Tell others about this route and community..."
            placeholderTextColor={colors.text.secondary}
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: colors.background.secondary,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 15,
              color: colors.text.primary,
              borderWidth: 1,
              borderColor: colors.border.secondary,
              minHeight: 100,
              textAlignVertical: 'top',
            }}
            maxLength={1000}
          />
        </View>

        {/* Route Start */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text.primary,
              }}
            >
              Route Start Location *
            </Text>
            <TouchableOpacity onPress={() => handleUseCurrentLocation(true)}>
              <View className="flex-row items-center">
                <Ionicons name="locate" size={16} color={COLORS.primary.oceanBlue700} />
                <Text
                  className="ml-1 text-sm"
                  style={{ color: COLORS.primary.oceanBlue700 }}
                >
                  Use Current
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <TextInput
            value={routeStartName}
            onChangeText={setRouteStartName}
            placeholder="e.g., Agdal, Rabat"
            placeholderTextColor={colors.text.secondary}
            style={{
              backgroundColor: colors.background.secondary,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 15,
              color: colors.text.primary,
              borderWidth: 1,
              borderColor: colors.border.secondary,
            }}
          />
          {routeStartCoords && (
            <Text className="text-xs mt-1" style={{ color: colors.text.secondary }}>
              📍 Coordinates set: {routeStartCoords.lat.toFixed(4)}, {routeStartCoords.lng.toFixed(4)}
            </Text>
          )}
        </View>

        {/* Route End */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text.primary,
              }}
            >
              Route End Location *
            </Text>
            <TouchableOpacity onPress={() => handleUseCurrentLocation(false)}>
              <View className="flex-row items-center">
                <Ionicons name="locate" size={16} color={COLORS.primary.oceanBlue700} />
                <Text
                  className="ml-1 text-sm"
                  style={{ color: COLORS.primary.oceanBlue700 }}
                >
                  Use Current
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <TextInput
            value={routeEndName}
            onChangeText={setRouteEndName}
            placeholder="e.g., Mohammed V University, Rabat"
            placeholderTextColor={colors.text.secondary}
            style={{
              backgroundColor: colors.background.secondary,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 15,
              color: colors.text.primary,
              borderWidth: 1,
              borderColor: colors.border.secondary,
            }}
          />
          {routeEndCoords && (
            <Text className="text-xs mt-1" style={{ color: colors.text.secondary }}>
              📍 Coordinates set: {routeEndCoords.lat.toFixed(4)}, {routeEndCoords.lng.toFixed(4)}
            </Text>
          )}
        </View>

        {/* Max Members */}
        <View className="mb-6">
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 8,
            }}
          >
            Maximum Members
          </Text>
          <TextInput
            value={maxMembers}
            onChangeText={setMaxMembers}
            placeholder="500"
            placeholderTextColor={colors.text.secondary}
            keyboardType="number-pad"
            style={{
              backgroundColor: colors.background.secondary,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 15,
              color: colors.text.primary,
              borderWidth: 1,
              borderColor: colors.border.secondary,
            }}
          />
        </View>

        {/* Public/Private Toggle */}
        <View
          className="mb-4 p-4 rounded-xl flex-row justify-between items-center"
          style={{
            backgroundColor: colors.background.secondary,
            borderWidth: 1,
            borderColor: colors.border.secondary,
          }}
        >
          <View className="flex-1">
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: colors.text.primary,
              }}
            >
              Public Tribe
            </Text>
            <Text className="text-sm mt-1" style={{ color: colors.text.secondary }}>
              Anyone can discover and join
            </Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: '#767577', true: COLORS.primary.oceanBlue200 }}
            thumbColor={isPublic ? COLORS.primary.oceanBlue700 : '#f4f3f4'}
          />
        </View>

        {/* Requires Approval Toggle */}
        <View
          className="mb-6 p-4 rounded-xl flex-row justify-between items-center"
          style={{
            backgroundColor: colors.background.secondary,
            borderWidth: 1,
            borderColor: colors.border.secondary,
          }}
        >
          <View className="flex-1">
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: colors.text.primary,
              }}
            >
              Require Approval
            </Text>
            <Text className="text-sm mt-1" style={{ color: colors.text.secondary }}>
              Review join requests before accepting
            </Text>
          </View>
          <Switch
            value={requiresApproval}
            onValueChange={setRequiresApproval}
            trackColor={{ false: '#767577', true: COLORS.primary.oceanBlue200 }}
            thumbColor={requiresApproval ? COLORS.primary.oceanBlue700 : '#f4f3f4'}
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity
          onPress={handleCreateTribe}
          disabled={isLoading}
          className="py-4 rounded-xl items-center justify-center"
          style={{
            backgroundColor: isLoading
              ? colors.text.secondary
              : COLORS.primary.oceanBlue700,
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Create Tribe</Text>
          )}
        </TouchableOpacity>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateTribeScreen;
