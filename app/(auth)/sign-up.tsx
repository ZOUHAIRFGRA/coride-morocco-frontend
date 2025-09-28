import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import { GradientButton } from "@/components/ui/buttons/GradientButton";
import { LinearGradient } from "expo-linear-gradient";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { useFocusEffect } from "expo-router";
import { useCreateUserMutation, useLoginMutation, useVerifyOtpMutation } from "@redux/auth";
import { useAuth } from "@hooks/useAuth";
import { COLORS } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";

type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Tabs: undefined;
};

export default function SignUpScreen() {
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [verifyOtp, { isLoading: isVerifyLoading }] = useVerifyOtpMutation();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    handle: "",
  });
  const [isConfirmation, setIsConfirmation] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useLocalSearchParams();
  const slideFromRight = params.slideFromRight === "true";
  const slideUp = params.slideUp === "true";

  // Determine initial position based on params
  const initialTranslateX = slideFromRight ? Dimensions.get("window").width : 0;
  const initialTranslateY = slideUp ? Dimensions.get("window").height : 0;

  const slideHorizontalAnim = useRef(new Animated.Value(initialTranslateX)).current;
  const slideUpAnim = useRef(new Animated.Value(initialTranslateY)).current;
  const userInfoModalAnim = useRef(new Animated.Value(Dimensions.get("window").height)).current;

  // Handle back button press
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.push("/(public)/onboarding");
        return true; // Prevent default behavior
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => subscription.remove();
    }, [router])
  );

  useEffect(() => {
    if (slideFromRight) {
      // Start with the content off-screen to the right
      slideHorizontalAnim.setValue(Dimensions.get("window").width);
      // slideUpAnim.setValue(0); // Keep initial value if not sliding up

      // Then animate it from right to left
      Animated.timing(slideHorizontalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (slideUp) {
      // Start with the content off-screen at the bottom
      slideHorizontalAnim.setValue(0);
      // slideHorizontalAnim.setValue(0); // Keep initial value if not sliding right

      // Then animate it up
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // If not animating, ensure the content is already in position
      slideHorizontalAnim.setValue(0);
      // slideUpAnim.setValue(0);
    }
  }, [slideFromRight, slideUp]);

  // Function to handle complete sign up
  const handleSignUp = async () => {
    // Validate all required fields
    if (!formData.email || !formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (!formData.firstName.trim()) {
      setError("First name is required");
      return;
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return;
    }

    if (!formData.handle.trim()) {
      setError("Username is required");
      return;
    }

    try {
      setError("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // First create the user
      const userResult = await createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        handle: formData.handle,
        // otherNames: "test",
      }).unwrap();

      if (!userResult.success) {
        setError(userResult.message || "Failed to create user");
        return;
      }

      // Then get OTP for verification
      const result = await login({ email: formData.email }).unwrap();
      if (result && result.success) {
        setIsConfirmation(true); // Show confirmation modal
      } else {
        setError(result?.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError("Failed to complete sign up. Please try again.");
    }
  };

  const handleResendCode = async () => {
    try {
      setError("");
      const result = await login({ email: formData.email }).unwrap();
      if (result && result.success) {
        // Reset the code inputs
        setCode(["", "", "", "", "", ""]);
      } else {
        setError(result?.message || "Failed to resend code");
      }
    } catch (err) {
      console.error("Resend code error:", err);
      setError("Failed to resend code. Please try again.");
    }
  };

  const handleVerifyOtp = async (newCode: string[]) => {
    try {
      setError("");
      const otp = newCode.join("");
      const result = await verifyOtp({ email: formData.email, otp }).unwrap();
      if (result?.success && result?.tokenAuth) {
        await signIn(result.tokenAuth.accessToken, result.tokenAuth.refreshToken, formData.email, result.clientMutationId);

        // Profile fetching is now handled in app/_layout.tsx
        router.replace("/investment/(tabs)/investment");
      } else {
        setError(result?.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError("Failed to verify OTP. Please try again.");
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    setError("");

    // If all codes are filled, verify OTP
    if (newCode.every((digit) => digit !== "")) {
      handleVerifyOtp(newCode);
    }
  };

  const renderSocialButtons = () => (
    <>
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-typography-white opacity-60" />
        <Text className="text-typography-white mx-4 font-regular">OR</Text>
        <View className="flex-1 h-px bg-typography-white opacity-60" />
      </View>

      <View className="flex-row justify-center flex-wrap gap-2 mt-2.5">
        <TouchableOpacity className="bg-primary-oceanBlue950 rounded-lg py-3 flex-row items-center justify-center w-[47%] gap-2">
          <Image source={require("@assets/images/icons/google.png")} className="w-6 h-6" />
          <Text className="text-base text-typography-white font-semiBold">Google</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-primary-oceanBlue950 rounded-lg py-3 flex-row items-center justify-center w-[47%] gap-2">
          <Image source={require("@assets/images/icons/facebook.png")} className="w-6 h-6" />
          <Text className="text-base text-typography-white font-semiBold">Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-primary-oceanBlue950 rounded-lg py-3 flex-row items-center justify-center w-[47%] gap-2">
          <Image source={require("@assets/images/icons/apple.png")} className="w-6 h-6" />
          <Text className="text-base text-typography-white font-semiBold">Apple</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderSuccess = () => (
    <View className="absolute inset-0 bg-black/40 justify-center items-center">
      <View className="bg-white rounded-[32px] p-6 w-[90%] items-center">
        <Image source={require("@assets/images/icons/success.png")} className="w-36 h-36 mb-6" />
        <Text className="text-xl font-bold text-typography-950 mb-2 text-center">Account created successfully!</Text>
        <Text className="text-base font-regular text-typography-600 mb-8 text-center">Your account has been successfully created.</Text>
        <View className="w-full">
          <GradientButton text="Continue" onPress={() => router.replace("/investment/(tabs)/investment")} colors={["#006389", "#33B7E9"]} />
        </View>
      </View>
    </View>
  );

  const renderInitial = () => (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-5 pb-5">
        <Text className="text-4xl font-bold text-typography-white mb-14 text-center mt-20 px-5">Sign-Up</Text>

        {/* Name Fields */}
        <View className="flex-row justify-between mb-4">
          <View className="w-[49%]">
            <Text className="text-base font-regular text-typography-white mb-2">First Name</Text>
            <TextInput
              className="bg-white rounded-lg p-4 text-md font-regular"
              placeholder="First name"
              placeholderTextColor={COLORS.text.secondary}
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          <View className="w-[49%]">
            <Text className="text-base font-regular text-typography-white mb-2">Last Name</Text>
            <TextInput
              className="bg-white rounded-lg p-4 text-md font-regular"
              placeholder="Last name"
              placeholderTextColor={COLORS.text.secondary}
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-base font-regular text-typography-white mb-2">Email</Text>
          <TextInput
            className="bg-white rounded-lg p-4 text-md font-regular"
            placeholder="Enter your email address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            placeholderTextColor={COLORS.text.secondary}
            autoCapitalize="none"
            returnKeyType="next"
          />
        </View>

        {/* Username Field */}
        <View className="mb-6">
          <Text className="text-base font-regular text-typography-white mb-2">Username</Text>
          <View className="flex-row items-center bg-white rounded-lg overflow-hidden">
            <View className="bg-gray-200 py-4 px-3">
              <Text className="text-base font-semiBold text-gray-700">@</Text>
            </View>
            <TextInput
              className="flex-1 p-4 text-md font-regular"
              placeholder="username"
              placeholderTextColor={COLORS.text.secondary}
              value={formData.handle}
              onChangeText={(text) => {
                // Remove @ if user types it (since we're displaying it separately)
                const cleanText = text.startsWith("@") ? text.substring(1) : text;
                setFormData({ ...formData, handle: cleanText });
              }}
              autoCapitalize="none"
              returnKeyType="done"
            />
          </View>
        </View>

        <View className="flex-col justify-center items-center mt-1">
          {(() => {
            const isFormValid =
              formData.email.includes("@") && formData.firstName.trim() !== "" && formData.lastName.trim() !== "" && formData.handle.trim() !== "";

            return (
              <GradientButton
                text="Sign Up"
                onPress={isFormValid ? handleSignUp : () => {}}
                colors={isFormValid ? ["#001117", "#001117"] : ["#666666", "#666666"]}
                style={isFormValid ? {} : { opacity: 0.7 }}
                isLoading={isCreatingUser || isLoginLoading}
              />
            );
          })()}

          <Text className="text-base text-typography-white mt-10">You already have an account ?</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(auth)/sign-in",
                params: { slideFromLeft: "true" },
              })
            }
          >
            <Text className="text-base text-typography-white font-semiBold">Sign In</Text>
          </TouchableOpacity>
        </View>

        {renderSocialButtons()}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <LinearGradient colors={["#006389", "#33B7E9"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1, height: "100%" }}>
        <ImageBackground
          source={require("@assets/images/background/background_1.png")}
          imageStyle={{ opacity: 0.1 }}
          style={{ flex: 1, height: "100%" }}
        >
          <SafeAreaView className="flex-1">
            <Animated.View
              style={[
                { flex: 1 },
                {
                  transform: [{ translateX: slideHorizontalAnim }, { translateY: slideUpAnim }],
                },
              ]}
              pointerEvents="box-none"
            >
              {error ? <Text className="text-[#FFD2D2] text-sm font-regular text-center my-4 bg-red-900/20 p-2 mx-5 rounded-lg">{error}</Text> : null}
              {renderInitial()}
              {isConfirmation && !isSuccess && (
                <ConfirmationModal
                  email={formData.email}
                  code={code}
                  onCodeChange={handleCodeChange}
                  onChangeEmail={() => setIsConfirmation(false)}
                  onComplete={() => handleVerifyOtp(code)}
                  onClose={() => setIsConfirmation(false)}
                  onResendCode={handleResendCode}
                  isLoading={isVerifyLoading}
                />
              )}
              {isSuccess && renderSuccess()}
            </Animated.View>
          </SafeAreaView>
        </ImageBackground>
      </LinearGradient>
    </>
  );
}