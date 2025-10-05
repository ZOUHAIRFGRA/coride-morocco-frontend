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
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "@/constants/theme";
import { getFormSchema, validateFormData } from "@/constants/formSchemas";
import { FormFieldRenderer } from "@/components/schema-forms/FormFieldRenderer";
import { GradientButton } from "@/components/ui/buttons/GradientButton";
import * as Haptics from "expo-haptics";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { userApiService } from "@/services/userApi";

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

// Real API function for adding location
const addLocation = async (data: any) => {
  try {
    // Transform form data to match CreateLocationRequest interface
    const locationData = {
      name: data.locationName,
      address: data.address,
      latitude: data.latitude || 33.5731, // Default to Casablanca
      longitude: data.longitude || -7.5898,
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
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formDefinition = getFormSchema(formName);

  // Animation when modal becomes visible
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(0);
    }
  }, [visible, slideAnim, fadeAnim]);

  // Pre-populate form with initial data when modal becomes visible
  useEffect(() => {
    if (!visible || !formDefinition) return;
    setFormData({ ...(initialData ?? {}) });
  }, [visible, formDefinition]);

  // Handle field value changes
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    
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

  if (!formDefinition || !visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      
      <View style={styles.modalContainer}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [400, 0],
                })
              }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>

            <Text style={styles.title}>{formDefinition.schema.title}</Text>
            <View style={{ width: 40 }} />

            {formDefinition.schema.description && (
              <Text style={styles.description}>
                {formDefinition.schema.description}
              </Text>
            )}
          </View>

          {/* Form Content */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              ref={scrollViewRef}
              style={{ flex: 1, paddingHorizontal: 24 }}
              contentContainerStyle={{ paddingVertical: 16, paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
            >
              {Object.entries(formDefinition.schema.properties).map(([fieldName, fieldDef]) => (
                <FormFieldRenderer
                  key={fieldName}
                  fieldName={fieldName}
                  fieldDef={fieldDef}
                  uiDef={(formDefinition.uiSchema as any)[fieldName]}
                  value={formData[fieldName]}
                  error={errors[fieldName]}
                  onChange={(value) => handleFieldChange(fieldName, value)}
                  disabled={isSubmitting}
                  required={formDefinition.schema.required?.includes(fieldName) || false}
                />
              ))}
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Submit Button */}
          <View style={styles.footer}>
            <GradientButton
              onPress={handleSubmit}
              text={isSubmitting ? "Submitting..." : "Submit"}
              colors={COLORS.primary.gradient}
              isLoading={isSubmitting}
              style={styles.submitButton}
              textStyle={styles.submitButtonText}
            />
          </View>
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
    zIndex: 9999,
    elevation: 9999,
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
    justifyContent: "flex-end",
    pointerEvents: "box-none",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: hp(90),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  closeButton: {
    padding: 8,
    position: "absolute",
    left: 16,
    top: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text.primary,
    textAlign: "center",
    marginTop: 8,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  submitButton: {
    shadowColor: COLORS.primary.light,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
});
