import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { pickImageAndUpload, takePictureAndUpload } from "@/utils/cloudinary";
import { useUser } from "@/hooks/useUserProfile";
import type { UserProfile, UpdateProfileRequest } from "@/types/user";
import type { UserResponse } from "@/types/auth";

interface EditProfileProps {
  userProfile: UserProfile | UserResponse | null;
  profileImageUrl: string | null;
  setProfileImageUrl: (url: string | null) => void;
  editViewStyle: any;
  toggleEditMode: (edit: boolean) => void;
  onSaveRef?: React.MutableRefObject<(() => Promise<void>) | null>;
}

export default function EditProfile({
  userProfile,
  profileImageUrl,
  setProfileImageUrl,
  editViewStyle,
  toggleEditMode,
  onSaveRef,
}: EditProfileProps) {
  // State for profile form data - matching the CoRide API structure
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    preferred_language: "",
    bio: "",
  });

  // Use CoRide user hooks
  const { updateProfile, isLoading: isUpdating } = useUser();
  
  // Enhanced error handling states
  const [errorState, setErrorState] = useState<{
    hasError: boolean;
    message: string;
    type: 'validation' | 'network' | 'server' | 'phone_taken' | 'unknown';
    field?: string;
    canRetry: boolean;
  }>({ hasError: false, message: '', type: 'unknown', canRetry: false });

  // State for uploading image
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Initialize form data when profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        phone: userProfile.phone || "",
        preferred_language: userProfile.preferred_language || "en",
        bio: (userProfile as UserProfile)?.bio || "",
      });
    }
  }, [userProfile]);

  // Helper function to parse and categorize errors
  const parseError = (error: any): typeof errorState => {
    if (typeof error === 'string') {
      if (error.toLowerCase().includes('phone number is already registered')) {
        return {
          hasError: true,
          message: 'This phone number is already registered by another user. Please use a different phone number.',
          type: 'phone_taken',
          field: 'phone',
          canRetry: false
        };
      }
      if (error.toLowerCase().includes('network') || error.toLowerCase().includes('timeout')) {
        return {
          hasError: true,
          message: 'Network error. Please check your connection and try again.',
          type: 'network',
          canRetry: true
        };
      }
      if (error.toLowerCase().includes('validation')) {
        return {
          hasError: true,
          message: 'Please check your information and try again.',
          type: 'validation',
          canRetry: false
        };
      }
    }
    
    // Handle structured error objects
    if (error && typeof error === 'object') {
      if (error.message) {
        const message = error.message.toLowerCase();
        if (message.includes('phone number is already registered')) {
          return {
            hasError: true,
            message: 'This phone number is already registered by another user. Please use a different phone number.',
            type: 'phone_taken',
            field: 'phone',
            canRetry: false
          };
        }
        if (message.includes('network') || message.includes('timeout') || message.includes('fetch')) {
          return {
            hasError: true,
            message: 'Network error. Please check your connection and try again.',
            type: 'network',
            canRetry: true
          };
        }
        if (error.statusCode >= 500) {
          return {
            hasError: true,
            message: 'Server error. Please try again in a few moments.',
            type: 'server',
            canRetry: true
          };
        }
      }
    }
    
    return {
      hasError: true,
      message: 'An unexpected error occurred. Please try again.',
      type: 'unknown',
      canRetry: true
    };
  };

  // Clear error when form data changes and retry function
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    // Clear error when user starts typing in the field that had an error
    if (errorState.hasError && errorState.field === field) {
      setErrorState({ hasError: false, message: '', type: 'unknown', canRetry: false });
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Retry function for retryable errors
  const handleRetry = () => {
    setErrorState({ hasError: false, message: '', type: 'unknown', canRetry: false });
    handleSaveChanges();
  };

  // Handle saving profile changes - using CoRide API with enhanced error handling
  const handleSaveChanges = async () => {
    // Clear previous errors
    setErrorState({ hasError: false, message: '', type: 'unknown', canRetry: false });
    
    // Prepare input for the CoRide API
    const input: UpdateProfileRequest = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      preferred_language: formData.preferred_language,
      bio: formData.bio,
    };

    try {
      const response = await updateProfile(input);
      
      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", "Profile updated successfully", [{ text: "OK", onPress: () => toggleEditMode(false) }]);
      } else {
        // Parse and set specific error
        const errorInfo = parseError(response.error);
        setErrorState(errorInfo);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        // Show alert for critical errors that need immediate attention
        if (errorInfo.type === 'phone_taken') {
          Alert.alert(
            "Phone Number Already Registered", 
            errorInfo.message,
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.error("Profile update error:", error);
      const errorInfo = parseError(error);
      setErrorState(errorInfo);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Expose the save method to parent component
  useEffect(() => {
    if (onSaveRef) {
      onSaveRef.current = handleSaveChanges;
    }
  }, [onSaveRef, formData, profileImageUrl]);

  // Handle uploading profile image
  const handleProfileImageUpload = async () => {
    try {
      // Show action sheet for upload options
      Alert.alert(
        "Update Profile Picture",
        "Choose an option",
        [
          {
            text: "Take Photo",
            onPress: async () => {
              try {
                setIsUploadingImage(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                const result = await takePictureAndUpload();
                if (result) {
                  setProfileImageUrl(result.imageUrl);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              } catch (error) {
                console.error("Error taking photo:", error);
                Alert.alert("Error", "Failed to take photo. Please try again.");
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              } finally {
                setIsUploadingImage(false);
              }
            },
          },
          {
            text: "Choose from Library",
            onPress: async () => {
              try {
                setIsUploadingImage(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                const result = await pickImageAndUpload();
                if (result) {
                  setProfileImageUrl(result.imageUrl);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              } catch (error) {
                console.error("Error picking image:", error);
                Alert.alert("Error", "Failed to pick image. Please try again.");
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              } finally {
                setIsUploadingImage(false);
              }
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error("Error handling image upload:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  // Get image URL with fallback
  const getEditProfileImageUrl = () => {
    if (profileImageUrl) return profileImageUrl;
    if ((userProfile as UserProfile)?.profile_photo_url) return (userProfile as UserProfile).profile_photo_url;
    
    // Use initials-based avatar service for consistency
    const fullName = userProfile?.first_name && userProfile?.last_name 
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : userProfile?.first_name || userProfile?.email || "User";
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0F4C75&color=fff&size=100`;
  };

  return (
    <Animated.View style={editViewStyle}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16, paddingTop: 24 }} keyboardShouldPersistTaps="handled">
        {/* Enhanced error display with specific messages and retry functionality */}
        {errorState.hasError && (
          <View className={`mb-4 p-4 rounded-xl border ${
            errorState.type === 'phone_taken' ? 'bg-amber-50 border-amber-200' :
            errorState.type === 'network' ? 'bg-blue-50 border-blue-200' :
            errorState.type === 'validation' ? 'bg-orange-50 border-orange-200' :
            'bg-red-50 border-red-200'
          }`}>
            <View className="flex-row items-start">
              <View className={`w-5 h-5 rounded-full mr-3 mt-0.5 ${
                errorState.type === 'phone_taken' ? 'bg-amber-400' :
                errorState.type === 'network' ? 'bg-blue-400' :
                errorState.type === 'validation' ? 'bg-orange-400' :
                'bg-red-400'
              }`} />
              <View className="flex-1">
                <Text className={`text-md font-semibold ${
                  errorState.type === 'phone_taken' ? 'text-amber-800' :
                  errorState.type === 'network' ? 'text-blue-800' :
                  errorState.type === 'validation' ? 'text-orange-800' :
                  'text-red-800'
                }`}>Error Updating Profile</Text>
                <Text className={`text-sm mt-1 ${
                  errorState.type === 'phone_taken' ? 'text-amber-700' :
                  errorState.type === 'network' ? 'text-blue-700' :
                  errorState.type === 'validation' ? 'text-orange-700' :
                  'text-red-700'
                }`}>{errorState.message}</Text>
                
                {errorState.canRetry && (
                  <TouchableOpacity 
                    className={`mt-3 py-2 px-4 rounded-lg ${
                      errorState.type === 'network' ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                    onPress={handleRetry}
                  >
                    <Text className="text-white text-sm font-medium text-center">
                      {errorState.type === 'network' ? 'Retry Connection' : 'Try Again'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        <View className="items-center mb-8">
          <View className="relative">
            {isUploadingImage ? (
              <View className="w-24 h-24 rounded-full border-2 border-primary-oceanBlue100 justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#006389" />
              </View>
            ) : (
              <Image source={{ uri: getEditProfileImageUrl() }} className="w-24 h-24 rounded-full border-2 border-primary-oceanBlue100" />
            )}
            <TouchableOpacity
              className="absolute bottom-0 right-0 bg-primary-light p-1.5 rounded-full border-2 border-white"
              onPress={handleProfileImageUpload}
              disabled={isUploadingImage}
            >
              <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Name fields in a row */}
        <View className="flex-row justify-between">
          <View className="mb-6" style={{ width: "48%" }}>
            <Text className="text-sm font-semiBold text-gray-700 mb-2">First Name</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
              <TextInput
                className="flex-1 text-md text-gray-900"
                value={formData.first_name}
                onChangeText={(text) => handleInputChange("first_name", text)}
                placeholder="Enter first name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                autoCorrect={false}
                blurOnSubmit={false}
              />
            </View>
          </View>

          <View className="mb-6" style={{ width: "48%" }}>
            <Text className="text-sm font-semiBold text-gray-700 mb-2">Last Name</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
              <TextInput
                className="flex-1 text-md text-gray-900"
                value={formData.last_name}
                onChangeText={(text) => handleInputChange("last_name", text)}
                placeholder="Enter last name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                autoCorrect={false}
                blurOnSubmit={false}
              />
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semiBold text-gray-700 mb-2">Phone Number</Text>
          <View className={`flex-row items-center rounded-xl px-4 py-4 border ${
            errorState.hasError && errorState.field === 'phone' 
              ? 'bg-red-50 border-red-300' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <TextInput
              className="flex-1 text-md text-gray-900"
              value={formData.phone}
              onChangeText={(text) => handleInputChange("phone", text)}
              placeholder="Enter your phone number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={false}
            />
          </View>
          {errorState.hasError && errorState.field === 'phone' && (
            <Text className="text-red-600 text-xs mt-1 ml-1">
              {errorState.type === 'phone_taken' ? 'This phone number is already in use' : 'Please check your phone number'}
            </Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semiBold text-gray-700 mb-2">Preferred Language</Text>
          <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
            <TextInput
              className="flex-1 text-md text-gray-900"
              value={formData.preferred_language}
              onChangeText={(text) => handleInputChange("preferred_language", text)}
              placeholder="e.g., en, fr, ar"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={false}
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semiBold text-gray-700 mb-2">Bio</Text>
          <View className="bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
            <TextInput
              className="text-md text-gray-900 min-h-[80px]"
              value={formData.bio}
              onChangeText={(text) => handleInputChange("bio", text)}
              placeholder="Tell others about yourself..."
              placeholderTextColor="#9CA3AF"
              autoCapitalize="sentences"
              autoCorrect={true}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
              blurOnSubmit={false}
            />
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}
