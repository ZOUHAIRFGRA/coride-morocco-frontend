import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { FONTS } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

interface SimpleDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

/**
 * Simple, reliable date picker component using native DateTimePicker
 * Avoids the complex modal and external library issues
 */
export const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  error = false,
  disabled = false,
  minimumDate,
  maximumDate,
}) => {
  const { colors } = useAppTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    try {
      // If value is provided, use it; otherwise use today's date
      return value ? new Date(value + 'T00:00:00') : new Date();
    } catch {
      return new Date();
    }
  });

  // Set today's date as default on mount if no value provided
  React.useEffect(() => {
    if (!value) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayFormatted = `${year}-${month}-${day}`;
      onChange(todayFormatted);
    }
  }, []);

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime()) ? date.toLocaleDateString() : "";
    } catch {
      return "";
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // On Android, picker closes automatically
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate && event.type !== 'dismissed') {
      setCurrentDate(selectedDate);
      // Format as YYYY-MM-DD for form submission (avoiding timezone issues)
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      onChange(formattedDate);
    }
  };

  const openPicker = () => {
    if (disabled) return;
    setShowPicker(true);
  };

  const handleManualEntry = () => {
    const minDateText = minimumDate ? minimumDate.toLocaleDateString() : "";
    const maxDateText = maximumDate ? maximumDate.toLocaleDateString() : "";
    const constraintText = minimumDate && maximumDate 
      ? `\nDate must be between ${minDateText} and ${maxDateText}`
      : minimumDate 
      ? `\nDate must be after ${minDateText}`
      : maxDateText 
      ? `\nDate must be before ${maxDateText}`
      : "";

    Alert.prompt(
      "Enter Date",
      `Please enter date in MM/DD/YYYY format:${constraintText}`,
      (text) => {
        if (text) {
          try {
            // Parse MM/DD/YYYY format
            const [month, day, year] = text.split('/').map(Number);
            if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900) {
              const date = new Date(year, month - 1, day);
              if (!isNaN(date.getTime())) {
                // Check date constraints
                if (minimumDate && date < minimumDate) {
                  Alert.alert("Invalid Date", `Date must be after ${minDateText}`);
                  return;
                }
                if (maximumDate && date > maximumDate) {
                  Alert.alert("Invalid Date", `Date must be before ${maxDateText}`);
                  return;
                }
                
                const formattedDate = date.toISOString().split('T')[0];
                onChange(formattedDate);
                setCurrentDate(date);
                return;
              }
            }
          } catch (error) {
            // Invalid format
          }
          Alert.alert("Invalid Date", "Please enter a valid date in MM/DD/YYYY format.");
        }
      },
      "plain-text",
      value ? formatDisplayDate(value) : ""
    );
  };

  return (
    <View>
      <TouchableOpacity
        onPress={openPicker}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          borderColor: error ? "#ef4444" : colors.border.primary,
          backgroundColor: colors.background.tertiary,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <View className="flex-row items-center justify-between">
          <Text
            style={{
              fontFamily: FONTS.regular,
              color: value ? colors.text.primary : colors.text.tertiary,
              fontSize: 16
            }}
          >
            {value ? formatDisplayDate(value) : placeholder}
          </Text>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={error ? "#ef4444" : colors.primary.dark}
          />
        </View>
      </TouchableOpacity>

      {/* Manual entry option */}
      <TouchableOpacity
        onPress={handleManualEntry}
        className="mt-1"
      >
        <Text 
          className="text-blue-600 text-sm text-center" 
          style={{ fontFamily: FONTS.regular }}
        >
          Enter manually
        </Text>
      </TouchableOpacity>

      {/* Native Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={maximumDate || new Date(2040, 11, 31)}
          minimumDate={minimumDate || new Date()}
        />
      )}

      {/* iOS: Add done button for spinner mode */}
      {showPicker && Platform.OS === 'ios' && (
        <View className="flex-row justify-end mt-2">
          <TouchableOpacity
            onPress={() => setShowPicker(false)}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            <Text className="text-white" style={{ fontFamily: FONTS.semiBold }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SimpleDatePicker;
