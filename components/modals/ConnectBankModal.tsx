import React, { useRef, useState, useEffect } from "react";
import { View, Text, Modal, TouchableWithoutFeedback, TextInput, Keyboard, Platform, ScrollView, Animated, PanResponder, Alert } from "react-native";
import { COLORS, FONTS } from "@/constants/theme";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { GradientButton } from "@/components/ui/buttons/GradientButton";
import CountryDropdown from "@/components/ui/CountryDropdown";
import { CountryCode } from "@/constants/countries";
import { useConnectBankAccountMutation } from "@/redux/investment/investmentEndpoints";

/**
 * Props for ConnectBankModal
 */
type ConnectBankModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

/**
 * Modal for connecting a bank account to Alpaca.
 * Automatically selects ABA for US, BIC for others.
 */
const ConnectBankModal: React.FC<ConnectBankModalProps> = ({ visible, onClose, onSuccess }) => {
  // Form state
  const [name, setName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [country, setCountry] = useState<CountryCode>("USA");
  const [stateProvince, setStateProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  // Mutation hook
  const [connectBankAccount, { isLoading: isConnecting }] = useConnectBankAccountMutation();

  // Animation and modal state
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const slideAnim = useRef(new Animated.Value(hp(100))).current;

  // Animate modal in
  useEffect(() => {
    if (visible && !isMounted) {
      setIsMounted(true);
      setIsClosing(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [visible, isMounted]);

  // Android back button closes modal
  useEffect(() => {
    const backHandler =
      Platform.OS === "android"
        ? require("react-native").BackHandler.addEventListener("hardwareBackPress", () => {
            if (visible && !isClosing) {
              closeModal();
              return true;
            }
            return false;
          })
        : null;
    return () => backHandler?.remove();
  }, [visible, isClosing]);

  // PanResponder for swipe-to-close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > Math.abs(gestureState.dx * 3),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) slideAnim.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) closeModal();
        else Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 50, friction: 7 }).start();
      },
    })
  ).current;

  // Close modal with animation
  const closeModal = () => {
    if (isClosing) return;
    setIsClosing(true);
    Keyboard.dismiss();
    Animated.timing(slideAnim, {
      toValue: hp(100),
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsMounted(false);
      onClose();
    });
  };

  // Handle connect action
  const handleConnect = () => {
    if (isClosing || isConnecting) return;

    // Basic validation
    if (!name.trim() || !bankCode.trim() || !accountNumber.trim()) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    // Close modal and proceed immediately - don't block user
    closeModal();

    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }

    // Process bank connection in background
    const input = {
      bankName: name.trim(),
      accountNumber: accountNumber.trim(),
      routingNumber: bankCode.trim(),
      accountType: "CHECKING", // Default to CHECKING
      country: country,
      ownerName: "User", // Placeholder - in real app, get from user profile
      streetAddress: streetAddress.trim() || "",
      city: city.trim() || "",
      stateProvince: stateProvince.trim() || "",
      postalCode: postalCode.trim() || "",
    };

    connectBankAccount(input)
      .unwrap()
      .then((response) => {
        if (response.success) {
          console.log("Bank connection successful:", response.message);
          // Could show a toast notification here if needed
        } else {
          console.error("Bank connection failed:", response.message);
          // Could show a toast notification here if needed
        }
      })
      .catch((error) => {
        console.error("Bank connection error:", error);
        // Could show a toast notification here if needed
      });
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setName("");
      setBankCode("");
      setAccountNumber("");
      setCountry("USA");
      setStateProvince("");
      setPostalCode("");
      setCity("");
      setStreetAddress("");
    }
  }, [visible]);

  if (!visible || !isMounted) return null;

  const isUS = country === "USA";

  return (
    <Modal visible transparent animationType="none" onRequestClose={closeModal} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={closeModal}>
        <View className="flex-1 justify-end bg-black/40">
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                {
                  transform: [{ translateY: slideAnim }],
                  backgroundColor: COLORS.background.white,
                  borderTopLeftRadius: wp(8),
                  borderTopRightRadius: wp(8),
                  padding: wp(5),
                  paddingTop: 0,
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -3 },
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                  maxHeight: hp(90),
                },
              ]}
              {...panResponder.panHandlers}
            >
              {/* Drag indicator */}
              <View className="w-full items-center pt-3 pb-2">
                <View className="w-[40px] h-1.5 rounded bg-[#E0E0E0]" />
              </View>

              {/* Title */}
              <Text
                style={{
                  fontSize: hp(2.5),
                  fontFamily: FONTS.bold,
                  color: COLORS.primary.dark,
                  textAlign: "center",
                  marginBottom: hp(1),
                }}
              >
                Connect Bank Account
              </Text>
              <View className="h-px bg-[#E0E0E0] mb-4" />

              <ScrollView
                contentContainerStyle={{
                  paddingBottom: Platform.OS === "ios" ? hp(12) : hp(10), // Extra padding for fixed button
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Country Picker */}
                <View className="mb-4">
                  <CountryDropdown label="Country" value={country} onValueChange={(value) => setCountry(value)} required={false} />
                </View>

                {/* Bank Name */}
                <View className="mb-4">
                  <Text className="text-md mb-2" style={{ fontFamily: FONTS.regular, color: "#333" }}>
                    Bank Name
                  </Text>
                  <TextInput
                    className="border border-[#E0E0E0] rounded px-3 py-3 text-md bg-[#F5F9FF]"
                    style={{ fontFamily: FONTS.regular, color: "#333" }}
                    placeholder="e.g. Chase, Revolut"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Bank Code */}
                <View className="mb-4">
                  <Text className="text-md mb-2" style={{ fontFamily: FONTS.regular, color: "#333" }}>
                    {isUS ? "Routing Number (ABA)" : "Bank Code (BIC/SWIFT)"}
                  </Text>
                  <TextInput
                    className="border border-[#E0E0E0] rounded px-3 py-3 text-md bg-[#F5F9FF]"
                    style={{ fontFamily: FONTS.regular, color: "#333" }}
                    placeholder={isUS ? "e.g. 021000021" : "e.g. DEUTDEFF"}
                    placeholderTextColor="#999"
                    value={bankCode}
                    onChangeText={setBankCode}
                  />
                </View>

                {/* Account Number */}
                <View className="mb-4">
                  <Text className="text-md mb-2" style={{ fontFamily: FONTS.regular, color: "#333" }}>
                    Account Number
                  </Text>
                  <TextInput
                    className="border border-[#E0E0E0] rounded px-3 py-3 text-md bg-[#F5F9FF]"
                    style={{ fontFamily: FONTS.regular, color: "#333" }}
                    placeholder="e.g. 123456789"
                    placeholderTextColor="#999"
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                  />
                </View>

                {/* International fields for non-US countries */}
                {!isUS && (
                  <>
                    <View className="mb-4">
                      <Text className="text-md mb-2" style={{ fontFamily: FONTS.regular, color: "#333" }}>
                        State/Province
                      </Text>
                      <TextInput
                        className="border border-[#E0E0E0] rounded px-3 py-3 text-md bg-[#F5F9FF]"
                        style={{ fontFamily: FONTS.regular, color: "#333" }}
                        placeholder="e.g. NY"
                        placeholderTextColor="#999"
                        value={stateProvince}
                        onChangeText={setStateProvince}
                      />
                    </View>
                    <View className="mb-4">
                      <Text className="text-md mb-2" style={{ fontFamily: FONTS.regular, color: "#333" }}>
                        Postal Code
                      </Text>
                      <TextInput
                        className="border border-[#E0E0E0] rounded px-3 py-3 text-md bg-[#F5F9FF]"
                        style={{ fontFamily: FONTS.regular, color: "#333" }}
                        placeholder="e.g. 10001"
                        placeholderTextColor="#999"
                        value={postalCode}
                        onChangeText={setPostalCode}
                      />
                    </View>
                    <View className="mb-4">
                      <Text className="text-md mb-2" style={{ fontFamily: FONTS.regular, color: "#333" }}>
                        City
                      </Text>
                      <TextInput
                        className="border border-[#E0E0E0] rounded px-3 py-3 text-md bg-[#F5F9FF]"
                        style={{ fontFamily: FONTS.regular, color: "#333" }}
                        placeholder="e.g. New York"
                        placeholderTextColor="#999"
                        value={city}
                        onChangeText={setCity}
                      />
                    </View>
                    <View className="mb-4">
                      <Text className="text-md mb-2" style={{ fontFamily: FONTS.regular, color: "#333" }}>
                        Street Address
                      </Text>
                      <TextInput
                        className="border border-[#E0E0E0] rounded px-3 py-3 text-md bg-[#F5F9FF]"
                        style={{ fontFamily: FONTS.regular, color: "#333" }}
                        placeholder="e.g. 123 Main St"
                        placeholderTextColor="#999"
                        value={streetAddress}
                        onChangeText={setStreetAddress}
                      />
                    </View>
                  </>
                )}
              </ScrollView>

              {/* Fixed Connect Button at Bottom */}
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: COLORS.background.white,
                  paddingHorizontal: wp(5),
                  paddingTop: hp(2),
                  paddingBottom: Platform.OS === "ios" ? hp(4) : hp(3),
                  borderTopWidth: 1,
                  borderTopColor: "#E0E0E0",
                  shadowColor: "gray",
                  shadowOffset: { width: 0, height: -2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                  elevation: 8,
                }}
              >
                <GradientButton text="Connect" onPress={handleConnect} colors={COLORS.primary.gradient} isLoading={isConnecting} />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ConnectBankModal;
