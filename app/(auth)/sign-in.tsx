import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,

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
import { useFocusEffect } from "expo-router";
import { useAuth } from "@/contexts/AppStateContext";
import { COLORS } from "@/constants/theme";
import SafeAreaWrapper  from "@/components/ui/SafeAreaWrapper";
import { Ionicons } from "@expo/vector-icons";

export default function SignInScreen() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      if (!email || !password) {
        setError("Please enter both email and password");
        return;
      }
      
      const result = await login({ email, password });
      if (result.success) {
        // Login successful, navigation will be handled by the layout
        router.replace("/(main)/" as any);
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    }
  };

  const renderInitial = () => (
    <>
      <View className="mb-8">
        <Text className="text-md font-regular text-typography-white mb-4">Email</Text>
        <TextInput
          className={`bg-white rounded-lg p-4 text-md font-regular mb-4 ${error ? 'border-2 border-[#f80404]' : ''}`}
          placeholder="Enter your email address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(""); // Clear error when user types
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={COLORS.text.secondary}
          style={{ minHeight: 44 }}
        />
        
        <Text className="text-md font-regular text-typography-white mb-4">Password</Text>
        <TextInput
          className={`bg-white rounded-lg p-4 text-md font-regular mb-2 ${error ? 'border-2 border-[#f80404]' : ''}`}
          placeholder="Enter your password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(""); // Clear error when user types
          }}
          secureTextEntry
          autoCapitalize="none"
          placeholderTextColor={COLORS.text.secondary}
          style={{ minHeight: 44 }}
        />
        
        {error ? (
          <View className="bg-white rounded p-2 mb-4">
            <Text className="text-[#f80404] text-sm font-regular text-center">
              {error}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-1">
        <GradientButton 
          text="Sign In" 
          onPress={handleSignIn}
          colors={["#001117", "#001117"]} 
          isLoading={isLoading} 
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
          <Ionicons name="logo-google" size={24} color="#FFFFFF" />
          <Text className="text-md text-typography-white font-semiBold">Google</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-primary-oceanBlue950 rounded-lg py-3 flex-row items-center justify-center w-[47%] gap-2"
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          style={{ minHeight: 44 }}
        >
          <Ionicons name="logo-facebook" size={24} color="#FFFFFF" />
          <Text className="text-md text-typography-white font-semiBold">Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-primary-oceanBlue950 rounded-lg py-3 flex-row items-center justify-center w-[47%] gap-2"
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          style={{ minHeight: 44 }}
        >
          <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
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
        <View style={{ flex: 1, height: "100%", backgroundColor: 'rgba(255,255,255,0.05)' }}>
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
                  {renderSocialButtons()}
                </ScrollView>
              </KeyboardAvoidingView>
            </Animated.View>
          </SafeAreaView>
        </View>
      </LinearGradient>
    </SafeAreaWrapper>
  );
}
