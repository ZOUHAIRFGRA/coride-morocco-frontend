import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, FONTS } from "@/constants/theme";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { GradientButton } from "@/components/ui/buttons/GradientButton";
import { moderateScale, verticalScale, responsiveFontSize, horizontalScale } from "@utils/responsive";
import * as Haptics from "expo-haptics";
import SafeAreaWrapper from "@/components/ui/SafeAreaWrapper";

/**
 * Simple Onboarding Screen for CoRide Morocco
 */
const OnboardingScreen = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Simple onboarding steps for CoRide Morocco
  const onboardingSteps = [
    {
      id: "profile",
      title: "Create Your Profile",
      description: "Add your photo and basic info to build trust with other riders in the CoRide community.",
      icon: "person-outline",
    },
    {
      id: "location", 
      title: "Setup Your Routes",
      description: "Enable location access to find rides on your daily trajectories and connect with nearby commuters.",
      icon: "location-outline",
    },
    {
      id: "community",
      title: "Join Your Tribe", 
      description: "Join or create Trajectory Tribes for your routes to share rides, costs, and local travel tips.",
      icon: "people-outline",
    },
  ];

  // Get benefits for each step
  const getBenefitsForStep = (step: number) => {
    switch (step) {
      case 0:
        return [
          "Build trust with verified identity",
          "Get higher ride acceptance rates", 
          "Join the CoRide community safely"
        ];
      case 1:
        return [
          "Find rides on your exact route",
          "Get real-time ride notifications",
          "Connect with nearby commuters"
        ];
      case 2:
        return [
          "Join route-specific communities",
          "Share travel costs with others",
          "Access local traffic tips and updates"
        ];
      default:
        return [];
    }
  };

  // Handle back navigation
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Handle continue to next step
  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completed all steps - navigate to main app
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(main)");
    }
  };

  // Handle skip onboarding
  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(main)");
  };

  return (
    <SafeAreaWrapper>
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar backgroundColor={COLORS.background.white} barStyle="dark-content" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
          <TouchableOpacity className="p-2" onPress={handleBack}>
            <Ionicons name="chevron-back" size={wp(6)} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text
            className="text-center"
            style={{
              fontSize: responsiveFontSize(18),
              fontFamily: FONTS.semiBold,
              color: COLORS.text.primary,
            }}
          >
            Setup Your Profile
          </Text>
          <TouchableOpacity className="p-2" onPress={handleSkip}>
            <Text
              style={{
                fontSize: responsiveFontSize(14),
                fontFamily: FONTS.semiBold,
                color: COLORS.primary.light,
              }}
            >
              Skip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text
              style={{
                fontSize: responsiveFontSize(14),
                fontFamily: FONTS.semiBold,
                color: COLORS.text.secondary,
              }}
            >
              Step {currentStep + 1} of {onboardingSteps.length}
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(14),
                fontFamily: FONTS.semiBold,
                color: COLORS.text.secondary,
              }}
            >
              {Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%
            </Text>
          </View>
          <View className="w-full h-2 bg-gray-200 rounded-full">
            <View
              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / onboardingSteps.length) * 100}%`,
              }}
            />
          </View>
        </View>

        {/* Current Step Content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: horizontalScale(24),
            paddingBottom: verticalScale(40),
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-8">
            {/* Step Icon */}
            <View
              className="justify-center items-center rounded-full mb-6"
              style={{
                width: moderateScale(100),
                height: moderateScale(100),
                backgroundColor: COLORS.primary.light + "20",
              }}
            >
              <Ionicons
                name={onboardingSteps[currentStep].icon as any}
                size={wp(12)}
                color={COLORS.primary.light}
              />
            </View>

            {/* Step Title */}
            <Text
              className="text-center mb-4"
              style={{
                fontSize: responsiveFontSize(28),
                fontFamily: FONTS.bold,
                color: COLORS.text.primary,
              }}
            >
              {onboardingSteps[currentStep].title}
            </Text>

            {/* Step Description */}
            <Text
              className="text-center leading-relaxed"
              style={{
                fontSize: responsiveFontSize(16),
                fontFamily: FONTS.regular,
                color: COLORS.text.secondary,
                lineHeight: verticalScale(24),
                maxWidth: "90%",
              }}
            >
              {onboardingSteps[currentStep].description}
            </Text>
          </View>

          {/* Benefits List */}
          <View className="bg-gray-50 rounded-2xl p-6">
            <Text
              className="mb-4"
              style={{
                fontSize: responsiveFontSize(18),
                fontFamily: FONTS.semiBold,
                color: COLORS.text.primary,
              }}
            >
              Why this matters:
            </Text>
            {getBenefitsForStep(currentStep).map((benefit, index) => (
              <View key={index} className="flex-row items-center mb-3">
                <View
                  className="justify-center items-center rounded-full mr-3"
                  style={{
                    width: moderateScale(24),
                    height: moderateScale(24),
                    backgroundColor: COLORS.success.light,
                  }}
                >
                  <Ionicons name="checkmark" size={wp(4)} color="#FFFFFF" />
                </View>
                <Text
                  className="flex-1"
                  style={{
                    fontSize: responsiveFontSize(14),
                    fontFamily: FONTS.regular,
                    color: COLORS.text.primary,
                  }}
                >
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View className="px-6 py-4 border-t border-gray-100 bg-white">
          <GradientButton
            onPress={handleContinue}
            text={currentStep === onboardingSteps.length - 1 ? "Get Started" : "Continue"}
            colors={COLORS.primary.gradient}
            style={{
              shadowColor: COLORS.primary.light,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
            textStyle={{
              fontSize: responsiveFontSize(18),
              fontWeight: "700",
            }}
          />

          <Text
            className="text-center mt-4"
            style={{
              fontSize: responsiveFontSize(13),
              fontFamily: FONTS.regular,
              color: COLORS.text.tertiary,
            }}
          >
            🚗 Join thousands of commuters carpooling in Morocco
          </Text>
        </View>
      </SafeAreaView>
    </SafeAreaWrapper>
  );
};

export default OnboardingScreen;
