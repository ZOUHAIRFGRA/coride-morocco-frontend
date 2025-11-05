// Tribe Chat Screen
// Real-time messaging for tribe members

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { tribesApiService } from '@/services';
import { useTribeWebSocket } from '@/hooks/useTribeWebSocket';
import type { TribeMessage, Tribe } from '@/types/tribe';
import * as Haptics from 'expo-haptics';

const TribeChatScreen = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams();
  const tribeId = parseInt(params.id as string, 10);

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const [messages, setMessages] = useState<TribeMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // WebSocket hook
  const {
    isConnected: wsConnected,
    messages: wsMessages,
    typingUsers,
    connect: connectWS,
    disconnect: disconnectWS,
    sendTypingIndicator,
    addMessage: addWsMessage,
    clearMessages: clearWsMessages,
  } = useTribeWebSocket({
    onNewMessage: (message) => {
      console.log('📨 New message from WebSocket:', message.id);
      // Message is already added by the hook
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onError: (error, errorCode) => {
      console.error('WebSocket error:', error, errorCode);
      Alert.alert('Connection Error', error);
    },
  });

  // Load tribe info and connect to WebSocket
  useEffect(() => {
    loadTribeInfo();
    loadMessages();
    connectToWebSocket();

    return () => {
      disconnectWS();
    };
  }, [tribeId]);

  // Merge WebSocket messages with local messages
  useEffect(() => {
    if (wsMessages.length > 0) {
      setMessages((prevMessages) => {
        // Merge and deduplicate messages
        const allMessages = [...prevMessages, ...wsMessages];
        const uniqueMessages = Array.from(
          new Map(allMessages.map((m) => [m.id, m])).values()
        );
        // Sort by created_at
        return uniqueMessages.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
    }
  }, [wsMessages]);

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

  const loadMessages = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingMessages(true);
      }

      const response = await tribesApiService.getMessages(tribeId, {
        page,
        page_size: 50,
      });

      if (response.success && response.data) {
        const newMessages = response.data.messages;
        
        if (append) {
          setMessages((prev) => [...newMessages, ...prev]);
        } else {
          setMessages(newMessages);
          clearWsMessages();
        }

        setHasMoreMessages(response.data.has_more);
        setCurrentPage(page);
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error);
      Alert.alert('Error', 'Failed to load messages. Please try again.');
    } finally {
      setIsLoadingMessages(false);
      setIsLoadingMore(false);
    }
  };

  const connectToWebSocket = async () => {
    try {
      const success = await connectWS(tribeId);
      if (success) {
        console.log('✅ Connected to tribe chat WebSocket');
      } else {
        console.error('❌ Failed to connect to WebSocket');
      }
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMoreMessages) {
      loadMessages(currentPage + 1, true);
    }
  }, [isLoadingMore, hasMoreMessages, currentPage]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const response = await tribesApiService.sendMessage(tribeId, {
        content: messageText,
        message_type: 'text',
      });

      if (response.success && response.data) {
        // Add message to local state immediately
        addWsMessage(response.data);
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      // Restore the message text
      setInputText(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);

    // Send typing indicator
    if (wsConnected) {
      sendTypingIndicator(true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false);
      }, 2000);
    }
  };

  const renderMessage = ({ item }: { item: TribeMessage }) => {
    const isAnnouncement = item.is_announcement;
    const isSystem = item.message_type === 'system';

    if (isAnnouncement || isSystem) {
      return (
        <View className="mx-4 my-2 p-3 rounded-xl" style={{ backgroundColor: '#FEF3C7' }}>
          <View className="flex-row items-center mb-1">
            <Ionicons name="megaphone" size={16} color="#D97706" />
            <Text className="ml-2 font-semibold" style={{ color: '#D97706' }}>
              {isAnnouncement ? 'Announcement' : 'System'}
            </Text>
          </View>
          <Text style={{ color: '#92400E' }}>{item.content}</Text>
          {item.user_first_name && (
            <Text className="text-xs mt-1" style={{ color: '#B45309' }}>
              — {item.user_first_name} {item.user_last_name}
            </Text>
          )}
        </View>
      );
    }

    return (
      <View className="px-4 py-1">
        <View
          className="p-3 rounded-2xl max-w-[80%]"
          style={{
            backgroundColor: colors.background.secondary,
            alignSelf: 'flex-start',
            borderWidth: 1,
            borderColor: colors.border.secondary,
          }}
        >
          {/* Sender Name */}
          <Text
            className="font-semibold text-xs mb-1"
            style={{ color: COLORS.primary.oceanBlue700 }}
          >
            {item.user_first_name} {item.user_last_name}
          </Text>

          {/* Message Content */}
          <Text style={{ color: colors.text.primary, fontSize: 15 }}>
            {item.content}
          </Text>

          {/* Timestamp */}
          <Text className="text-xs mt-1" style={{ color: colors.text.secondary }}>
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    const typingUserNames = Array.from(typingUsers.values());
    const displayText =
      typingUserNames.length === 1
        ? `${typingUserNames[0]} is typing...`
        : `${typingUserNames.length} people are typing...`;

    return (
      <View className="px-4 py-2">
        <View
          className="flex-row items-center px-3 py-2 rounded-xl"
          style={{ backgroundColor: colors.background.secondary }}
        >
          <View className="flex-row space-x-1">
            <View
              className="w-2 h-2 rounded-full bg-gray-400"
              style={{ opacity: 0.6 }}
            />
            <View
              className="w-2 h-2 rounded-full bg-gray-400"
              style={{ opacity: 0.4 }}
            />
            <View
              className="w-2 h-2 rounded-full bg-gray-400"
              style={{ opacity: 0.2 }}
            />
          </View>
          <Text className="ml-2 text-xs" style={{ color: colors.text.secondary }}>
            {displayText}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoadingMessages) {
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
            Chat
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text style={{ marginTop: 16, color: colors.text.secondary }}>
            Loading messages...
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
        <View className="flex-1 mx-3">
          <Text
            style={{ fontSize: 18, fontWeight: '600', color: colors.text.primary }}
            numberOfLines={1}
          >
            {tribe?.name || 'Tribe Chat'}
          </Text>
          <View className="flex-row items-center">
            <View
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: wsConnected ? '#10B981' : '#EF4444' }}
            />
            <Text style={{ fontSize: 12, color: colors.text.secondary }}>
              {wsConnected ? 'Connected' : 'Offline'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push(`/tribes/${tribeId}/members` as any)}>
          <Ionicons name="people" size={24} color={colors.primary.dark} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 8 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            isLoadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color={COLORS.primary.oceanBlue700} />
              </View>
            ) : null
          }
          ListFooterComponent={renderTypingIndicator}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20">
              <Ionicons name="chatbubbles-outline" size={64} color={colors.text.secondary} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginTop: 16,
                }}
              >
                No messages yet
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.text.secondary,
                  marginTop: 8,
                  textAlign: 'center',
                }}
              >
                Be the first to send a message!
              </Text>
            </View>
          }
          inverted={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
        />

        {/* Message Input */}
        <View
          className="px-4 py-3 flex-row items-center"
          style={{
            backgroundColor: colors.background.secondary,
            borderTopWidth: 1,
            borderTopColor: colors.border.primary,
          }}
        >
          <TextInput
            value={inputText}
            onChangeText={handleInputChange}
            placeholder="Type a message..."
            placeholderTextColor={colors.text.secondary}
            multiline
            maxLength={5000}
            style={{
              flex: 1,
              maxHeight: 100,
              backgroundColor: colors.background.primary,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 15,
              color: colors.text.primary,
              borderWidth: 1,
              borderColor: colors.border.secondary,
            }}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isSending}
            className="ml-2 w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor:
                inputText.trim() && !isSending
                  ? COLORS.primary.oceanBlue700
                  : colors.text.secondary,
            }}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color="white"
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default TribeChatScreen;
