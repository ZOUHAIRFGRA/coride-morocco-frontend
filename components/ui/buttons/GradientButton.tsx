import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View, ActivityIndicator, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { verticalScale, moderateScale, responsiveFontSize } from "@utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

interface GradientButtonProps {
  onPress: () => void;
  text: string;
  variant?: "filled" | "outlined";
  colors?: [string, string];
  style?: ViewStyle;
  textStyle?: TextStyle;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  isLoading?: boolean;
  icon?: React.ReactNode
}

export const GradientButton = ({
  onPress,
  text,
  variant = "filled",
  colors = ["#33B7E9", "#006389"],
  style,
  textStyle,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  isLoading = false,
  icon=null
}: GradientButtonProps) => {
  if (variant === "outlined") {
    // Use MaskedView only on iOS to avoid Android touch issues
    if (Platform.OS === "ios") {
      return (
        <TouchableOpacity onPress={onPress} style={[styles.buttonWrapper, style]} activeOpacity={0.7} disabled={isLoading}>
          <LinearGradient colors={colors} start={start} end={end} style={styles.outlinedGradient}>
            <View style={styles.outlinedInner}>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors[0]} />
              ) : (
                <View style={styles.contentRow}>
                  {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
                  <MaskedView
                    style={styles.maskedView}
                    maskElement={
                      <View style={styles.maskElementWrapper}>
                        <Text style={[styles.text, textStyle]}>{text}</Text>
                      </View>
                    }
                  >
                    <LinearGradient colors={colors} start={start} end={end} style={styles.textGradient}>
                      <Text style={[styles.text, textStyle, styles.transparentText]}>{text}</Text>
                    </LinearGradient>
                  </MaskedView>
                </View>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    } else {
      // Android fallback - use regular gradient text without MaskedView
      return (
        <TouchableOpacity onPress={onPress} style={[styles.buttonWrapper, style]} activeOpacity={0.7} disabled={isLoading}>
          <LinearGradient colors={colors} start={start} end={end} style={styles.outlinedGradient}>
            <View style={styles.outlinedInner}>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors[0]} />
              ) : (
                <View style={styles.contentRow}>
                  {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
                  <Text style={[styles.text, { color: colors[0] }, textStyle]}>{text}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
  }

  return (
    <TouchableOpacity onPress={onPress} style={[styles.buttonWrapper, style]} activeOpacity={0.7} disabled={isLoading}>
      <LinearGradient colors={colors} start={start} end={end} style={styles.filledGradient}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <View style={styles.contentRow}>
            {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
            <Text style={[styles.text, styles.filledText, textStyle]}>{text}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    width: "100%",
  },
  filledGradient: {
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(8),
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
  },
  outlinedGradient: {
    borderRadius: moderateScale(8),
    padding: moderateScale(1.5),
  },
  outlinedInner: {
    borderRadius: moderateScale(7),
    backgroundColor: "#FFFFFF",
    paddingVertical: verticalScale(14.5),
    alignItems: "center",
    width: "100%",
  },
  maskedView: {
    height: verticalScale(20),
  },
  maskElementWrapper: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: responsiveFontSize(18),
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: moderateScale(0.5),
    textAlign: "center",
  },
  filledText: {
    color: "#FFFFFF",
  },
  textGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  transparentText: {
    opacity: 0,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    marginRight: moderateScale(8),
    alignItems: "center",
    justifyContent: "center",
  },
});