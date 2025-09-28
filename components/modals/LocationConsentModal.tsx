import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { COLORS } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LocationConsentModalProps {
  visible: boolean;
  onConsent: (granted: boolean) => void;
  onClose: () => void;
  userEmail?: string; // Add user email to track per user
}

/**
 * Modal component that informs users about location detection for compliance
 * and requests their consent before proceeding with IP geolocation.
 * Shows only once per user using AsyncStorage.
 */
const LocationConsentModal: React.FC<LocationConsentModalProps> = ({ visible, onConsent, onClose, userEmail }) => {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const router = useRouter();

  // Check if modal should be shown for this user
  useEffect(() => {
    const checkIfShouldShow = async () => {
      if (!visible || !userEmail) {
        setShouldShow(false);
        return;
      }

      try {
        const key = `locationConsent_${userEmail}`;
        const hasSeenModal = await AsyncStorage.getItem(key);

        if (hasSeenModal === null) {
          // User hasn't seen the modal before
          setShouldShow(true);
        } else {
          // User has seen the modal, check if they previously consented
          const consentData = JSON.parse(hasSeenModal);
          if (consentData.consented) {
            // User previously consented, auto-grant consent
            onConsent(true);
          }
          setShouldShow(false);
        }
      } catch (error) {
        console.error("Error checking location consent storage:", error);
        // On error, show the modal to be safe
        setShouldShow(true);
      }
    };

    checkIfShouldShow();
  }, [visible, userEmail, onConsent]);

  // Save consent decision to AsyncStorage
  const saveConsentDecision = async (granted: boolean) => {
    if (!userEmail) return;

    try {
      const key = `locationConsent_${userEmail}`;
      const consentData = {
        consented: granted,
        timestamp: new Date().toISOString(),
        version: "1.0", // For future updates to consent terms
      };

      await AsyncStorage.setItem(key, JSON.stringify(consentData));
      console.log(`Location consent saved for ${userEmail}: ${granted}`);
    } catch (error) {
      console.error("Error saving location consent:", error);
    }
  };

  // Auto-enable checkbox after a short delay to allow content to render
  useEffect(() => {
    const timer = setTimeout(() => {
      // If modal is visible and user hasn't manually interacted, check if scrolling is needed
      if (shouldShow && !hasReadTerms) {
        // This will be handled by the scroll detection in handleScroll
        // The timeout gives the content time to render properly
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [shouldShow, hasReadTerms]);

  // Reset checkbox state when modal opens
  useEffect(() => {
    if (shouldShow) {
      setHasReadTerms(false);
    }
  }, [shouldShow]);

  const handleConsent = async (granted: boolean) => {
    if (granted && !hasReadTerms) {
      Alert.alert("Please Read Terms", "Please scroll through and read the location detection terms before consenting.", [{ text: "OK" }]);
      return;
    }

    // Save the consent decision
    await saveConsentDecision(granted);

    onConsent(granted);
    onClose();
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    // More reliable scroll detection - consider user has reached the end if they're within 50px of the bottom
    const paddingToBottom = 50;
    const isScrolledToEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    // Also consider it scrolled to end if content is shorter than the container (no scrolling needed)
    const contentFitsInContainer = contentSize.height <= layoutMeasurement.height;

    if ((isScrolledToEnd || contentFitsInContainer) && !hasReadTerms) {
      setHasReadTerms(true);
    }
  };

  return (
    <Modal visible={shouldShow} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-xl w-11/12 max-h-4/5 p-5">
          {/* Header */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-primary-oceanBlue50 justify-center items-center mb-3">
              <Ionicons name="location" size={wp(8)} color={COLORS.primary.oceanBlue700} />
            </View>
            <Text className="text-xl text-gray-800 font-bold mb-2 text-center">Location Verification Required</Text>
            <Text className="text-sm text-gray-600 text-center">To comply with financial regulations, we need to verify your location.</Text>
          </View>

          {/* Scrollable Content */}
          <ScrollView className="flex-1 mb-4" showsVerticalScrollIndicator={true} onScroll={handleScroll} scrollEventThrottle={16}>
            <View className="space-y-4">
              <View>
                <Text className="text-base font-semibold text-gray-800 mb-2">Why We Need Your Location</Text>
                <Text className="text-sm text-gray-600 leading-5">
                  Financial regulations require us to verify that you are located in an authorized jurisdiction before creating a trading account.
                  This helps us:
                </Text>
                <View className="mt-2 space-y-1">
                  <Text className="text-sm text-gray-600">• Comply with securities regulations</Text>
                  <Text className="text-sm text-gray-600">• Prevent fraud and money laundering</Text>
                  <Text className="text-sm text-gray-600">• Ensure service availability in your region</Text>
                  <Text className="text-sm text-gray-600">• Meet KYC (Know Your Customer) requirements</Text>
                </View>
              </View>

              <View>
                <Text className="text-base font-semibold text-gray-800 mb-2">What Information We Collect</Text>
                <Text className="text-sm text-gray-600 leading-5">We will collect your IP address and derive the following information:</Text>
                <View className="mt-2 space-y-1">
                  <Text className="text-sm text-gray-600">• Country and region</Text>
                  <Text className="text-sm text-gray-600">• City (approximate)</Text>
                  <Text className="text-sm text-gray-600">• Internet Service Provider</Text>
                  <Text className="text-sm text-gray-600">• Network security indicators</Text>
                </View>
              </View>

              <View>
                <Text className="text-base font-semibold text-gray-800 mb-2">Security Detection</Text>
                <Text className="text-sm text-gray-600 leading-5">For compliance and security purposes, we may detect:</Text>
                <View className="mt-2 space-y-1">
                  <Text className="text-sm text-gray-600">• VPN usage</Text>
                  <Text className="text-sm text-gray-600">• Proxy servers</Text>
                  <Text className="text-sm text-gray-600">• Anonymous networks (like Tor)</Text>
                  <Text className="text-sm text-gray-600">• Suspicious network activity</Text>
                </View>
                <Text className="text-xs text-gray-500 mt-2 italic">
                  If these are detected, we may require additional verification steps or restrict access per our terms of service.
                </Text>
              </View>

              <View>
                <Text className="text-base font-semibold text-gray-800 mb-2">Data Privacy & Security</Text>
                <Text className="text-sm text-gray-600 leading-5">
                  • Your location data is encrypted and stored securely
                  {"\n"}• We only use this data for compliance and security purposes
                  {"\n"}• Data is retained as required by financial regulations
                  {"\n"}• We do not sell or share this data with third parties for marketing
                  {"\n"}• You can request deletion of this data subject to regulatory requirements
                </Text>
                <TouchableOpacity
                  className="mt-2"
                  onPress={() => {
                    onClose();
                    router.push("/investment/terms?section=privacy" as any);
                  }}
                >
                  <Text className="text-primary-oceanBlue700 text-sm underline">View full Privacy Policy →</Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text className="text-base font-semibold text-gray-800 mb-2">Your Rights</Text>
                <Text className="text-sm text-gray-600 leading-5">
                  • You can withdraw consent at any time (may affect service availability)
                  {"\n"}• You can request details about what data we collect
                  {"\n"}• You can file a complaint with relevant privacy authorities
                  {"\n"}• You can contact our support team with any questions
                </Text>
                <TouchableOpacity
                  className="mt-2"
                  onPress={() => {
                    onClose();
                    router.push("/investment/terms?section=location" as any);
                  }}
                >
                  <Text className="text-primary-oceanBlue700 text-sm underline">View detailed Location Terms →</Text>
                </TouchableOpacity>
              </View>

              <View className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <Text className="text-sm text-yellow-800 font-medium mb-1">⚠️ Important Notice</Text>
                <Text className="text-sm text-yellow-700">
                  Using VPNs, proxies, or location spoofing tools may violate our terms of service and prevent account creation. For the best
                  experience, please disable these tools during registration.
                </Text>
                <TouchableOpacity
                  className="mt-2"
                  onPress={() => {
                    onClose();
                    router.push("/investment/terms?section=trading" as any);
                  }}
                >
                  <Text className="text-yellow-800 text-sm underline font-medium">View Trading Terms & Conditions →</Text>
                </TouchableOpacity>
              </View>

              <View className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <Text className="text-sm text-blue-800 font-medium mb-1">🔒 Your Privacy Matters</Text>
                <Text className="text-sm text-blue-700">
                  We are committed to protecting your privacy while meeting our legal obligations. This location verification is required by law for
                  financial services.
                </Text>
                <TouchableOpacity
                  className="mt-2"
                  onPress={() => {
                    onClose();
                    router.push("/investment/terms?section=compliance" as any);
                  }}
                >
                  <Text className="text-blue-800 text-sm underline font-medium">View Regulatory Compliance →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Full Terms Link */}
          <TouchableOpacity
            className="mb-4"
            onPress={() => {
              onClose();
              router.push("/investment/terms" as any);
            }}
          >
            <Text className="text-primary-oceanBlue700 text-sm underline text-center">View Full Terms & Conditions</Text>
          </TouchableOpacity>

          {/* Consent Indicator */}
          <TouchableOpacity
            className="flex-row items-center mb-4"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setHasReadTerms(!hasReadTerms);
            }}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: hasReadTerms }}
            accessibilityLabel="I have read and understand the location detection terms"
          >
            <View
              className={`w-5 h-5 rounded border ${
                hasReadTerms ? "bg-green-500 border-green-500" : "border-gray-400"
              } mr-3 items-center justify-center`}
            >
              {hasReadTerms && <Ionicons name="checkmark" size={wp(3)} color="white" />}
            </View>
            <Text className="text-sm text-gray-600 flex-1">
              I have read and understand the location detection terms
              {!hasReadTerms && " (please scroll to the bottom or check this box)"}
            </Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View className="space-y-3">
            <TouchableOpacity
              className={`py-3 rounded-lg flex-row justify-center items-center ${hasReadTerms ? "bg-primary-oceanBlue700" : "bg-gray-300"}`}
              onPress={() => handleConsent(true)}
              disabled={!hasReadTerms}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white font-semibold">I Consent to Location Verification</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-100 py-3 rounded-lg flex-row justify-center items-center" onPress={() => handleConsent(false)}>
              <Ionicons name="close-circle" size={20} color="#666" style={{ marginRight: 8 }} />
              <Text className="text-gray-700 font-semibold">Decline (Cannot Proceed)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LocationConsentModal;
