import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "@utils/responsive";

interface SpinningGradientOutlineProps {
  type?: "buy" | "sell" | "hold";
  children: React.ReactNode;
  size?: number;
  speed?: number;
  colors?: [string, string, ...string[]];
  borderWidth?: number;
}

const SpinningGradientOutline: React.FC<SpinningGradientOutlineProps> = ({ type = "buy", children, size: _size = 4, speed = 200, colors, borderWidth = 2 }) => {
  // Animation value for spinning gradient colors
  const [spinAngle, setSpinAngle] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Default colors based on type
  const defaultColors = {
    buy: ["rgb(35, 215, 53)", "rgb(183, 248, 223)", "rgb(41, 232, 172)"] as [string, string, string],
    sell: ["rgba(229, 57, 53, 0.7)", "rgba(211, 47, 47, 0.3)", "rgba(229, 57, 53, 0.2)", "rgba(211, 47, 47, 0.7)"] as [
      string,
      string,
      string,
      string,
    ],
    hold: ["#9CA3AF", "#E5E7EB", "#F3F4F6"] as [string, string, string],

  };

  // Use provided colors or default based on type
  const gradientColors = colors || defaultColors[type];

  // Optimized spinning animation using requestAnimationFrame with Android compatibility
  useEffect(() => {
    const animate = (currentTime: number) => {
      // Only update if enough time has passed based on speed prop
      if (currentTime - lastUpdateRef.current >= speed) {
        // Smaller increment for Android to reduce rendering stress
        const increment = Platform.OS === 'android' ? 2 : 3;
        setSpinAngle((prev) => (prev + increment) % 360);
        lastUpdateRef.current = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Add a small delay before starting animation on Android
    const startDelay = Platform.OS === 'android' ? 100 : 0;
    
    const startAnimation = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (startDelay > 0) {
      const timeoutId = setTimeout(startAnimation, startDelay);
      return () => {
        clearTimeout(timeoutId);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } else {
      startAnimation();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [speed]);

  // Calculate start and end points for gradient based on spinning angle
  const getGradientPoints = (angle: number) => {
    // Convert angle to radians
    const radians = (angle * Math.PI) / 180;

    // Calculate start point
    const startX = 0.5 + 0.5 * Math.cos(radians);
    const startY = 0.5 + 0.5 * Math.sin(radians);

    // Calculate end point (opposite side)
    const endX = 0.5 - 0.5 * Math.cos(radians);
    const endY = 0.5 - 0.5 * Math.sin(radians);

    return {
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
    };
  };

  // Get current gradient direction based on animation
  const gradientPoints = getGradientPoints(spinAngle);

  return (
    <View style={[styles.wrapper, { padding: borderWidth }]}>
      {/* Gradient background container */}
      <View style={styles.gradientContainer}>
        <LinearGradient 
          colors={gradientColors} 
          start={gradientPoints.start} 
          end={gradientPoints.end} 
          style={[styles.gradient, { borderRadius: moderateScale(14) }]}
        />
      </View>

      {/* Main content */}
      <View style={[styles.content, { margin: borderWidth }]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: moderateScale(14),
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  gradientContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: moderateScale(14),
    overflow: "hidden",
    opacity: Platform.OS === 'android' ? 0.5 : 0.6,
  },
  gradient: {
    width: "100%",
    height: "100%",
    ...Platform.select({
      android: {
        // Additional Android-specific fixes
        elevation: 0,
        shadowOpacity: 0,
      },
      ios: {},
    }),
  },
  content: {
    backgroundColor: "#FFF",
    borderRadius: moderateScale(12),
    zIndex: 2,
    ...Platform.select({
      android: {
        // Ensure proper rendering on Android
        elevation: 1,
        shadowOpacity: 0,
      },
      ios: {},
    }),
  },
});

export default SpinningGradientOutline;
