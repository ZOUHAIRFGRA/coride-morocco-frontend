import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions,  Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "@/constants/theme";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { GradientButton } from "@/components/ui/buttons/GradientButton";
import * as Haptics from "expo-haptics";
import StatsRow from "../ui/StatsRow";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

/**
 * Props for FomoModal
 */
type FomoModalProps = {
  visible: boolean;
  
  onClose: () => void;
  onStartTrading: () => void;
  hasCompletedKyc?: boolean;
};

/**
 * FOMO Modal - Shows exciting gains messaging to encourage users to start trading
 * Only shows on first time when user clicks on a post
 */
const FomoModal: React.FC<FomoModalProps> = ({ visible, onClose, onStartTrading, hasCompletedKyc = false }) => {
  // Handle start trading action
  const handleStartTrading = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStartTrading(); // Navigate to onboarding screen
  };

  // Handle close action
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  // Generate random earnings amounts for variety
  const generateEarnings = () => {
    const amounts = ["$358,492", "$427,183", "$516,204", "$389,756", "$445,821"];
    return amounts[Math.floor(Math.random() * amounts.length)];
  };

  const todaysEarnings = generateEarnings();

  // Don't render anything if not visible
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Background overlay */}
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1}
        onPress={handleClose}
      />
      
      {/* Modal content */}
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Drag indicator */}
          <View style={styles.dragIndicatorContainer}>
            <View style={styles.dragIndicator} />
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={wp(6)} color="#666" />
          </TouchableOpacity>

          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="trending-up" size={wp(12)} color={COLORS.success.light} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Amazing Results!</Text>

          {/* Earnings Display */}
          <Text style={styles.earningsText}>{todaysEarnings}</Text>
          <Text style={styles.earningsSubtext}>made by our users today</Text>

          {/* Description */}
          <Text style={styles.description}>
            Join thousands of successful traders using our AI-powered insights to make profitable trades every day.
          </Text>

          {/* Stats */}
          <StatsRow
            stats={[
              { value: '95%', label: 'Success Rate' },
              { value: '24/7', label: 'AI Analysis' },
              { value: '1200000', label: 'Active Users' },
            ]}
          />

          {/* CTA Button */}
          <GradientButton
            onPress={handleStartTrading}
            text={hasCompletedKyc ? "Continue to Trading" : "Start Trading Now"}
            colors={COLORS.primary.gradient}
            style={styles.ctaButton}
            textStyle={styles.ctaButtonText}
          />

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>Ready to join thousands of successful traders?</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: screenWidth,
    height: screenHeight,
    zIndex: Platform.OS === 'ios' ? 999999999 : 9999,
    elevation: Platform.OS === 'android' ? 9999 : undefined,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    pointerEvents: "box-none",
    zIndex: Platform.OS === 'ios' ? 999999999 : 9999,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: hp(90),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: Platform.OS === 'android' ? 9999 : undefined,
    zIndex: Platform.OS === 'ios' ? 999999999 : 9999,
    padding: 24,
    paddingTop: 8,
    paddingBottom: 80, // Extra bottom padding for iOS to override safe area
    alignItems: "center",
    marginBottom: -25, // Negative margin to push further down on iOS
  },
  dragIndicatorContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.success.light}20`,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  earningsText: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.success.light,
    textAlign: "center",
    marginBottom: 4,
  },
  earningsSubtext: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text.primary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  ctaButton: {
    width: "100%",
    marginBottom: 16,
    shadowColor: COLORS.primary.light,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  disclaimer: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text.tertiary,
    textAlign: "center",
    paddingBottom: 8,
  },
});

export default FomoModal;