import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, Image, ImageBackground, StatusBar, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import * as SplashScreen from "expo-splash-screen";
import { GradientText } from "@/components/ui/texts/GradientText";
import { GradientButton } from "@/components/ui/buttons/GradientButton";
import { COLORS, FONTS, SIZES, GRADIENTS } from "@constants/theme";
import { s, vs } from "@utils/responsive";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import SafeAreaWrapper from "@/components/ui/SafeAreaWrapper";

const { width, height } = Dimensions.get("window");

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

const onboardingData = [
  {
    id: "1",
    title: "VOICE CONTROL",
    title2: "AI ASSISTANT",
    description: "Execute trades using only your voice",
    image: require("@assets/images/onboarding/voice-control.png"),
  },
  {
    id: "2",
    title: "USE AUTOMATION",
    title2: "GET RICH FASTER",
    description: "AI gives you best market opportunities",
    image: require("@assets/images/onboarding/automation.png"),
  },
  {
    id: "3",
    title: "LEARN TO SPEND",
    title2: "BETTER",
    description: "With spending limits & smart budget tips",
    image: require("@assets/images/onboarding/finance.png"),
  },
  {
    id: "4",
    title: "YOUR FINANCE ONE",
    title2: "PLACE",
    description: "Manage your investments, bank accounts & credit cards in one app",
    image: require("@assets/images/onboarding/spend.png"),
  },
];

interface OnboardingItem {
  id: string;
  title: string;
  title2: string;
  description: string;
  image: any;
}

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  React.useEffect(() => {
    const hideSplash = async () => {
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync().catch(() => {
          /* ignore error */
        });
      }
    };
    hideSplash();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: currentIndex === index ? "#00B4DB" : "#E0E0E0",
                width: currentIndex === index ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const renderItem = ({ item }: { item: OnboardingItem }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.titleContainer}>
          <GradientText text={item.title} style={styles.title} colors={COLORS.primary.gradient} {...GRADIENTS.diagonalReverse} />
          <GradientText text={item.title2} style={styles.title} colors={COLORS.primary.gradient} {...GRADIENTS.diagonalReverse} />
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>
    );
  };

  return (
    <SafeAreaWrapper>
      <Stack.Screen
        options={{
          headerShown: false,
          // statusBarStyle: "dark",
          // statusBarBackgroundColor: "transparent",
          // statusBarTranslucent: true,
        }}
      />
      <ImageBackground
        source={require("@assets/images/background/background_1.png")}
        style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}
      >
        <Image source={require("@assets/images/logo/voxprofit_blue_1024.png")} style={styles.logo} resizeMode="contain" />
        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(newIndex);
          }}
          keyExtractor={(item) => item.id}
        />
        {renderDots()}
        <View style={styles.navigationContainer}>
          <View style={styles.navigationButtons}>
            {currentIndex > 0 ? (
              <TouchableOpacity style={styles.navButton} onPress={handleBack}>
                <Text style={styles.navButtonText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.navButtonPlaceholder} />
            )}
            {currentIndex < onboardingData.length - 1 ? (
              <TouchableOpacity style={styles.navButton} onPress={handleNext}>
                <Text style={styles.navButtonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.navButtonPlaceholder} />
            )}
          </View>
          <View style={styles.buttonContainer}>
            <GradientButton
              text="Sign Up"
              onPress={() =>
                router.push({
                  pathname: "/(auth)/sign-up",
                  params: { slideUp: "true" },
                })
              }
              colors={COLORS.primary.gradient}
              {...GRADIENTS.diagonalReverse}
            />
            <GradientButton
              text="I already have an account"
              onPress={() =>
                router.push({
                  pathname: "/(auth)/sign-in",
                  params: { slideUp: "true" },
                })
              }
              variant="outlined"
              colors={COLORS.primary.gradient}
              {...GRADIENTS.diagonalReverse}
            />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.white,
  },
  slide: {
    width,
    alignItems: "center",
    paddingTop: hp(6),
    paddingHorizontal: wp(4),
  },
  logo: {
    marginTop: hp(4),
    alignSelf: "center",
    width: wp("20%"),
    height: hp("10%"),
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: hp(4),
    height: hp(5),
    justifyContent: "center",
  },
  title: {
    fontSize: hp(4.5),
    fontFamily: FONTS.bold,
    textAlign: "center",
    lineHeight: hp(5),
  },
  description: {
    fontSize: hp(2),
    fontFamily: FONTS.regular,
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: hp(3),
    maxWidth: "80%",
  },
  image: {
    width: 250,
    height: 250,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: vs(5),
    marginTop: "auto",
  },
  dot: {
    height: vs(10),
    borderRadius: s(4),
    marginHorizontal: s(4),
  },
  navigationContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: vs(20),
  },
  navButton: {
    paddingVertical: vs(10),
    paddingHorizontal: s(20),
  },
  navButtonText: {
    color: COLORS.primary.text,
    fontSize: SIZES.font.md,
    fontFamily: FONTS.semiBold,
  },
  navButtonPlaceholder: {
    width: s(80),
  },
  buttonContainer: {
    gap: vs(16),
  },
});
