import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView, BackHandler, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

type PaymentMethodModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (method: string) => void;
};

// Define payment method types with proper icon names
type PaymentMethod = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap; // Using proper type for icon names
};

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ visible, onClose, onSelect }) => {
  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    { id: "google_pay", name: "Google Pay", icon: "logo-google" },
    { id: "apple_pay", name: "Apple Pay", icon: "logo-apple" },
    { id: "paypal", name: "PayPal", icon: "logo-paypal" },
    { id: "paytm", name: "PayTM", icon: "wallet-outline" },
    { id: "card", name: "Credit card or debit card", icon: "card-outline" },
  ];

  // State to track if modal is currently closing
  const [isClosing, setIsClosing] = useState(false);

  // State to track if modal is actually mounted
  const [isMounted, setIsMounted] = useState(false);

  // Animation value using Reanimated's useSharedValue
  const translateY = useSharedValue(500);

  // Create animated style using Reanimated
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Reset closing state when modal opens
  useEffect(() => {
    if (visible && !isMounted) {
      setIsMounted(true);
      setIsClosing(false);
      // Reset animation value and animate modal in
      translateY.value = 500;
      translateY.value = withSpring(0, { damping: 20 });
    }
  }, [visible, isMounted]);

  // Handle back button press on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (visible && !isClosing) {
        closeModal();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, isClosing]);

  // Function to close the modal with animation
  const closeModal = () => {
    if (isClosing) return; // Prevent multiple close attempts

    setIsClosing(true);
    Keyboard.dismiss();

    // Animate modal out with Reanimated
    translateY.value = withTiming(500, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(finishClosing)();
      }
    });
  };

  // Function to handle cleanup after animation
  const finishClosing = () => {
    // Unmount the modal completely
    setIsMounted(false);

    // Call the onClose prop after animation completes
    onClose();
  };

  // Configure the gesture handler for swipe gestures using Reanimated's gesture system
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow downward swipes
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      // If the user swiped down more than 100 units, close the modal
      if (event.translationY > 100) {
        runOnJS(closeModal)();
      } else {
        // Otherwise, reset the position
        translateY.value = withSpring(0);
      }
    });

  // Function to handle payment method selection
  const handleSelect = (method: string) => {
    if (isClosing) return; // Prevent action if already closing

    onSelect(method);
  };

  // Don't render anything if not visible or not mounted
  if (!visible || !isMounted) return null;

  return (
    <Modal visible={true} transparent animationType="none" onRequestClose={closeModal} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={closeModal}>
        <View className="flex-1 bg-black/40 justify-end">
          <TouchableWithoutFeedback>
            <GestureDetector gesture={panGesture}>
              <Animated.View className="bg-white rounded-t-3xl overflow-hidden shadow-md relative" style={animatedStyle}>
                {/* Drag indicator */}
                <View className="w-full items-center pt-6 pb-2">
                  <View className="w-10 h-1 rounded-full bg-gray-200" />
                </View>

                {/* Close button */}
                <TouchableOpacity className="absolute top-6 right-4 z-10 p-2" onPress={closeModal} activeOpacity={0.7} disabled={isClosing}>
                  <Ionicons name="close" size={wp(6)} color="#666" />
                </TouchableOpacity>

                <ScrollView className="px-5 pb-4 mb-5 md:pb-6" keyboardShouldPersistTaps="handled">
                  <Text className="text-2xl font-bold text-center text-gray-800 mb-1.5">Choose a payment method</Text>
                  <View className="h-px bg-gray-200 mb-6" />

                  {/* Payment methods list */}
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      className="border border-gray-200 rounded-xl mb-4 overflow-hidden"
                      onPress={() => handleSelect(method.name)}
                      activeOpacity={0.7}
                      disabled={isClosing}
                    >
                      <View className="flex-row items-center p-4">
                        <Ionicons
                          name={method.icon}
                          size={wp(6)}
                          color={
                            method.id === "paypal"
                              ? "#0070BA"
                              : method.id === "google_pay"
                                ? "#4285F4"
                                : method.id === "apple_pay"
                                  ? "#000"
                                  : "#4DA6FF"
                          }
                        />
                        <Text className="text-base font-regular text-gray-800 ml-3">{method.name}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            </GestureDetector>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default PaymentMethodModal;
