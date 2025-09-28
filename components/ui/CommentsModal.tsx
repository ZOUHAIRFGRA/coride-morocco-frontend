import { View, Text, TouchableOpacity, Image, TextInput, Modal, Keyboard, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HStack } from "@/components/ui/hstack";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { COLORS } from "@constants/theme";
import React, { useState, useEffect, useCallback, useRef } from "react";
import * as Haptics from "expo-haptics";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from "react-native-reanimated";
import { useLikePostMutation, useCreateCommentMutation, useGetPostsQuery } from "@/redux/investment/investmentEndpoints";
import { useAppSelector } from "@/redux/hooks";
import { PostComment } from "@/redux/investment";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserProfileQuery } from "@/redux/user/userEndpoints";

// Interface for comment type
export interface Comment {
  id: string;
  text: string;
  handle: string;
  timestamp: string;
  createdAt?: Date; // Store the actual date object for recalculation
  profileImage: any;
  likes: number;
  liked?: boolean;
}

// Props for CommentsModal component
interface CommentsModalProps {
  isVisible: boolean;
  onClose: () => void;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  itemId: string;
  onAddComment?: (text: string) => void;
}

// Convert API comments to UI Comment type
const convertApiComments = (comments: PostComment[]): Comment[] => {
  if (!comments || !Array.isArray(comments)) return [];

  return comments.map((comment) => {
    const createdAt = comment.createdAt ? new Date(comment.createdAt) : new Date();

    // Process handle - if it's an email, extract the username part
    let handle = comment.handle || "user";
    if (handle.includes("@") && handle.includes(".")) {
      handle = handle.split("@")[0];
    }

    console.log(
      `Converting API comment: ID=${comment.id}, createdAt=${comment.createdAt}, calculated=${formatDistanceToNow(createdAt, { addSuffix: true })}`
    );

    return {
      id: comment.id,
      text: comment.content,
      handle: handle,
      timestamp: formatDistanceToNow(createdAt, { addSuffix: true }),
      createdAt: createdAt, // Store the date object
      profileImage: require("@assets/images/mix/user.jpg"),
      likes: comment.likeCount || 0,
      liked: comment.liked || false,
    };
  });
};

// Format new comment timestamp to show accurate time
const getCorrectTimestamp = (): { timestamp: string; createdAt: Date } => {
  const now = new Date();
  return {
    timestamp: formatDistanceToNow(now, { addSuffix: true }),
    createdAt: now,
  };
};

// Update all comment timestamps to be current
const updateAllTimestamps = (comments: Comment[]): Comment[] => {
  return comments.map((comment) => {
    const createdAt = comment.createdAt || new Date();
    return {
      ...comment,
      timestamp: formatDistanceToNow(createdAt, { addSuffix: true }),
    };
  });
};

