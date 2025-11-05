// Tribe Settings Screen
// Admin-only tribe management

import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { tribesApiService } from '@/services';
import type { Tribe, UpdateTribeRequest } from '@/types/tribe';
import * as Haptics from 'expo-haptics';

const TribeSettingsScreen = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams();
  const tribeId = parseInt(params.id as string, 10);

  // State
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [maxMembers, setMaxMembers] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadTribeDetails();
  }, [tribeId]);

  useEffect(() => {
    // Check if there are any changes
    if (tribe) {
      const changed =
        name !== tribe.name ||
        description !== (tribe.description || '') ||
        isPublic !== tribe.is_public ||
        requiresApproval !== tribe.requires_approval ||
        parseInt(maxMembers, 10) !== tribe.max_members;
      setHasChanges(changed);
    }
  }, [name, description, isPublic, requiresApproval, maxMembers, tribe]);

  const loadTribeDetails = async () => {
    try {
      setIsLoading(true);

      const response = await tribesApiService.getTribeById(tribeId);
      if (response.success && response.data) {
        const tribeData = response.data;
        
        // Check if user is admin
        if (tribeData.user_role !== 'admin') {
          Alert.alert('Access Denied', 'Only tribe admins can access settings', [
            { text: 'OK', onPress: () => router.back() },
          ]);
          return;
        }

        setTribe(tribeData);
        setName(tribeData.name);
        setDescription(tribeData.description || '');
        setIsPublic(tribeData.is_public);
        setRequiresApproval(tribeData.requires_approval);
        setMaxMembers(tribeData.max_members.toString());
      }
    } catch (error: any) {
      console.error('Failed to load tribe details:', error);
      Alert.alert('Error', 'Failed to load tribe details. Please try again.');
      router.back();
    } finally {
      setIsLoading(false);
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

    const maxMembersNum = parseInt(maxMembers, 10);
    if (isNaN(maxMembersNum) || maxMembersNum < 2 || maxMembersNum > 10000) {
      Alert.alert('Validation Error', 'Max members must be between 2 and 10,000');
      return false;
    }

    if (tribe && maxMembersNum < tribe.member_count) {
      Alert.alert(
        'Validation Error',
        `Cannot set max members below current member count (${tribe.member_count})`
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !tribe) return;

    try {
      setIsSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const updateData: UpdateTribeRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        is_public: isPublic,
        requires_approval: requiresApproval,
        max_members: parseInt(maxMembers, 10),
      };

      const response = await tribesApiService.updateTribe(tribeId, updateData);

      if (response.success && response.data) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Tribe settings updated successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      console.error('Failed to update tribe:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to update tribe settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!tribe) return;

    Alert.alert(
      'Delete Tribe',
      `Are you sure you want to permanently delete "${tribe.name}"? This action cannot be undone and all messages will be lost.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

              const response = await tribesApiService.deleteTribe(tribeId);

              if (response.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Success', 'Tribe deleted successfully', [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate to tribes list
                      router.replace('/tribes' as any);
                    },
                  },
                ]);
              }
            } catch (error: any) {
              console.error('Failed to delete tribe:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', error.message || 'Failed to delete tribe');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
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
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text.primary }}>
            Settings
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text style={{ marginTop: 16, color: colors.text.secondary }}>
            Loading settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text.primary }}>
          Tribe Settings
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={!hasChanges || isSaving}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: hasChanges && !isSaving ? COLORS.primary.oceanBlue700 : colors.text.secondary,
            }}
          >
            Save
          </Text>
        </TouchableOpacity>
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
            Tribe Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter tribe name"
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
            placeholder="Describe your tribe..."
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
          {tribe && (
            <Text className="text-xs mt-2" style={{ color: colors.text.secondary }}>
              Current members: {tribe.member_count}
            </Text>
          )}
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

        {/* Danger Zone */}
        <View
          className="mt-8 p-4 rounded-xl"
          style={{
            backgroundColor: '#FEE2E2',
            borderWidth: 1,
            borderColor: '#FCA5A5',
          }}
        >
          <View className="flex-row items-center mb-3">
            <Ionicons name="warning" size={20} color="#DC2626" />
            <Text className="ml-2 font-semibold" style={{ color: '#DC2626' }}>
              Danger Zone
            </Text>
          </View>
          <Text className="text-sm mb-4" style={{ color: '#991B1B' }}>
            Deleting a tribe is permanent and cannot be undone. All messages and member data will
            be lost.
          </Text>
          <TouchableOpacity
            onPress={handleDelete}
            disabled={isDeleting}
            className="py-3 rounded-xl items-center justify-center"
            style={{
              backgroundColor: '#DC2626',
              opacity: isDeleting ? 0.6 : 1,
            }}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold">Delete Tribe</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TribeSettingsScreen;
