import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from "react-native-svg";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { COLORS, FONTS } from "@/constants/theme";

type GaugeMeterProps = {
  value: number; // 0-100 value where 0 = Fear and 100 = Greed
  size?: number;
  strokeWidth?: number;
  leftLabel?: string;
  rightLabel?: string;
};

const GaugeMeter: React.FC<GaugeMeterProps> = ({ value, size = wp(26), strokeWidth = 6, leftLabel = "Fear", rightLabel = "Greed" }) => {
  // Ensure value is within 0-100 range
  const clampedValue = Math.min(100, Math.max(0, value));

  // Parameters for drawing
  const centerX = size / 2;
  const centerY = size / 2; // Center of rotation, and Y-level of the arc's diameter
  const radius = size / 2 - 10; // Radius of the gauge arc

  // Arc path for the top semi-circle (diameter at y=centerY, arc above it)
  // M = move to, A = elliptical Arc (rx ry x-axis-rotation large-arc-flag sweep-flag x y)
  // Sweep-flag 0 for counter-clockwise (or the shorter arc path if start/end define two possibilities for top/bottom)
  // To draw top semi-circle from left to right:
  const arcStartX = centerX - radius;
  const arcStartY = centerY;
  const arcEndX = centerX + radius;
  const arcEndY = centerY;
  const arcPath = `M ${arcStartX} ${arcStartY} A ${radius} ${radius} 0 0 1 ${arcEndX} ${arcEndY}`;

  // Needle properties
  const needleLength = radius - 15; // Length of the needle
  // Base needle path: line from center pointing straight UP
  const baseNeedlePath = `M ${centerX} ${centerY} L ${centerX} ${centerY - needleLength}`;

  // Calculate rotation angle for the needle in degrees
  // 0 value (Fear) = -90 degrees (rotate left from Up)
  // 50 value (Neutral) = 0 degrees (points Up)
  // 100 value (Greed) = +90 degrees (rotate right from Up)
  const rotationDegrees = (clampedValue / 100.0) * 180.0 - 90.0;

  return (
    <View style={[styles.container, { width: size, height: size / 2 + 30 }]}>
      {/* SVG ViewBox: y goes from 0 (top) to size/2 + small_padding (bottom) */}
      {/* centerY is at size/2, so the arc from y=centerY to y=(centerY-radius) is visible */}
      <Svg width={size} height={size / 2 + 15} viewBox={`0 0 ${size} ${size / 2 + 15}`}>
        <Defs>
          <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FF3B30" />
            <Stop offset="25%" stopColor="#FF9500" />
            <Stop offset="50%" stopColor="#FFCC00" />
            <Stop offset="75%" stopColor="#A1DD70" />
            <Stop offset="100%" stopColor="#4CD964" />
          </LinearGradient>
        </Defs>

        {/* Draw top semi-circle background arc */}
        <Path d={arcPath} stroke="url(#gaugeGradient)" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />

        {/* Needle: Group for rotation, then path and circle */}
        <G transform={`rotate(${rotationDegrees}, ${centerX}, ${centerY})`}>
          <Path d={baseNeedlePath} stroke="#1A55D9" strokeWidth={4} strokeLinecap="round" />
          {/* Optional: small circle at the end of the needle */}
          {/* <Circle cx={centerX} cy={centerY - needleLength} r={2} fill="#1A55D9" /> */}
        </G>

        {/* Center pivot circle (drawn on top of needle base) */}
        <Circle cx={centerX} cy={centerY} r={7} fill="#1A55D9" />
      </Svg>

      {/* Labels */}
      <View style={styles.labelsContainer}>
        <Text style={styles.label}>{leftLabel}</Text>
        <Text style={styles.label}>{rightLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  label: {
    fontSize: hp(1.5),
    fontFamily: FONTS.regular,
    color: COLORS.primary.oceanBlue700,
    fontWeight: "bold",
  },
});

export default GaugeMeter;
