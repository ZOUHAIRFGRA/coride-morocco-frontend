import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "@/constants/theme";
import { moderateScale, verticalScale, responsiveFontSize } from "@utils/responsive";
import { US_STATES, StateCode } from "@/constants/countries";

interface StateDropdownProps {
  label: string;
  value: StateCode;
  onValueChange: (value: StateCode) => void;
  error?: string;
  required?: boolean;
}

/**
 * US State dropdown component with proper 2-letter state codes
 */
const StateDropdown: React.FC<StateDropdownProps> = ({ label, value, onValueChange, error, required = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedState = US_STATES.find((state) => state.code === value);

  const handleSelect = (stateCode: StateCode) => {
    onValueChange(stateCode);
    setIsOpen(false);
  };

  return (
    <View style={{ marginBottom: verticalScale(16) }}>
      <Text
        style={{
          fontSize: responsiveFontSize(14),
          fontFamily: FONTS.regular,
          color: COLORS.text.primary,
          marginBottom: verticalScale(6),
        }}
      >
        {label} {required && <Text style={{ color: "#E53935" }}>*</Text>}
      </Text>

      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderColor: error ? "#E53935" : "#E0E0E0",
          borderRadius: moderateScale(8),
          paddingHorizontal: moderateScale(12),
          paddingVertical: moderateScale(12),
          backgroundColor: "#F9F9F9",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onPress={() => setIsOpen(true)}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(16),
            fontFamily: FONTS.regular,
            color: selectedState ? COLORS.text.primary : "#999",
          }}
        >
          {selectedState ? selectedState.name : "Select state"}
        </Text>
        <Ionicons name="chevron-down" size={moderateScale(20)} color="#999" />
      </TouchableOpacity>

      {error && (
        <Text
          style={{
            fontSize: responsiveFontSize(12),
            fontFamily: FONTS.regular,
            color: "#E53935",
            marginTop: verticalScale(4),
          }}
        >
          {error}
        </Text>
      )}

      {/* Dropdown Modal */}
      <Modal visible={isOpen} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            justifyContent: "center",
            paddingHorizontal: moderateScale(20),
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: moderateScale(12),
              maxHeight: "80%",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: moderateScale(16),
                paddingVertical: moderateScale(12),
                borderBottomWidth: 1,
                borderBottomColor: "#E0E0E0",
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(18),
                  fontFamily: FONTS.semiBold,
                  color: COLORS.text.primary,
                }}
              >
                Select State
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={moderateScale(24)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* State List */}
            <ScrollView style={{ maxHeight: verticalScale(400) }}>
              {US_STATES.map((state) => (
                <TouchableOpacity
                  key={state.code}
                  style={{
                    paddingHorizontal: moderateScale(16),
                    paddingVertical: moderateScale(12),
                    borderBottomWidth: 1,
                    borderBottomColor: "#F0F0F0",
                    backgroundColor: value === state.code ? "#F5F9FF" : "white",
                  }}
                  onPress={() => handleSelect(state.code)}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: responsiveFontSize(16),
                        fontFamily: FONTS.regular,
                        color: COLORS.text.primary,
                      }}
                    >
                      {state.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: responsiveFontSize(14),
                        fontFamily: FONTS.regular,
                        color: COLORS.text.secondary,
                      }}
                    >
                      {state.code}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default StateDropdown;
