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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "@constants/theme";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "@/hooks/useAppTheme";

type PremiumModalProps = {
  visible: boolean;
  onClose: () => void;
};

const PremiumModal: React.FC<PremiumModalProps> = ({ visible, onClose }) => {
  const { colors, isDarkMode } = useAppTheme();
  
  // State to track if modal is currently closing
  const [isClosing, setIsClosing] = useState(false);

  // State to track if modal is actually mounted
  const [isMounted, setIsMounted] = useState(false);

  // State for payment method modal
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  // Animations for better modal experience
  const panY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  const translateY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });

  // Timer for countdown
  const [timeRemaining, setTimeRemaining] = useState("19:15:21");

  // Reset closing state when modal opens and add entrance animation
  useEffect(() => {
    if (visible && !isMounted) {
      setIsMounted(true);
      setIsClosing(false);
      // Reset animation values
      panY.setValue(0);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, isMounted, fadeAnim, scaleAnim]);

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
        // If the user swiped down more than 100 units or with sufficient velocity, close the modal
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeModal();
        } else {
          // Otherwise, spring back to original position with better animation
          Animated.parallel([
            Animated.spring(panY, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            })
          ]).start();
        }
      },
    })
  ).current;

  // Function to close the modal with enhanced animation
  const closeModal = () => {
    if (isClosing) return; // Prevent multiple close attempts

    setIsClosing(true);

    // Enhanced exit animation with fade, scale, and slide
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(panY, {
        toValue: 400,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Reset animation values for next time
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      panY.setValue(0);
      
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
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback>
              <Animated.View 
                style={[
                  styles.modalContent, 
                  { 
                    transform: [
                      { translateY },
                      { scale: scaleAnim }
                    ],
                    backgroundColor: colors.background.secondary,
                    shadowColor: isDarkMode ? '#000' : '#000',
                    shadowOpacity: isDarkMode ? 0.3 : 0.1,
                    opacity: fadeAnim,
                  }
                ]} 
                {...panResponder.panHandlers}
              >
              {/* Close button */}
              <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.background.tertiary }]} onPress={closeModal} activeOpacity={0.7} disabled={isClosing}>
                <Ionicons name="close" size={wp(6)} color={colors.text.secondary} />
              </TouchableOpacity>

              {/* Premium icon */}
              <View style={styles.iconContainer}>
                <View style={styles.iconBackground3}>
                  <View style={styles.iconBackground2}>
                    <View style={styles.iconBackground1}>
                      <Ionicons name="diamond" size={wp(8)} color={COLORS.primary.oceanBlue700} />
                    </View>
                  </View>
                </View>
              </View>

              {/* Title */}
              <Text style={[styles.title, { color: colors.primary.dark }]}>Unlock Premium Features{"\n"}for CoRide Morocco</Text>

              {/* Features list */}
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="lock-open-outline" size={wp(5)} color={COLORS.primary.oceanBlue700} />
                  <Text style={[styles.featureText, { color: colors.text.primary }]}>Priority ride matching</Text>
                </View>

                <View style={styles.featureItem}>
                  <Ionicons name="car-outline" size={wp(5)} color={COLORS.primary.oceanBlue700} />
                  <Text style={[styles.featureText, { color: colors.text.primary }]}>Unlimited ride requests</Text>
                </View>

                <View style={styles.featureItem}>
                  <Ionicons name="shield-checkmark-outline" size={wp(5)} color={COLORS.primary.oceanBlue700} />
                  <Text style={[styles.featureText, { color: colors.text.primary }]}>Advanced safety features</Text>
                </View>

                <View style={styles.featureItem}>
                  <Ionicons name="chatbubbles-outline" size={wp(5)} color={COLORS.primary.oceanBlue700} />
                  <Text style={[styles.featureText, { color: colors.text.primary }]}>Premium support 24/7</Text>
                </View>
              </View>

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: colors.border.primary }]} />

              {/* Timer */}
              <View style={styles.timerContainer}>
                <Ionicons name="time-outline" size={wp(5)} color={COLORS.primary.oceanBlue700} />
                <Text style={[styles.timerText, { color: colors.text.primary }]}>Limited time offer ends in {timeRemaining}</Text>
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
                <Text style={[styles.ratingText, { color: colors.text.secondary }]}>4.9 ( 25K+ CoRide users )</Text>
              </View>

              {/* Upgrade button */}
              <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade} activeOpacity={0.8}>
                <LinearGradient
                  colors={[COLORS.primary.oceanBlue600, COLORS.primary.oceanBlue700]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium - 99 MAD/month</Text>
                </LinearGradient>
              </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Payment Method Modal
      {paymentModalVisible && (
        <PaymentMethodModal visible={paymentModalVisible} onClose={() => setPaymentModalVisible(false)} onSelect={handlePaymentMethodSelect} />
      )} */}
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
    borderRadius: wp(5),
    width: wp(80),
    padding: wp(5),
    alignItems: "center",
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: wp(2),
    right: wp(2),
    zIndex: 10,
    padding: wp(2),
    borderRadius: wp(4),
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
    marginLeft: wp(3),
  },
  divider: {
    width: "100%",
    height: 1,
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
});

export default PremiumModal;
