import React from "react";
import { StyleSheet, Platform, NativeModules } from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";

const { StatusBarManager } = NativeModules;

type SafeAreaWrapperProps = {
  children: React.ReactNode;
  style?: any;
};

/**
 * A wrapper component that handles safe area insets and status bar padding
 * Use this component as the root container for all screens
 */
const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ children, style }) => {
  // Get safe area insets
  const insets = useSafeAreaInsets();

  // Get status bar height with fallback
  const statusBarHeight = Platform.OS === "android" ? StatusBarManager?.HEIGHT || 24 : 0;

  return <SafeAreaView style={styles.safeArea}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  safeArea: {
    flex: 1,
  },
});

export default SafeAreaWrapper;
