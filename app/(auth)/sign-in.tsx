import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  BackHandler,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { GradientButton } from "@/components/ui/buttons/GradientButton";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useAuth } from "@/contexts/AppStateContext";
import { COLORS } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Handles sign in functionality
export default function SignInScreen() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Handle back button press on Android
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

  // Handles user sign in
  const handleSignIn = async () => {
    try {
      setError("");
      if (!email || !password) {
        setError("Please enter both email and password");
        return;
      }
      
      const result = await login({ email, password });
      if (result.success) {
        router.replace("/(main)/" as any);
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient 
        colors={["#006389", "#33B7E9"]} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 0, y: 1 }} 
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.keyboardView}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View style={styles.header}>
                <Text className="text-4xl font-bold text-white text-center">Sign In</Text>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                <Text className="text-md font-regular text-white mb-3">Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    error ? styles.inputError : null
                  ]}
                  placeholder="Enter your email address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={COLORS.text.secondary}
                  editable={!isLoading}
                />
                
                <Text className="text-md font-regular text-white mb-3 mt-4">Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    error ? styles.inputError : null
                  ]}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError("");
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  placeholderTextColor={COLORS.text.secondary}
                  editable={!isLoading}
                />
                
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text className="text-[#f80404] text-sm font-regular text-center">
                      {error}
                    </Text>
                  </View>
                ) : null}

                {/* Sign In Button */}
                <View style={styles.buttonContainer}>
                  <GradientButton 
                    text="Sign In" 
                    onPress={handleSignIn}
                    colors={["#001117", "#001117"]} 
                    isLoading={isLoading} 
                  />
                </View>

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                  <Text className="text-md text-white font-regular">Don't have an account?</Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/sign-up")}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    disabled={isLoading}
                  >
                    <Text className="text-md text-white font-semiBold ml-1">Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text className="text-white mx-4 font-regular">OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Buttons */}
              <View style={styles.socialContainer}>
                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.7}
                  disabled={isLoading}
                  onPress={() => Alert.alert('Coming soon', 'Sign in with Google isn\'t available yet.')}
                >
                  <Ionicons name="logo-google" size={24} color="#FFFFFF" />
                  <Text className="text-md text-white font-semiBold ml-2">Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.7}
                  disabled={isLoading}
                  onPress={() => Alert.alert('Coming soon', 'Sign in with Facebook isn\'t available yet.')}
                >
                  <Ionicons name="logo-facebook" size={24} color="#FFFFFF" />
                  <Text className="text-md text-white font-semiBold ml-2">Facebook</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.7}
                  disabled={isLoading}
                  onPress={() => Alert.alert('Coming soon', 'Sign in with Apple isn\'t available yet.')}
                >
                  <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
                  <Text className="text-md text-white font-semiBold ml-2">Apple</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 40,
  },
  formContainer: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 50,
    color: '#000000',
  },
  inputError: {
    borderWidth: 2,
    borderColor: '#f80404',
  },
  errorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
  },
  buttonContainer: {
    marginTop: 24,
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  socialContainer: {
    gap: 12,
    marginBottom: 20,
  },
  socialButton: {
    backgroundColor: 'rgba(0, 17, 23, 0.4)',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
