import React, { useState, useCallback, useMemo, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { FeedPost } from "@/redux/investment";
import { useRouter } from "expo-router";
import { RibbonItem } from "./feedRibbonItem";
import { useMarqueeAnimation } from "@/hooks/useMarqueeAnimation";
import { ITEM_WIDTH } from "@/constants/ribbon";

type Speed = "slow" | "normal" | "fast";
const DURATION_FACTORS: Record<Speed, number> = {
  slow: 60,
  normal: 20,
  fast: 10,
};

interface HorizontalRibbonProps {
  posts: FeedPost[];
  speed?: Speed;
}

export default function HorizontalRibbon({ posts, speed = "normal" }: HorizontalRibbonProps) {
  const router = useRouter();
  const [isScrollStopped, setIsScrollStopped] = useState(false);
  const [currentScrollOffset, setCurrentScrollOffset] = useState(0);
  const listRef = useRef<FlashList<FeedPost>>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loopedPosts = useMemo(() => {
    if (posts.length === 0) return [];
    // Create enough copies to ensure smooth infinite scroll
    return [...posts];
  }, [posts]);

  const originalContentWidth = useMemo(
    () => posts.length * (ITEM_WIDTH + 16), // ITEM_WIDTH + 16 for marginHorizontal (8*2)
    [posts.length]
  );

  const loopedContentWidth = useMemo(() => originalContentWidth * 3, [originalContentWidth]);

  const isAnimationPlaying = !isScrollStopped;

  const { scrollX } = useMarqueeAnimation({
    contentWidth: originalContentWidth,
    isPlaying: isAnimationPlaying,
    durationFactor: DURATION_FACTORS[speed],
  });

  // Listen to animated value changes to track current position
  React.useEffect(() => {
    if (isAnimationPlaying) {
      const listener = scrollX.addListener(({ value }) => {
        setCurrentScrollOffset(Math.abs(value));
      });
      return () => scrollX.removeListener(listener);
    }
  }, [scrollX, isAnimationPlaying]);

  // Function to navigate to insight screen
  const navigateToInsight = useCallback((item: FeedPost) => {
    const actualNavigate = () => {
      // Prepare news sources if available
      let newsSourcesParam;

      if (item.newsSources && item.newsSources.length > 0) {
        try {
          newsSourcesParam = JSON.stringify(item.newsSources);
        } catch (error) {
          console.error("Error stringifying newsSources:", error);
        }
      }

      // Navigate with params
      router.push({
        pathname: "/investment/insight/[symbol]",
        params: {
          symbol: item?.ticker || "TSLA",
          feedItemId: item.signalId,
          action: item.action,
          handle: `@${item.user?.handle || item.user?.email?.split("@")[0] || "user"}`,
          timestamp: item.timestamp || "recently",
          confidence: item.confidence?.toString(),
          likes: (item.likeCount !== undefined ? item.likeCount : item.likes)?.toString() || "0",
          comments: (item.commentCount !== undefined ? item.commentCount : item.comments)?.toString() || "0",
          analysis: item.analysis,
          ...(newsSourcesParam ? { newsSources: newsSourcesParam } : {}),
        },
      });
    };

    // Navigate immediately
    actualNavigate();
  }, [router]);

  const handlePressItem = useCallback(
    (item: FeedPost) => {
      // Clear any existing resume timeout
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }

      if (!isScrollStopped) {
        // First tap: Stop the scroll and maintain current position
        setIsScrollStopped(true);
        
        // Scroll to current position to maintain continuity
        setTimeout(() => {
          listRef.current?.scrollToOffset({
            offset: currentScrollOffset,
            animated: false,
          });
        }, 50);
        
        // Set timeout to resume auto-scroll after 5 seconds of inactivity
        resumeTimeoutRef.current = setTimeout(() => {
          setIsScrollStopped(false);
        }, 10000) as any;
      } else {
        // Second tap: Navigate to insight
        navigateToInsight(item);
      }
    },
    [isScrollStopped, navigateToInsight, currentScrollOffset]
  );

  // Handle manual scroll events
  const handleScrollBegin = useCallback(() => {
    setIsScrollStopped(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  }, []);

  const handleScrollEnd = useCallback(() => {
    // Resume auto-scroll after 3 seconds of scroll inactivity
    resumeTimeoutRef.current = setTimeout(() => {
      setIsScrollStopped(false);
    }, 3000) as any;
  }, []);

  // Handle manual scroll position tracking
  const handleScroll = useCallback((event: any) => {
    setCurrentScrollOffset(event.nativeEvent.contentOffset.x);
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  if (!posts || posts.length === 0) {
    return null;
  }

  const renderItem = useCallback(
    ({ item }: { item: FeedPost; index: number }) => (
      <RibbonItem
        item={item}
        onPress={() => handlePressItem(item)}
      />
    ),
    [handlePressItem]
  );

  const keyExtractor = (item: FeedPost, index: number) => `${item.id}-${index}`;

  return (
    <View style={styles.container}>
      {isAnimationPlaying ? (
        <Animated.View
          style={{
            width: loopedContentWidth,
            transform: [{ translateX: scrollX }],
          }}
        >
          <FlashList
            ref={listRef}
            data={loopedPosts}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            horizontal
            showsHorizontalScrollIndicator={false}
            estimatedItemSize={ITEM_WIDTH}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />
        </Animated.View>
      ) : (
        <FlashList
          ref={listRef}
          data={loopedPosts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={true}
          estimatedItemSize={ITEM_WIDTH}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          onScrollBeginDrag={handleScrollBegin}
          onScrollEndDrag={handleScrollEnd}
          onMomentumScrollEnd={handleScrollEnd}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    paddingVertical: 4,
    overflow: "hidden",
  },
  listContent: {
    paddingVertical: 8,
  },
});