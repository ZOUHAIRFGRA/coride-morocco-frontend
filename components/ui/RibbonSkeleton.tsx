import React from "react";
import { View } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { horizontalScale, verticalScale } from "@utils/responsive";

/**
 * RibbonSkeleton - Skeleton loading component for the marquee ribbon
 * Matches the exact layout and dimensions of HorizontalRibbon component
 */
const RibbonSkeleton: React.FC = () => {
  return (
    <View className="bg-white/80 backdrop-blur-sm rounded-xl mx-5 mb-4 p-3">
      {/* Ribbon header */}
      <View className="flex-row items-center justify-between mb-2">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-16 h-4" />
      </View>
      
      {/* Ribbon content - multiple skeleton items to simulate scrolling content */}
      <View className="flex-row space-x-4">
        {/* First skeleton item */}
        <View className="flex-row items-center space-x-2">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-16 h-4" />
        </View>
        
        {/* Second skeleton item */}
        <View className="flex-row items-center space-x-2">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-20 h-4" />
        </View>
        
        {/* Third skeleton item */}
        <View className="flex-row items-center space-x-2">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="w-18 h-4" />
          <Skeleton className="w-14 h-4" />
        </View>
        
        {/* Fourth skeleton item */}
        <View className="flex-row items-center space-x-2">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="w-22 h-4" />
          <Skeleton className="w-18 h-4" />
        </View>
      </View>
    </View>
  );
};

export default RibbonSkeleton;
