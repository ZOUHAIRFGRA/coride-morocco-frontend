import React from "react";
import { View, Text, Modal, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useRouter } from "expo-router";
import StocksSvg from "@/assets/images/icons/StocksSvg";

/**
 * Props for TradingProfilePromptModal
 */
type TradingProfilePromptModalProps = {
  visible: boolean;
  onClose: () => void;
  onSkip: () => void;
  missingFields?: string[];
  actionType?: "BUY" | "SELL";
  isFirstTimeLogin?: boolean;
};

/**
 * Modal for prompting users to complete their trading profile
 * Shows missing fields and provides options to complete or skip
 * Can also be used for first-time login onboarding
 */
const TradingProfilePromptModal: React.FC<TradingProfilePromptModalProps> = ({
  visible,
  onClose,
  onSkip,
  missingFields = [],
  actionType,
  isFirstTimeLogin = false,
}) => {
  const router = useRouter();

  // Handle platform selection
  const handlePlatformSelect = (platform: string) => {
    onClose();
    // Navigate to the appropriate profile creation page
    setTimeout(() => {
      if (platform === "alpaca") {
        router.push("/investment/create-alpaca-profile" as any);
      } else if (platform === "binance") {
        router.push("/investment/create-binance-profile" as any);
      }
    }, 500);
  };

  // Handle skip action
  const handleSkipAction = () => {
    const skipMessage = isFirstTimeLogin
      ? "You can explore the app and browse investment insights, but you'll need to complete your trading profile to execute trades."
      : "You can still browse investment insights, but you won't be able to execute trades until your profile is complete.";

    Alert.alert(isFirstTimeLogin ? "Skip Profile Setup" : "Skip Profile Completion", skipMessage, [
      {
        text: "Go Back",
        style: "cancel",
      },
      {
        text: "Skip Anyway",
        onPress: () => {
          onClose();
          setTimeout(() => {
            onSkip();
          }, 500);
        },
      },
    ]);
  };

  // Dynamic content based on context
  const getHeaderText = () => {
    return "Complete Your Trading Profile";
  };

  const getSubText = () => {
    if (isFirstTimeLogin) {
      return "Complete your trading profile to start investing in stocks and cryptocurrencies.";
    }
    if (actionType) {
      const hasMultipleMissingFields = missingFields.length > 1;
      return `To ${actionType.toLowerCase()} stocks, you need to complete your trading profile.${
        hasMultipleMissingFields ? " Several fields are missing:" : " The following field is missing:"
      }`;
    }
    return "Complete your trading profile to start trading.";
  };

  const getIconName = () => {
    "warning";
  };

  const hasMultipleMissingFields = missingFields.length > 1;
  const displayFields = missingFields.slice(0, 3); // Show max 3 fields
  const hasMoreFields = missingFields.length > 3;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-xl w-5/6 p-5">
          {/* Header with Icon */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-primary-oceanBlue50 justify-center items-center mb-3">
              <Ionicons name={"warning"} size={wp(8)} color={COLORS.primary.oceanBlue700} />
            </View>
            <Text className="text-xl text-gray-800 font-bold mb-2 text-center">{getHeaderText()}</Text>
            <Text className="text-sm text-gray-600 text-center mb-2">{getSubText()}</Text>
          </View>

          {/* Platform Selection */}
          <View className="mb-4">
            <Text className="text-md font-semibold text-gray-700 mb-3 text-center">Choose Trading Platform</Text>

            {/* Alpaca Button */}
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-lg p-4 mb-3 flex-row items-center"
              onPress={() => handlePlatformSelect("alpaca")}
            >
              <View className="w-10 h-10 rounded-full bg-primary-oceanBlue50 justify-center items-center mr-3">
                <StocksSvg width={wp(5)} height={wp(5)} fill="#4DA6FF" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800">Alpaca</Text>
                <Text className="text-sm text-gray-500">US Stocks & ETFs Trading</Text>
              </View>
              <Ionicons name="chevron-forward" size={wp(5)} color="#666" />
            </TouchableOpacity>

            {/* Binance Button */}
            {/* <TouchableOpacity
              className="bg-white border border-gray-200 rounded-lg p-4 mb-1 flex-row items-center"
              onPress={() => handlePlatformSelect("binance")}
            >
              <View className="w-10 h-10 rounded-full bg-primary-oceanBlue50 justify-center items-center mr-3">
                <BitcoinSvg width={wp(5)} height={wp(5)} fill="#4DA6FF" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800">Binance</Text>
                <Text className="text-sm text-gray-500">Cryptocurrency Trading</Text>
              </View>
              <Ionicons name="chevron-forward" size={wp(5)} color="#666" />
            </TouchableOpacity> */}
          </View>

          {/* Action Buttons */}
          <View className="space-y-3">
            {/* Skip Button */}
            <TouchableOpacity className="bg-gray-100 rounded-lg py-3 flex-row justify-center items-center" onPress={handleSkipAction}>
              <Text className="text-gray-700 font-semibold text-md">{isFirstTimeLogin ? "Skip for now" : "Skip for now"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TradingProfilePromptModal;
