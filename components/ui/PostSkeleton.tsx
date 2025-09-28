import React from "react";
import { View } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { horizontalScale, verticalScale } from "@utils/responsive";

/**
 * PostSkeleton - Skeleton loading component for feed posts
 * Matches the exact layout and dimensions of FeedItem component
 */
const PostSkeleton: React.FC = () => {
  return (
    <View className="bg-white rounded-xl shadow-sm ios:shadow-black/5 mb-4 p-4">
      {/* Header with user info and timestamp */}
      <View className="flex-row items-center mb-3">
        {/* User avatar skeleton */}
        <Skeleton className="w-10 h-10 rounded-full mr-3" />
        
        {/* User info skeleton */}
        <View className="flex-1">
          <Skeleton className="w-24 h-4 mb-1" />
          <Skeleton className="w-16 h-3" />
        </View>
        
        {/* Action and confidence skeleton */}
        <View className="items-end">
          <Skeleton className="w-16 h-6 rounded-full mb-1" />
          <Skeleton className="w-12 h-4 rounded-full" />
        </View>
      </View>

      {/* Ticker and analysis skeleton */}
      <View className="mb-3">
        <Skeleton className="w-20 h-5 mb-2" />
        <Skeleton className="w-full h-4 mb-1" />
        <Skeleton className="w-3/4 h-4 mb-1" />
        <Skeleton className="w-1/2 h-4" />
      </View>

      {/* News sources skeleton */}
      <View className="mb-3">
        <Skeleton className="w-32 h-4 mb-2" />
        <View className="flex-row space-x-2">
          <Skeleton className="w-20 h-8 rounded-lg" />
          <Skeleton className="w-20 h-8 rounded-lg" />
        </View>
      </View>

      {/* Action buttons skeleton */}
      <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
        <View className="flex-row space-x-4">
          <Skeleton className="w-16 h-8 rounded-full" />
          <Skeleton className="w-16 h-8 rounded-full" />
          <Skeleton className="w-16 h-8 rounded-full" />
        </View>
        <Skeleton className="w-8 h-8 rounded-full" />
      </View>
    </View>
  );
};

export default PostSkeleton;
