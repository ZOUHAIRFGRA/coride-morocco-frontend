import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  PanResponder,
  ScrollView,
  Platform,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "@constants/theme";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { GradientButton } from "@/components/ui/buttons/GradientButton";

type CardModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (cardData: { cardHolder: string; cardNumber: string; expiryDate: string; securityCode: string; country: string }) => void;
};

const CardModal: React.FC<CardModalProps> = ({ visible, onClose, onSave }) => {
  // State for form fields
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [country, setCountry] = useState("Morocco");

  // State to track if modal is currently closing
  const [isClosing, setIsClosing] = useState(false);

  // State to track if modal is actually mounted
  const [isMounted, setIsMounted] = useState(false);

  // Animation for swipe to dismiss
  const panY = useRef(new Animated.Value(0)).current;
  const translateY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });

  // Reset fields and state when modal opens
  useEffect(() => {
    if (visible && !isMounted) {
      setIsMounted(true);
      setIsClosing(false);
      // Reset animation value
      panY.setValue(0);
      // Reset form fields
      setCardHolder("");
      setCardNumber("");
      setExpiryDate("");
      setSecurityCode("");
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

  // Configure the pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical gestures
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx * 3);
      },
      onPanResponderGrant: () => {
        // When the gesture starts, set the panY to 0
        panY.setOffset(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward swipes
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If the user swiped down more than 100 units, close the modal
        if (gestureState.dy > 100) {
          closeModal();
        } else {
          // Otherwise, reset the position
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Function to close the modal with animation
  const closeModal = () => {
    if (isClosing) return; // Prevent multiple close attempts

    setIsClosing(true);
    Keyboard.dismiss();

    Animated.timing(panY, {
      toValue: 500, // Move the modal down by 500 units
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Unmount the modal completely
      setIsMounted(false);

      // Call the onClose prop after animation completes
      onClose();
    });
  };

  // Function to handle saving the card
  const handleSave = () => {
    if (isClosing) return; // Prevent action if already closing

    // Validate form fields
    if (!cardHolder.trim() || !cardNumber.trim() || !expiryDate.trim() || !securityCode.trim()) {
      // You could show an error message here
      return;
    }

    onSave({
      cardHolder,
      cardNumber,
      expiryDate,
      securityCode,
      country,
    });

    closeModal();
  };

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Add a space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Format as MM/YY
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  // Don't render anything if not visible or not mounted
  if (!visible || !isMounted) return null;

  return (
    <Modal visible={true} transparent animationType="none" onRequestClose={closeModal} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContent, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={closeModal} activeOpacity={0.7} disabled={isClosing}>
                <Ionicons name="close" size={wp(6)} color="#666" />
              </TouchableOpacity>

              <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Add a card</Text>
                <View style={styles.divider} />

                <Text style={styles.subtitle}>Enter your card information</Text>

                {/* Card holder input */}
                <TextInput
                  style={styles.input}
                  placeholder="Titulaire de la carte"
                  value={cardHolder}
                  onChangeText={setCardHolder}
                  placeholderTextColor="#999"
                  editable={!isClosing}
                />

                {/* Card number input */}
                <TextInput
                  style={styles.input}
                  placeholder="Numéro de carte"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  maxLength={19}
                  placeholderTextColor="#999"
                  editable={!isClosing}
                />

                {/* Expiry date and security code in a row */}
                <View style={styles.rowInputs}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Date d'expiration"
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    keyboardType="numeric"
                    maxLength={5}
                    placeholderTextColor="#999"
                    editable={!isClosing}
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Code de sécurité"
                    value={securityCode}
                    onChangeText={(text) => setSecurityCode(text.replace(/\D/g, "").slice(0, 3))}
                    keyboardType="numeric"
                    maxLength={3}
                    placeholderTextColor="#999"
                    secureTextEntry
                    editable={!isClosing}
                  />
                </View>

                {/* Country selector */}
                <TouchableOpacity style={styles.countrySelector} activeOpacity={0.7} disabled={isClosing}>
                  <View>
                    <Text style={styles.countryLabel}>Country/Region</Text>
                    <Text style={styles.countryValue}>{country}</Text>
                  </View>
                  <Ionicons name="chevron-down" size={wp(5)} color="#666" />
                </TouchableOpacity>

                {/* Save button with gradient */}
                {!isClosing && (
                  <GradientButton text="Save" onPress={handleSave} style={styles.saveButtonContainer} textStyle={styles.saveButtonText} />
                )}
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.background.white,
    borderRadius: wp(6),
    width: wp(90),
    maxHeight: hp(80),
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: hp(1),
    right: wp(2),
    zIndex: 10,
    padding: wp(2),
  },
  scrollContent: {
    padding: wp(5),
    paddingBottom: Platform.OS === "ios" ? hp(4) : hp(3),
  },
  title: {
    fontSize: hp(2.6),
    fontFamily: FONTS.bold,
    color: COLORS.primary.text,
    textAlign: "center",
    marginBottom: hp(1.5),
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: hp(2.5),
  },
  subtitle: {
    fontSize: hp(1.8),
    fontFamily: FONTS.regular,
    color: "#333",
    marginBottom: hp(2),
  },
  input: {
    height: hp(6),
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    fontSize: hp(2),
    fontFamily: FONTS.regular,
    marginBottom: hp(2),
    color: "#333",
    backgroundColor: "#F5F9FC",
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: wp(38),
  },
  countrySelector: {
    height: hp(8),
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(3),
    backgroundColor: "#F5F9FC",
  },
  countryLabel: {
    fontSize: hp(1.4),
    fontFamily: FONTS.regular,
    color: "#999",
  },
  countryValue: {
    fontSize: hp(1.8),
    fontFamily: FONTS.regular,
    color: "#333",
    marginTop: hp(0.5),
  },
  saveButtonContainer: {
    borderRadius: wp(2),
    paddingVertical: hp(1.5),
  },
  saveButtonText: {
    fontSize: hp(2),
    fontFamily: FONTS.semiBold,
    color: "#fff",
  },
});

export default CardModal;
