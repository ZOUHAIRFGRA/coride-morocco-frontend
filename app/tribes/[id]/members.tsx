// Tribe Members Screen
// View and manage tribe members

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { tribesApiService } from '@/services';
import type { TribeMember, Tribe, TribeRole } from '@/types/tribe';
import * as Haptics from 'expo-haptics';

const TribeMembersScreen = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams();
  const tribeId = parseInt(params.id as string, 10);

  // State
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const [members, setMembers] = useState<TribeMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TribeMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    loadTribeInfo();
    loadMembers();
  }, [tribeId]);

  useEffect(() => {
    // Filter members based on search query
    if (searchQuery.trim()) {
      const filtered = members.filter((member) => {
        const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      });
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [searchQuery, members]);

  const loadTribeInfo = async () => {
    try {
      const response = await tribesApiService.getTribeById(tribeId);
      if (response.success && response.data) {
        setTribe(response.data);
      }
    } catch (error) {
      console.error('Failed to load tribe info:', error);
    }
  };

  const loadMembers = async () => {
    try {
      setIsLoading(true);

      const response = await tribesApiService.getTribeMembers(tribeId, {
        page: 1,
        page_size: 100,
      });

      if (response.success && response.data) {
        setMembers(response.data.members);
        setFilteredMembers(response.data.members);
        setOnlineCount(response.data.online_count);
      }
    } catch (error: any) {
      console.error('Failed to load members:', error);
      Alert.alert('Error', 'Failed to load members. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadMembers();
  }, []);

  const handleMemberPress = (member: TribeMember) => {
    if (!tribe) return;

    const isAdmin = tribe.user_role === 'admin';
    const isModerator = tribe.user_role === 'moderator';

    if (!isAdmin && !isModerator) {
      // Regular members can only view
      return;
    }

    // Admin/Moderator actions
    const actions: any[] = [];

    if (isAdmin && member.role !== 'admin') {
      actions.push({
        text: 'Promote to Moderator',
        onPress: () => handleUpdateRole(member.user_id, 'moderator'),
      });

      if (member.role === 'moderator') {
        actions.push({
          text: 'Demote to Member',
          onPress: () => handleUpdateRole(member.user_id, 'member'),
        });
      }
    }

    if ((isAdmin || isModerator) && member.role === 'member') {
      actions.push({
        text: 'Remove from Tribe',
        style: 'destructive',
        onPress: () => handleRemoveMember(member.user_id, member.first_name, member.last_name),
      });
    }

    actions.push({
      text: 'Cancel',
      style: 'cancel',
    });

    if (actions.length > 1) {
      Alert.alert(
        `${member.first_name} ${member.last_name}`,
        `Role: ${member.role.charAt(0).toUpperCase() + member.role.slice(1)}`,
        actions
      );
    }
  };

  const handleUpdateRole = async (userId: number, newRole: TribeRole) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const response = await tribesApiService.updateMemberRole(tribeId, userId, {
        role: newRole,
      });

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', `Member role updated to ${newRole}`);
        loadMembers();
      }
    } catch (error: any) {
      console.error('Failed to update role:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to update member role');
    }
  };

  const handleRemoveMember = (userId: number, firstName: string, lastName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${firstName} ${lastName} from this tribe?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

              const response = await tribesApiService.removeMember(tribeId, userId);

              if (response.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Success', 'Member removed from tribe');
                loadMembers();
              }
            } catch (error: any) {
              console.error('Failed to remove member:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', error.message || 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (role: TribeRole) => {
    switch (role) {
      case 'admin':
        return { bg: '#FEE2E2', text: '#991B1B' };
      case 'moderator':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const renderMember = ({ item }: { item: TribeMember }) => {
    const roleColors = getRoleBadgeColor(item.role);
    const canManage = tribe?.user_role === 'admin' || tribe?.user_role === 'moderator';

    return (
      <TouchableOpacity
        onPress={() => handleMemberPress(item)}
        disabled={!canManage}
        style={{
          backgroundColor: colors.background.secondary,
          borderRadius: 12,
          padding: 16,
          marginHorizontal: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border.secondary,
        }}
      >
        <View className="flex-row items-center">
          {/* Avatar */}
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: COLORS.primary.oceanBlue100 }}
          >
            <Text
              style={{
                color: COLORS.primary.oceanBlue700,
                fontWeight: '600',
                fontSize: 16,
              }}
            >
              {item.first_name[0]}
              {item.last_name[0]}
            </Text>
          </View>

          {/* Member Info */}
          <View className="flex-1 ml-3">
            <View className="flex-row items-center">
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text.primary,
                }}
              >
                {item.first_name} {item.last_name}
              </Text>
              {item.is_online && (
                <View
                  className="w-2 h-2 rounded-full ml-2"
                  style={{ backgroundColor: '#10B981' }}
                />
              )}
            </View>

            {/* Stats */}
            <View className="flex-row items-center mt-1">
              <Ionicons name="chatbubble" size={12} color={colors.text.secondary} />
              <Text className="text-xs ml-1" style={{ color: colors.text.secondary }}>
                {item.message_count} messages
              </Text>
              {item.last_active_at && (
                <>
                  <Text className="text-xs mx-2" style={{ color: colors.text.secondary }}>
                    •
                  </Text>
                  <Text className="text-xs" style={{ color: colors.text.secondary }}>
                    Active {new Date(item.last_active_at).toLocaleDateString()}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Role Badge */}
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: roleColors.bg }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: roleColors.text }}
            >
              {item.role.toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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
            Members
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text style={{ marginTop: 16, color: colors.text.secondary }}>
            Loading members...
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
          Members
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats Bar */}
      <View
        className="flex-row justify-around py-4"
        style={{
          backgroundColor: colors.background.secondary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.primary,
        }}
      >
        <View className="items-center">
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text.primary }}>
            {members.length}
          </Text>
          <Text style={{ fontSize: 12, color: colors.text.secondary }}>Total Members</Text>
        </View>
        <View className="items-center">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#10B981' }} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text.primary }}>
              {onlineCount}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: colors.text.secondary }}>Online Now</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background.secondary,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: colors.border.secondary,
          }}
        >
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            placeholder="Search members..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 15,
              color: colors.text.primary,
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Members List */}
      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.user_id.toString()}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary.oceanBlue700]}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="people-outline" size={64} color={colors.text.secondary} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text.primary,
                marginTop: 16,
              }}
            >
              No members found
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.text.secondary,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              {searchQuery ? 'Try a different search term' : 'No members in this tribe yet'}
            </Text>
          </View>
        }
      />

      {/* Admin Tip */}
      {(tribe?.user_role === 'admin' || tribe?.user_role === 'moderator') && (
        <View
          className="mx-4 mb-4 p-3 rounded-xl flex-row items-start"
          style={{ backgroundColor: COLORS.primary.oceanBlue50 }}
        >
          <Ionicons name="information-circle" size={20} color={COLORS.primary.oceanBlue700} />
          <Text className="flex-1 ml-2 text-xs" style={{ color: COLORS.primary.oceanBlue700 }}>
            Tap on a member to manage their role or remove them from the tribe
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default TribeMembersScreen;
