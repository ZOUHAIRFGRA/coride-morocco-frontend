import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "@/constants/theme";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { moderateScale, verticalScale, responsiveFontSize } from "@utils/responsive";

/**
 * Step status enum
 */
export type StepStatus = "completed" | "active" | "pending";

/**
 * Individual step data
 */
export interface Step {
  id: string;
  title: string;
  status: StepStatus;
}

/**
 * Props for OnboardingStepIndicator
 */
interface OnboardingStepIndicatorProps {
  steps: Step[];
  currentStepId?: string;
}

/**
 * Individual step component
 */
const StepItem: React.FC<{ step: Step; isLast: boolean }> = ({ step, isLast }) => {
  const getStepIcon = () => {
    switch (step.status) {
      case "completed":
        return <Ionicons name="checkmark" size={wp(5)} color="#FFFFFF" />;
      case "active":
        return <View style={styles.activeStepDot} />;
      case "pending":
        return <View style={styles.pendingStepDot} />;
      default:
        return <View style={styles.pendingStepDot} />;
    }
  };

  const getStepStyle = () => {
    switch (step.status) {
      case "completed":
        return styles.completedStep;
      case "active":
        return styles.activeStep;
      case "pending":
        return styles.pendingStep;
      default:
        return styles.pendingStep;
    }
  };

  const getTextStyle = () => {
    switch (step.status) {
      case "completed":
        return styles.completedText;
      case "active":
        return styles.activeText;
      case "pending":
        return styles.pendingText;
      default:
        return styles.pendingText;
    }
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepRow}>
        {/* Step Circle */}
        <View style={[styles.stepCircle, getStepStyle()]}>{getStepIcon()}</View>

        {/* Step Title */}
        <Text style={[styles.stepTitle, getTextStyle()]}>{step.title}</Text>
      </View>

      {/* Connection Line */}
      {!isLast && <View style={[styles.connectionLine, step.status === "completed" ? styles.completedLine : styles.pendingLine]} />}
    </View>
  );
};

/**
 * Onboarding Step Indicator Component
 * Shows progress through KYC, Bank Connection, and Fund Account steps
 */
const OnboardingStepIndicator: React.FC<OnboardingStepIndicatorProps> = ({ steps, currentStepId }) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <StepItem key={step.id} step={step} isLast={index === steps.length - 1} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "#F8FAFC",
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    // marginBottom: verticalScale(24),
    // borderWidth: 1,
    // borderColor: "#E2E8F0",
  },
  headerText: {
    fontSize: responsiveFontSize(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.text.primary,
    marginBottom: verticalScale(16),
    textAlign: "center",
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  stepContainer: {
    flex: 1,
    alignItems: "center",
  },
  stepRow: {
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  stepCircle: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(8),
    borderWidth: 2,
  },
  completedStep: {
    backgroundColor: COLORS.primary.text,
    borderColor: COLORS.primary.oceanBlue200,
  },
  activeStep: {
    backgroundColor: COLORS.primary.light,
    borderColor: COLORS.primary.light,
  },
  pendingStep: {
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
  },
  activeStepDot: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: "#FFFFFF",
  },
  pendingStepDot: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: "#CBD5E1",
  },
  stepTitle: {
    fontSize: responsiveFontSize(12),
    fontFamily: FONTS.semiBold,
    textAlign: "center",
    maxWidth: moderateScale(80),
  },
  completedText: {
    color: COLORS.primary.dark,
  },
  activeText: {
    color: COLORS.primary.text,
  },
  pendingText: {
    color: "#64748B",
  },
  connectionLine: {
    position: "absolute",
    top: moderateScale(16),
    left: "50%",
    right: "-50%",
    height: 2,
    transform: [{ translateX: moderateScale(16) }],
  },
  completedLine: {
    backgroundColor: COLORS.primary.text,
  },
  pendingLine: {
    backgroundColor: "#CBD5E1",
  },
});

export default OnboardingStepIndicator;
