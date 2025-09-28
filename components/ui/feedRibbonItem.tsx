import React, { useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from "react-native";
import { FeedPost } from "@/redux/investment";
import { VStack } from "@/components/ui/vstack";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS, GRADIENTS } from "@constants/theme";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { horizontalScale, verticalScale, moderateScale, responsiveFontSize } from "@utils/responsive";
import SpinningGradientOutline from "@/components/ui/SpinningGradientOutline";
import * as Haptics from "expo-haptics";

interface RibbonItemProps {
  item: FeedPost;
  onPress: () => void;
}

/**
 * Enhanced RibbonItemComponent with modern design and responsive styling
 * - Left column: ticker symbol with enhanced styling
 * - Right column: improved layout with better visual hierarchy
 * - Enhanced confidence badges and action indicators
 * - Performance optimizations and accessibility support
 */
function RibbonItemComponent({ item, onPress }: RibbonItemProps) {
  const screenWidth = Dimensions.get("window").width;
  
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  // Memoize styling calculations for performance
  const itemStyles = useMemo(() => {
    const action = 
      item.action === "BUY" 
      ? "buy" :
      item.action === "HOLD"
      ? "hold" : "sell";
      
    const confidenceBg =
      item.confidence > 80 ? COLORS.success.light : 
      item.confidence > 60 ? COLORS.primary.light : 
      item.confidence > 30 ? "#FFA000" : COLORS.error.light;

    const actionColor =
      item.action === "BUY"
        ? COLORS.success.teal
        : item.action === "HOLD"
        ? COLORS.primary.light
        : COLORS.error.light;

    const confidenceGradient = 
      item.confidence > 80 ? 'rgba(34, 197, 94, 0.1)' :
      item.confidence > 60 ? 'rgba(59, 130, 246, 0.1)' :
      item.confidence > 30 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)';

    return {
      action,
      confidenceBg,
      actionColor,
      confidenceGradient,
      containerWidth: Math.max(320, screenWidth * 0.85),
      containerHeight: Math.max(90, screenWidth * 0.22)
    };
  }, [item.action, item.confidence, screenWidth]);

  const { action, confidenceBg, actionColor, confidenceGradient, containerWidth, containerHeight } = itemStyles;

  return (
    <TouchableOpacity 
      activeOpacity={0.85} 
      onPress={handlePress} 
      style={[
        styles.container,
        {
          width: containerWidth,
          height: containerHeight,
          marginHorizontal: Math.max(8, screenWidth * 0.02),
        }
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${item.ticker || 'Investment'} recommendation: ${item.action} with ${item.confidence}% confidence. ${item.title || item.analysis || ''}`}
      accessibilityHint="Tap to view detailed analysis"
    >
      <View style={styles.row}>
        {/* Enhanced Left Column - Ticker */}
        <View style={[
          styles.leftColumn,
          {
            backgroundColor: confidenceGradient,
            borderRightColor: confidenceBg + '30',
          }
        ]}>
          {item.ticker ? (
            <View style={styles.tickerContainer}>
              <Text style={[
                styles.ticker,
                {
                  fontSize: Math.max(14, screenWidth * 0.035),
                  color: confidenceBg,
                }
              ]} numberOfLines={1}>
                {item.ticker}
              </Text>
              <View style={[
                styles.tickerDot,
                { backgroundColor: confidenceBg }
              ]} />
            </View>
          ) : (
            <View style={[
              styles.iconContainer,
              { backgroundColor: confidenceGradient }
            ]}>
              <Image
                source={require("@assets/images/icons/bitcoin.png")}
                style={[
                  styles.tickerIcon,
                  {
                    width: Math.max(24, screenWidth * 0.06),
                    height: Math.max(24, screenWidth * 0.06),
                  }
                ]}
                resizeMode="contain"
              />
            </View>
          )}
        </View>

        {/* Enhanced Right Column - Content */}
        <View style={styles.rightColumn}>
          {/* Enhanced Top Row - Title */}
          <View style={styles.topRow}>
            <Text style={[
              styles.title,
              {
                fontSize: Math.max(13, screenWidth * 0.033),
                lineHeight: Math.max(18, screenWidth * 0.045),
              }
            ]} numberOfLines={2}>
              {item.title || item.analysis || "Investment Analysis"}
            </Text>
          </View>

          {/* Enhanced Bottom Row - Badges */}
          <View style={styles.bottomRow}>
            {/* Enhanced Confidence Badge */}
            <View style={[
              styles.confidenceBadge, 
              { 
                backgroundColor: confidenceGradient,
                borderWidth: 1,
                borderColor: confidenceBg + '40',
                paddingHorizontal: Math.max(8, screenWidth * 0.02),
                paddingVertical: Math.max(4, screenWidth * 0.01),
              }
            ]}>
              <Text style={[
                styles.confidenceText,
                {
                  color: confidenceBg,
                  fontSize: Math.max(10, screenWidth * 0.025),
                  fontFamily: 'Montserrat_600SemiBold',
                }
              ]}>Confidence: {item.confidence}%</Text>
            </View>

            {/* Enhanced Action Indicator */}
            <View style={styles.actionContainer}>
              <SpinningGradientOutline type={action as "buy" | "hold" | "sell"} size={4}>
                <View style={[
                  styles.actionIndicator,
                  {
                    backgroundColor: actionColor + '15',
                    paddingHorizontal: Math.max(8, screenWidth * 0.02),
                    paddingVertical: Math.max(4, screenWidth * 0.01),
                  }
                ]}>
                  <View style={[
                    styles.actionIndicatorDot,
                    {
                      width: Math.max(6, screenWidth * 0.015),
                      height: Math.max(6, screenWidth * 0.015),
                      backgroundColor: actionColor,
                    }
                  ]} />
                  <Text style={[
                    styles.actionText, 
                    { 
                      color: actionColor,
                      fontSize: Math.max(11, screenWidth * 0.028),
                      fontFamily: 'Montserrat_700Bold',
                      marginLeft: Math.max(4, screenWidth * 0.01),
                    }
                  ]}>
                    {item.action}
                  </Text>
                </View>
              </SpinningGradientOutline>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Memoize the component for performance in lists
export const RibbonItem = React.memo(RibbonItemComponent);

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    borderColor: "rgba(0,0,0,0.04)",
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    height: "100%",
  },
  leftColumn: {
    width: "22%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.06)",
  },
  tickerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  ticker: {
    fontFamily: 'Montserrat_700Bold',
    textAlign: "center",
    marginBottom: 4,
  },
  tickerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 4,
  },
  tickerIcon: {
    tintColor: COLORS.primary.light,
  },
  rightColumn: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "space-between",
  },
  topRow: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Montserrat_600SemiBold',
    color: COLORS.text.primary,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  confidenceBadge: {
    borderRadius: 8,
    marginRight: 8,
    flex: 1,
  },
  confidenceText: {
    textAlign: "center",
  },
  actionContainer: {
    alignItems: "flex-end",
  },
  actionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
  },
  actionIndicatorDot: {
    borderRadius: 3,
  },
  actionText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});