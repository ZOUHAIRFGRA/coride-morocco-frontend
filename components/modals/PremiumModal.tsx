import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  BackHandler,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "@constants/theme";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import PaymentMethodModal from "./PaymentMethodModal";
import { LinearGradient } from "expo-linear-gradient";

type PremiumModalProps = {
  visible: boolean;
  onClose: () => void;
};

const PremiumModal: React.FC<PremiumModalProps> = ({ visible, onClose }) => {
  // State to track if modal is currently closing
  const [isClosing, setIsClosing] = useState(false);

  // State to track if modal is actually mounted
  const [isMounted, setIsMounted] = useState(false);

  // State for payment method modal
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  // Animation for swipe to dismiss
  const panY = useRef(new Animated.Value(0)).current;
  const translateY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });

  // Timer for countdown
  const [timeRemaining, setTimeRemaining] = useState("19:15:21");

  // Reset closing state when modal opens
  useEffect(() => {
    if (visible && !isMounted) {
      setIsMounted(true);
      setIsClosing(false);
      // Reset animation value
      panY.setValue(0);
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

  // Function to handle upgrade button press
  const handleUpgrade = () => {
    if (isClosing) return; // Prevent action if already closing

    // Open payment method modal
    setPaymentModalVisible(true);
  };

  // Function to handle payment method selection
  const handlePaymentMethodSelect = (method: string) => {
    setPaymentModalVisible(false);
    // Here you would typically process the payment
    // For now, we'll just close the modal
    closeModal();
  };

  // Don't render anything if not visible or not mounted
  if (!visible || !isMounted) return null;

  return (
    <Modal visible={true} transparent animationType="none" onRequestClose={closeModal} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContent, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={closeModal} activeOpacity={0.7} disabled={isClosing}>
                <Ionicons name="close" size={wp(6)} color="#666" />
              </TouchableOpacity>

              {/* Gift icon */}

              <Image source={require("@assets/images/icons/upgrade.png")} style={styles.giftIcon} />

              {/* Title */}
              <Text style={styles.title}>Intelligent budgeting{"\n"}with AI</Text>

              {/* Features list */}
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="lock-open-outline" size={wp(5)} color="#0077B6" />
                  <Text style={styles.featureText}>Unlock premium features</Text>
                </View>

                <View style={styles.featureItem}>
                  <Ionicons name="pricetags-outline" size={wp(5)} color="#0077B6" />
                  <Text style={styles.featureText}>Create your own categories</Text>
                </View>

                <View style={styles.featureItem}>
                  <Ionicons name="sync-outline" size={wp(5)} color="#0077B6" />
                  <Text style={styles.featureText}>Sync to multiple devices</Text>
                </View>

                <View style={styles.featureItem}>
                  <Ionicons name="close-circle-outline" size={wp(5)} color="#0077B6" />
                  <Text style={styles.featureText}>Remove all ads</Text>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Timer */}
              <View style={styles.timerContainer}>
                <Ionicons name="hourglass-outline" size={wp(5)} color="#0077B6" />
                <Text style={styles.timerText}>Offer ends in {timeRemaining}</Text>
              </View>

              {/* Rating */}
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                  <Ionicons name="star" size={wp(5)} color="#FFD700" />
                  <Ionicons name="star" size={wp(5)} color="#FFD700" />
                  <Ionicons name="star" size={wp(5)} color="#FFD700" />
                  <Ionicons name="star" size={wp(5)} color="#FFD700" />
                  <Ionicons name="star-half" size={wp(5)} color="#FFD700" />
                </View>
                <Text style={styles.ratingText}>4.8 ( 12K+ reviews )</Text>
              </View>

              {/* Upgrade button */}
              <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade} activeOpacity={0.8}>
                <LinearGradient
                  colors={[COLORS.primary.light, COLORS.primary.dark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Payment Method Modal */}
      {paymentModalVisible && (
        <PaymentMethodModal visible={paymentModalVisible} onClose={() => setPaymentModalVisible(false)} onSelect={handlePaymentMethodSelect} />
      )}
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
    borderRadius: wp(5),
    width: wp(80),
    padding: wp(5),
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: wp(2),
    right: wp(2),
    zIndex: 10,
    padding: wp(2),
  },
  iconContainer: {
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  iconBackground3: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(5),
    backgroundColor: "rgba(173, 216, 230, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBackground2: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(4),
    backgroundColor: "rgba(173, 216, 230, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBackground1: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(3),
    backgroundColor: "rgba(173, 216, 230, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: hp(2.8),
    fontFamily: FONTS.bold,
    color: "#0077B6",
    textAlign: "center",
    marginBottom: hp(2),
  },
  featuresList: {
    width: "100%",
    marginBottom: hp(2),
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  featureText: {
    fontSize: hp(1.9),
    fontFamily: FONTS.regular,
    color: "#333",
    marginLeft: wp(3),
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: hp(2),
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
  },
  timerText: {
    fontSize: hp(1.8),
    fontFamily: FONTS.regular,
    color: "#333",
    marginLeft: wp(2),
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(3),
  },
  stars: {
    flexDirection: "row",
    marginRight: wp(2),
  },
  ratingText: {
    fontSize: hp(1.8),
    fontFamily: FONTS.regular,
    color: "#333",
  },
  upgradeButton: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientButton: {
    borderRadius: wp(2),
    paddingVertical: hp(1.5),
    alignItems: "center",
  },
  upgradeButtonText: {
    fontSize: hp(2),
    fontFamily: FONTS.semiBold,
    color: "#FFFFFF",
    textAlign: "center",
  },
  giftIcon: {
    width: wp(35),
    height: wp(35),
    marginBottom: hp(2),
  },
});

export default PremiumModal;
