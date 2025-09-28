import React, { useCallback } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { FONTS } from "@/constants/theme";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function SplashPage() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      // Hide the native splash screen
      await SplashScreen.hideAsync();

      // Navigate to main screen after delay
      const timer = setTimeout(() => {
        router.replace("/(public)/onboarding");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, router]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={["#006389", "#33B7E9"]} style={styles.gradient}>
        <View style={styles.content}>
          <Image source={require("@assets/images/logo/voxprofit_white.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>USE AI TO GET RICH</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
});
