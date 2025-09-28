import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { GradientText } from "@/components/ui/texts/GradientText";
import { GradientButton } from "@/components/ui/buttons/GradientButton";
import { COLORS, FONTS, SIZES, GRADIENTS } from "@constants/theme";

export default function FeatureHighlightsScreen() {
  const router = useRouter();

  const handleLetsGo = async () => {
    try {
      // Mark that the user has seen the highlights
      await AsyncStorage.setItem("hasSeenHighlights", "true");

      // Navigate to investment screen
      router.replace("/investment/(tabs)/investment");
    } catch (error) {
      console.error("Error saving feature highlights status:", error);
      router.replace("/investment/(tabs)/investment");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
          // statusBarStyle: "dark",
          // statusBarBackgroundColor: "white",
          // statusBarTranslucent: true,
        }}
      />
      {/* <StatusBar translucent backgroundColor="rgba(0, 0, 0, 0)" barStyle="dark-content" /> */}

      <LinearGradient colors={["rgba(255,255,255,0.8)", "rgba(240,240,240,0.6)"]} style={styles.background} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeContainer}>
          <View style={styles.titleContainer}>
            <GradientText
              text="Hello "
              colors={COLORS.primary.gradient}
              style={styles.welcomeTitle}
              start={GRADIENTS.horizontal.start}
              end={GRADIENTS.horizontal.end}
            />
            <GradientText
              text="Yankz"
              colors={[COLORS.primary.dark, COLORS.primary.oceanBlue950]}
              style={styles.username}
              start={GRADIENTS.horizontal.start}
              end={GRADIENTS.horizontal.end}
            />
            <GradientText
              text=" ;"
              colors={COLORS.primary.gradient}
              style={styles.welcomeTitle}
              start={GRADIENTS.horizontal.start}
              end={GRADIENTS.horizontal.end}
            />
          </View>
          <GradientText
            text="Welcome to your Personal Assistant!"
            colors={COLORS.primary.gradient}
            style={styles.welcomeSubtitle}
            start={GRADIENTS.horizontal.start}
            end={GRADIENTS.horizontal.end}
          />
        </View>

        <Text style={styles.highlightsTitle}>App Highlights:</Text>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>AI and Voice</Text>
          <View style={styles.bulletPointContainer}>
            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Activate your AI assistant with voice</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Say what you want to do</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>AI execute your wish</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>You get real time voice reply from AI</Text>
            </View>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Sentimental & Fundamental Analytics</Text>
          <View style={styles.bulletPointContainer}>
            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>We scour the internet and do</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Run sentimental analysis on your favorite crypto and stocks</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>If AI see an opportunity, it alerts you</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>You tell the AI if you want to trade the opportunity</Text>
            </View>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>How does it works?</Text>
          <View style={styles.bulletPointContainer}>
            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>We scour the internet and do</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Run sentimental analysis on your favorite crypto and stocks</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>If AI see an opportunity, it alerts you</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>You tell the AI if you want to trade the opportunity</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <GradientButton
          text="Let's go!"
          onPress={handleLetsGo}
          colors={COLORS.button.gradient}
          start={GRADIENTS.horizontal.start}
          end={GRADIENTS.horizontal.end}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding,
    paddingBottom: SIZES.spacing.xxl + 60, // Extra space for button
  },
  welcomeContainer: {
    marginTop: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.md,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  welcomeTitle: {
    fontSize: SIZES.font.xxl,
    fontFamily: FONTS.semiBold,
  },
  username: {
    fontSize: SIZES.font.xxl,
    fontFamily: FONTS.bold,
  },
  welcomeSubtitle: {
    fontSize: SIZES.font.xl,
    fontFamily: FONTS.bold,
    marginTop: SIZES.spacing.xs,
  },
  highlightsTitle: {
    fontSize: SIZES.font.xl,
    fontFamily: FONTS.bold,
    color: COLORS.primary.oceanBlue950,
    marginBottom: SIZES.spacing.xs,
  },
  featureCard: {
    backgroundColor: "white",
    borderRadius: SIZES.radius.medium,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: {
    fontSize: SIZES.font.lg,
    fontFamily: FONTS.bold,
    color: COLORS.primary.oceanBlue700,
    marginBottom: SIZES.spacing.sm,
  },
  bulletPointContainer: {
    marginLeft: SIZES.spacing.xs,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: SIZES.spacing.xs,
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: SIZES.font.md,
    fontFamily: FONTS.bold,
    color: COLORS.text.secondary,
    // width: 15,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: SIZES.font.md,
    fontFamily: FONTS.regular,
    color: COLORS.primary.oceanBlue950,
    lineHeight: SIZES.font.md * 1.3,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.padding,
    paddingBottom: Platform.OS === "ios" ? SIZES.spacing.lg : SIZES.spacing.md,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
});
