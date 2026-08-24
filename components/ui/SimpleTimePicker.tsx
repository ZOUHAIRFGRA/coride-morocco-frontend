import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS } from "@/constants/theme";

interface SimpleTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  selectedDate?: Date;
}

/**
 * Simple, reliable time picker component using native DateTimePicker
 * Handles time in HH:mm format (24-hour)
 */
export const SimpleTimePicker: React.FC<SimpleTimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select time",
  error = false,
  disabled = false,
  selectedDate,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerInitialValue, setPickerInitialValue] = useState<Date | null>(null);
  
  // Helper to get base date
  const getBaseDate = () => {
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      return new Date(selectedDate);
    }
    return new Date();
  };

  // Initialize currentTime based on value or default to 9:00 AM
  const [currentTime, setCurrentTime] = useState(() => {
    const base = getBaseDate();
    
    if (value && value.includes(':')) {
      try {
        const [hours, minutes] = value.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          base.setHours(hours, minutes, 0, 0);
          console.log('Time picker initialized with:', hours, minutes, '- Date:', base.toISOString());
          return base;
        }
      } catch (e) {
        console.log('Time picker init error:', e);
      }
    }
    // Default to 9:00 AM on base date
    base.setHours(9, 0, 0, 0);
    console.log('Time picker initialized with default 9:00 AM - Date:', base.toISOString());
    return base;
  });

  // Update currentTime when value prop changes externally
  // BUT only when picker is closed
  useEffect(() => {
    if (showPicker) {
      return; 
    }
    
    // Always sync with base date (selectedDate) and value
    const base = getBaseDate();
    
    if (value && value.includes(':')) {
      try {
        const [hours, minutes] = value.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          base.setHours(hours, minutes, 0, 0);
          console.log('Time picker syncing with prop value:', value, '- Date:', base.toISOString());
          setCurrentTime(base);
          return;
        }
      } catch (e) {
        console.log('Time picker sync error:', e);
      }
    }
    
    // If no value but date changed, update base date but keep existing time if possible
    // Only if we haven't just set it manually
    if (!value) {
       base.setHours(9, 0, 0, 0);
       setCurrentTime(base);
    }

  }, [value, showPicker, selectedDate]);

  const formatDisplayTime = (timeString: string) => {
    if (!timeString) return "";
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return "";
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    console.log('Time picker event:', event.type, 'Selected time:', selectedTime?.toISOString());
    console.log('Selected hours:', selectedTime?.getHours(), 'minutes:', selectedTime?.getMinutes());
    
    // On Android, picker closes automatically on selection or dismissal
    if (Platform.OS === 'android') {
      setShowPicker(false);
      setPickerInitialValue(null);
      
      // Only process valid selections, not dismissals
      if (event.type !== 'dismissed' && selectedTime && !isNaN(selectedTime.getTime())) {
        // Extract just the hours and minutes (ignore the date part from picker)
        const hours = selectedTime.getHours();
        const minutes = selectedTime.getMinutes();
        
        // Apply to the correct base date
        const base = getBaseDate();
        base.setHours(hours, minutes, 0, 0);
        
        console.log('Android selection - updating to:', base.toISOString());
        setCurrentTime(base);
        
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        onChange(formattedTime);
      }
      return;
    }
    
    // iOS: Store the selected time but don't update currentTime yet
    // We'll update when user taps Done
    if (selectedTime && !isNaN(selectedTime.getTime())) {
      // Just store it in pickerInitialValue temporarily
      setPickerInitialValue(selectedTime);
    }
  };

  const openPicker = () => {
    if (disabled) return;
    
    // Set the initial value for the picker - this won't change while picker is open
    const initialValue = new Date(currentTime);
    setPickerInitialValue(initialValue);
    
    console.log('Opening time picker with initial value:', initialValue.toISOString());
    console.log('currentTime is valid?', !isNaN(currentTime.getTime()));
    console.log('selectedDate prop:', selectedDate);
    setShowPicker(true);
  };

  const handleManualEntry = () => {
    Alert.prompt(
      "Enter Time",
      "Please enter time in HH:MM format (24-hour):\nExample: 14:30 for 2:30 PM",
      (text) => {
        if (text) {
          try {
            // Parse HH:MM format
            const [hours, minutes] = text.split(':').map(Number);
            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
              const date = new Date();
              date.setHours(hours, minutes, 0, 0);
              const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
              onChange(formattedTime);
              setCurrentTime(date);
              return;
            }
          } catch (error) {
            // Invalid format
          }
          Alert.alert("Invalid Time", "Please enter a valid time in HH:MM format (00:00 to 23:59).");
        }
      },
      "plain-text",
      value || "09:00"
    );
  };

  return (
    <View>
      <TouchableOpacity
        onPress={openPicker}
        className={`border rounded-lg px-3 py-3 ${
          error ? "border-red-500" : "border-gray-300"
        } bg-gray-50`}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <View className="flex-row items-center justify-between">
          <Text 
            style={{ 
              fontFamily: FONTS.regular, 
              color: value ? COLORS.text.primary : "#999",
              fontSize: 16 
            }}
          >
            {value ? formatDisplayTime(value) : placeholder}
          </Text>
          <Ionicons 
            name="time-outline" 
            size={20} 
            color={error ? "#ef4444" : COLORS.primary.dark} 
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

      {/* Native Time Picker */}
      {showPicker && pickerInitialValue && (
        <>
          {console.log('Rendering DateTimePicker with value:', pickerInitialValue.toISOString(), 'isValid:', !isNaN(pickerInitialValue.getTime()))}
          <DateTimePicker
            value={pickerInitialValue}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        </>
      )}

      {/* iOS: Add done button for spinner mode */}
      {showPicker && Platform.OS === 'ios' && (
        <View className="flex-row justify-end mt-2">
          <TouchableOpacity
            onPress={() => {
              // Use the last selected time from the picker
              if (pickerInitialValue) {
                const base = getBaseDate();
                base.setHours(pickerInitialValue.getHours(), pickerInitialValue.getMinutes(), 0, 0);
                setCurrentTime(base);
                
                const hours = String(pickerInitialValue.getHours()).padStart(2, '0');
                const minutes = String(pickerInitialValue.getMinutes()).padStart(2, '0');
                const formattedTime = `${hours}:${minutes}`;
                onChange(formattedTime);
              }
              setShowPicker(false);
              setPickerInitialValue(null);
            }}
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

export default SimpleTimePicker;
