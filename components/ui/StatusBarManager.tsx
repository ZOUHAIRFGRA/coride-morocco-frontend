import React, { ReactNode } from "react";
import { Platform, KeyboardAvoidingView, StyleSheet, View, NativeModules } from "react-native";
import { StatusBar, StatusBarProps as ExpoStatusBarProps } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { StatusBarManager } = NativeModules;

type StatusBarCustomProps = ExpoStatusBarProps & {
  children?: ReactNode;
};

/**
 * A component to manage status bar appearance and handle keyboard interactions consistently across the app
 * This can be included in the layout file or individual screens
 */
const StatusBarManagerComponent: React.FC<StatusBarCustomProps> = (props) => {
  const { children } = props;
  const insets = useSafeAreaInsets();

  // Ensure status bar shows up on Android

  if (children) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        {Platform.OS === "ios" ? (
          <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={insets.top}>
            {children}
          </KeyboardAvoidingView>
        ) : (
          <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top : StatusBarManager?.HEIGHT || 24 }]}>{children}</View>
        )}
      </View>
    );
  }

  return <StatusBar style="auto" />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default StatusBarManagerComponent;
