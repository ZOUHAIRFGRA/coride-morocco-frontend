import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  PanResponder,
  TouchableOpacity,
  Alert,
  Platform,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, COLORS } from "@constants/theme";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { LinkSuccess, LinkExit, create, open } from "react-native-plaid-link-sdk";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  useCreateLinkTokenMutation,
  useExchangePublicTokenMutation,
  setLinkToken,
  setLoading,
  setError,
  setBankLinked,
  setAccounts,
  PlaidAccount,
} from "@/redux/plaid";
import { GradientButton } from "@/components/ui/buttons/GradientButton";

interface PlaidModalProps {
  visible: boolean;
  email: string;
  moduleKey: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const PlaidModal: React.FC<PlaidModalProps> = ({ visible, email, moduleKey, onClose, onSuccess }) => {
  // Local component state
  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);

  // Redux state and dispatch
  const dispatch = useAppDispatch();
  const { linkToken, loading, error } = useAppSelector((state) => state.plaid);

  // RTK Query mutations
  const [createLinkToken, { isLoading: isCreatingToken }] = useCreateLinkTokenMutation();
  const [exchangePublicToken, { isLoading: isExchangingToken }] = useExchangePublicTokenMutation();

  // Animation values
  const panY = useRef(new Animated.Value(0)).current;
  const translateY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });

  // Spinning animation
  const spinValue = useRef(new Animated.Value(0)).current;

  // Start spinning animation
  useEffect(() => {
    if (loading || isCreatingToken || isExchangingToken) {
      startSpinAnimation();
    }
  }, [loading, isCreatingToken, isExchangingToken]);

  const startSpinAnimation = () => {
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  // Create the interpolated rotation value
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Effect to mount the modal with animation
  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      setIsClosing(false);
      Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, panY]);

  // Generate a link token when component mounts
  useEffect(() => {
    if (visible && !linkToken && !isClosing) {
      const getLinkToken = async () => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
          console.log("email", email);
          const response = await createLinkToken({
            clientMutationId: "Gn4hG4j43",
          });
          console.log("plaid createLinkToken response", response);

          if (response.data?.success) {
            dispatch(setLinkToken(response.data.linkToken));
            // Preload Plaid Link after receiving token
            create({ token: response.data.linkToken });
            setButtonDisabled(false);
          } else {
            dispatch(setError(response.data?.message || "Failed to create link token"));
            console.log("Plaid link token error:", response);
          }
        } catch (err) {
          dispatch(setError("An error occurred while creating the link token. Please try again."));
          console.error("Error creating link token:", err);
        } finally {
          dispatch(setLoading(false));
        }
      };

      getLinkToken();
    }
  }, [visible, createLinkToken, dispatch, email, linkToken, isClosing]);

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
      // Reset Plaid state
      dispatch(setLinkToken(null));
      dispatch(setError(null));

      // Unmount the modal completely
      setIsMounted(false);

      // Call the onClose prop after animation completes
      onClose();
    });
  };

  // Handle successful linking
  const handleSuccess = async (success: LinkSuccess) => {
    console.log("accounts", success.metadata.accounts);
    try {
      dispatch(setLoading(true));

      // Store the accounts in Redux
      if (success.metadata.accounts) {
        // Convert LinkAccount to PlaidAccount
        const plaidAccounts: PlaidAccount[] = success.metadata.accounts.map((account) => ({
          id: account.id || "",
          mask: account.mask || "",
          name: account.name || "",
          subtype: account.subtype ? String(account.subtype) : "",
          type: account.type ? String(account.type) : "",
          verificationStatus: account.verificationStatus || "",
        }));
        dispatch(setAccounts(plaidAccounts));
      }

      console.log("plaid success.publicToken", success.publicToken);

      const response = await exchangePublicToken({
        publicToken: success.publicToken,
        moduleKey: moduleKey,
        clientMutationId: "Gn4hG4j43",
      });

      console.log("plaid exchangePublicToken response", response);

      if (response.data?.success) {
        dispatch(setBankLinked(true));

        if (onSuccess) {
          console.log("onSuccess", onSuccess);
          onSuccess();
        }
      } else {
        dispatch(setError(response.data?.message || "Failed to exchange public token"));
        Alert.alert("Error", "There was a problem linking your account. Please try again.", [{ text: "OK" }]);
      }
    } catch (err) {
      console.error("Error exchanging public token:", err);
      dispatch(setError("An error occurred while exchanging the public token. Please try again."));
      Alert.alert("Error", "There was a problem linking your account. Please try again.", [{ text: "OK" }]);
    } finally {
      dispatch(setLoading(false));
      setButtonDisabled(false);
    }
  };

  // Handle exit/cancellation
  const handleExit = (exit: LinkExit) => {
    console.log("Plaid link exit:", exit.error);
    if (!exit.error?.errorCode) {
      closeModal();
    } else if (exit.error) {
      const isUserExit = exit.error.errorMessage && exit.error.errorMessage.toLowerCase().includes("user closed");

      if (!isUserExit) {
        dispatch(setError(exit.error.errorMessage || "An error occurred"));
      } else {
        // If it's a user-initiated exit, close the modal
        closeModal();
      }
    }
    setButtonDisabled(false);
  };

  // Handle opening Plaid
  const handleOpenPlaid = () => {
    if (linkToken) {
      setButtonDisabled(true);
      open({
        onSuccess: handleSuccess,
        onExit: handleExit,
      });
    }
  };

  // Don't render anything if not visible or not mounted
  if (!visible || !isMounted) return null;

  return (
    <Modal visible={true} transparent animationType="none" onRequestClose={closeModal} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContent, { transform: [{ translateY: translateY }] }]} {...panResponder.panHandlers}>
              {/* Drag indicator */}
              <View style={styles.dragIndicatorContainer}>
                <View style={styles.dragIndicator} />
              </View>

              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={closeModal} disabled={isClosing} testID="close-button">
                <Ionicons name="close" size={wp(6)} color="#666" />
              </TouchableOpacity>

              {/* Title */}
              <Text style={styles.title}>Connect Your Bank</Text>

              {/* Description */}
              <Text style={styles.description}>Link your bank account securely with Plaid to enable financial insights and tracking.</Text>

              {/* Main content */}
              <View style={styles.content}>
                {loading || isCreatingToken || isExchangingToken ? (
                  <View style={styles.loadingContainer}>
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Ionicons name="sync" size={wp(10)} color="#4DA6FF" />
                    </Animated.View>
                    <Text style={styles.loadingText}>Connecting to your bank...</Text>
                  </View>
                ) : error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={wp(10)} color="#FF3B30" />
                    <Text style={styles.errorText}>{error}</Text>
                    <GradientButton
                      text="Try Again"
                      colors={COLORS.primary.gradient}
                      onPress={() => {
                        dispatch(setError(null));
                        dispatch(setLinkToken(null));
                      }}
                      style={styles.plaidButton}
                    />
                  </View>
                ) : linkToken ? (
                  <View style={styles.plaidContainer}>
                    <GradientButton
                      text="Connect Bank Account"
                      colors={COLORS.primary.gradient}
                      onPress={handleOpenPlaid}
                      isLoading={buttonDisabled}
                      style={styles.plaidButton}
                    />
                    <View style={styles.securityContainer}>
                      <Ionicons name="shield-checkmark-outline" size={wp(5)} color="#4DA6FF" />
                      <Text style={styles.securityText}>Your data is secured with bank-level encryption. We never store your credentials.</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="time" size={wp(10)} color="#4DA6FF" />
                    <Text style={styles.preparingText}>Preparing secure connection...</Text>
                  </View>
                )}
              </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: hp(40),
    paddingBottom: Platform.OS === "ios" ? hp(3) : hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  dragIndicatorContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: hp(0.8),
  },
  dragIndicator: {
    width: wp(10),
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 2.5,
  },
  closeButton: {
    position: "absolute",
    top: hp(1.5),
    right: wp(4),
    padding: wp(2),
    zIndex: 10,
  },
  title: {
    fontSize: wp(5),
    fontFamily: FONTS.bold,
    color: "#333333",
    textAlign: "center",
    marginTop: hp(1.5),
    marginBottom: hp(0.8),
  },
  description: {
    fontSize: wp(3.5),
    fontFamily: FONTS.regular,
    color: "#666666",
    textAlign: "center",
    marginHorizontal: wp(6),
    marginBottom: hp(2),
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(5),
    marginBottom: hp(3),
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(4),
  },
  spinningIcon: {
    transform: [{ rotate: "0deg" }],
  },
  loadingText: {
    marginTop: hp(1.5),
    color: "#333333",
    fontSize: wp(4),
    fontFamily: FONTS.regular,
    textAlign: "center",
  },
  preparingText: {
    marginTop: hp(1.5),
    color: "#333333",
    fontSize: wp(4),
    fontFamily: FONTS.regular,
    textAlign: "center",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(3),
    width: "100%",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: wp(4),
    fontFamily: FONTS.regular,
    marginVertical: hp(1.5),
    textAlign: "center",
    marginBottom: hp(2),
  },
  retryButton: {
    width: "100%",
  },
  plaidContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  plaidButton: {
    width: "100%",
    marginBottom: hp(2),
  },
  securityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F9FF",
    padding: hp(1.5),
    borderRadius: 8,
    marginTop: hp(1.5),
  },
  securityText: {
    fontSize: wp(3),
    fontFamily: FONTS.regular,
    color: "#666",
    textAlign: "left",
    marginLeft: wp(2),
    flex: 1,
  },
});

export default PlaidModal;