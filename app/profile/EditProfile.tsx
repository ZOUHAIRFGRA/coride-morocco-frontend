import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { pickImageAndUpload, takePictureAndUpload } from "@/utils/cloudinary";
import { useUser } from "@/hooks/useUserProfile";
import type { UserProfile, UpdateProfileRequest } from "@/types/user";
import type { UserResponse } from "@/types/auth";
import { useAppTheme } from "@/hooks/useAppTheme";

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
  const { colors, isDarkMode } = useAppTheme();
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
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background.primary }}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16, paddingTop: 24 }}
        keyboardShouldPersistTaps="handled">
        {/* Enhanced error display with specific messages and retry functionality */}
        {errorState.hasError && (
          <View style={{
            marginBottom: 16,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            backgroundColor: isDarkMode ? colors.background.secondary :
              errorState.type === 'phone_taken' ? '#FFFBEB' :
                errorState.type === 'network' ? '#EFF6FF' :
                  errorState.type === 'validation' ? '#FFF7ED' :
                    '#FEF2F2',
            borderColor: isDarkMode ? colors.border.primary :
              errorState.type === 'phone_taken' ? '#FED7AA' :
                errorState.type === 'network' ? '#BFDBFE' :
                  errorState.type === 'validation' ? '#FDBA74' :
                    '#FECACA'
          }}>
            <View className="flex-row items-start">
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                marginRight: 12,
                marginTop: 2,
                backgroundColor:
                  errorState.type === 'phone_taken' ? '#F59E0B' :
                    errorState.type === 'network' ? '#3B82F6' :
                      errorState.type === 'validation' ? '#F97316' :
                        '#EF4444'
              }} />
              <View className="flex-1">
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: isDarkMode ? colors.text.primary :
                    errorState.type === 'phone_taken' ? '#92400E' :
                      errorState.type === 'network' ? '#1E3A8A' :
                        errorState.type === 'validation' ? '#9A3412' :
                          '#991B1B'
                }}>Error Updating Profile</Text>
                <Text style={{
                  fontSize: 14,
                  marginTop: 4,
                  color: isDarkMode ? colors.text.secondary :
                    errorState.type === 'phone_taken' ? '#B45309' :
                      errorState.type === 'network' ? '#1D4ED8' :
                        errorState.type === 'validation' ? '#C2410C' :
                          '#B91C1C'
                }}>{errorState.message}</Text>

                {errorState.canRetry && (
                  <TouchableOpacity
                    style={{
                      marginTop: 12,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: errorState.type === 'network' ? '#2563EB' : '#4B5563'
                    }}
                    onPress={handleRetry}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500', textAlign: 'center' }}>
                      {errorState.type === 'network' ? 'Retry Connection' : 'Try Again'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View className="relative">
            {isUploadingImage ? (
              <View style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                borderWidth: 2,
                borderColor: '#BBE5F1',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isDarkMode ? colors.background.secondary : '#F3F4F6'
              }}>
                <ActivityIndicator size="large" color="#006389" />
              </View>
            ) : (
              <Image source={{ uri: getEditProfileImageUrl() }} style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                borderWidth: 2,
                borderColor: '#BBE5F1'
              }} />
            )}
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#006389',
                padding: 6,
                borderRadius: 50,
                borderWidth: 2,
                borderColor: isDarkMode ? colors.background.primary : '#FFFFFF'
              }}
              onPress={handleProfileImageUpload}
              disabled={isUploadingImage}
            >
              <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Name fields in a row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View className="mb-6" style={{ width: "48%" }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 8
            }}>First Name</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDarkMode ? colors.background.secondary : '#F9FAFB',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderWidth: 1,
              borderColor: isDarkMode ? colors.border.primary : '#E5E7EB'
            }}>
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: colors.text.primary
                }}
                value={formData.first_name}
                onChangeText={(text) => handleInputChange("first_name", text)}
                placeholder="Enter first name"
                placeholderTextColor={isDarkMode ? colors.text.tertiary : '#9CA3AF'}
                autoCapitalize="words"
                autoCorrect={false}
                blurOnSubmit={false}
              />
            </View>
          </View>

          <View style={{ marginBottom: 24, width: '48%' }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 8
            }}>Last Name</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDarkMode ? colors.background.secondary : '#F9FAFB',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderWidth: 1,
              borderColor: isDarkMode ? colors.border.primary : '#E5E7EB'
            }}>
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: colors.text.primary
                }}
                value={formData.last_name}
                onChangeText={(text) => handleInputChange("last_name", text)}
                placeholder="Enter last name"
                placeholderTextColor={isDarkMode ? colors.text.tertiary : '#9CA3AF'}
                autoCapitalize="words"
                autoCorrect={false}
                blurOnSubmit={false}
              />
            </View>
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.text.primary,
            marginBottom: 8
          }}>Phone Number</Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderWidth: 1,
            backgroundColor: errorState.hasError && errorState.field === 'phone'
              ? (isDarkMode ? colors.background.secondary : '#FEF2F2')
              : (isDarkMode ? colors.background.secondary : '#F9FAFB'),
            borderColor: errorState.hasError && errorState.field === 'phone'
              ? '#FCA5A5'
              : (isDarkMode ? colors.border.primary : '#E5E7EB')
          }}>
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: colors.text.primary
              }}
              value={formData.phone}
              onChangeText={(text) => handleInputChange("phone", text)}
              placeholder="Enter your phone number"
              placeholderTextColor={isDarkMode ? colors.text.tertiary : '#9CA3AF'}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={false}
            />
          </View>
          {errorState.hasError && errorState.field === 'phone' && (
            <Text style={{
              color: '#DC2626',
              fontSize: 12,
              marginTop: 4,
              marginLeft: 4
            }}>
              {errorState.type === 'phone_taken' ? 'This phone number is already in use' : 'Please check your phone number'}
            </Text>
          )}
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.text.primary,
            marginBottom: 8
          }}>Preferred Language</Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? colors.background.secondary : '#F9FAFB',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderWidth: 1,
            borderColor: isDarkMode ? colors.border.primary : '#E5E7EB'
          }}>
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: colors.text.primary
              }}
              value={formData.preferred_language}
              onChangeText={(text) => handleInputChange("preferred_language", text)}
              placeholder="e.g., en, fr, ar"
              placeholderTextColor={isDarkMode ? colors.text.tertiary : '#9CA3AF'}
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={false}
            />
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.text.primary,
            marginBottom: 8
          }}>Bio</Text>
          <View style={{
            backgroundColor: isDarkMode ? colors.background.secondary : '#F9FAFB',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderWidth: 1,
            borderColor: isDarkMode ? colors.border.primary : '#E5E7EB'
          }}>
            <TextInput
              style={{
                fontSize: 16,
                color: colors.text.primary,
                minHeight: 80
              }}
              value={formData.bio}
              onChangeText={(text) => handleInputChange("bio", text)}
              placeholder="Tell others about yourself..."
              placeholderTextColor={isDarkMode ? colors.text.tertiary : '#9CA3AF'}
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
