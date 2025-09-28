import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import { GradientButton } from "@/components/ui/buttons/GradientButton";
import { LinearGradient } from "expo-linear-gradient";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { useFocusEffect } from "expo-router";
import { useLoginMutation, useVerifyOtpMutation } from "@/redux/auth";
import { useAuth } from "@hooks/useAuth";
import { COLORS } from "@/constants/theme";
import SafeAreaWrapper  from "@/components/ui/SafeAreaWrapper";

export default function SignInScreen() {
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [verifyOtp, { isLoading: isVerifyLoading }] = useVerifyOtpMutation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [isConfirmation, setIsConfirmation] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const router = useRouter();
  const slideUpAnim = useRef(new Animated.Value(Dimensions.get("window").height)).current;
  const slideHorizontalAnim = useRef(new Animated.Value(-Dimensions.get("window").width)).current;
  const params = useLocalSearchParams();
  const slideUp = params.slideUp === "true";
  const slideFromLeft = params.slideFromLeft === "true";

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
    // Validate animation values
    const windowHeight = Dimensions.get("window").height;
    const windowWidth = Dimensions.get("window").width;
   
    if (slideUp) {
      // Start with the content off-screen at the bottom
      const targetHeight = isNaN(windowHeight) ? 800 : windowHeight;
      slideUpAnim.setValue(targetHeight);
      slideHorizontalAnim.setValue(0);

      // Then animate it up
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (slideFromLeft) {
      // Start with the content off-screen to the left
      slideUpAnim.setValue(0);
      const targetWidth = isNaN(windowWidth) ? 400 : windowWidth;
      slideHorizontalAnim.setValue(-targetWidth);

      // Then animate it from left to right
      Animated.timing(slideHorizontalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // If not animating, ensure the content is already in position
      slideUpAnim.setValue(0);
      slideHorizontalAnim.setValue(0);
    }
  }, [slideUp, slideFromLeft, slideUpAnim, slideHorizontalAnim]);

  const handleSignIn = async () => {
    try {
      setError("");
      const result = await login({ email }).unwrap();
      if (result && result.success) {
        setIsConfirmation(true);
      } else {
        setError(result?.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleResendCode = async () => {
    try {
      setError("");
      const result = await login({ email }).unwrap();
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

  const handleVerifyOtp = async (otp: string) => {
    try {
      setError("");
      const result = await verifyOtp({ otp, email }).unwrap();
      if (result?.success && result?.tokenAuth) {
        await signIn(result.tokenAuth.accessToken, result.tokenAuth.refreshToken, email, result.clientMutationId);

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
      handleVerifyOtp(newCode.join(""));
    }
  };

  const renderInitial = () => (
    <>
      <View className="mb-8">
        <Text className="text-md font-regular text-typography-white mb-4">Email/Phone</Text>
        <TextInput
          className={`bg-white rounded-lg p-4 text-md font-regular mb-2 ${error ? 'border-2 border-[#f80404]' : ''}`}
          placeholder="Enter your email / phone number"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={COLORS.text.secondary}
          style={{ minHeight: 44 }}
        />
        <Text className="text-xs font-regular text-typography-white opacity-80 leading-tight">
          Enter your email address or phone number to receive a code via email or SMS
        </Text>
        {error ? (
          <Text className="text-[#f80404] bg-white text-l font-regular text-center mb-4">
            {error.includes('User matching query does not exist') ? "You don't have an account" : error}
          </Text>
        ) : null}
      </View>

      <View className="mt-1">
        <GradientButton 
          text="Sign In" 
          onPress={() => {
            handleSignIn();
          }} 
          colors={["#001117", "#001117"]} 
          isLoading={isLoginLoading} 
        />
      </View>

      <View className="flex-col items-center mt-6 gap-2">
        <Text className="text-md text-typography-white font-regular">Don't have an account ?</Text>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/(auth)/sign-up",
              params: { slideFromRight: "true" },
            });
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ minHeight: 44, minWidth: 100 }}
        >
          <Text className="text-md text-typography-white font-semiBold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderSocialButtons = () => (
    <>
      <View className="flex-row items-center my-8">
        <View className="flex-1 h-px bg-typography-white opacity-60" />
        <Text className="text-typography-white mx-4 font-regular">OR</Text>
        <View className="flex-1 h-px bg-typography-white opacity-60" />
      </View>

      <View className="flex-row justify-center flex-wrap gap-2 mt-2.5">
        <TouchableOpacity 
          className="bg-primary-oceanBlue950 rounded-lg py-3 flex-row items-center justify-center w-[47%] gap-2"
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          style={{ minHeight: 44 }}
        >
          <Image source={require("@assets/images/icons/google.png")} className="w-6 h-6" />
          <Text className="text-md text-typography-white font-semiBold">Google</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-primary-oceanBlue950 rounded-lg py-3 flex-row items-center justify-center w-[47%] gap-2"
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          style={{ minHeight: 44 }}
        >
          <Image source={require("@assets/images/icons/facebook.png")} className="w-6 h-6" />
          <Text className="text-md text-typography-white font-semiBold">Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-primary-oceanBlue950 rounded-lg py-3 flex-row items-center justify-center w-[47%] gap-2"
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          style={{ minHeight: 44 }}
        >
          <Image source={require("@assets/images/icons/apple.png")} className="w-6 h-6" />
          <Text className="text-md text-typography-white font-semiBold">Apple</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaWrapper>
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
                  transform: [{ translateY: slideUpAnim }, { translateX: slideHorizontalAnim }],
                },
              ]}
              pointerEvents="box-none"
            >
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-5 mt-20 pb-5">
                  <Text className="text-4xl font-bold text-typography-white  mb-14 text-center">Sign-In</Text>
                  
                  {renderInitial()}
                  {!isConfirmation && renderSocialButtons()}
                </ScrollView>
              </KeyboardAvoidingView>
              {isConfirmation && (
                <ConfirmationModal
                  email={email}
                  code={code}
                  onCodeChange={handleCodeChange}
                  onChangeEmail={() => setIsConfirmation(false)}
                  onComplete={() => handleVerifyOtp(code.join(""))}
                  onClose={() => setIsConfirmation(false)}
                  onResendCode={handleResendCode}
                  isLoading={isVerifyLoading}
                />
              )}
            </Animated.View>
          </SafeAreaView>
        </ImageBackground>
      </LinearGradient>
    </SafeAreaWrapper>
  );
}
