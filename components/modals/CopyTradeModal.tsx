import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  TextInput,
  Alert,
  Dimensions,
  ScrollView,
} from "react-native";
import { COLORS } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { Monicon } from "@monicon/native";
import { Ionicons } from "@expo/vector-icons";
import { GradientButton } from "../ui/buttons/GradientButton";
import { Trader } from "@/redux/investment/investmentTypes";
import { TraderAvatar } from "@/components/ui/TraderAvatar";

// Copy trade configuration interface - matches CopyTradeInput from API
interface CopyTradeConfig {
  traderUuid: string;
  stopLoss?: number;
  takeProfit?: number;
  maxPositions?: number;
  balancePercentage?: number;
}

/**
 * Props for CopyTradeModal
 */
interface CopyTradeModalProps {
  visible: boolean;
  onClose: () => void;
  trader: Trader;
  onConfirm: (config: CopyTradeConfig) => void;
}

/**
 * CopyTradeModal Component
 * 
 * A modal for configuring copy trading settings with smart defaults
 * based on trader risk profile. Includes real-time validation and 
 * intuitive UI controls for all copy trading parameters.
 */
export const CopyTradeModal: React.FC<CopyTradeModalProps> = ({
  visible,
  onClose,
  trader,
  onConfirm,
}) => {
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  
  // Smart defaults based on trader risk profile
  const getSmartDefaults = (trader: Trader): CopyTradeConfig => ({
    traderUuid: trader.userUuid,
    stopLoss: trader.riskScore <= 2 ? 3 : trader.riskScore === 3 ? 5 : 7,
    takeProfit: trader.riskScore <= 2 ? 20 : trader.riskScore === 3 ? 15 : 12,
    maxPositions: trader.riskScore <= 2 ? 5 : trader.riskScore === 3 ? 8 : 5,
    balancePercentage: trader.riskScore <= 2 ? 10 : trader.riskScore === 3 ? 8 : 5,
  });
  
  const [config, setConfig] = useState<CopyTradeConfig>(getSmartDefaults(trader));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Animate modal entrance and exit
  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Handle close modal
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  // Validate configuration in real-time
  const validateConfig = (newConfig: CopyTradeConfig): {[key: string]: string} => {
    const newErrors: {[key: string]: string} = {};
    
    if (newConfig.stopLoss && (newConfig.stopLoss <= 0 || newConfig.stopLoss >= 100)) {
      newErrors.stopLoss = "Must be between 1% and 99%";
    }
    
    if (newConfig.takeProfit && newConfig.takeProfit <= 0) {
      newErrors.takeProfit = "Must be greater than 0%";
    }
    
    if (newConfig.maxPositions && newConfig.maxPositions <= 0) {
      newErrors.maxPositions = "Must be at least 1 position";
    }
    
    
    return newErrors;
  };

  // Handle confirm copy trading
  const handleConfirm = () => {
    const validationErrors = validateConfig(config);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert(
        "Configuration Error",
        "Please fix the highlighted errors before proceeding.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    
    // Map config to CopyTradeInput format for API
    const copyTradeInput = {
      traderUuid: trader.userUuid,
      ...(config.stopLoss && { stopLoss: config.stopLoss }),
      ...(config.takeProfit && { takeProfit: config.takeProfit }),
      ...(config.maxPositions && { maxPositions: config.maxPositions }),
      ...(config.balancePercentage && { balancePercentage: config.balancePercentage }),
    };
    
    onConfirm(copyTradeInput);
  };

  // Update configuration values with real-time validation
  const updateConfig = (key: keyof CopyTradeConfig | string, value: number | string) => {
    let newConfig = { ...config };
    
    newConfig = { ...config, [key]: value };
    
    
    setConfig(newConfig);
    
    // Clear specific error when user starts fixing it
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
    
    // Validate in real-time for immediate feedback
    const validationErrors = validateConfig(newConfig);
    setErrors(validationErrors);
  };

  const getRiskColor = (score: number) => {
    if (score <= 2) return COLORS.success.light;
    if (score === 3) return '#FFA726';
    return COLORS.error.light;
  };

  const getRiskText = (score: number) => {
    if (score <= 2) return 'Low Risk';
    if (score === 3) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <Animated.View
          className="bg-white rounded-t-3xl"
          style={{
            transform: [{ translateY: slideAnim }],
            height: Dimensions.get('window').height * 0.9,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">Copy Trader</Text>
            <TouchableOpacity
              className="p-2 rounded-full bg-gray-100"
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Trader Info */}
          <View className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <View className="flex-row items-center">
              <View className="relative">
                <TraderAvatar
                  imageUrl={trader.avatar}
                  name={trader.displayName}
                  size={48}
                  userId={trader.userUuid}
                />
                {trader.isVerified && (
                  <View className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                    <Ionicons name="checkmark" size={10} color="white" />
                  </View>
                )}
              </View>
              
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text className="font-bold text-base text-gray-900 mr-2">{trader.displayName}</Text>
                  <View className="bg-primary rounded-full px-2 py-1">
                    <Text className="text-white text-xs font-bold">Top Trader</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center mt-1">
                  <Text className="text-green-600 font-semibold text-sm mr-3">ROI: +{trader.totalReturn}%</Text>
                  <Text className="text-gray-600 text-sm mr-3">Win rate: {trader.winRate}%</Text>
                  <View 
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: getRiskColor(trader.riskScore) }}
                  >
                    <Text className="text-xs font-medium text-white">
                      {getRiskText(trader.riskScore)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Configuration Form */}
          <ScrollView 
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16 }}
          >

          {/* Max Positions */}
          <View className="mb-6">
            <Text className="text-base font-semibold mb-3" style={{ color: COLORS.text.primary }}>Max Positions</Text>
            <View className={`flex-row items-center rounded-xl px-4 py-3 ${
              errors.maxPositions ? 'border border-red-300' : 'border'
            }`} style={{
              backgroundColor: errors.maxPositions ? '#FEF2F2' : COLORS.primary.oceanBlue50,
              borderColor: errors.maxPositions ? COLORS.error.light : COLORS.border.primary
            }}>
              <TextInput
                className={`flex-1 text-base font-semibold ${
                  errors.maxPositions ? 'text-red-600' : ''
                }`}
                style={{ color: errors.maxPositions ? COLORS.error.light : COLORS.text.primary }}
                value={(config.maxPositions || 0).toString()}
                onChangeText={(text: string) => {
                  const value = parseInt(text) || 0;
                  updateConfig('maxPositions', value);
                }}
                keyboardType="numeric"
                placeholder="5"
                accessibilityLabel="Maximum positions"
                accessibilityHint="Enter the maximum number of concurrent positions"
                accessibilityRole="none"
              />
            </View>
            {errors.maxPositions && (
              <Text className="text-red-500 text-xs mt-2">{errors.maxPositions}</Text>
            )}
          </View>

            {/* Balance percentage */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-semibold" style={{ color: COLORS.text.primary }}>Percentage of your Balance</Text>
                <Text className={`text-base font-bold`} style={{
                  color: errors.copyRatio ? COLORS.error.light : COLORS.primary.light
                }}>{Math.round((config?.balancePercentage || 0) * 10)}%</Text>
              </View>
              <View className={`h-2 rounded-full ${
                errors.copyRatio ? 'border border-red-300' : ''
              }`} style={{ backgroundColor: COLORS.background.lightGray }}>
                <View 
                  className="h-2 rounded-full"
                  style={{ 
                    backgroundColor: errors.copyRatio ? COLORS.error.light : COLORS.primary.light,
                    width: `${(config?.balancePercentage || 0) * 10}%` 
                  }}
                />
              </View>
              <View className="flex-row justify-between mt-2">
                <TouchableOpacity 
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: COLORS.background.lightGray }}
                  onPress={() => updateConfig('balancePercentage', Math.max(0.01, (config?.balancePercentage || 0) - 0.05))}
                  accessibilityLabel="Decrease copy ratio"
                  accessibilityRole="button"
                >
                  <Text className="text-sm font-medium" style={{ color: COLORS.text.primary }}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: COLORS.background.lightGray }}
                  onPress={() => updateConfig('balancePercentage', Math.min(1, (config?.balancePercentage || 0) + 0.05))}
                  accessibilityLabel="Increase copy ratio"
                  accessibilityRole="button"
                >
                  <Text className="text-sm font-medium" style={{ color: COLORS.text.primary }}>+</Text>
                </TouchableOpacity>
              </View>
              {errors.copyRatio && (
                <Text className="text-red-500 text-xs mt-2 text-center">{errors.copyRatio}</Text>
              )}
              <View className="flex-row justify-between mt-1">
                <Text className="text-xs" style={{ color: COLORS.text.tertiary }}>1%</Text>
                <Text className="text-xs" style={{ color: COLORS.text.tertiary }}>100%</Text>
              </View>
            </View>

            {/* Stop Loss */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-semibold" style={{ color: COLORS.text.primary }}>Stop Loss (Optional)</Text>
                <Text className={`text-base font-bold`} style={{
                  color: errors.stopLoss ? COLORS.error.light : COLORS.error.light
                }}>{config.stopLoss || 0}%</Text>
              </View>
              <View className={`h-2 rounded-full ${
                errors.stopLoss ? 'border border-red-300' : ''
              }`} style={{ backgroundColor: COLORS.background.lightGray }}>
                <View 
                  className="h-2 rounded-full"
                  style={{ 
                    backgroundColor: errors.stopLoss ? COLORS.error.light : COLORS.error.light,
                    width: `${config.stopLoss || 0}%` 
                  }}
                />
              </View>
              <View className="flex-row justify-between mt-2">
                <TouchableOpacity 
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: COLORS.background.lightGray }}
                  onPress={() => updateConfig('stopLoss', Math.max(0, (config.stopLoss || 0) - 1))}
                  accessibilityLabel="Decrease stop loss"
                  accessibilityHint="Decreases the stop loss percentage by 1%"
                  accessibilityRole="button"
                >
                  <Text className="text-sm font-medium" style={{ color: COLORS.text.primary }}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: COLORS.background.lightGray }}
                  onPress={() => updateConfig('stopLoss', Math.min(99, (config.stopLoss || 0) + 1))}
                  accessibilityLabel="Increase stop loss"
                  accessibilityHint="Increases the stop loss percentage by 1%"
                  accessibilityRole="button"
                >
                  <Text className="text-sm font-medium" style={{ color: COLORS.text.primary }}>+</Text>
                </TouchableOpacity>
              </View>
              {errors.stopLoss && (
                <Text className="text-red-500 text-xs mt-2 text-center">{errors.stopLoss}</Text>
              )}
              <View className="flex-row justify-between mt-1">
                <Text className="text-xs" style={{ color: COLORS.text.tertiary }}>0%</Text>
                <Text className="text-xs" style={{ color: COLORS.text.tertiary }}>99%</Text>
              </View>
            </View>

            {/* Take Profit */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-semibold" style={{ color: COLORS.text.primary }}>Take Profit (Optional)</Text>
                <Text className={`text-base font-bold`} style={{
                  color: errors.takeProfit ? COLORS.error.light : COLORS.success.light
                }}>{config.takeProfit || 0}%</Text>
              </View>
              <View className={`h-2 rounded-full ${
                errors.takeProfit ? 'border border-red-300' : ''
              }`} style={{ backgroundColor: COLORS.background.lightGray }}>
                <View 
                  className="h-2 rounded-full"
                  style={{ 
                    backgroundColor: errors.takeProfit ? COLORS.error.light : COLORS.success.light,
                    width: `${Math.min(config.takeProfit || 0, 100)}%` 
                  }}
                />
              </View>
              <View className="flex-row justify-between mt-2">
                <TouchableOpacity 
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: COLORS.background.lightGray }}
                  onPress={() => updateConfig('takeProfit', Math.max(0, (config.takeProfit || 0) - 1))}
                  accessibilityLabel="Decrease take profit"
                  accessibilityHint="Decreases the take profit percentage by 1%"
                  accessibilityRole="button"
                >
                  <Text className="text-sm font-medium" style={{ color: COLORS.text.primary }}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: COLORS.background.lightGray }}
                  onPress={() => updateConfig('takeProfit', (config.takeProfit || 0) + 1)}
                  accessibilityLabel="Increase take profit"
                  accessibilityHint="Increases the take profit percentage by 1%"
                  accessibilityRole="button"
                >
                  <Text className="text-sm font-medium" style={{ color: COLORS.text.primary }}>+</Text>
                </TouchableOpacity>
              </View>
              {errors.takeProfit && (
                <Text className="text-red-500 text-xs mt-2 text-center">{errors.takeProfit}</Text>
              )}
              <View className="flex-row justify-between mt-1">
                <Text className="text-xs" style={{ color: COLORS.text.tertiary }}>0%</Text>
                <Text className="text-xs" style={{ color: COLORS.text.tertiary }}>∞</Text>
              </View>
            </View>

            {/* Risk Warning */}
            <View className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
              <View className="flex-row items-start">
                <Monicon name="mingcute:warning-line" size={20} color="#F59E0B" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-orange-800 mb-1">Risk Warning</Text>
                  <Text className="text-xs text-orange-700 leading-4">
                    Copy trading involves significant risk. Past performance does not guarantee future results. 
                    You may lose money by copying this trader's strategies.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="px-6 py-4 mb-4 border-t border-gray-200">
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 bg-gray-100 rounded-xl py-4 ${
                  isSubmitting ? 'opacity-50' : ''
                }`}
                onPress={handleClose}
                activeOpacity={0.7}
                disabled={isSubmitting}
                accessibilityLabel="Cancel copy trading"
                accessibilityHint="Closes the modal without starting copy trading"
                accessibilityRole="button"
              >
                <Text className="text-center font-bold text-base text-gray-700">Cancel</Text>
              </TouchableOpacity>
              
              <View className="flex-1">
                <GradientButton
                  onPress={handleConfirm}
                  text={isSubmitting ? "Processing..." : "Start Copying"}
                  isLoading={isSubmitting}
                  style={{ marginHorizontal: 0, marginBottom: 0 }}
                />
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CopyTradeModal;
