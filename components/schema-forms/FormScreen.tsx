import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "@/constants/theme";
import { getFormSchema, validateFormData } from "@/constants/formSchemas";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { GradientButton } from "@/components/ui/buttons/GradientButton";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import * as Haptics from "expo-haptics";
import SafeAreaWrapper from "../ui/SafeAreaWrapper";

// Mock API functions for CoRide Morocco forms
const mockSubmitForm = async (formName: string, data: any) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Simulate success/failure
  const success = Math.random() > 0.1; // 90% success rate
  
  if (success) {
    switch (formName) {
      case "contactSupport":
        return { success: true, message: "Your message has been sent successfully!" };
      case "createRideRequest":
        return { success: true, message: "Your ride request has been posted! Drivers will be notified." };
      case "createRideOffer":
        return { success: true, message: "Your ride offer has been posted! Passengers can now book seats." };
      case "submitFeedback":
        return { success: true, message: "Thank you for your feedback! It helps us improve the app." };
      case "reportIssue":
        return { success: true, message: "Your report has been submitted. We'll investigate and take appropriate action." };
      default:
        return { success: true, message: "Form submitted successfully!" };
    }
  } else {
    throw new Error("Submission failed. Please try again.");
  }
};

/**
 * Generic Form Screen Component for CoRide Morocco
 * Renders any form based on the schema registry as a full screen
 * Handles validation, submission, and API integration
 */
const FormScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const formName = params.formName as string;

  // State for form data and validation
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get form definition from schema registry
  const formDefinition = getFormSchema(formName);

  // Check if form exists
  useEffect(() => {
    if (!formDefinition) {
      Alert.alert(
        "Form Not Found",
        `The form "${formName}" could not be found. Please check the form name.`,
        [{ text: "Go Back", onPress: () => router.back() }]
      );
    }
  }, [formDefinition, formName, router]);

  // Pre-populate form with default values
  useEffect(() => {
    if (!formDefinition) return;

    const initialData: Record<string, any> = {};

    // Set default values for specific form types
    switch (formName) {
      case "createRideRequest":
        // Set default departure time to current time + 1 hour
        const defaultDeparture = new Date();
        defaultDeparture.setHours(defaultDeparture.getHours() + 1);
        initialData.departureTime = defaultDeparture.toISOString().slice(0, 16);
        initialData.passengers = 1;
        break;

      case "createRideOffer":
        // Set default departure time to current time + 1 hour
        const defaultOfferDeparture = new Date();
        defaultOfferDeparture.setHours(defaultOfferDeparture.getHours() + 1);
        initialData.departureTime = defaultOfferDeparture.toISOString().slice(0, 16);
        initialData.availableSeats = 3;
        break;

      case "submitFeedback":
        initialData.rating = 5;
        break;

      case "reportIssue":
        // Set default occurred time to current time
        initialData.occurred = new Date().toISOString().slice(0, 16);
        initialData.severity = "moderate";
        break;
    }

    setFormData(initialData);
  }, [formDefinition, formName]);

  // Handle field value changes
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!formDefinition) return;

    console.log("🚗 FormScreen - Starting submission for:", formName);
    console.log("🚗 FormScreen - Form data:", formData);

    // Validate form data
    const validation = validateFormData(formName, formData);
    if (!validation.isValid) {
      console.log("🚗 FormScreen - Validation failed:", validation.errors);
      setErrors(validation.errors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Validation Error", "Please fix the errors below and try again.");
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Transform data based on form type
      let submissionData = { ...formData };

      switch (formName) {
        case "createRideRequest":
          // Ensure passengers is a number
          if (submissionData.passengers) {
            submissionData.passengers = parseInt(submissionData.passengers, 10);
          }
          // Convert departure time to ISO string
          if (submissionData.departureTime) {
            submissionData.departureTime = new Date(submissionData.departureTime).toISOString();
          }
          break;

        case "createRideOffer":
          // Ensure availableSeats is a number
          if (submissionData.availableSeats) {
            submissionData.availableSeats = parseInt(submissionData.availableSeats, 10);
          }
          // Convert departure time to ISO string
          if (submissionData.departureTime) {
            submissionData.departureTime = new Date(submissionData.departureTime).toISOString();
          }
          break;

        case "submitFeedback":
          // Ensure rating is a number
          if (submissionData.rating) {
            submissionData.rating = parseInt(submissionData.rating, 10);
          }
          break;

        case "reportIssue":
          // Convert occurred time to ISO string
          if (submissionData.occurred) {
            submissionData.occurred = new Date(submissionData.occurred).toISOString();
          }
          break;
      }

      console.log("🚗 FormScreen - Submitting transformed data:", submissionData);
      const result = await mockSubmitForm(formName, submissionData);
      console.log("🚗 FormScreen - API result:", result);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Success",
          result.message || formDefinition.successMessage,
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error: any) {
      console.error("🚗 FormScreen - Submission error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Error",
        error.message || formDefinition.errorMessage || "There was an error submitting the form."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [formDefinition, formName, formData, router]);

  // Don't render if form not found
  if (!formDefinition) {
    return null;
  }

  return (
    <SafeAreaWrapper>
      <SafeAreaView className="flex-1 bg-background-0">
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-outline-100">
          <TouchableOpacity
            className="p-2"
            onPress={() => router.back()}
            accessible={true}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={wp(6)} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text
            className="text-center flex-1"
            style={{
              fontSize: 18,
              fontFamily: FONTS.semiBold,
              color: COLORS.text.primary,
            }}
          >
            {formDefinition.schema.title}
          </Text>
          <View style={{ width: wp(10) }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Form Description */}
            {formDefinition.schema.description && (
              <Text
                className="text-typography-600 my-4"
                style={{ fontFamily: FONTS.regular }}
              >
                {formDefinition.schema.description}
              </Text>
            )}

            {/* Form Fields */}
            <View className="space-y-4">
              {Object.entries(formDefinition.schema.properties).map(([fieldName, fieldDef]) => (
                <FormFieldRenderer
                  key={fieldName}
                  fieldName={fieldName}
                  fieldDef={fieldDef}
                  uiDef={formDefinition.uiSchema[fieldName]}
                  value={formData[fieldName]}
                  error={errors[fieldName]}
                  onChange={(value) => handleFieldChange(fieldName, value)}
                  disabled={isSubmitting}
                  required={formDefinition.schema.required?.includes(fieldName) || false}
                />
              ))}
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View className="px-4 py-4 border-t border-outline-100 bg-background-0">
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
                fontSize: 16,
                fontWeight: "700",
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaWrapper>
  );
};

export default FormScreen;
