import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS, FONTS } from "@/constants/theme";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { GradientButton } from "@/components/ui/buttons/GradientButton";
import { moderateScale, verticalScale, responsiveFontSize, horizontalScale } from "@utils/responsive";
import * as Haptics from "expo-haptics";
import OnboardingStepIndicator from "@/components/ui/OnboardingStepIndicator";
import { useFomoPopup } from "@/hooks/useFomoPopup";
import KycFormModal from "@/components/modals/KycFormModal";
import PlaidModal from "@/components/modals/PlaidModal";
import ConnectBankModal from "@/components/modals/ConnectBankModal";
import { useCreateAlpacaAccountMutation } from "@/redux/investment/investmentEndpoints";
import { CreateAlpacaAccountInput } from "@/redux/investment/investmentTypes";
import { useAppSelector } from "@/redux/hooks";
import SafeAreaWrapper from "@/components/ui/SafeAreaWrapper";

/**
 * Onboarding Screen - Shows step-by-step progress for KYC, Bank Connection, and Fund Account
 */
const OnboardingScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Check if coming back from successful transfer
  const transferSuccess = params.transferSuccess === "true";
  const transferAmount = params.transferAmount as string;
  const transferType = params.transferType as string;

  // Get onboarding data from the hook
  const { hasCompletedKyc, hasBankConnections, hasFundedAccount, getOnboardingSteps, handleStartTradingAndNavigate, alpacaAccount, refetchAlpacaAccount } = useFomoPopup();

  // Get user data for email (needed for Plaid)
  const userState = useAppSelector((state) => state.user.user);

  // Get the steps with current status
  const onboardingSteps = getOnboardingSteps();

  // Modal states
  const [showKycModal, setShowKycModal] = useState(false);
  const [showPlaidModal, setShowPlaidModal] = useState(false);
  const [showManualBankModal, setShowManualBankModal] = useState(false);
  const [showTransferConfirmation, setShowTransferConfirmation] = useState(false);

  // Create Alpaca account mutation
  const [createAlpacaAccount, { isLoading: isCreatingAccount }] = useCreateAlpacaAccountMutation();

  // Show transfer confirmation modal if coming from successful transfer
  useEffect(() => {
    if (transferSuccess) {
      setShowTransferConfirmation(true);

      // Auto-close after 5 seconds and navigate to investment screen
      const autoCloseTimer = setTimeout(() => {
        setShowTransferConfirmation(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/investment/(tabs)/investment");
      }, 5000); // 5 seconds to let user read the success message

      // Cleanup timer on component unmount or if modal is manually closed
      return () => clearTimeout(autoCloseTimer);
    }
  }, [transferSuccess, router]);

  // Auto-progress to next step when KYC is completed
  useEffect(() => {
    console.log("🔍 Onboarding - useEffect triggered - hasCompletedKyc:", hasCompletedKyc(), "showKycModal:", showKycModal);
    
    if (hasCompletedKyc() && !showKycModal) {
      console.log("🔍 Onboarding - KYC completed, auto-progressing to bank connection step");
      // The flow will automatically show step 2 (bank connection) 
      // because hasCompletedKyc() now returns true and getCurrentStep() will return the bank step
    }
  }, [hasCompletedKyc, showKycModal]);

  // Debug modal state
  useEffect(() => {
    console.log("Modal state changed, showKycModal:", showKycModal);
  }, [showKycModal]);

  // Handle back navigation
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Check if user is from US based on KYC data
  const isUSUser = () => {
    // Parse the extraInfo to get country information
    if (!alpacaAccount?.extraInfo) return true; // Default to US if no data
    
    try {
      const extraInfo = JSON.parse(alpacaAccount.extraInfo);
      return extraInfo.country === "USA";
    } catch (error) {
      console.error("Error parsing extraInfo:", error);
      return true; // Default to US
    }
  };

  // Handle continue button - proceed to next step
  const handleContinue = () => {
    // Prevent rapid clicks that might cause freezing
    if (showKycModal || showPlaidModal || showManualBankModal) {
      console.log("Modal already open, ignoring click");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("handleContinue called, hasCompletedKyc:", hasCompletedKyc(), "hasBankConnections:", hasBankConnections());

    // Navigate based on current step status
    if (!hasCompletedKyc()) {
      // KYC not complete, show KYC form modal
      console.log("Setting showKycModal to true");
      setShowKycModal(true);
    } else if (!hasBankConnections()) {
      // KYC complete but no bank connected, proceed to bank connection
      if (isUSUser()) {
        // US user - show Plaid modal
        setShowPlaidModal(true);
      } else {
        // Non-US user - show manual bank connection modal
        setShowManualBankModal(true);
      }
    } else {
      // Both KYC and bank connection are complete, proceed to fund step
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push("/investment/fund-account");
    }
  };

  console.log("hasBankConnections: ", hasBankConnections());

  // Handle KYC form submission
  const handleKycSubmit = async (formData: CreateAlpacaAccountInput) => {
    console.log("🔍 Onboarding - handleKycSubmit called with formData:", formData);
    
    // Close KYC modal
    setShowKycModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // The FormModal now handles the API call internally
    // We can access the additional fields here if needed for local storage or other purposes
    console.log("🔍 Onboarding - KYC form submitted with data:", formData);
    
    // Note: The actual Alpaca account creation is handled by FormModal
    // Additional fields like investmentExperience, annualIncome, netWorth, riskTolerance
    // are collected for user experience but not sent to the Alpaca backend
    
    // Refetch Alpaca account data to update the status
    try {
      console.log("🔍 Onboarding - Refetching Alpaca account data...");
      await refetchAlpacaAccount();
      console.log("🔍 Onboarding - Alpaca account data refetched");
      
      // Check the current status
      console.log("🔍 Onboarding - Current hasCompletedKyc status:", hasCompletedKyc());
      console.log("🔍 Onboarding - Current alpacaAccount alpacaStatus:", alpacaAccount?.alpacaStatus);
    } catch (error) {
      console.error("🔍 Onboarding - Error refetching Alpaca account data:", error);
    }
  };

  // Handle KYC modal close
  const handleKycClose = () => {
    setShowKycModal(false);
  };

  // Handle Plaid modal close
  const handlePlaidClose = () => {
    setShowPlaidModal(false);
  };

  // Handle Plaid success - proceed to next step
  const handlePlaidSuccess = () => {
    console.log(`🔍 Onboarding [${new Date().toISOString()}] - handlePlaidSuccess called`);
    setShowPlaidModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    console.log(`🔍 Onboarding [${new Date().toISOString()}] - Checking if user has funded account...`);
    // Check if user has funded their account
    if (hasFundedAccount()) {
      console.log(`🔍 Onboarding [${new Date().toISOString()}] - Account already funded, navigating to investment screen`);
      // Account is already funded, go directly to investment screen
      router.push("/investment/(tabs)/investment");
    } else {
      console.log(`🔍 Onboarding [${new Date().toISOString()}] - Account not funded, navigating to fund account step`);
      // Follow proper onboarding flow - go to fund account step
      router.push("/investment/fund-account");
    }
  };

  // Handle manual bank modal close
  const handleManualBankClose = () => {
    setShowManualBankModal(false);
  };

  // Handle manual bank connection success - proceed to next step
  const handleManualBankSuccess = () => {
    setShowManualBankModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Check if user has funded their account
    if (hasFundedAccount()) {
      // Account is already funded, go directly to investment screen
      router.push("/investment/(tabs)/investment");
    } else {
      // Follow proper onboarding flow - go to fund account step
      router.push("/investment/fund-account");
    }
  };

  // Handle transfer confirmation modal close
  const handleTransferConfirmationClose = () => {
    setShowTransferConfirmation(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Close the entire onboarding screen since transfer is complete
    router.replace("/investment/(tabs)/investment");
  };

  // Handle start trading after successful transfer
  const handleStartTrading = () => {
    setShowTransferConfirmation(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Close onboarding screen and navigate to investment screen
    router.replace("/investment/(tabs)/investment");
  };

  // Handle view portfolio after successful transfer
  const handleViewPortfolio = () => {
    setShowTransferConfirmation(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Close onboarding screen and navigate to investment screen
    router.replace("/investment/(tabs)/investment");
  };

  // Get current active step
  const getCurrentStep = () => {
    if (!hasCompletedKyc()) {
      return onboardingSteps.find((step) => step.id === "kyc") || onboardingSteps[0];
    } else if (!hasBankConnections()) {
      return onboardingSteps.find((step) => step.id === "bank") || onboardingSteps[1];
    } else {
      // Both KYC and bank are complete, show fund step
      return onboardingSteps.find((step) => step.id === "fund") || onboardingSteps[2];
    }
  };

  const currentStep = getCurrentStep();

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
          Get Started
        </Text>
        <View style={{ width: moderateScale(40) }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: horizontalScale(24),
          paddingBottom: verticalScale(40),
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Progress Steps */}
        <View>
          <OnboardingStepIndicator steps={onboardingSteps} currentStepId={currentStep.id} />
        </View>

        {/* All Steps Details */}
        <View className="mt-6">
          {onboardingSteps.map((step, index) => {
              const isActive = step.id === currentStep.id;
              const isCompleted = step.status === "completed";
              const isPending = step.status === "pending";

              // Get step-specific content
              const getStepContent = () => {
                switch (step.id) {
                  case "kyc":
                    return {
                      stepNumber: 1,
                      icon: "person-outline",
                      description:
                        "We need to verify your identity to ensure secure trading and comply with financial regulations. This process is quick and secure.",
                      benefits: [
                        { icon: "shield-checkmark", text: "Bank-level security" },
                        { icon: "flash", text: "Quick 2-minute setup" },
                        { icon: "lock-closed", text: "Encrypted & private" },
                      ],
                    };
                  case "bank":
                    return {
                      stepNumber: 2,
                      icon: "flowbite:landmark-outline",
                      description:
                        "Connect your bank account to enable seamless trading and transfers. Choose between Plaid (US) or manual connection (International).",
                      benefits: [
                        { icon: "link", text: "Secure bank linking" },
                        { icon: "globe", text: "US & International support" },
                        { icon: "refresh", text: "Instant account sync" },
                      ],
                    };
                  case "fund":
                    return {
                      stepNumber: 3,
                      icon: "wallet-outline",
                      description:
                        "Add money to your account to start trading. Choose ACH (US users) or WIRE transfer (International users) from your connected bank.",
                      benefits: [
                        { icon: "cash", text: "Multiple transfer options" },
                        { icon: "time", text: "Fast processing" },
                        { icon: "trending-up", text: "Start trading immediately" },
                      ],
                    };
                  default:
                    return {
                      icon: "checkmark-circle-outline",
                      description: "Complete this step to continue",
                      benefits: [],
                    };
                }
              };

              const stepContent = getStepContent();
              // Calculate correct step number (1, 2, 3)
              const stepNumber = index + 1;

              return (
                <View
                  key={step.id}
                  className={`mb-4 rounded-2xl p-5 border-l-4 ${
                    isCompleted ? "bg-green-50 border-green-500" : isActive ? "bg-blue-50 border-blue-500" : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <View className="flex-row items-center mb-3">
                    <View
                      className="justify-center items-center rounded-full mr-3"
                      style={{
                        width: moderateScale(32),
                        height: moderateScale(32),
                        backgroundColor: isCompleted ? COLORS.success.light : isActive ? COLORS.primary.light : "#999",
                      }}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={wp(5)} color="#FFFFFF" />
                      ) : (
                        <Text
                          style={{
                            fontSize: responsiveFontSize(16),
                            fontFamily: FONTS.bold,
                            color: "#FFFFFF",
                          }}
                        >
                          {stepContent.stepNumber}
                        </Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text
                        style={{
                          fontSize: responsiveFontSize(18),
                          fontFamily: FONTS.semiBold,
                          color: COLORS.text.primary,
                        }}
                      >
                        {step.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(13),
                          fontFamily: FONTS.regular,
                          color: isCompleted ? COLORS.success.light : isActive ? COLORS.primary.light : COLORS.text.secondary,
                        }}
                      >
                        {isCompleted ? "Completed" : isActive ? "Active" : "Pending"}
                      </Text>
                    </View>
                    <Ionicons
                      name={stepContent.icon as any}
                      size={wp(6)}
                      color={isCompleted ? COLORS.success.light : isActive ? COLORS.primary.light : "#999"}
                    />
                  </View>

                  <Text
                    className="mb-4"
                    style={{
                      fontSize: responsiveFontSize(15),
                      fontFamily: FONTS.regular,
                      color: COLORS.text.secondary,
                      lineHeight: verticalScale(22),
                    }}
                  >
                    {stepContent.description}
                  </Text>

                  {/* Step Benefits */}
                  <View style={{ gap: verticalScale(8) }}>
                    {stepContent.benefits.map((benefit, benefitIndex) => (
                      <View key={benefitIndex} className="flex-row items-center">
                        <Ionicons
                          name={benefit.icon as any}
                          size={wp(4.5)}
                          color={isCompleted ? COLORS.success.light : isActive ? COLORS.primary.light : "#999"}
                        />
                        <Text
                          className="ml-2"
                          style={{
                            fontSize: responsiveFontSize(14),
                            fontFamily: FONTS.regular,
                            color: COLORS.text.primary,
                          }}
                        >
                          {benefit.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View className="px-6 py-2 border-t border-gray-100 bg-white">
        <GradientButton
          onPress={handleContinue}
          text={!hasCompletedKyc() ? "Complete Identity Verification" : !hasBankConnections() ? "Connect Bank Account" : "Fund Account"}
          colors={COLORS.primary.gradient}
          style={{
            marginBottom: verticalScale(12),
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
          className="text-center mb-3"
          style={{
            fontSize: responsiveFontSize(13),
            fontFamily: FONTS.regular,
            color: COLORS.text.tertiary,
          }}
        >
          🔒 Your information is encrypted and secure
        </Text>
      </View>

      {/* KYC Form Modal */}
      <KycFormModal visible={showKycModal} onClose={handleKycClose} onSubmit={handleKycSubmit} isLoading={isCreatingAccount} />

      {/* Plaid Modal for US users */}
      <PlaidModal 
        visible={showPlaidModal} 
        email={userState?.email || ""} 
        onClose={handlePlaidClose} 
        onSuccess={handlePlaidSuccess} 
        moduleKey="trading" 
      />

      {/* Manual Bank Connection Modal for non-US users */}
      <ConnectBankModal visible={showManualBankModal} onClose={handleManualBankClose} onSuccess={handleManualBankSuccess} />

      {/* Transfer Confirmation Modal */}
      <Modal visible={showTransferConfirmation} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-2xl w-full max-w-md p-6">
            {/* Success Icon */}
            <View className="items-center mb-6">
              <View
                className="justify-center items-center rounded-full mb-4"
                style={{
                  width: moderateScale(80),
                  height: moderateScale(80),
                  backgroundColor: COLORS.success.light,
                }}
              >
                <Ionicons name="checkmark" size={wp(10)} color="#FFFFFF" />
              </View>

              <Text
                className="text-center mb-2"
                style={{
                  fontSize: responsiveFontSize(24),
                  fontFamily: FONTS.bold,
                  color: COLORS.text.primary,
                }}
              >
                Transfer Initiated!
              </Text>

              <Text
                className="text-center"
                style={{
                  fontSize: responsiveFontSize(16),
                  fontFamily: FONTS.regular,
                  color: COLORS.text.secondary,
                  lineHeight: verticalScale(24),
                }}
              >
                Your {transferType || "ACH"} transfer of ${transferAmount || "0.00"} has been successfully initiated.
              </Text>
            </View>

            {/* Transfer Details */}
            <View className="bg-gray-50 rounded-xl p-4 mb-6">
              <Text
                className="mb-3"
                style={{
                  fontSize: responsiveFontSize(16),
                  fontFamily: FONTS.semiBold,
                  color: COLORS.text.primary,
                }}
              >
                What happens next?
              </Text>

              <View style={{ gap: verticalScale(12) }}>
                <View className="flex-row items-start">
                  <View
                    className="justify-center items-center rounded-full mr-3 mt-1"
                    style={{
                      width: moderateScale(20),
                      height: moderateScale(20),
                      backgroundColor: COLORS.primary.light,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: responsiveFontSize(12),
                        fontFamily: FONTS.bold,
                        color: "#FFFFFF",
                      }}
                    >
                      1
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{
                        fontSize: responsiveFontSize(14),
                        fontFamily: FONTS.semiBold,
                        color: COLORS.text.primary,
                      }}
                    >
                      Processing Transfer
                    </Text>
                    <Text
                      style={{
                        fontSize: responsiveFontSize(13),
                        fontFamily: FONTS.regular,
                        color: COLORS.text.secondary,
                      }}
                    >
                      Your funds are being transferred and will be available in 1-3 business days
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start">
                  <View
                    className="justify-center items-center rounded-full mr-3 mt-1"
                    style={{
                      width: moderateScale(20),
                      height: moderateScale(20),
                      backgroundColor: COLORS.primary.light,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: responsiveFontSize(12),
                        fontFamily: FONTS.bold,
                        color: "#FFFFFF",
                      }}
                    >
                      2
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{
                        fontSize: responsiveFontSize(14),
                        fontFamily: FONTS.semiBold,
                        color: COLORS.text.primary,
                      }}
                    >
                      Start Trading
                    </Text>
                    <Text
                      style={{
                        fontSize: responsiveFontSize(13),
                        fontFamily: FONTS.regular,
                        color: COLORS.text.secondary,
                      }}
                    >
                      Once funds arrive, you can start investing in stocks and ETFs
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start">
                  <View
                    className="justify-center items-center rounded-full mr-3 mt-1"
                    style={{
                      width: moderateScale(20),
                      height: moderateScale(20),
                      backgroundColor: COLORS.primary.light,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: responsiveFontSize(12),
                        fontFamily: FONTS.bold,
                        color: "#FFFFFF",
                      }}
                    >
                      3
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{
                        fontSize: responsiveFontSize(14),
                        fontFamily: FONTS.semiBold,
                        color: COLORS.text.primary,
                      }}
                    >
                      Track Progress
                    </Text>
                    <Text
                      style={{
                        fontSize: responsiveFontSize(13),
                        fontFamily: FONTS.regular,
                        color: COLORS.text.secondary,
                      }}
                    >
                      Monitor your investments and portfolio performance
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ gap: verticalScale(12) }}>
              <GradientButton
                onPress={handleStartTrading}
                text="Start Trading"
                colors={COLORS.primary.gradient}
                style={{
                  shadowColor: COLORS.primary.light,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                textStyle={{
                  fontSize: responsiveFontSize(16),
                  fontWeight: "700",
                }}
              />

              <TouchableOpacity className="py-3 border border-gray-200 rounded-xl" onPress={handleViewPortfolio}>
                <Text
                  className="text-center"
                  style={{
                    fontSize: responsiveFontSize(16),
                    fontFamily: FONTS.semiBold,
                    color: COLORS.text.primary,
                  }}
                >
                  View Portfolio
                </Text>
              </TouchableOpacity>
            </View>

            {/* Close Button */}
            <TouchableOpacity className="absolute top-4 right-4 p-2" onPress={handleTransferConfirmationClose}>
              <Ionicons name="close" size={wp(6)} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </SafeAreaWrapper>
  );
};

export default OnboardingScreen;