const CommentsModal = ({ isVisible, onClose, comments, setComments, itemId, onAddComment }: CommentsModalProps) => {
  // State for comment input
  const [commentText, setCommentText] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Local state for comment manipulation
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  // Timer to update timestamps
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // API mutations
  const [likePost, { isLoading: isLiking }] = useLikePostMutation();
  const [createComment, { isLoading: isCreatingComment }] = useCreateCommentMutation();

  // Get current post data to refresh comments
  const { data: postsData, refetch } = useGetPostsQuery(
    {
      first: 10,
      after: null,
      last: null,
      before: null,
      offset: null,
      _queryId: Date.now().toString(),
    },
    {
      skip: !isVisible, // Only fetch when modal is visible
    }
  );

  // Get user data from Redux state
  const userData = useAppSelector((state) => state.auth.user);

  // Get user profile data to access handle
  const { data: userProfileData } = useGetUserProfileQuery(undefined, {
    skip: !isVisible,
  });

  // Function to get user handle
  const getUserHandle = () => {
    // Use handle from profile if available
    if (userProfileData?.user?.handle) {
      // Check if handle is an email address and extract username part
      const handle = userProfileData.user.handle;
      if (handle.includes("@") && handle.includes(".")) {
        return handle.split("@")[0];
      }
      return handle;
    }
    // Fall back to email-based handle if available
    if (userData?.email) {
      // Extract username part from email (before the @)
      return userData.email.split("@")[0];
    }
    // Default handle if no data is available
    return "user";
  };

  // Animation shared value
  const translateY = useSharedValue(600);
  const opacity = useSharedValue(0);

  // Sync comments with local state when updates occur
  useEffect(() => {
    if (comments && comments.length >= 0) {
      // Preserve the createdAt values from previous localComments
      const updatedComments = comments.map((comment) => {
        const existingComment = localComments.find((c) => c.id === comment.id);
        if (existingComment && existingComment.createdAt) {
          return {
            ...comment,
            createdAt: existingComment.createdAt,
            timestamp: formatDistanceToNow(existingComment.createdAt, { addSuffix: true }),
          };
        }
        return comment;
      });

      setLocalComments(updatedComments);
    }
  }, [comments]);

  // Setup timer to update timestamps every minute
  useEffect(() => {
    if (isVisible) {
      // Start a timer to update timestamps every minute
      timerRef.current = setInterval(() => {
        setLocalComments((prev) => updateAllTimestamps(prev));
      }, 60000); // Update every minute
    }

    return () => {
      // Clean up timer when component unmounts or modal closes
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isVisible]);

  // Run animation when visibility changes
  useEffect(() => {
    if (isVisible) {
      // Start opening animation
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });

      // Update timestamps when opening
      setLocalComments((prev) => updateAllTimestamps(prev));

      // Refresh comments data when modal opens if needed
      if (localComments.length === 0) {
        refreshComments();
      }
    } else {
      // Reset the input when modal closes
      setCommentText("");

      // Clear the timer when closing
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isVisible]);

  // Function to refresh comments
  const refreshComments = useCallback(async () => {
    if (!itemId) return;

    setIsRefreshing(true);
    try {
      const result = await refetch();

      // Find the current post in the results
      const currentPost = result.data?.allPosts?.edges?.find(
        (edge) => (edge.node.signalId && edge.node.signalId === itemId) || edge.node.id === itemId
      )?.node;

      // If found and has comments array, update comments state
      if (currentPost && currentPost.comments && Array.isArray(currentPost.comments)) {
        console.log("Refreshed comments from API:", currentPost.comments);

        // Convert API comments but preserve existing comment metadata where possible
        const apiComments = convertApiComments(currentPost.comments);

        // Merge with existing comments to preserve local data
        const mergedComments = apiComments.map((apiComment) => {
          const existingComment = localComments.find((c) => c.id === apiComment.id);
          if (existingComment && existingComment.createdAt) {
            // If we already have this comment with a timestamp, keep our timestamp
            return {
              ...apiComment,
              createdAt: existingComment.createdAt,
              timestamp: formatDistanceToNow(existingComment.createdAt, { addSuffix: true }),
            };
          }
          return apiComment;
        });

        setComments(mergedComments);
      }
    } catch (error) {
      console.error("Error refreshing comments:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [itemId, refetch, setComments, localComments]);

  // Function to handle closing the modal
  const handleClose = () => {
    // Start closing animation
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(
      600,
      {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          // Run on JS thread when animation is complete
          runOnJS(onClose)();
        }
      }
    );
    Keyboard.dismiss();
  };

  // Function to add a comment
  const addComment = async () => {
    if (commentText.trim()) {
      const clientMutationId = Math.random().toString();

      // Get timestamp and date object
      const { timestamp, createdAt } = getCorrectTimestamp();

      // Optimistically add the comment to UI with correct timestamp
      const newComment = {
        id: clientMutationId, // Temporary ID
        text: commentText.trim(),
        handle: getUserHandle(),
        timestamp: timestamp,
        createdAt: createdAt, // Store the date object
        profileImage: require("@assets/images/mix/user.jpg"),
        likes: 0,
        liked: false,
      };

      console.log(`Adding new comment with timestamp: ${timestamp}`);

      // Update both local state and parent state
      const updatedComments = [...localComments, newComment];
      setLocalComments(updatedComments);
      setComments(updatedComments);

      // Clear input
      setCommentText("");

      // Call the optional onAddComment callback
      if (onAddComment) {
        onAddComment(commentText.trim());
      }

      // Haptic feedback for good experience
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Send comment to server in background
      try {
        const result = await createComment({
          signalId: itemId, // itemId should now be signalId when passed from parent component
          content: commentText.trim(),
          clientMutationId: clientMutationId,
        }).unwrap();

        if (!result.success) {
          console.warn("Failed to create comment:", result.message);
          // Remove the optimistic comment if server request failed
          const filteredComments = localComments.filter((comment) => comment.id !== clientMutationId);
          setLocalComments(filteredComments);
          setComments(filteredComments);
        }

        // We don't need to refetch anymore as we're managing state locally
        // Only refresh if specifically needed for other data
        // setTimeout(() => refreshComments(), 1000);
      } catch (error) {
        console.error("Error creating comment:", error);
        // Remove the optimistic comment if server request failed
        const filteredComments = localComments.filter((comment) => comment.id !== clientMutationId);
        setLocalComments(filteredComments);
        setComments(filteredComments);
      }
    }
  };

  // Function to like a comment
  const likeComment = async (commentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // First update UI optimistically
    const updatedComments = localComments.map((comment) =>
      comment.id === commentId
        ? {
            ...comment,
            likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            liked: !comment.liked,
          }
        : comment
    );

    setLocalComments(updatedComments);
    setComments(updatedComments);

    // Now update the server
    try {
      const comment = localComments.find((c) => c.id === commentId);
      if (!comment) return;

      const currentLikedState = comment.liked || false;

      const result = await likePost({
        model: "comment",
        objectId: commentId,
        like: !currentLikedState,
      }).unwrap();

      if (!result.success) {
        console.warn("Comment like operation failed:", result.message);
        // Revert UI state if the server request failed
        const revertedComments = localComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes: comment.liked ? comment.likes + 1 : comment.likes - 1,
                liked: currentLikedState,
              }
            : comment
        );

        setLocalComments(revertedComments);
        setComments(revertedComments);
      }
    } catch (error) {
      console.error("Error liking comment:", error);
      // Could revert UI state here if needed
    }
  };

  // Animated styles
  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const modalAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Determine if there are no comments to show
  const hasNoComments = !isRefreshing && (!localComments || localComments.length === 0);

  return (
    <Modal animationType="none" transparent={true} visible={isVisible} onRequestClose={handleClose}>
      <Animated.View className="flex-1 justify-end bg-black/30" style={overlayAnimatedStyle}>
        <TouchableOpacity className="absolute inset-0" onPress={handleClose} activeOpacity={1} />

        <Animated.View style={modalAnimatedStyle} className="bg-white rounded-t-[20px] pt-2.5 pb-10 h-[70%] shadow-sm">
          {/* Modal Header */}
          <View className="flex-row justify-center items-center py-2.5 border-b border-black/10 relative">
            <Text className="font-bold text-lg text-gray-800">Comments</Text>
            <TouchableOpacity onPress={handleClose} className="absolute right-4 p-1.5">
              <Ionicons name="close" size={wp(6)} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
            {isRefreshing ? (
              <>
                {/* Skeleton loading states for comments */}
                {[1, 2, 3, 4].map((_, index) => (
                  <View key={index} className="flex-row mb-4">
                    <Skeleton className="w-9 h-9 rounded-full mr-2" />
                    <View className="flex-1">
                      <View className="bg-gray-100 p-3 rounded-2xl max-w-[95%]">
                        <Skeleton className="w-24 h-4 mb-2 rounded-md" />
                        <Skeleton className="w-full h-4 mb-1 rounded-md" />
                        <Skeleton className="w-3/4 h-4 rounded-md" />
                      </View>
                      <View className="flex-row mt-1 ml-2 items-center">
                        <Skeleton className="w-12 h-3 mr-3 rounded-md" />
                        <Skeleton className="w-10 h-3 mr-3 rounded-md" />
                        <Skeleton className="w-16 h-3 rounded-md" />
                      </View>
                    </View>
                  </View>
                ))}
              </>
            ) : localComments.length > 0 ? (
              localComments.map((comment) => {
                // Format handle for display - remove email domain if it's an email
                let displayHandle = comment.handle;
                if (displayHandle.includes("@") && displayHandle.includes(".")) {
                  displayHandle = displayHandle.split("@")[0];
                }

                return (
                  <View key={comment.id} className="flex-row mb-4">
                    <Image source={comment.profileImage} className="w-9 h-9 rounded-full mr-2" />
                    <View className="flex-1">
                      <View className="bg-[#f0f2f5] p-3 rounded-2xl max-w-[95%]">
                        <Text className="font-semibold text-sm text-gray-800 mb-0.5">@{displayHandle}</Text>
                        <Text className="text-sm text-gray-800">{comment.text}</Text>
                      </View>
                      <View className="flex-row mt-1 ml-2 items-center">
                        <TouchableOpacity className="mr-3" onPress={() => likeComment(comment.id)} disabled={isLiking}>
                          <HStack space="xs" className="items-center">
                            <Ionicons
                              name={comment.liked ? "heart" : "heart-outline"}
                              size={wp(3.5)}
                              color={comment.likes > 0 || comment.liked ? "#E53935" : "#666"}
                            />
                            <Text className={`font-semibold text-xs ${comment.likes > 0 || comment.liked ? "text-[#E53935]" : "text-gray-500"}`}>
                              {comment.likes > 0 ? `${comment.likes}` : "Like"}
                            </Text>
                          </HStack>
                        </TouchableOpacity>
                        <TouchableOpacity className="mr-3">
                          <Text className="font-semibold text-xs text-gray-500">Reply</Text>
                        </TouchableOpacity>
                        <Text className="text-xs text-gray-400">{comment.timestamp}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="flex-1 min-h-[20%] justify-center items-center">
                <Ionicons name="chatbubble-ellipses-outline" size={wp(15)} color="rgba(0,0,0,0.1)" />
                <Text className="font-semibold text-base text-gray-500 mt-2.5">No comments yet</Text>
                <Text className="text-sm text-gray-400 mt-1">Be the first to comment</Text>
              </View>
            )}
          </ScrollView>

          {/* Comment Input */}
          <View className="flex-row items-center bg-[#f9f9f9] px-4 py-2.5 border-t border-black/5">
            <Image source={require("@assets/images/mix/user.jpg")} className="w-9 h-9 rounded-full mr-2" />
            <TextInput
              className="flex-1 min-h-[40px] max-h-[100px] bg-white rounded-[20px] px-4 py-2 text-sm text-gray-800 border border-black/10"
              placeholder="Write a comment..."
              value={commentText}
              onChangeText={setCommentText}
              multiline={true}
              maxLength={300}
            />
            <TouchableOpacity
              className={`p-2.5 ml-2 ${!commentText.trim() || isCreatingComment ? "opacity-50" : ""}`}
              onPress={addComment}
              disabled={!commentText.trim() || isCreatingComment}
            >
              <Ionicons name="send" size={wp(5)} color={commentText.trim() && !isCreatingComment ? COLORS.primary.light : "#ccc"} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default CommentsModal;
