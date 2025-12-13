import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { COLORS, FONTS } from "@constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";


type StickyHeaderProps = {
  title: string;
  subtitle?: string;
  showBackIcon?: boolean;
  onBackPress?: () => void;
  backIconName?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
  style?: any;
  titleStyle?: any;
};

/**
 * StickyHeader displays a centered title, optional subtitle, and an optional back icon.
 */
export default function StickyHeader({
  title,
  subtitle,
  showBackIcon = false,
  onBackPress,
  backIconName = "chevron-back",
  rightElement,
  style,
  titleStyle
}: StickyHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.stickyHeader}>
      {showBackIcon ? (
        <TouchableOpacity
          onPress={onBackPress || (() => router.back())}
          style={styles.backButton}
        >
          <Ionicons name={backIconName} size={wp(8)} color="#000" />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButton} />
      )}

      <View style={styles.titleContainer}>
        <Text style={[styles.screenTitle, titleStyle]}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>

      {rightElement ? (
        <View style={styles.rightContainer}>
          {rightElement}
        </View>
      ) : (
        <View style={styles.backButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    width: wp(10),
    height: wp(10),
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center", 
    justifyContent: "center",
  },
  rightContainer: {
    minWidth: wp(10),
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 8,
  },
  screenTitle: {
    fontSize: hp(2.4),
    fontFamily: FONTS.bold,
    color: COLORS.primary.dark,
  },
  subtitle: {
    fontSize: hp(1.7),
    color: COLORS.text.primary,
    marginTop: 2,
    fontFamily: FONTS.regular,
    textAlign: "center",
  },
});