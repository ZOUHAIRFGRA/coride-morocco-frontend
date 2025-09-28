import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,

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
import { useFocusEffect } from "expo-router";
import { useAuth } from "@/contexts/AppStateContext";
import { COLORS } from "@/constants/theme";
import { UserRole } from "@/types/auth";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import SafeAreaWrapper from "@/components/ui/SafeAreaWrapper";
import { Ionicons } from "@expo/vector-icons";

export default function SignUpScreen() {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });
  const router = useRouter();
  const params = useLocalSearchParams();
  const slideFromRight = params.slideFromRight === "true";
  const slideRightAnim = useRef(new Animated.Value(Dimensions.get("window").width)).current;

  // Handle back button press
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.push("/(public)/onboarding");
        return true;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [router])
  );

  useEffect(() => {
    const windowWidth = Dimensions.get("window").width;
    
    if (slideFromRight) {
      slideRightAnim.setValue(isNaN(windowWidth) ? 400 : windowWidth);
      Animated.timing(slideRightAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      slideRightAnim.setValue(0);
    }
  }, [slideFromRight, slideRightAnim]);

  // Client-side validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) return true; // Optional field
    // Morocco phone formats: +212XXXXXXXXX or 06XXXXXXXX/07XXXXXXXX
    const phoneRegex = /^(\+212[5-7]\d{8}|0[6-7]\d{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    // Match exact backend validation logic
    if (password.length < 8) {
      return {
        isValid: false,
        message: "Password must be at least 8 characters long"
      };
    }
    
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one uppercase letter"
      };
    }
    
    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one lowercase letter"
      };
    }
    
    if (!/\d/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one number"
      };
    }
    
    // Match backend special characters regex exactly
    if (!/[!@#$%^&*(),.?":{}|<>\[\]+=_\-~\/`;\\]/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>[]+=_-~/`;\\)"
      };
    }
    
    return {
      isValid: true,
      message: undefined
    };
  };

  const handleSignUp = async () => {
    try {
      setError("");
      
      // Comprehensive client-side validation
      if (!formData.firstName.trim()) {
        setError("First name is required");
        return;
      }
      
      if (!formData.lastName.trim()) {
        setError("Last name is required");
        return;
      }
      
      if (!formData.email.trim()) {
        setError("Email is required");
        return;
      }
      
      if (!validateEmail(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }
      
      if (!formData.password.trim()) {
        setError("Password is required");
        return;
      }
      
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.message || "Password does not meet security requirements");
        return;
      }
      
      if (formData.phone && !validatePhone(formData.phone)) {
        setError("Invalid phone number format. Use +212XXXXXXXXX or 06XXXXXXXX/07XXXXXXXX");
        return;
      }

      // Show haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Register user
      const result = await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || undefined,
        preferred_language: 'fr', // Default to French for Morocco
        role: UserRole.RIDER, // Default role as per API docs
      });

      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.replace("/(main)/" as any);
        }, 2000);
      } else {
        // Display specific error message from API
        setError(result.error || "Failed to create account. Please try again.");
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError("Failed to create account. Please try again.");
    }
  };

  const renderSuccess = () => (
    <View className="flex-1 justify-center items-center px-5">
      <View className="w-24 h-24 mb-8 justify-center items-center">
        <Ionicons 
          name="checkmark-circle" 
          size={96} 
          color="#FFFFFF" 
        />
      </View>
      <Text className="text-3xl font-bold text-typography-white text-center mb-4">
        Welcome to CoRide!
      </Text>
      <Text className="text-lg text-typography-white text-center opacity-80">
        Your account has been created successfully. You can now start carpooling!
      </Text>
    </View>
  );

  const renderForm = () => (
    <>
      <Text className="text-4xl font-bold text-typography-white mb-14 text-center">Create Account</Text>
      
      <View className="mb-8">
        {/* First Name */}
        <Text className="text-md font-regular text-typography-white mb-4">First Name</Text>
        <TextInput
          className={`bg-white rounded-lg p-4 text-md font-regular mb-4 ${error ? 'border-2 border-[#f80404]' : ''}`}
          placeholder="Enter your first name"
          value={formData.firstName}
          onChangeText={(text) => {
            setFormData({ ...formData, firstName: text });
            setError("");
          }}
          autoCapitalize="words"
          placeholderTextColor={COLORS.text.secondary}
          style={{ minHeight: 44 }}
        />

        {/* Last Name */}
        <Text className="text-md font-regular text-typography-white mb-4">Last Name</Text>
        <TextInput
          className={`bg-white rounded-lg p-4 text-md font-regular mb-4 ${error ? 'border-2 border-[#f80404]' : ''}`}
          placeholder="Enter your last name"
          value={formData.lastName}
          onChangeText={(text) => {
            setFormData({ ...formData, lastName: text });
            setError("");
          }}
          autoCapitalize="words"
          placeholderTextColor={COLORS.text.secondary}
          style={{ minHeight: 44 }}
        />

        {/* Email */}
        <Text className="text-md font-regular text-typography-white mb-4">Email</Text>
        <TextInput
          className={`bg-white rounded-lg p-4 text-md font-regular mb-2 ${error || fieldErrors.email ? 'border-2 border-[#f80404]' : ''}`}
          placeholder="Enter your email address"
          value={formData.email}
          onChangeText={(text) => {
            setFormData({ ...formData, email: text });
            setError("");
            
            // Real-time email validation
            if (text && !validateEmail(text)) {
              setFieldErrors({ ...fieldErrors, email: "Please enter a valid email address" });
            } else {
              setFieldErrors({ ...fieldErrors, email: "" });
            }
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={COLORS.text.secondary}
          style={{ minHeight: 44 }}
        />
        {fieldErrors.email ? (
          <Text className="text-[#f80404] text-xs mb-2 ml-1">{fieldErrors.email}</Text>
        ) : null}

        {/* Phone (Optional) */}
        <Text className="text-md font-regular text-typography-white mb-4">Phone Number (Optional)</Text>
        <TextInput
          className={`bg-white rounded-lg p-4 text-md font-regular mb-2 ${error || fieldErrors.phone ? 'border-2 border-[#f80404]' : ''}`}
          placeholder="+212XXXXXXXXX or 06XXXXXXXX"
          value={formData.phone}
          onChangeText={(text) => {
            setFormData({ ...formData, phone: text });
            setError("");
            
            // Real-time phone validation
            if (text && !validatePhone(text)) {
              setFieldErrors({ ...fieldErrors, phone: "Format: +212XXXXXXXXX or 06XXXXXXXX/07XXXXXXXX" });
            } else {
              setFieldErrors({ ...fieldErrors, phone: "" });
            }
          }}
          keyboardType="phone-pad"
          placeholderTextColor={COLORS.text.secondary}
          style={{ minHeight: 44 }}
        />
        {fieldErrors.phone ? (
          <Text className="text-[#f80404] text-xs mb-2 ml-1">{fieldErrors.phone}</Text>
        ) : null}

        {/* Password */}
        <Text className="text-md font-regular text-typography-white mb-4">Password</Text>
        <TextInput
          className={`bg-white rounded-lg p-4 text-md font-regular mb-2 ${error || fieldErrors.password ? 'border-2 border-[#f80404]' : ''}`}
          placeholder="Create a secure password"
          value={formData.password}
          onChangeText={(text) => {
            setFormData({ ...formData, password: text });
            setError("");
            
            // Real-time password validation
            if (text) {
              const validation = validatePassword(text);
              if (!validation.isValid) {
                setFieldErrors({ ...fieldErrors, password: validation.message || "" });
              } else {
                setFieldErrors({ ...fieldErrors, password: "" });
              }
            } else {
              setFieldErrors({ ...fieldErrors, password: "" });
            }
          }}
          secureTextEntry
          autoCapitalize="none"
          placeholderTextColor={COLORS.text.secondary}
          style={{ minHeight: 44 }}
        />
        {fieldErrors.password ? (
          <Text className="text-[#f80404] text-xs mb-2 ml-1 leading-4">{fieldErrors.password}</Text>
        ) : null}
        
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
          text="Create Account" 
          onPress={handleSignUp}
          colors={["#001117", "#001117"]} 
          isLoading={isLoading} 
        />
      </View>

      <View className="flex-col items-center mt-6 gap-2">
        <Text className="text-md text-typography-white font-regular">Already have an account?</Text>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/(auth)/sign-in",
              params: { slideFromLeft: "true" },
            });
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ minHeight: 44, minWidth: 100 }}
        >
          <Text className="text-md text-typography-white font-semiBold">Sign In</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaWrapper>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={["#006389", "#33B7E9"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <SafeAreaView className="flex-1">
            <Animated.View
              style={[
                { flex: 1 },
                {
                  transform: [{ translateX: slideRightAnim }],
                },
              ]}
              pointerEvents="box-none"
            >
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-5 mt-20 pb-5">
                  {isSuccess ? renderSuccess() : renderForm()}
                </ScrollView>
              </KeyboardAvoidingView>
            </Animated.View>
          </SafeAreaView>
        </View>
      </LinearGradient>
    </SafeAreaWrapper>
  );
}