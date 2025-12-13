import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "@/constants/theme";
import { getFormSchema, validateFormData } from "@/constants/formSchemas";
import { FormFieldRenderer } from "@/components/schema-forms/FormFieldRenderer";
import { GradientButton } from "@/components/ui/buttons/GradientButton";
import * as Haptics from "expo-haptics";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { userApiService } from "@/services/userApi";
import { useAppTheme } from "@/hooks/useAppTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Mock API functions for CoRide Morocco forms
const mockContactSupport = async (data: any) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const success = Math.random() > 0.1;
  if (success) {
    return { success: true, message: "Your message has been sent successfully!" };
  } else {
    throw new Error("Failed to send message. Please try again.");
  }
};

const mockCreateRideRequest = async (data: any) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return { success: true, message: "Your ride request has been posted!" };
};

const mockCreateRideOffer = async (data: any) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return { success: true, message: "Your ride offer has been posted!" };
};

const mockSubmitFeedback = async (data: any) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { success: true, message: "Thank you for your feedback!" };
};

const mockReportIssue = async (data: any) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return { success: true, message: "Your report has been submitted." };
};

const mockAddLocation = async (data: any) => {
  return { success: true, message: "Location saved successfully!" };
};

const mockDriverLicenseDetails = async (data: any) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Validate Moroccan license number format (XX/XXXXXX - letters or numbers)
  if (!data.licenseNumber) {
    throw new Error("Please enter your license number");
  }

  const licenseRegex = /^[A-Z0-9]{2}\/[0-9]{6}$/;
  if (!licenseRegex.test(data.licenseNumber)) {
    throw new Error("License number must be in format XX/XXXXXX (e.g., AB/123456 or 05/789873)");
  }

  // Validate expiry date - Accept YYYY-MM-DD format from date picker
  if (!data.expiryDate) {
    throw new Error("Please select an expiry date");
  }

  let inputDate: Date;
  try {
    // Handle YYYY-MM-DD format (from date picker) or DD/MM/YYYY format (manual entry)
    if (data.expiryDate.includes('-')) {
      // YYYY-MM-DD format
      inputDate = new Date(data.expiryDate + 'T00:00:00');
    } else if (data.expiryDate.includes('/')) {
      // DD/MM/YYYY format
      const [day, month, year] = data.expiryDate.split('/');
      inputDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      throw new Error("Invalid date format");
    }
  } catch (error) {
    throw new Error("Please select a valid expiry date");
  }

  if (isNaN(inputDate.getTime())) {
    throw new Error("Please select a valid expiry date");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
  
  if (inputDate <= today) {
    throw new Error("License must not be expired (future date required)");
  }
  
  return { success: true, message: "License details validated successfully!" };
};

// Real API function for adding location
const addLocation = async (data: any) => {
  try {
    // Handle location data - it might be an object from the map picker
    let addressString = data.address;
    let latitude = data.latitude;
    let longitude = data.longitude;
    
    // If address is an object (from location picker), extract the values
    if (typeof data.address === 'object' && data.address !== null) {
      addressString = data.address.address;
      latitude = data.address.latitude;
      longitude = data.address.longitude;
    }
    
    // Transform form data to match CreateLocationRequest interface
    const locationData = {
      name: data.locationName,
      address: addressString,
      latitude: latitude || 33.5731, // Default to Casablanca
      longitude: longitude || -7.5898,
      location_type: data.locationType
    };

    const response = await userApiService.createLocation(locationData);
    return {
      success: true,
      message: "Location saved successfully!",
      data: response.data
    };
  } catch (error: any) {
    // Handle API errors
    if (error.message?.includes('already have a home location')) {
      throw new Error("You already have a location of this type saved");
    }
    throw new Error(error.message || "Failed to save location");
  }
};

interface FormModalProps {
  visible: boolean;
  formName: string;
  onClose: () => void;
  onSuccess?: (result: any, formData?: any) => void;
  initialData?: Record<string, any>;
}

