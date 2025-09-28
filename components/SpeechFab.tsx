import React from "react";
import { TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export const SpeechFab = () => {
  const pathname = usePathname();

  // Check if current path is in auth or public screens
  const shouldHideFab = pathname.includes("/(auth)") || pathname.includes("/(public)");

  // Check if we're on a screen with bottom nav
  const hasBottomNav = !pathname.includes("/investment/(tabs)/investment");

  if (shouldHideFab) {
    return null;
  }

  return (
    <View
      className="absolute right-3 z-[1000]"
      style={{
        bottom: hasBottomNav ? 70 : 20,
      }}
      testID="speech-fab"
    >
      <TouchableOpacity onPress={() => router.push("/ai-agent/ai-agent-screen")} activeOpacity={0.8} testID="speech-fab-button">
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 28,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <LinearGradient
            colors={COLORS.primary.gradientSoft}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full h-full justify-center items-center"
          >
            <View className="w-full h-full justify-center items-center">
              <Ionicons name="mic-outline" size={35} color="white" />
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </View>
  );
};
