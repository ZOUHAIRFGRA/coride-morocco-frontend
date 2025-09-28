/* eslint-disable react/display-name */
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/constants/theme";
import Monicon from "@monicon/native";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ScrollView, SafeAreaView, TextInput, ActivityIndicator } from "react-native";
import { Drawer, DrawerBackdrop, DrawerContent, DrawerHeader, DrawerBody } from "@/components/ui/drawer"; // Using the base Drawer component
import VoxProfitSvg from "@/assets/images/icons/voxprofitSvg";
import { MenuItemLabel } from "./menu";
import { MenuItem } from "./menu";
import { Menu } from "./menu";
import { useAiChatHistory } from "@/hooks/useAiChatHistory";
import { format } from "date-fns";
import { ChatSession } from "@/redux/ai-chat";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withSequence } from "react-native-reanimated";

// Define local interfaces
interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat?: () => void; // Optional callback to create a new chat
  onSwitchChat?: (sessionId: string) => void; // Optional callback to switch chat
}

interface ChatItem {
  id: string;
  title: string;
  timestamp: string;
  dateGroup: string;
}

// Format a timestamp for display
const formatChatDate = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();

    // Get the date parts in local timezone for comparison
    const dateLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate yesterday
    const yesterdayLocal = new Date(todayLocal);
    yesterdayLocal.setDate(yesterdayLocal.getDate() - 1);

    // Check if date is today
    if (dateLocal.getTime() === todayLocal.getTime()) {
      return "Today";
    }

    // Check if date is yesterday
    if (dateLocal.getTime() === yesterdayLocal.getTime()) {
      return "Yesterday";
    }

    // Calculate days difference
    const daysDiff = Math.floor((todayLocal.getTime() - dateLocal.getTime()) / (1000 * 60 * 60 * 24));

    // Check if date is within the last 7 days
    if (daysDiff >= 0 && daysDiff <= 7) {
      return "Previous 7 Days";
    }

    // Check if date is within the last 30 days
    if (daysDiff >= 0 && daysDiff <= 30) {
      return "Previous 30 Days";
    }

    // Format older dates as month and year
    return format(date, "MMMM yyyy");
  } catch (error) {
    console.error("Error formatting chat date:", error, "for timestamp:", timestamp);
    return "Unknown date";
  }
};

// Helper function to check if a date is today
const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();

  // Compare dates in local timezone
  const dateLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return dateLocal.getTime() === todayLocal.getTime();
};

// Helper function to check if a date is yesterday
const isYesterday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();

  // Compare dates in local timezone
  const dateLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const yesterdayLocal = new Date(todayLocal);
  yesterdayLocal.setDate(yesterdayLocal.getDate() - 1);

  return dateLocal.getTime() === yesterdayLocal.getTime();
};

// Generate a chat title from messages
const generateChatTitle = (content: string): string => {
  // Remove any newlines and extra spaces
  let cleanContent = content.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();

  // Truncate long content and add ellipsis
  if (cleanContent.length > 40) {
    return cleanContent.substring(0, 40) + "...";
  }
  return cleanContent;
};

// Create a reusable chat item component with animation
const AnimatedChatItem = React.memo(({ 
  chat, 
  isSelected, 
  onPress
}: { 
  chat: ChatItem; 
  isSelected: boolean; 
  onPress: () => void;
}) => {
  // Initialize animation values to final states to prevent useInsertionEffect warnings
  const scale = useSharedValue(isSelected ? 0.95 : 1);
  const backgroundColor = useSharedValue(isSelected ? "rgba(0, 122, 255, 0.1)" : "transparent");

  // Update animation values when isSelected changes using requestAnimationFrame
  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      setTimeout(() => {
        scale.value = withTiming(isSelected ? 0.95 : 1, {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        backgroundColor.value = withTiming(isSelected ? "rgba(0, 122, 255, 0.1)" : "transparent", { 
          duration: 300 
        });
      }, 0);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [isSelected, scale, backgroundColor]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: backgroundColor.value,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Pressable className="py-2.5 px-3 mx-4 rounded-lg active:bg-primary-oceanBlue50" onPress={onPress}>
        <View className="flex-row items-center justify-between">
          <Text 
            className="text-md font-medium text-black" 
            numberOfLines={1} 
            ellipsizeMode="tail"
            style={{ flex: 1 }}
          >
            {generateChatTitle(chat.title)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
});

// Create a reusable animated button for the New Chat button
const AnimatedNewChatButton = React.memo(({ onPress }: { onPress: () => void }) => {
  // Initialize scale to final state to prevent useInsertionEffect warnings
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    // Use requestAnimationFrame to schedule animation outside render phase
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Animate button press with proper timing
        scale.value = withSequence(
          withTiming(0.95, { duration: 100 }),
          withTiming(1, { duration: 150 })
        );
      }, 0);
    });

    // Call the handler
    onPress();
  }, [onPress, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={animatedStyle} className="flex-row items-center py-2">
        <LinearGradient
          colors={COLORS.primary.gradientSoft}
          style={{
            width: 30,
            height: 30,
            borderRadius: 20,
            marginRight: 6,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <VoxProfitSvg width={20} height={20} />
        </LinearGradient>
        <Text className="text-base font-medium text-black">New Chat</Text>
      </Animated.View>
    </Pressable>
  );
});

