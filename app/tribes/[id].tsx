// Tribe Details Screen
// View tribe information and access chat

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { tribesApiService } from '@/services';
import type { Tribe, TribeMember } from '@/types/tribe';
import * as Haptics from 'expo-haptics';

const TribeDetailsScreen = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams();
  const tribeId = parseInt(params.id as string, 10);

  // State
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const [members, setMembers] = useState<TribeMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    loadTribeDetails();
  }, [tribeId]);

  const loadTribeDetails = async () => {
    try {
      setIsLoading(true);

      // Load tribe details
      const tribeResponse = await tribesApiService.getTribeById(tribeId);
      if (tribeResponse.success && tribeResponse.data) {
        setTribe(tribeResponse.data);

        // Load members if user is a member
        if (tribeResponse.data.user_is_member) {
          const membersResponse = await tribesApiService.getTribeMembers(tribeId, {
            page: 1,
            page_size: 10,
          });
          if (membersResponse.success && membersResponse.data) {
            setMembers(membersResponse.data.members);
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to load tribe details:', error);
      Alert.alert('Error', 'Failed to load tribe details. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadTribeDetails();
  }, [tribeId]);

  const handleJoinTribe = async () => {
    if (!tribe) return;

    try {
      setIsJoining(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const response = await tribesApiService.joinTribe(tribeId);

      if (response.success && response.data) {
        if (response.data.status === 'joined') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Success', 'You have joined the tribe!', [
            {
              text: 'OK',
              onPress: () => loadTribeDetails(),
            },
          ]);
        } else if (response.data.status === 'pending') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(
            'Request Submitted',
            'Your join request has been submitted and is pending approval.'
          );
        }
      }
    } catch (error: any) {
      console.error('Failed to join tribe:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to join tribe. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveTribe = async () => {
    if (!tribe) return;

    Alert.alert(
      'Leave Tribe',
      'Are you sure you want to leave this tribe? You can rejoin later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLeaving(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

              const response = await tribesApiService.leaveTribe(tribeId);

              if (response.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Success', 'You have left the tribe.', [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]);
              }
            } catch (error: any) {
              console.error('Failed to leave tribe:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', error.message || 'Failed to leave tribe.');
            } finally {
              setIsLeaving(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenChat = () => {
    if (!tribe) return;
    router.push(`/tribes/${tribeId}/chat` as any);
  };

  const handleViewMembers = () => {
    if (!tribe) return;
    router.push(`/tribes/${tribeId}/members` as any);
  };

  const handleSettings = () => {
    if (!tribe) return;
    router.push(`/tribes/${tribeId}/settings` as any);
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
            Tribe Details
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text style={{ marginTop: 16, color: colors.text.secondary }}>
            Loading tribe details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tribe) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <View className="flex-1 justify-center items-center">
          <Ionicons name="alert-circle" size={64} color={colors.text.secondary} />
          <Text style={{ marginTop: 16, color: colors.text.primary, fontSize: 18 }}>
            Tribe not found
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
          Tribe Details
        </Text>
        {tribe.user_role === 'admin' && (
          <TouchableOpacity onPress={handleSettings}>
            <Ionicons name="settings" size={24} color={colors.primary.dark} />
          </TouchableOpacity>
        )}
        {tribe.user_role !== 'admin' && <View style={{ width: 24 }} />}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary.oceanBlue700]}
          />
        }
      >
        {/* Tribe Info Card */}
        <View
          className="mx-4 mt-4 p-6 rounded-xl"
          style={{
            backgroundColor: colors.background.secondary,
            borderWidth: 1,
            borderColor: colors.border.secondary,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: colors.text.primary,
              marginBottom: 8,
            }}
          >
            {tribe.name}
          </Text>

          {tribe.description && (
            <Text
              style={{
                fontSize: 15,
                color: colors.text.secondary,
                marginBottom: 16,
                lineHeight: 22,
              }}
            >
              {tribe.description}
            </Text>
          )}

          {/* Route Information */}
          <View className="mb-4">
            <Text
              className="font-semibold mb-2"
              style={{ color: colors.text.primary, fontSize: 14 }}
            >
              Route
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="location" size={18} color={COLORS.primary.oceanBlue700} />
              <Text
                className="ml-2 flex-1"
                style={{ color: colors.text.secondary, fontSize: 14 }}
              >
                {tribe.route_start_name}
              </Text>
            </View>
            <View className="flex-row items-center ml-1 my-1">
              <Ionicons name="arrow-down" size={14} color={colors.text.secondary} />
            </View>
            <View className="flex-row items-center">
              <Ionicons name="location" size={18} color={COLORS.primary.oceanBlue700} />
              <Text
                className="ml-2 flex-1"
                style={{ color: colors.text.secondary, fontSize: 14 }}
              >
                {tribe.route_end_name}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between pt-4 border-t border-gray-200">
            <View className="items-center">
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text.primary }}>
                {tribe.member_count}
              </Text>
              <Text style={{ fontSize: 12, color: colors.text.secondary }}>Members</Text>
            </View>
            <View className="items-center">
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text.primary }}>
                {tribe.message_count}
              </Text>
              <Text style={{ fontSize: 12, color: colors.text.secondary }}>Messages</Text>
            </View>
            <View className="items-center">
              <Ionicons
                name={tribe.is_public ? 'globe' : 'lock-closed'}
                size={20}
                color={colors.text.primary}
              />
              <Text style={{ fontSize: 12, color: colors.text.secondary, marginTop: 4 }}>
                {tribe.is_public ? 'Public' : 'Private'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {tribe.user_is_member ? (
          <View className="mx-4 mt-4">
            {/* Open Chat Button */}
            <TouchableOpacity
              onPress={handleOpenChat}
              className="py-4 rounded-xl mb-3 flex-row items-center justify-center"
              style={{ backgroundColor: COLORS.primary.oceanBlue700 }}
            >
              <Ionicons name="chatbubbles" size={20} color="white" />
              <Text className="text-white font-semibold text-base ml-2">Open Chat</Text>
            </TouchableOpacity>

            {/* View Members Button */}
            <TouchableOpacity
              onPress={handleViewMembers}
              className="py-4 rounded-xl mb-3 flex-row items-center justify-center"
              style={{
                backgroundColor: colors.background.secondary,
                borderWidth: 1,
                borderColor: COLORS.primary.oceanBlue700,
              }}
            >
              <Ionicons name="people" size={20} color={COLORS.primary.oceanBlue700} />
              <Text
                className="font-semibold text-base ml-2"
                style={{ color: COLORS.primary.oceanBlue700 }}
              >
                View Members
              </Text>
            </TouchableOpacity>

            {/* Leave Tribe Button */}
            <TouchableOpacity
              onPress={handleLeaveTribe}
              disabled={isLeaving}
              className="py-4 rounded-xl flex-row items-center justify-center"
              style={{
                backgroundColor: colors.background.secondary,
                borderWidth: 1,
                borderColor: '#EF4444',
                opacity: isLeaving ? 0.6 : 1,
              }}
            >
              {isLeaving ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Ionicons name="exit" size={20} color="#EF4444" />
                  <Text className="font-semibold text-base ml-2" style={{ color: '#EF4444' }}>
                    Leave Tribe
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="mx-4 mt-4">
            <TouchableOpacity
              onPress={handleJoinTribe}
              disabled={isJoining}
              className="py-4 rounded-xl flex-row items-center justify-center"
              style={{
                backgroundColor: isJoining
                  ? colors.text.secondary
                  : COLORS.primary.oceanBlue700,
                opacity: isJoining ? 0.6 : 1,
              }}
            >
              {isJoining ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="enter" size={20} color="white" />
                  <Text className="text-white font-semibold text-base ml-2">
                    {tribe.requires_approval ? 'Request to Join' : 'Join Tribe'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Members Preview (if member) */}
        {tribe.user_is_member && members.length > 0 && (
          <View
            className="mx-4 mt-6 p-4 rounded-xl"
            style={{
              backgroundColor: colors.background.secondary,
              borderWidth: 1,
              borderColor: colors.border.secondary,
            }}
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
                Recent Members
              </Text>
              <TouchableOpacity onPress={handleViewMembers}>
                <Text style={{ fontSize: 14, color: COLORS.primary.oceanBlue700 }}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            {members.slice(0, 5).map((member) => (
              <View
                key={member.user_id}
                className="flex-row items-center py-2"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border.primary }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: COLORS.primary.oceanBlue100 }}
                >
                  <Text style={{ color: COLORS.primary.oceanBlue700, fontWeight: '600' }}>
                    {member.first_name[0]}
                    {member.last_name[0]}
                  </Text>
                </View>
                <View className="flex-1 ml-3">
                  <Text style={{ color: colors.text.primary, fontWeight: '500' }}>
                    {member.first_name} {member.last_name}
                  </Text>
                  <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Text>
                </View>
                {member.is_online && (
                  <View
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: '#10B981' }}
                  />
                )}
              </View>
            ))}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TribeDetailsScreen;
