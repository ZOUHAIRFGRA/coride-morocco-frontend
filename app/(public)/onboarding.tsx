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

const slides = [
  {
    id: "1",
    title: "FIND YOUR RIDE",
    title2: "TRIBE",
    description: "Connect with fellow commuters on your route and build lasting carpooling relationships in Morocco.",
    image: require("@assets/images/onboarding/ride-matching.png"),
  },
  {
    id: "2",
    title: "SPLIT COSTS", 
    title2: "SAVE MONEY",
    description: "Share fuel costs, reduce your commuting expenses, and make transportation affordable for everyone.",
    image: require("@assets/images/onboarding/cost-sharing.png"),
  },
  {
    id: "3",
    title: "TRAJECTORY",
    title2: "TRIBES",
    description: "Join route-specific communities, share local insights, and make your daily commute more social and fun.",
    image: require("@assets/images/onboarding/community.png"),
  },
  {
    id: "4",
    title: "SAFE TRAVEL",
    title2: "TOGETHER",
    description: "Verified profiles, ratings, and secure payments ensure every ride is safe and trustworthy for all passengers.",
    image: require("@assets/images/onboarding/safety.png"),
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
        {slides.map((_, index) => (
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
    if (currentIndex < slides.length - 1) {
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
        {/* TODO: Replace with CoRide Morocco logo */}
        <Image source={require("@assets/images/logo/coride_blue_1024.png")} style={styles.logo} resizeMode="contain" />
        <FlatList
          ref={flatListRef}
          data={slides}
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
            {currentIndex < slides.length - 1 ? (
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
    marginBottom: hp(2),
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
    marginBottom: hp(0),
    maxWidth: "80%",
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: hp(8), // Add spacing between image and bottom navigation
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