export const FormModal: React.FC<FormModalProps> = ({
  visible,
  formName,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { colors, isDarkMode } = useAppTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Reanimated values - start in hidden state
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formDefinition = getFormSchema(formName);

  // Animation when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Animate in
      translateY.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      // Animate out
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible]);

  // Pre-populate form with initial data when modal becomes visible
  useEffect(() => {
    if (!visible || !formDefinition) return;
    setFormData({ ...(initialData ?? {}) });
  }, [visible, formDefinition]);

  // Handle field value changes
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    // Special handling for location fields - when address is updated from location picker
    if (fieldName === 'address' && typeof value === 'object' && value !== null && 'latitude' in value && 'longitude' in value) {
      // Update address, latitude, and longitude fields simultaneously
      setFormData((prev) => ({
        ...prev,
        address: value.address,
        latitude: value.latitude,
        longitude: value.longitude
      }));
    } else {
      // Normal field update
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
    }
    
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [errors]);

  // Get API function based on form type
  const getApiFunction = useCallback(() => {
    switch (formDefinition?.mutation) {
      case "contactSupport":
        return mockContactSupport;
      case "createRideRequest":
        return mockCreateRideRequest;
      case "createRideOffer":
        return mockCreateRideOffer;
      case "submitFeedback":
        return mockSubmitFeedback;
      case "reportIssue":
        return mockReportIssue;
      case "addLocation":
        return addLocation;
      case "driverLicenseDetails":
        return mockDriverLicenseDetails;
      default:
        return null;
    }
  }, [formDefinition?.mutation]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!formDefinition) return;

    const validation = validateFormData(formName, formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Validation Error", "Please fix the errors below and try again.");
      return;
    }

    const apiFunction = getApiFunction();
    if (!apiFunction) {
      Alert.alert("Error", "Form submission not configured.");
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      let submissionData = { ...formData };

      // Transform data based on form type
      switch (formName) {
        case "createRideRequest":
          if (submissionData.passengers) {
            submissionData.passengers = parseInt(submissionData.passengers, 10);
          }
          if (submissionData.departureTime) {
            submissionData.departureTime = new Date(submissionData.departureTime).toISOString();
          }
          break;
        case "createRideOffer":
          if (submissionData.availableSeats) {
            submissionData.availableSeats = parseInt(submissionData.availableSeats, 10);
          }
          if (submissionData.departureTime) {
            submissionData.departureTime = new Date(submissionData.departureTime).toISOString();
          }
          break;
        case "submitFeedback":
          if (submissionData.rating) {
            submissionData.rating = parseInt(submissionData.rating, 10);
          }
          break;
        case "reportIssue":
          if (submissionData.occurred) {
            submissionData.occurred = new Date(submissionData.occurred).toISOString();
          }
          break;
      }

      const result = await apiFunction(submissionData);

      if (result?.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        if (onSuccess) {
          onSuccess(result, formData);
        } else {
          Alert.alert("Success", result.message || formDefinition.successMessage);
        }

        onClose();
      } else {
        throw new Error(result?.message || "Submission failed");
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", error.message || "There was an error submitting the form.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formDefinition, formName, formData, getApiFunction, onSuccess, onClose]);

  // Animated styles
  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!formDefinition || !visible) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Background overlay */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Modal content */}
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.modalContent, modalStyle]}>
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            {/* Header */}
            <View style={{
              backgroundColor: "#FFFFFF",
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
              paddingHorizontal: 24,
              paddingVertical: 24,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
              
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{
                  fontSize: 20,
                  fontFamily: FONTS.bold,
                  color: "#000",
                  textAlign: 'center',
                }}>
                  {formDefinition.schema.title}
                </Text>
                {formDefinition.schema.description && (
                  <Text style={{
                    fontFamily: FONTS.regular,
                    fontSize: 14,
                    color: "#6B7280",
                    textAlign: 'center',
                    marginTop: 8,
                    lineHeight: 20,
                  }}>
                    {formDefinition.schema.description}
                  </Text>
                )}
              </View>
              
              <View style={{ width: 40 }} />
            </View>

          {/* Form Content */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            enabled={Platform.OS === "ios"}
          >
            <ScrollView
              ref={scrollViewRef}
              style={{ flex: 1, paddingHorizontal: 24 }}
              contentContainerStyle={{
                paddingVertical: 16,
                paddingBottom: 80
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Form Fields */}
              <View style={{ gap: 16 }}>
                {Object.entries(formDefinition.schema.properties).map(
                  ([fieldName, fieldDef]) => (
                    <FormFieldRenderer
                      key={fieldName}
                      fieldName={fieldName}
                      fieldDef={fieldDef}
                      uiDef={(formDefinition.uiSchema as any)[fieldName]}
                      value={formData[fieldName]}
                      error={errors[fieldName]}
                      onChange={(value) => handleFieldChange(fieldName, value)}
                      disabled={isSubmitting}
                      required={
                        formDefinition.schema.required?.includes(fieldName) ||
                        false
                      }
                    />
                  )
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Submit Button */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingVertical: 16,
              paddingBottom: Platform.OS === 'ios' ? 60 : 50,
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
              backgroundColor: "#FFFFFF",
            }}
          >
            <GradientButton
              onPress={handleSubmit}
              text={isSubmitting ? "Submitting..." : "Submit"}
              colors={COLORS.primary.gradient}
              isLoading={isSubmitting}
              style={{
                shadowColor: COLORS.primary.light,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
              textStyle={{
                fontSize: 18,
                fontWeight: '700',
              }}
            />
          </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: Platform.OS === 'ios' ? 999999999 : 9999,
    elevation: Platform.OS === 'android' ? 9999 : undefined,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContainer: {
    flex: 1,
    pointerEvents: "box-none",
    zIndex: Platform.OS === 'ios' ? 999999999 : 9999,
  }, 
  modalContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",

    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: Platform.OS === 'android' ? 9999 : undefined,
    zIndex: Platform.OS === 'ios' ? 999999999 : 9999,
  },
});
