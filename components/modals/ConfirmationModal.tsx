import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  PanResponder,
  Animated,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { COLORS, FONTS } from "@constants/theme";
import {
  horizontalScale,
  verticalScale,
  moderateScale,
  responsiveFontSize,
  useScreenDimensions,
} from "@utils/responsive";

type ConfirmationModalProps = {
  email: string;
  code: string[];
  onCodeChange: (text: string, index: number) => void;
  onChangeEmail: () => void;
  onComplete?: () => void;
  onClose?: () => void;
  onResendCode?: () => void;
  isLoading?: boolean;
};

export function ConfirmationModal({
  email,
  code,
  onCodeChange,
  onChangeEmail,
  onComplete,
  onClose = () => {},
  onResendCode = () => {},
  isLoading = false,
}: ConfirmationModalProps) {
  const { isSmallDevice } = useScreenDimensions();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const panY = useRef(new Animated.Value(0)).current;
  const translateY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });

  // Calculate dynamic offset based on screen height and modal content
  const screenHeight = Dimensions.get("window").height;
  const keyboardVerticalOffset = Platform.select({
    ios: 20,
    android: verticalScale(10), // Further reduced
  });

  // Configure the pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx * 3);
      },
      onPanResponderGrant: () => {
        panY.setOffset(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeModal();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;

    onCodeChange(text, index);

    if (text.length === 1 && index < code.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleBackgroundPress = () => {
    Keyboard.dismiss();
  };

  const closeModal = () => {
    Animated.timing(panY, {
      toValue: 500,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <View style={styles.container}>
     <KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  style={styles.keyboardAvoidingView}
  keyboardVerticalOffset={keyboardVerticalOffset}
>
        <TouchableWithoutFeedback onPress={handleBackgroundPress} accessible={false}>
          <View style={styles.overlay}>
            <Animated.View style={[styles.modalContent, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
              <View style={styles.dragIndicatorContainer}>
                <View style={styles.dragIndicator} />
              </View>

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.confirmTitle}>Confirm your email</Text>
                <View style={styles.line} />
                <Text style={styles.confirmDescription}>
                  Please enter the confirmation code received on your email adress to validate your account.
                </Text>
                <View style={styles.emailBox}>
                  <Text style={styles.emailText}>{email}</Text>
                  <TouchableOpacity onPress={onChangeEmail} activeOpacity={0.7}>
                    <Text style={styles.changeLink}>Change</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.codeContainer}>
                  {code.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      style={styles.codeInput}
                      value={digit}
                      onChangeText={(text) => handleCodeChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      selectionColor={COLORS.primary.oceanBlue200}
                      editable={!isLoading}
                    />
                  ))}
                </View>
                {isLoading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primary.oceanBlue200} />
                    <Text style={styles.loadingText}>Verifying your code...</Text>
                  </View>
                )}
                <TouchableOpacity activeOpacity={0.7} style={styles.resendContainer} onPress={onResendCode}>
                  <Text style={styles.resendLink}>Didn't receive the code ?</Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.background.white,
    borderTopLeftRadius: moderateScale(32),
    borderTopRightRadius: moderateScale(32),
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  dragIndicatorContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: moderateScale(12),
    paddingBottom: moderateScale(8),
  },
  dragIndicator: {
    width: moderateScale(40),
    height: moderateScale(5),
    borderRadius: moderateScale(3),
    backgroundColor: COLORS.primary.fadedBlue,
  },
  scrollContent: {
    padding: moderateScale(24),
    paddingBottom: 0, // Ensure no extra bottom padding
    paddingTop: moderateScale(8),
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: verticalScale(10), // Reduced from 20
    gap: moderateScale(12),
  },
  confirmTitle: {
    fontSize: responsiveFontSize(24),
    color: COLORS.primary.text,
    fontFamily: FONTS.bold,
    marginBottom: verticalScale(10),
    textAlign: "center",
  },
  confirmDescription: {
    fontSize: responsiveFontSize(16),
    color: COLORS.text.primary,
    fontFamily: FONTS.regular,
    textAlign: "center",
    marginBottom: verticalScale(25),
    lineHeight: verticalScale(24),
  },
  emailBox: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary.oceanBlue50,
    borderColor: COLORS.primary.oceanBlue200,
    borderWidth: 1,
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    marginBottom: verticalScale(35),
  },
  emailText: {
    fontSize: responsiveFontSize(16),
    color: COLORS.text.primary,
    fontFamily: FONTS.regular,
  },
  changeLink: {
    fontSize: responsiveFontSize(12),
    color: COLORS.primary.text,
    fontFamily: FONTS.semiBold,
  },

  codeInput: {
    width: moderateScale(40),
    height: verticalScale(50),
    backgroundColor: COLORS.primary.oceanBlue50,
    borderRadius: moderateScale(8),
    borderColor: COLORS.primary.oceanBlue200,
    borderWidth: 1,
    textAlign: "center",
    fontSize: responsiveFontSize(20),
    fontFamily: FONTS.semiBold,
    color: COLORS.text.primary,
  },
  resendContainer: {
    paddingVertical: verticalScale(10),
  },
  resendLink: {
    fontSize: responsiveFontSize(12),
    color: COLORS.primary.text,
    fontFamily: FONTS.semiBold,
    textAlign: "center",
  },
  line: {
    width: "100%",
    height: 1,
    backgroundColor: COLORS.primary.fadedBlue,
    marginVertical: verticalScale(16),
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(16),
  },
  loadingText: {
    marginLeft: horizontalScale(8),
    color: COLORS.primary.oceanBlue200,
    fontSize: responsiveFontSize(14),
    fontFamily: FONTS.regular,
  },
});