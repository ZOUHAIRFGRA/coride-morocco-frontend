import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "@/constants/theme";
import {
  FormField as FormFieldType,
  UISchemaField,
} from "@/constants/formSchemas";
import SimpleDatePicker from "@/components/ui/SimpleDatePicker";
import StateDropdown from "@/components/ui/StateDropdown";
import { StateCode } from "@/constants/countries"
import { LinearGradient } from "expo-linear-gradient";
import LocationField from "@/components/ui/LocationField";
import { useAuth } from "@/contexts/AppStateContext";
import { useAppTheme } from "@/hooks/useAppTheme";

interface FormFieldRendererProps {
  fieldName: string;
  fieldDef: FormFieldType;
  uiDef?: UISchemaField;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  disabled?: boolean;
  required?: boolean; // Add required prop
  onTextareaFocus?: () => void; // Callback for textarea focus on iOS
}

// Helper function to get gradient colors based on confidence
const getConfidenceGradientColors = (confidence: number): [string, string] => {
  if (confidence <= 33) {
    // Red Gradient (Low Confidence)
    return ["#fca5a5", COLORS.error.dark]; // Lighter red to darker red
  } else if (confidence <= 66) {
    // Orange/Yellow Gradient (Medium Confidence)
    return ["#fbbf24", "#d97706"]; // Assuming Tailwind amber-400 and amber-600
  } else {
    // Green Gradient (High Confidence)
    return [COLORS.success.light, COLORS.success.dark];
  }
};

/**
 * Custom Select Dropdown Component
 * Designed to work properly within modals without z-index issues
 */
interface CustomSelectDropdownProps {
  value: any;
  options: (string | number)[];
  optionLabels?: string[];
  onSelect: (value: any) => void;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  searchable?: boolean; // Add searchable prop
}

