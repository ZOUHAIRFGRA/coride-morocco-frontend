import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "@/constants/theme";
import { moderateScale, verticalScale, responsiveFontSize } from "@utils/responsive";
import { COUNTRIES, CountryCode } from "@/constants/countries";

interface CountryDropdownProps {
  label: string;
  value: CountryCode;
  onValueChange: (value: CountryCode) => void;
  error?: string;
  required?: boolean;
}

/**
 * Country dropdown component with proper ISO 2-letter codes
 */
const CountryDropdown: React.FC<CountryDropdownProps> = ({ label, value, onValueChange, error, required = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCountry = COUNTRIES.find((country) => country.code === value);

  const handleSelect = (countryCode: CountryCode) => {
    onValueChange(countryCode);
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
            color: selectedCountry ? COLORS.text.primary : "#999",
          }}
        >
          {selectedCountry ? selectedCountry.name : "Select country"}
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
                Select Country
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={moderateScale(24)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Country List */}
            <ScrollView style={{ maxHeight: verticalScale(400) }}>
              {COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={{
                    paddingHorizontal: moderateScale(16),
                    paddingVertical: moderateScale(12),
                    borderBottomWidth: 1,
                    borderBottomColor: "#F0F0F0",
                    backgroundColor: value === country.code ? "#F5F9FF" : "white",
                  }}
                  onPress={() => handleSelect(country.code)}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: responsiveFontSize(16),
                        fontFamily: FONTS.regular,
                        color: COLORS.text.primary,
                      }}
                    >
                      {country.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: responsiveFontSize(14),
                        fontFamily: FONTS.regular,
                        color: COLORS.text.secondary,
                      }}
                    >
                      {country.code}
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

export default CountryDropdown;