export default function AppDrawer({ isOpen, onClose, onNewChat, onSwitchChat }: AppDrawerProps) {
  // State for search functionality
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Track the selected chat ID for animation
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Use our chat history hook
  const {
    chatSessions = [],
    currentSessionId,
    isLoading,
    error,
    switchChat,
    refreshChatHistory,
    getGroupedChatHistory,
    getSessionTitle,
    isQueryInitialized,
    createNewChat,
  } = useAiChatHistory();

  // Refresh chat sessions whenever drawer opens
  useEffect(() => {
    if (isOpen) {
      refreshChatHistory();
    }
  }, [isOpen, refreshChatHistory]);

  // Force re-render when chatSessions change to ensure new chats appear immediately
  useEffect(() => {
    if (chatSessions && chatSessions.length > 0) {
      // console.log(`Chat sessions updated: ${chatSessions.length} sessions available`);
    }
  }, [chatSessions]);

  // Generate chat items from chat sessions
  const chatItems = useMemo<ChatItem[]>(() => {
    
    if (!Array.isArray(chatSessions)) {
      return [];
    }

    const items = chatSessions.map((session: ChatSession) => {
      // Use session updatedAt as the primary timestamp for sorting
      const latestTimestamp = session.updatedAt;
      const dateGroup = formatChatDate(latestTimestamp);

      return {
        id: session.sessionId,
        title: getSessionTitle ? getSessionTitle(session) : session.title || "New conversation",
        timestamp: latestTimestamp,
        dateGroup: dateGroup,
      };
    });

    // Pre-sort all items by timestamp (newest first) before grouping
    // This ensures consistent ordering even before the grouping logic
    items.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();

      // Handle invalid timestamps
      if (isNaN(timeA) && isNaN(timeB)) return 0;
      if (isNaN(timeA)) return 1;
      if (isNaN(timeB)) return -1;

      // Return newest first (descending order)
      return timeB - timeA;
    });

    return items;
  }, [chatSessions, getSessionTitle]);

  // Check if we have any chats today
  const hasTodayChats = useMemo(() => {
    return chatItems.some((chat) => isToday(chat.timestamp));
  }, [chatItems]);

  // Check if we have any chats yesterday
  const hasYesterdayChats = useMemo(() => {
    return chatItems.some((chat) => isYesterday(chat.timestamp));
  }, [chatItems]);

  // Original grouped history (unfiltered)
  const groupedHistory = useMemo(() => {
    
    // Initialize with empty Today and Yesterday sections
    const groups: Record<string, ChatItem[]> = {
      Today: [],
      Yesterday: [],
    };

    // Populate groups with actual chat items
    chatItems.forEach((chat) => {
      const group = chat.dateGroup;
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(chat);
    });

    // Sort each group by timestamp (newest first - most recently updated appears first)
    Object.keys(groups).forEach((groupKey) => {
      groups[groupKey].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();

        // If timestamps are invalid, handle gracefully
        if (isNaN(timeA) && isNaN(timeB)) return 0;
        if (isNaN(timeA)) return 1; // Put invalid timestamps at the end
        if (isNaN(timeB)) return -1; // Put invalid timestamps at the end

        // Return newest first (descending order)
        return timeB - timeA;
      });
    });

    return groups;
  }, [chatItems]);

  const historyGroups = useMemo(() => {
    // Always start with Today and Yesterday in the correct order
    return [
      "Today",
      "Yesterday",
      ...Object.keys(groupedHistory)
        .filter((group) => group !== "Today" && group !== "Yesterday")
        .sort((a: string, b: string) => {
          // Custom sorting to ensure the groups are in the right order
          const order: Record<string, number> = {
            "Previous 7 Days": 3,
            "Previous 30 Days": 4,
          };

          return (order[a] || 999) - (order[b] || 999);
        }),
    ];
  }, [groupedHistory]);

  // Filtered history based on search query
  const filteredHistory = useMemo<ChatItem[]>(() => {
    if (!isSearching || !searchQuery) {
      return []; // Return empty array if not searching or query is empty
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = chatItems.filter((chat: ChatItem) => chat.title.toLowerCase().includes(lowerCaseQuery));

    // Ensure search results are also sorted by timestamp (newest first)
    return filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();

      // Handle invalid timestamps
      if (isNaN(timeA) && isNaN(timeB)) return 0;
      if (isNaN(timeA)) return 1;
      if (isNaN(timeB)) return -1;

      // Return newest first (descending order)
      return timeB - timeA;
    });
  }, [isSearching, searchQuery, chatItems]);

  const handleStartSearch = () => {
    setIsSearching(true);
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
    setSearchQuery("");
  };

  // Handle chat selection with animation
  const handleChatSelect = useCallback(
    (sessionId: string) => {
      // Set selected chat ID to trigger animation
      setSelectedChatId(sessionId);

      // Use custom switchChat if provided, otherwise use the hook's switchChat
      if (onSwitchChat) {
        onSwitchChat(sessionId);
      } else {
        switchChat(sessionId);
      }

      // Reset selection after animation completes
      setTimeout(() => {
        setSelectedChatId(null);
        // Close drawer
        onClose();
      }, 300);
    },
    [switchChat, onSwitchChat, onClose]
  );

  // Handler for new chat button
  const handleNewChat = useCallback(() => {
    // Set selected chat ID to null to avoid any animations in the list
    setSelectedChatId(null);

    // Always close the drawer first to prevent any re-rendering issues
    onClose();

    // If an onNewChat callback was provided, call it (this handles the new chat creation)
    if (onNewChat) {
      // Add a small delay to ensure drawer closes smoothly before creating new chat
      setTimeout(() => {
        onNewChat();
      }, 100);
    } else {
      // Otherwise create a new chat directly
      setTimeout(() => {
        const newSessionId = createNewChat();
      }, 100);
    }
  }, [createNewChat, onClose, onNewChat, setSelectedChatId]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="lg" anchor="right">
      {/* Dark backdrop */}
      <DrawerBackdrop onPress={onClose} className="bg-black/60" />
      {/* White content area, remove top padding, let SafeAreaView handle it */}
      <DrawerContent className="bg-white pb-4 px-0">
        {/* Wrap content in SafeAreaView to avoid status bar */}
        <SafeAreaView className="flex-1 py-4">
          {/* Conditional Header */}
          <DrawerHeader className="px-4">
            {isSearching ? (
              // Search Header
              <View className="w-full flex-row items-center gap-2 pt-3">
                <Monicon name="tabler:search" size={22} color="gray" />
                <TextInput
                  placeholder="Search history..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                  className="flex-1 h-9 text-base"
                  style={{
                    textAlignVertical: 'center',
                    paddingVertical: 0,
                    lineHeight: 18,
                  }}
                />
                <Pressable onPress={handleCancelSearch}>
                  <Text className="text-base text-blue-500">Cancel</Text>
                </Pressable>
              </View>
            ) : (
              // Normal Header
              <View className="w-full flex-row justify-between items-center">
                <Pressable onPress={onClose}>
                  <Monicon name="hugeicons:menu-two-line" size={28} color="black" />
                </Pressable>
                <View className="flex-row gap-4">
                  <Pressable onPress={handleStartSearch}>
                    {/* Activate search */}
                    <Monicon name="tabler:search" size={24} color="black" />
                  </Pressable>
                  <Pressable onPress={handleNewChat}>
                    <Monicon name="material-symbols:edit-outline" size={24} color="black" />
                  </Pressable>
                </View>
              </View>
            )}
          </DrawerHeader>

          {/* Primary Navigation Items & Grouped Chat History */}
          <DrawerBody className="mt-0 mb-0 px-0">
            {/* Conditionally render New Chat button only when NOT searching */}
            {!isSearching && (
              <View className="px-4 my-4">
                <AnimatedNewChatButton onPress={handleNewChat} />
              </View>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <View className="items-center justify-center py-6">
                <ActivityIndicator size="large" color={COLORS.primary.light} />
                <Text className="text-gray-500 mt-2">Loading your conversations...</Text>
                <Text className="text-xs text-gray-400 mt-2">This may take a moment</Text>
              </View>
            )}

            {/* Error state */}
            {error && !isLoading && (
              <View className="items-center justify-center py-6 px-4">
                <Monicon name="mingcute:alert-circle-fill" size={32} color={COLORS.error.light} />
                <Text className="text-base text-center mt-2 text-error-light">Failed to load chat history.</Text>
                <Pressable className="mt-3 bg-primary-oceanBlue50 px-4 py-2 rounded-lg" onPress={refreshChatHistory}>
                  <Text className="text-primary-text">Try Again</Text>
                </Pressable>
              </View>
            )}

            {/* Query not initialized yet - show initial loading */}
            {!isLoading && !error && !isQueryInitialized && chatSessions.length === 0 && (
              <View className="items-center justify-center py-6">
                <ActivityIndicator size="large" color={COLORS.primary.light} />
                <Text className="text-gray-500 mt-2">Setting up chat system...</Text>
                <Text className="text-xs text-gray-400 mt-2">Preparing to load your conversations</Text>
              </View>
            )}

            {/* System ready but waiting for data */}
            {!isLoading && !error && isQueryInitialized && chatSessions.length === 0 && !chatSessions && (
              <View className="items-center justify-center py-6">
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-3">
                  <Monicon name="material-symbols:check-circle-outline" size={24} color="#10B981" />
                </View>
                <Text className="text-gray-500 mt-2">System ready, fetching conversations...</Text>
                <Text className="text-xs text-gray-400 mt-2">Please wait while we load your data</Text>
              </View>
            )}

            {/* API finished loading but no chats found - show empty state with context */}
            {!isLoading && !error && isQueryInitialized && chatSessions.length === 0 && (
              <View className="items-center justify-center py-8 px-6">
                <View className="w-16 h-16 bg-primary-oceanBlue50 rounded-full items-center justify-center mb-4">
                  <Monicon name="material-symbols:chat-bubble-outline" size={32} color={COLORS.primary.oceanBlue700} />
                </View>
                <Text className="text-lg font-semibold text-gray-800 mb-2 text-center">No conversations yet</Text>
                <Text className="text-gray-500 text-center mb-6">Start your first conversation with your AI assistant</Text>
                <Pressable 
                  className="bg-primary rounded-full px-6 py-3"
                  style={{ backgroundColor: COLORS.primary.oceanBlue700 }}
                  onPress={handleNewChat}
                >
                  <Text className="text-white font-semibold text-base">Start New Chat</Text>
                </Pressable>
                <View className="flex-row gap-3 mt-4">
                  <Pressable 
                    className="bg-gray-100 rounded-full px-4 py-2"
                    onPress={refreshChatHistory}
                  >
                    <Text className="text-gray-600 text-sm">Refresh</Text>
                  </Pressable>
                </View>
                <Text className="text-xs text-gray-400 mt-4 text-center">
                  Ready to start chatting
                </Text>
                <Text className="text-xs text-gray-300 mt-2 text-center">
                  If you have existing conversations, try refreshing
                </Text>
              </View>
            )}

            {/* Main content scrollview - only show when there are chats */}
            {!isLoading && !error && chatSessions.length > 0 && (
              <ScrollView className="flex-1">
                               {isSearching ? (
                  // Render Filtered List (flat)
                  filteredHistory.length > 0 ? (
                    filteredHistory.map((chat: ChatItem) => (
                      <AnimatedChatItem
                        key={chat.id}
                        chat={chat}
                        isSelected={selectedChatId === chat.id}
                        onPress={() => {
                          handleChatSelect(chat.id);
                          handleCancelSearch();
                        }}
                      />
                    ))
                  ) : (
                    <View className="items-center justify-center py-6">
                      <Text className="text-gray-500">No results found</Text>
                    </View>
                  )
                ) : (
                  <>
                    {/* Always render Today section */}
                    <View className="mb-4">
                      <View className="flex-row items-center px-4 pb-2">
                        <Text className="text-md text-black font-semibold">Today</Text>
                      </View>
                      {groupedHistory["Today"] && groupedHistory["Today"].length > 0 ? (
                        groupedHistory["Today"].map((chat: ChatItem) => (
                          <View key={chat.id} className="flex-row justify-between items-center">
                            <View style={{ flex: 1 }}>
                              <AnimatedChatItem 
                                chat={chat} 
                                isSelected={selectedChatId === chat.id} 
                                onPress={() => handleChatSelect(chat.id)} 
                              />
                            </View>
                            <Menu
                              placement="bottom right"
                              offset={5}
                              trigger={(props) => (
                                <Pressable {...props} className="mr-1">
                                  <Monicon name="bx:dots-vertical-rounded" size={24} color="black" />
                                </Pressable>
                              )}
                            >
                              <MenuItem key="delete" className="gap-1" textValue="Delete Chat" onPress={() => console.log("Delete Chat pressed")}>
                                <Monicon name="material-symbols:delete-forever-outline-rounded" size={22} color={COLORS.error.light} />
                                <MenuItemLabel className="text-base font-semibold text-red-500">Delete Chat</MenuItemLabel>
                              </MenuItem>
                            </Menu>
                          </View>
                        ))
                      ) : (
                        <View className="items-center justify-center py-2">
                          <Text className="text-gray-500 text-sm">No chats today</Text>
                        </View>
                      )}
                    </View>

                    {/* Always render Yesterday section */}
                    <View className="mb-4">
                      <View className="flex-row items-center px-4 pb-2">
                        <Text className="text-md text-black font-semibold">Yesterday</Text>
                      </View>
                      {groupedHistory["Yesterday"] && groupedHistory["Yesterday"].length > 0 ? (
                        groupedHistory["Yesterday"].map((chat: ChatItem) => (
                          <View key={chat.id} className="flex-row justify-between items-center">
                            <View style={{ flex: 1 }}>
                              <AnimatedChatItem 
                                chat={chat} 
                                isSelected={selectedChatId === chat.id} 
                                onPress={() => handleChatSelect(chat.id)} 
                              />
                            </View>
                            <Menu
                              placement="bottom right"
                              offset={5}
                              trigger={(props) => (
                                <Pressable {...props} className="mr-1">
                                  <Monicon name="bx:dots-vertical-rounded" size={24} color="black" />
                                </Pressable>
                              )}
                            >
                              <MenuItem key="delete" className="gap-1" textValue="Delete Chat" onPress={() => console.log("Delete Chat pressed")}>
                                <Monicon name="material-symbols:delete-forever-outline-rounded" size={22} color={COLORS.error.light} />
                                <MenuItemLabel className="text-base font-semibold text-red-500">Delete Chat</MenuItemLabel>
                              </MenuItem>
                            </Menu>
                          </View>
                        ))
                      ) : (
                        <View className="items-center justify-center py-2">
                          <Text className="text-gray-500 text-sm">No chats yesterday</Text>
                        </View>
                      )}
                    </View>

                    {/* Render remaining groups except Today and Yesterday */}
                    {historyGroups
                      .filter((groupName) => groupName !== "Today" && groupName !== "Yesterday")
                      .map((groupName) => (
                        <View key={groupName} className="mb-4">
                          <View className="flex-row items-center px-4 pb-2">
                            <Text className="text-md text-black font-semibold">{groupName}</Text>
                          </View>
                          {groupedHistory[groupName] && groupedHistory[groupName].length > 0 ? (
                            groupedHistory[groupName].map((chat: ChatItem) => (
                              <View key={chat.id} className="flex-row justify-between items-center">
                                <View style={{ flex: 1 }}>
                                  <AnimatedChatItem 
                                    chat={chat} 
                                    isSelected={selectedChatId === chat.id} 
                                    onPress={() => handleChatSelect(chat.id)} 
                                  />
                                </View>
                                <Menu
                                  placement="bottom right"
                                  offset={5}
                                  trigger={(props) => (
                                    <Pressable {...props} className="mr-1">
                                      <Monicon name="bx:dots-vertical-rounded" size={24} color="black" />
                                    </Pressable>
                                  )}
                                >
                                  <MenuItem key="delete" className="gap-1" textValue="Delete Chat" onPress={() => console.log("Delete Chat pressed")}>
                                    <Monicon name="material-symbols:delete-forever-outline-rounded" size={22} color={COLORS.error.light} />
                                    <MenuItemLabel className="text-base font-semibold text-red-500">Delete Chat</MenuItemLabel>
                                  </MenuItem>
                                </Menu>
                              </View>
                            ))
                          ) : (
                            <View className="items-center justify-center py-2">
                              <Text className="text-gray-500 text-sm">No chats</Text>
                            </View>
                          )}
                        </View>
                      ))}
                  </>
                )}
              </ScrollView>
            )}
          </DrawerBody>
        </SafeAreaView>
      </DrawerContent>
    </Drawer>

  );
}