const CustomSelectDropdown: React.FC<CustomSelectDropdownProps & { fieldName?: string }> = React.memo(({
  value,
  options,
  optionLabels,
  onSelect,
  placeholder,
  disabled = false,
  error,
  searchable = false,
  fieldName,
}) => {
  const { colors, isDarkMode } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100); // slight delay to ensure modal is rendered
    }
  }, [isOpen, searchable]);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return options.map((option, index) => ({ option, index }));
    }

    const query = searchQuery.toLowerCase();
    return options
      .map((option, index) => ({ option, index }))
      .filter(({ option, index }) => {
        const optionText = optionLabels?.[index] || String(option);
        return (
          optionText.toLowerCase().includes(query) ||
          String(option).toLowerCase().includes(query)
        );
      });
  }, [options, optionLabels, searchQuery, searchable]);

  const getDisplayValue = () => {
    if (!value) return placeholder;
    const index = options.findIndex(
      (option) => String(option) === String(value) || option === value
    );
    const displayText = optionLabels?.[index] || String(value);
    // If this is the icon field, show the icon next to the label
    if (fieldName === "icon" && value) {
      return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name={value as any} size={18} style={{ marginRight: 8 }} />
          <Text style={{ fontFamily: FONTS.regular }}>{displayText}</Text>
        </View>
      );
    }
    return <Text style={{ fontFamily: FONTS.regular }}>{displayText}</Text>;
  };

  const handleOptionSelect = (option: string | number) => {
    onSelect(option);
    setIsOpen(false);
    setSearchQuery(""); // Reset search when option is selected
  };

  const handleModalClose = () => {
    setIsOpen(false);
    setSearchQuery(""); // Reset search when modal is closed
  };

  return (
    <View className="relative">
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        style={{
          minHeight: 48,
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderColor: error ? '#EF4444' : (isDarkMode ? colors.border.primary : '#D1D5DB'),
          backgroundColor: disabled 
            ? (isDarkMode ? colors.background.tertiary : '#F3F4F6') 
            : (isDarkMode ? colors.background.secondary : '#FFFFFF')
        }}
        disabled={disabled}
      >
        {/* If icon field, render icon+label, else just label */}
        {fieldName === "icon" && value ? (
          getDisplayValue()
        ) : (
        <Text
          style={{
            flex: 1,
            fontFamily: FONTS.regular,
            color: !value 
              ? (isDarkMode ? colors.text.tertiary : '#6B7280') 
              : colors.text.primary
          }}
        >
            {(() => {
              if (!value) return placeholder || "Select an option";
              const index = options.findIndex((option) => String(option) === String(value) || option === value);
              if (index !== -1 && optionLabels && optionLabels[index]) {
                return optionLabels[index];
              }
              return String(value) || placeholder || "Select an option";
            })()}
        </Text>
        )}
        <Ionicons
          name="chevron-down"
          size={16}
          color={disabled ? "#9CA3AF" : "#666"}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          activeOpacity={1}
          onPress={handleModalClose}
        >
          <View
            style={{
              backgroundColor: colors.background.primary,
              borderRadius: 8,
              maxHeight: 320,
              marginHorizontal: 32,
              minWidth: 256,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 8,
              maxWidth: "90%",
              width: 300,
            }}
          >
            <View style={{
              borderBottomWidth: 1,
              borderBottomColor: isDarkMode ? colors.border.primary : '#E5E7EB',
              paddingHorizontal: 16,
              paddingVertical: 12
            }}>
              <Text
                style={{
                  fontFamily: FONTS.semiBold,
                  fontSize: 18,
                  color: colors.text.primary
                }}
              >
                {placeholder}
              </Text>
            </View>

            {/* Search Input */}
            {searchable && (
              <View style={{
                borderBottomWidth: 1,
                borderBottomColor: isDarkMode ? colors.border.primary : '#E5E7EB',
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: isDarkMode ? colors.background.secondary : '#F9FAFB'
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="search" size={16} color={colors.text.secondary} />
                  <TextInput
                    ref={searchInputRef}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search..."
                    placeholderTextColor={isDarkMode ? colors.text.tertiary : '#9CA3AF'}
                    style={{
                      flex: 1,
                      marginLeft: 8,
                      color: colors.text.primary,
                      fontFamily: FONTS.regular
                    }}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <Ionicons name="close-circle" size={16} color={colors.text.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            <ScrollView
              className="max-h-64"
              showsVerticalScrollIndicator={false}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map(({ option, index }) => (
                  <TouchableOpacity
                    key={String(option)}
                    onPress={() => handleOptionSelect(option)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: isDarkMode ? colors.border.secondary : '#F3F4F6',
                      backgroundColor: String(option) === String(value) 
                        ? (isDarkMode ? colors.background.tertiary : '#EFF6FF') 
                        : 'transparent',
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    {/* If icon field, render icon+label, else just label */}
                    {fieldName === "icon" ? (
                      <Ionicons name={option as any} size={20} style={{ marginRight: 10 }} color={colors.text.primary} />
                    ) : null}
                    <Text
                      style={{
                        fontSize: 16,
                        color: String(option) === String(value)
                          ? (isDarkMode ? COLORS.primary.oceanBlue200 : '#1D4ED8')
                          : colors.text.primary,
                        fontFamily: String(option) === String(value)
                          ? FONTS.semiBold
                          : FONTS.regular,
                      }}
                    >
                      {optionLabels?.[index] || String(option)}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : searchable && searchQuery.length > 0 ? (
                <View style={{ paddingHorizontal: 16, paddingVertical: 24, alignItems: 'center' }}>
                  <Text
                    style={{
                      color: colors.text.secondary,
                      textAlign: 'center',
                      fontFamily: FONTS.regular
                    }}
                  >
                    No options found matching "{searchQuery}"
                  </Text>
                </View>
              ) : null}
            </ScrollView>
            <TouchableOpacity
              onPress={handleModalClose}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderTopWidth: 1,
                borderTopColor: isDarkMode ? colors.border.primary : '#E5E7EB'
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: isDarkMode ? COLORS.primary.oceanBlue200 : '#2563EB',
                  fontFamily: FONTS.semiBold
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

CustomSelectDropdown.displayName = 'CustomSelectDropdown';

/**
 * Renders a form field based on its schema definition and UI hints
 */
export const FormFieldRenderer: React.FC<FormFieldRendererProps> = React.memo(({
  fieldName,
  fieldDef,
  uiDef,
  value,
  error,
  onChange,
  disabled = false,
  required = false,
  onTextareaFocus,
}) => {
  const { colors, isDarkMode } = useAppTheme();
  const widget = uiDef?.["ui:widget"];
  const placeholder =
    uiDef?.["ui:placeholder"] || `Enter ${fieldDef.title.toLowerCase()}`;
  const help = uiDef?.["ui:help"];
  const options = uiDef?.["ui:options"] || {};

  // Check if field is disabled from options or prop
  const isFieldDisabled = disabled || options.disabled || false;

  // Don't render hidden fields or section headers with labels
  if (widget === "hidden") {
    return null;
  }

  // Section headers don't need labels or error handling
  if (widget === "section_header") {
    return (
      <View className="mb-2 mt-6 first:mt-0">
        <Text
          className="text-lg font-semibold text-primary-dark mb-4"
          style={{ fontFamily: FONTS.semiBold }}
        >
          {fieldDef.title}
        </Text>
      </View>
    );
  }

  // Common label component
  const FieldLabel = () => (
    <Text
      style={{
        fontSize: 14,
        fontWeight: '500',
        color: colors.text.primary,
        marginBottom: 8,
        fontFamily: FONTS.regular
      }}
    >
      {fieldDef.title}
      {required && <Text style={{ color: "#E53935" }}> *</Text>}
    </Text>
  );

  // Common error component
  const FieldError = () =>
    error ? <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{error}</Text> : null;

  // Common help text component
  const FieldHelp = () =>
    help ? (
      <Text style={{ color: colors.text.secondary, fontSize: 12, marginTop: 4 }}>{help}</Text>
    ) : null;

  // Render different widgets based on type and widget hint
  const renderWidget = () => {
    switch (widget) {
      case "state_select":
        return (
          <StateDropdown
            value={value as StateCode}
            onValueChange={onChange}
            error={error}
            label={""}
          />
        );

      case "disclosure_toggle":
        return (
          <View className="mb-4">
            <View className="flex-row items-center justify-between">
              <Text
                className="text-sm font-medium text-typography-700 flex-1 pr-4"
                style={{ fontFamily: FONTS.regular }}
              >
                {fieldDef.title}
              </Text>
              <Switch
                value={Boolean(value)}
                onValueChange={onChange}
                trackColor={{ false: "#D1D5DB", true: COLORS.primary.light }}
                thumbColor={value ? COLORS.primary.dark : "#F3F4F6"}
                disabled={isFieldDisabled}
              />
            </View>
            {fieldDef.description && (
              <Text
                className="text-xs text-typography-500 mt-1"
                style={{ fontFamily: FONTS.regular }}
              >
                {fieldDef.description}
              </Text>
            )}
          </View>
        );

      case "terms_checkbox":
        return (
          <TouchableOpacity
            className="flex-row items-start mb-2"
            onPress={() => !isFieldDisabled && onChange(!value)}
            disabled={isFieldDisabled}
          >
            <View
              className={`w-5 h-5 rounded border mr-3 mt-0.5 items-center justify-center ${
                value
                  ? "bg-primary-light border-primary-light"
                  : "border-outline-300 bg-gray-50"
              }`}
            >
              {value && <Ionicons name="checkmark" size={12} color="white" />}
            </View>
            <Text
              className="text-sm text-typography-700 flex-1 leading-5"
              style={{ fontFamily: FONTS.regular }}
            >
              {fieldDef.title}
            </Text>
          </TouchableOpacity>
        );

      case "select":
        // Debug logging for select fields
        // console.log("🔍 FormFieldRenderer - Select field:", {
        //   fieldName,
        //   value,
        //   options: fieldDef.enum,
        //   optionLabels: fieldDef.enumNames
        // });
        
        const handleSelectChange = (selectedValue: any) => {
          // Convert to number if the field type is number and all enum values are numbers
          if (
            fieldDef.type === "number" &&
            fieldDef.enum?.every((val) => typeof val === "number")
          ) {
            onChange(Number(selectedValue));
          } else {
            onChange(selectedValue);
          }
        };

        return (
          <CustomSelectDropdown
            value={value}
            options={fieldDef.enum || []}
            optionLabels={fieldDef.enumNames}
            onSelect={handleSelectChange}
            placeholder={`Select ${fieldDef.title.toLowerCase()}`}
            disabled={isFieldDisabled}
            error={error}
            searchable={options.searchable || false}
            fieldName={fieldName}
          />
        );

      case "checkboxes":
        return (
          <View className="space-y-2">
            {fieldDef.items?.enum?.map((option: string, index: number) => {
              const isSelected = Array.isArray(value) && value.includes(option);
              const label = fieldDef.items?.enumNames?.[index] || option;

              return (
                <TouchableOpacity
                  key={option}
                  className="flex-row items-center py-2"
                  onPress={() => {
                    if (disabled) return;
                    const currentArray = Array.isArray(value) ? value : [];
                    if (isSelected) {
                      onChange(
                        currentArray.filter((item: string) => item !== option)
                      );
                    } else {
                      onChange([...currentArray, option]);
                    }
                  }}
                  disabled={disabled}
                >
                  <View
                    className={`w-5 h-5 rounded border mr-3 items-center justify-center ${
                      isSelected
                        ? "bg-primary-500 border-primary-500"
                        : "border-outline-300"
                    }`}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                  <Text className="text-typography-700 flex-1">{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case "switch":
        return (
          <View className="flex-row items-center justify-between">
            <Text className="text-typography-700 flex-1 pr-4">
              {fieldDef.description || fieldDef.title}
            </Text>
            <Switch
              value={Boolean(value)}
              onValueChange={onChange}
              trackColor={{ false: "#D1D5DB", true: COLORS.primary.light }}
              thumbColor={value ? COLORS.primary.dark : "#F3F4F6"}
              disabled={disabled}
            />
          </View>
        );

      case "date":
        // Parse date constraints from options
        const getDateConstraint = (constraint: string | Date | undefined): Date | undefined => {
          if (!constraint) return undefined;
          if (constraint instanceof Date) return constraint;
          if (constraint === 'today') return new Date();
          try {
            return new Date(constraint);
          } catch {
            return undefined;
          }
        };

        return (
          <SimpleDatePicker
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            error={!!error}
            disabled={isFieldDisabled}
            minimumDate={getDateConstraint(options.minimumDate)}
            maximumDate={getDateConstraint(options.maximumDate)}
          />
        );

      case "slider":
        return (
          <SliderFieldRenderer
            value={value}
            onChange={onChange}
            options={options}
            disabled={disabled}
          />
        );

      case "textarea":
        return (
          <TextInput
            style={{
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 16,
              minHeight: 140,
              fontFamily: FONTS.regular,
              textAlignVertical: "top",
              borderColor: error ? '#EF4444' : (isDarkMode ? colors.border.primary : '#D1D5DB'),
              backgroundColor: isDarkMode ? colors.background.secondary : '#F9FAFB',
              color: colors.text.primary
            }}
            value={value || ""}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={isDarkMode ? colors.text.tertiary : '#9CA3AF'}
            multiline
            numberOfLines={4}
            editable={!disabled}
            blurOnSubmit={false}
            returnKeyType="default"
            textAlignVertical="top"
            onFocus={() => {
              // iOS-specific: Auto-scroll to textarea when focused
              if (Platform.OS === "ios" && onTextareaFocus) {
                onTextareaFocus();
              }
            }}
          />
        );

      case "tickerInput":
        return (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? colors.background.secondary : '#F3F4F6',
            borderRadius: 12,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: isDarkMode ? colors.border.primary : '#E5E7EB'
          }}>
            <Ionicons
              name="search-outline"
              size={20}
              color={colors.text.secondary}
              style={{ marginRight: 8 }}
            />
            <TextInput
              value={value || ""}
              onChangeText={onChange}
              style={{
                flex: 1,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.text.primary,
                fontWeight: '500'
              }}
              placeholder={placeholder}
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="characters"
              editable={!isFieldDisabled}
            />
          </View>
        );

      case "buySellButtons":
        return (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => onChange("BUY")}
              className={`flex-1 py-1 justify-center rounded-xl items-center border-2 ${value === "BUY" ? "bg-green-100 border-green-500" : "bg-gray-100 border-gray-200"}`}
              disabled={isFieldDisabled}
            >
              <Ionicons
                name="trending-up-outline"
                size={25}
                color={
                  value === "BUY" ? COLORS.success.dark : COLORS.text.secondary
                }
              />
              <Text
                className={`text-lg font-semiBold ${value === "BUY" ? "text-green-700" : "text-gray-700"}`}
              >
                BUY
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onChange("SELL")}
              className={`flex-1 justify-center rounded-xl items-center border-2 ${value === "SELL" ? "bg-red-100 border-red-500" : "bg-gray-100 border-gray-200"}`}
              disabled={isFieldDisabled}
            >
              <Ionicons
                name="trending-down-outline"
                size={25}
                color={
                  value === "SELL" ? COLORS.error.dark : COLORS.text.secondary
                }
              />
              <Text
                className={`text-lg font-semiBold ${value === "SELL" ? "text-red-700" : "text-gray-700"}`}
              >
                SELL
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "confidenceSlider":
        const confidenceValue = parseInt(value) || 0;
        return (
          <View className="mb-5">
            <Text className="text-md font-medium text-gray-600 mb-2 ml-1">
              Your Confidence ({confidenceValue}%)
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => onChange(Math.max(confidenceValue - 10, 0))}
                className="p-1"
                disabled={isFieldDisabled}
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={26}
                  color={COLORS.primary.oceanBlue700}
                />
              </TouchableOpacity>
              <View className="flex-1 mx-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <LinearGradient
                  colors={getConfidenceGradientColors(confidenceValue)}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{
                    height: "100%",
                    width: `${confidenceValue}%` as any,
                    borderRadius: 9999,
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={() => onChange(Math.min(confidenceValue + 10, 100))}
                className="p-1"
                disabled={isFieldDisabled}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={26}
                  color={COLORS.primary.oceanBlue700}
                />
              </TouchableOpacity>
            </View>
          </View>
        );

      case "news_sources_array":
        return (
          <View className="mb-4 pt-2">
            <Text className="text-lg font-semibold text-gray-700 mb-3 ml-1">
              News & Analysis Sources
            </Text>

            {(value || []).map((source: any, index: number) => (
              <View
                key={index}
                className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-3 shadow-sm"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-md font-medium text-slate-600">
                    Source #{index + 1}
                  </Text>
                  {(value || []).length > 1 && (
                    <TouchableOpacity
                      onPress={() => {
                        const updatedSources = [...(value || [])];
                        updatedSources.splice(index, 1);
                        onChange(updatedSources);
                      }}
                      className={`p-1.5 rounded-full bg-red-50 hover:bg-red-100 active:bg-red-200 ${(value || []).length <= 1 ? "opacity-0" : ""}`}
                      disabled={isFieldDisabled}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={20}
                        color={COLORS.error.dark}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <View className="mb-3">
                  <Text className="text-sm font-medium text-slate-500 mb-1 ml-0.5">
                    Title or Source Name
                  </Text>
                  <TextInput
                    value={source.title}
                    onChangeText={(text) => {
                      const updatedSources = [...(value || [])];
                      updatedSources[index].title = text;
                      onChange(updatedSources);
                    }}
                    className="border border-slate-300 bg-white rounded-md px-3 py-2.5 text-[15px] text-typography-800 focus:border-primary-light focus:ring-1 focus:ring-primary-light/50"
                    placeholder="e.g., Bloomberg Article, Reuters Report"
                    placeholderTextColor={COLORS.text.tertiary}
                    editable={!isFieldDisabled}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-slate-500 mb-1 ml-0.5">
                    URL (Link to Source)
                  </Text>
                  <TextInput
                    value={source.url}
                    onChangeText={(text) => {
                      const updatedSources = [...(value || [])];
                      updatedSources[index].url = text;
                      onChange(updatedSources);
                    }}
                    className="border border-slate-300 bg-white rounded-md px-3 py-2.5 text-[15px] text-typography-800 focus:border-primary-light focus:ring-1 focus:ring-primary-light/50"
                    placeholder="https://www.example.com/article-link"
                    placeholderTextColor={COLORS.text.tertiary}
                    autoCapitalize="none"
                    keyboardType="url"
                    editable={!isFieldDisabled}
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={() =>
                onChange([...(value || []), { title: "", url: "" }])
              }
              className="mt-2 flex-row items-center justify-center bg-primary-light/10 hover:bg-primary-light/20 active:bg-primary-light/30 py-2.5 px-4 rounded-lg border border-primary-light/30 shadow-xs"
              disabled={isFieldDisabled}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={COLORS.primary.light}
              />
              <Text className="text-primary-light font-semibold text-sm ml-2">
                Add News Source
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "array":
        // Handle transaction arrays for journal entries
        if (fieldName === "transactions") {
          return (
            <View className="mb-4 pt-2">
              <Text className="text-lg font-semibold text-gray-700 mb-3 ml-1">
                Transactions
              </Text>
              <Text className="text-sm text-gray-500 mb-4 ml-1">
                Double-entry accounting: Add at least 2 transactions where total
                debits equal total credits
              </Text>

              {(value || []).map((transaction: any, index: number) => (
                <View
                  key={index}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-3 shadow-sm"
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-md font-medium text-slate-600">
                      Transaction #{index + 1}
                    </Text>
                    {(value || []).length > 1 && (
                      <TouchableOpacity
                        onPress={() => {
                          const updatedTransactions = [...(value || [])];
                          updatedTransactions.splice(index, 1);
                          onChange(updatedTransactions);
                        }}
                        className="p-1.5 rounded-full bg-red-50"
                        disabled={isFieldDisabled}
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={20}
                          color={COLORS.error.dark}
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Account Selection */}
                  <View className="mb-3">
                    <Text className="text-sm font-medium text-slate-500 mb-1 ml-0.5">
                      Account
                    </Text>
                    {(() => {
                      const hasEnum =
                        fieldDef?.items?.properties?.accountUuid?.enum;

                      // Extract accountUuid-specific options from nested uiSchema structure
                      const transactionItemsUI = uiDef as any;
                      const accountUuidOptions =
                        transactionItemsUI?.items?.accountUuid?.[
                          "ui:options"
                        ] || {};

                      return hasEnum ? (
                        <CustomSelectDropdown
                          value={transaction.accountUuid || ""}
                          onSelect={(text: string) => {
                            const updatedTransactions = [...(value || [])];
                            updatedTransactions[index] = {
                              ...transaction,
                              accountUuid: text,
                            };
                            onChange(updatedTransactions);
                          }}
                          options={fieldDef.items.properties.accountUuid.enum}
                          optionLabels={
                            fieldDef.items.properties.accountUuid.enumNames
                          }
                          placeholder="Select account"
                          error={error}
                          disabled={isFieldDisabled}
                          searchable={accountUuidOptions.searchable || false}
                          fieldName="accountUuid"
                        />
                      ) : (
                        <TextInput
                          value={transaction.accountUuid || ""}
                          onChangeText={(text) => {
                            const updatedTransactions = [...(value || [])];
                            updatedTransactions[index] = {
                              ...transaction,
                              accountUuid: text,
                            };
                            onChange(updatedTransactions);
                          }}
                          className="border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700"
                          placeholder="Enter account UUID"
                          placeholderTextColor={COLORS.text.tertiary}
                          editable={!isFieldDisabled}
                        />
                      );
                    })()}
                  </View>

                  {/* Transaction Type Dropdown */}
                  <View className="mb-3">
                    <Text className="text-sm font-medium text-slate-500 mb-1 ml-0.5">
                      Transaction Type
                    </Text>
                    <CustomSelectDropdown
                      value={transaction.transactionType || ""}
                      onSelect={(selectedType: string) => {
                        const updatedTransactions = [...(value || [])];
                        updatedTransactions[index] = {
                          ...transaction,
                          transactionType: selectedType,
                        };
                        onChange(updatedTransactions);
                      }}
                      options={["debit", "credit"]}
                      optionLabels={["Debit", "Credit"]}
                      placeholder="Select transaction type"
                      error={error}
                      disabled={isFieldDisabled}
                      searchable={false}
                    />
                  </View>

                  {/* Amount - Only show after transaction type or txType is selected */}
                  {(transaction.transactionType || transaction.txType) && (
                    <View className="mb-3">
                      <Text className="text-sm font-medium text-slate-500 mb-1 ml-0.5">
                        {transaction.transactionType === "debit" ||
                        (transaction.txType &&
                          transaction.txType.toLowerCase() === "debit")
                          ? "Debit Amount"
                          : "Credit Amount"}
                      </Text>
                      <TextInput
                        value={
                          transaction.transactionType
                            ? transaction.amount !== undefined &&
                              transaction.amount !== null
                              ? transaction.amount.toString()
                              : ""
                            : transaction.txType &&
                                transaction.txType.toLowerCase() === "debit"
                              ? transaction.debitAmount !== undefined &&
                                transaction.debitAmount !== null
                                ? transaction.debitAmount.toString()
                                : ""
                              : transaction.creditAmount !== undefined &&
                                  transaction.creditAmount !== null
                                ? transaction.creditAmount.toString()
                                : ""
                        }
                        onChangeText={(text) => {
                          const updatedTransactions = [...(value || [])];
                          const amount = text === "" ? "" : parseFloat(text);

                          if (transaction.transactionType) {
                            updatedTransactions[index] = {
                              ...transaction,
                              amount: amount,
                            };
                          } else if (
                            transaction.txType &&
                            transaction.txType.toLowerCase() === "debit"
                          ) {
                            updatedTransactions[index] = {
                              ...transaction,
                              debitAmount: amount,
                            };
                          } else if (
                            transaction.txType &&
                            transaction.txType.toLowerCase() === "credit"
                          ) {
                            updatedTransactions[index] = {
                              ...transaction,
                              creditAmount: amount,
                            };
                          }

                          onChange(updatedTransactions);
                        }}
                        className="border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700"
                        placeholder="0.00"
                        placeholderTextColor={COLORS.text.tertiary}
                        keyboardType="numeric"
                        editable={!isFieldDisabled}
                      />
                    </View>
                  )}
                </View>
              ))}

              {/* Add Transaction Button */}
              <TouchableOpacity
                onPress={() =>
                  onChange([
                    ...(value || []),
                    {
                      accountUuid: "",
                      description: "",
                      transactionType: "",
                      amount: 0,
                    },
                  ])
                }
                className="mt-2 flex-row items-center justify-center bg-primary-light/10 py-2.5 px-4 rounded-lg border border-primary-light/30"
                disabled={isFieldDisabled}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={COLORS.primary.light}
                />
                <Text className="text-primary-light font-semibold text-sm ml-2">
                  Add Transaction
                </Text>
              </TouchableOpacity>

              {/* Balance Validation Display */}
              {(value || []).length >= 2 && (
                <View className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  {(() => {
                    const totalDebits = (value || []).reduce(
                      (sum: number, t: any) => {
                        const isDebit =
                          t.transactionType === "debit" ||
                          (t.txType && t.txType.toLowerCase() === "debit");

                        const amount =
                          t.debitAmount !== undefined && t.debitAmount !== null
                            ? parseFloat(t.debitAmount)
                            : isDebit
                              ? parseFloat(t.amount) || 0
                              : 0;

                        return sum + amount;
                      },
                      0
                    );

                    const totalCredits = (value || []).reduce(
                      (sum: number, t: any) => {
                        const isCredit =
                          t.transactionType === "credit" ||
                          (t.txType && t.txType.toLowerCase() === "credit");

                        const amount =
                          t.creditAmount !== undefined &&
                          t.creditAmount !== null
                            ? parseFloat(t.creditAmount)
                            : isCredit
                              ? parseFloat(t.amount) || 0
                              : 0;

                        return sum + amount;
                      },
                      0
                    );

                    const isBalanced =
                      Math.abs(totalDebits - totalCredits) < 0.01;

                    return (
                      <View>
                        <View className="flex-row justify-between mb-2">
                          <Text className="text-sm text-gray-600">
                            Total Debits:
                          </Text>
                          <Text className="text-sm font-medium">
                            ${totalDebits.toFixed(2)}
                          </Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                          <Text className="text-sm text-gray-600">
                            Total Credits:
                          </Text>
                          <Text className="text-sm font-medium">
                            ${totalCredits.toFixed(2)}
                          </Text>
                        </View>
                        <View
                          className={`flex-row items-center justify-center mt-2 p-2 rounded ${isBalanced ? "bg-green-100" : "bg-red-100"}`}
                        >
                          <Ionicons
                            name={
                              isBalanced ? "checkmark-circle" : "alert-circle"
                            }
                            size={16}
                            color={isBalanced ? "#16a34a" : "#dc2626"}
                          />
                          <Text
                            className={`text-sm font-medium ml-2 ${isBalanced ? "text-green-700" : "text-red-700"}`}
                          >
                            {isBalanced
                              ? "Balanced ✓"
                              : "Unbalanced - Debits must equal Credits"}
                          </Text>
                        </View>
                      </View>
                    );
                  })()}
                </View>
              )}
            </View>
          );
        }

        // Fallback for other array types
        return (
          <TextInput
            className={`border rounded-lg px-3 py-3 text-base ${
              error ? "border-error-500" : "border-outline-300"
            } bg-gray-50 text-typography-900`}
            style={{ fontFamily: FONTS.regular }}
            value={
              Array.isArray(value)
                ? JSON.stringify(value, null, 2)
                : value || ""
            }
            onChangeText={(text) => {
              try {
                const parsed = JSON.parse(text);
                onChange(parsed);
              } catch {
                onChange(text);
              }
            }}
            placeholder="Enter JSON array"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            editable={!isFieldDisabled}
          />
        );

      case "user_profile_header":
        const { user } = useAuth();

        // Helper function to get profile image URL
        const getProfileImageUrl = () => {
          // Use initials-based avatar service for consistency
          const fullName = user?.first_name && user?.last_name 
            ? `${user.first_name} ${user.last_name}`
            : user?.first_name || user?.email || "User";
          
          return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0F4C75&color=fff&size=128`;
        };

        return (
          <View className="px-4 pt-4 pb-3 flex-row items-center">
            <Image
              source={{ uri: getProfileImageUrl() }}
              className="w-14 h-14 rounded-full"
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              placeholder={require("@assets/images/mix/user.jpg")}
              placeholderContentFit="cover"
            />
            <View className="ml-3">
              <Text className="font-semiBold text-md text-typography-900">
                {user?.first_name || "Anonymous"}{" "}
                {user?.last_name || ""}
              </Text>
              <View className="flex-row items-center bg-primary-oceanBlue50 rounded-md px-2 py-0.5 mt-1">
                <Ionicons
                  name="stats-chart-outline"
                  size={12}
                  color={COLORS.primary.oceanBlue700}
                />
                <Text className="text-xs text-primary-oceanBlue700 ml-1 font-medium">
                  Investment Post
                </Text>
              </View>
            </View>
          </View>
        );

      case "location":
        return (
          <LocationField
            value={value}
            onLocationSelect={onChange}
            placeholder={placeholder}
            title={fieldDef.title}
            required={required}
            error={error}
            disabled={isFieldDisabled}
          />
        );

      default:
        // Default text input
        return (
          <TextInput
            style={{
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 16,
              fontFamily: FONTS.regular,
              borderColor: error ? '#EF4444' : (isDarkMode ? colors.border.primary : '#D1D5DB'),
              backgroundColor: isFieldDisabled
                ? (isDarkMode ? colors.background.tertiary : '#F3F4F6')
                : (isDarkMode ? colors.background.secondary : '#F9FAFB'),
              color: isFieldDisabled
                ? (isDarkMode ? colors.text.tertiary : '#6B7280')
                : colors.text.primary
            }}
            value={value || ""}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={isDarkMode ? colors.text.tertiary : '#9CA3AF'}
            keyboardType={getKeyboardType(fieldDef)}
            autoCapitalize={getAutoCapitalize(fieldDef)}
            editable={!isFieldDisabled}
          />
        );
    }
  };

  return (
    <View className="mb-4">
      {/* Only show field label for non-disclosure toggles and non-terms checkboxes */}
      {widget !== "disclosure_toggle" && widget !== "terms_checkbox" && (
        <FieldLabel />
      )}
      {renderWidget()}
      <FieldError />
      <FieldHelp />
    </View>
  );
});

FormFieldRenderer.displayName = 'FormFieldRenderer';

/**
 * Slider field renderer component
 */
interface SliderFieldRendererProps {
  value: number;
  onChange: (value: number) => void;
  options: Record<string, any>;
  disabled: boolean;
}

const SliderFieldRenderer: React.FC<SliderFieldRendererProps> = ({
  value,
  options,
}) => {
  const min = options.min || 0;
  const max = options.max || 100;

  return (
    <View className="space-y-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-typography-500">{min}</Text>
        <Text className="text-typography-700 font-semibold">{value}</Text>
        <Text className="text-typography-500">{max}</Text>
      </View>
      {/* Note: Slider component needs to be implemented or replaced with a simple view for now */}
      <View className="bg-primary-500 h-2 rounded-full w-full">
        <View
          className="bg-primary-700 h-2 rounded-full"
          style={{ width: `${(((value || 0) - min) / (max - min)) * 100}%` }}
        />
      </View>
    </View>
  );
};

/**
 * Helper function to get keyboard type based on field definition
 */
function getKeyboardType(
  fieldDef: FormFieldType
): "default" | "email-address" | "numeric" | "phone-pad" {
  if (fieldDef.format === "email") return "email-address";
  if (fieldDef.type === "number") return "numeric";
  if (fieldDef.title.toLowerCase().includes("phone")) return "phone-pad";
  return "default";
}

/**
 * Helper function to get auto-capitalize setting
 */
function getAutoCapitalize(
  fieldDef: FormFieldType
): "none" | "sentences" | "words" | "characters" {
  if (fieldDef.format === "email") return "none";
  if (fieldDef.title.toLowerCase().includes("name")) return "words";
  if (fieldDef.title.toLowerCase().includes("address")) return "words";
  if (fieldDef.title.toLowerCase().includes("city")) return "words";
  return "none";
}
