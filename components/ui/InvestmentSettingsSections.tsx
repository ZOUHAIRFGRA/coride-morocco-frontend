import React from "react";
import { View, Text, TouchableOpacity, Switch, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import SettingsSection from "./SettingsSection";

// Types
export type PortfolioType = {
  id: number;
  name: string;
  balance: string;
  icon: string;
  performance: string;
  status: "up" | "down";
};

export type AssetType = {
  id: number;
  name: string;
  symbol: string;
  icon: string;
};

export type FundingSourceType = "EMPLOYMENT_INCOME" | "INVESTMENTS" | "INHERITANCE" | "BUSINESS_INCOME" | "SAVINGS" | "FAMILY";

/**
 * Renders an icon based on the icon name
 */
export const renderIcon = (iconName: string) => {
  switch (iconName) {
    case "trending-up":
      return <Ionicons name="trending-up" size={wp(6)} color="#4DA6FF" />;
    case "logo-bitcoin":
      return <Ionicons name="logo-bitcoin" size={wp(6)} color="#F7931A" />;
    case "logo-apple":
      return <Ionicons name="logo-apple" size={wp(6)} color="#555555" />;
    case "car":
      return <Ionicons name="car" size={wp(6)} color="#E82127" />;
    case "wallet":
      return <Ionicons name="wallet-outline" size={wp(6)} color="#4DA6FF" />;
    default:
      return <Ionicons name="help-circle-outline" size={wp(6)} color="#4DA6FF" />;
  }
};

/**
 * Portfolios section component
 */
export const PortfoliosSection = ({
  expanded,
  onToggle,
  portfolios,
  onAddPortfolio,
}: {
  expanded: boolean;
  onToggle: () => void;
  portfolios: PortfolioType[];
  onAddPortfolio: () => void;
}) => {
  return (
    <SettingsSection title="Portfolios" expanded={expanded} onToggle={onToggle}>
      {portfolios.map((portfolio) => (
        <TouchableOpacity key={portfolio.id} className="flex-row items-center my-3 bg-white" activeOpacity={0.7}>
          <View className="w-12 h-12 rounded-full bg-primary-oceanBlue50 justify-center items-center mr-3">{renderIcon(portfolio.icon)}</View>
          <View className="flex-1">
            <Text className="text-base text-gray-800 font-semibold">{portfolio.name}</Text>
            <Text className="text-sm text-gray-500">{portfolio.balance}</Text>
          </View>
          <View className="flex-col items-end">
            <Text className={`text-md ${portfolio.status === "up" ? "text-green-600" : "text-red-500"} font-bold`}>{portfolio.performance}</Text>
            <View className="bg-primary-oceanBlue50 rounded-full px-2 py-1 mt-1">
              <Text className="text-xs text-primary-oceanBlue700 font-semibold">{portfolio.status === "up" ? "Profit" : "Loss"}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Add Portfolio Button */}
      <TouchableOpacity className="self-end mt-2 mr-1 flex-row items-center p-2" activeOpacity={0.7} onPress={onAddPortfolio}>
        <Ionicons name="add" size={wp(5)} color="#4DA6FF" />
        <Text className="text-sm text-primary-oceanBlue700 ml-1 font-semibold">Add Portfolio</Text>
      </TouchableOpacity>
    </SettingsSection>
  );
};

/**
 * Favorite Assets section component
 */
export const FavoriteAssetsSection = ({
  expanded,
  onToggle,
  assets,
  onAddAsset,
  onRemoveAsset,
}: {
  expanded: boolean;
  onToggle: () => void;
  assets: AssetType[];
  onAddAsset: () => void;
  onRemoveAsset: (id: number) => void;
}) => {
  return (
    <SettingsSection title="Favorite Assets" expanded={expanded} onToggle={onToggle}>
      {assets.map((asset) => (
        <TouchableOpacity key={asset.id} className="flex-row items-center my-3 bg-white" activeOpacity={0.7}>
          <View className="w-12 h-12 rounded-full bg-primary-oceanBlue50 justify-center items-center mr-3">{renderIcon(asset.icon)}</View>
          <View className="flex-1">
            <Text className="text-base text-gray-800 font-semibold">{asset.name}</Text>
            <Text className="text-sm text-gray-500">{asset.symbol}</Text>
          </View>
          <TouchableOpacity className="p-2" onPress={() => onRemoveAsset(asset.id)}>
            <Ionicons name="close" size={wp(5)} color="#666666" />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {/* Add Asset Button */}
      <TouchableOpacity className="self-end mt-2 mr-1 flex-row items-center p-2" activeOpacity={0.7} onPress={onAddAsset}>
        <Ionicons name="add" size={wp(5)} color="#4DA6FF" />
        <Text className="text-sm text-primary-oceanBlue700 ml-1 font-semibold">Add Asset</Text>
      </TouchableOpacity>
    </SettingsSection>
  );
};

/**
 * Trading Preferences section component
 */
export const TradingPreferencesSection = ({
  expanded,
  onToggle,
  autoRefresh,
  showPerformance,
  onAutoRefreshChange,
  onShowPerformanceChange,
  onSelectDefaultPortfolio,
  onSelectRiskTolerance,
  onSelectDefaultCurrency,
}: {
  expanded: boolean;
  onToggle: () => void;
  autoRefresh: boolean;
  showPerformance: boolean;
  onAutoRefreshChange: (value: boolean) => void;
  onShowPerformanceChange: (value: boolean) => void;
  onSelectDefaultPortfolio: () => void;
  onSelectRiskTolerance: () => void;
  onSelectDefaultCurrency: () => void;
}) => {
  return (
    <SettingsSection title="Trading Preferences" expanded={expanded} onToggle={onToggle}>
      <View className="flex-row justify-between items-center my-2 px-1">
        <Text className="text-base text-gray-800">Default Portfolio</Text>
        <TouchableOpacity className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2" onPress={onSelectDefaultPortfolio}>
          <Text className="text-primary-oceanBlue700 mr-1">US Stocks</Text>
          <Ionicons name="chevron-down" size={wp(4)} color="#4DA6FF" />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-center my-2 px-1">
        <Text className="text-base text-gray-800">Risk Tolerance</Text>
        <TouchableOpacity className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2" onPress={onSelectRiskTolerance}>
          <Text className="text-primary-oceanBlue700 mr-1">Medium</Text>
          <Ionicons name="chevron-down" size={wp(4)} color="#4DA6FF" />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-center my-2 px-1">
        <Text className="text-base text-gray-800">Default Currency</Text>
        <TouchableOpacity className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2" onPress={onSelectDefaultCurrency}>
          <Text className="text-primary-oceanBlue700 mr-1">USD</Text>
          <Ionicons name="chevron-down" size={wp(4)} color="#4DA6FF" />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-center my-2 px-1">
        <Text className="text-base text-gray-800">Auto Refresh Data</Text>
        <Switch
          value={autoRefresh}
          onValueChange={onAutoRefreshChange}
          trackColor={{ false: "#D1D5DB", true: "#A1DD70" }}
          thumbColor={autoRefresh ? "#4CD964" : "#F3F4F6"}
        />
      </View>

      <View className="flex-row justify-between items-center my-2 px-1">
        <Text className="text-base text-gray-800">Show Performance</Text>
        <Switch
          value={showPerformance}
          onValueChange={onShowPerformanceChange}
          trackColor={{ false: "#D1D5DB", true: "#A1DD70" }}
          thumbColor={showPerformance ? "#4CD964" : "#F3F4F6"}
        />
      </View>
    </SettingsSection>
  );
};

/**
 * FormField component for reuse in Trading Profile section
 */
export const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  secureTextEntry = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  secureTextEntry?: boolean;
}) => {
  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-600 mb-1">{label}</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
      />
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
};

/**
 * Trading Profile section component (partial implementation for brevity)
 */
export const TradingProfileSection = ({
  expanded,
  onToggle,
  formData,
  onInputChange,
  errors,
  onShowDatePicker,
  onSubmit,
  isLoading,
}: {
  expanded: boolean;
  onToggle: () => void;
  formData: any;
  onInputChange: (field: any, value: any) => void;
  errors: Record<string, string>;
  onShowDatePicker: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}) => {
  return (
    <SettingsSection title="Trading Profile" expanded={expanded} onToggle={onToggle}>
      <Text className="text-sm text-gray-600 mb-4">
        Complete your trading profile to create an Alpaca brokerage account and enable real-time trading.
      </Text>

      {/* Personal Information */}
      <Text className="text-base text-primary-oceanBlue700 font-semibold mb-2">Personal Information</Text>

      <FormField
        label="First Name"
        value={formData.givenName}
        onChangeText={(text) => onInputChange("givenName", text)}
        placeholder="Enter your first name"
        autoCapitalize="words"
        error={errors.givenName}
      />

      <FormField
        label="Last Name"
        value={formData.familyName}
        onChangeText={(text) => onInputChange("familyName", text)}
        placeholder="Enter your last name"
        autoCapitalize="words"
        error={errors.familyName}
      />

      <FormField
        label="Email Address"
        value={formData.emailAddress}
        onChangeText={(text) => onInputChange("emailAddress", text)}
        placeholder="Enter your email address"
        keyboardType="email-address"
        error={errors.emailAddress}
      />

      <FormField
        label="Phone Number"
        value={formData.phoneNumber}
        onChangeText={(text) => onInputChange("phoneNumber", text)}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        error={errors.phoneNumber}
      />

      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-1">Date of Birth</Text>
        <TouchableOpacity className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800" onPress={onShowDatePicker}>
          <Text className={formData.dateOfBirth ? "text-gray-800" : "text-gray-500"}>{formData.dateOfBirth || "Select your date of birth"}</Text>
        </TouchableOpacity>
        {errors.dateOfBirth && <Text className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</Text>}
      </View>

      {/* Submit Button - Shows at the end of the full form */}
      <TouchableOpacity
        className={`mt-6 py-3 rounded-lg flex-row justify-center items-center ${isLoading ? "bg-gray-400" : "bg-primary-oceanBlue700"}`}
        onPress={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <Text className="text-white font-semibold">Creating Account...</Text>
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white font-semibold">Create Trading Account</Text>
          </>
        )}
      </TouchableOpacity>
    </SettingsSection>
  );
};

/**
 * General Settings section component
 */
export const GeneralSettingsSection = ({
  expanded,
  onToggle,
  darkMode,
  onDarkModeChange,
  onUpgradeToPro,
  isModalTransitioning,
}: {
  expanded: boolean;
  onToggle: () => void;
  darkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
  onUpgradeToPro: () => void;
  isModalTransitioning: boolean;
}) => {
  return (
    <SettingsSection title="General Settings" expanded={expanded} onToggle={onToggle}>
      <TouchableOpacity className="flex-row items-center my-2" onPress={onUpgradeToPro} activeOpacity={0.7} disabled={isModalTransitioning}>
        <View className="w-10 h-10 rounded-full bg-primary-oceanBlue50 justify-center items-center mr-3">
          <Ionicons name="arrow-up-circle-outline" size={wp(6)} color="#4DA6FF" />
        </View>
        <View className="flex-1">
          <Text className="text-base text-gray-800 font-semibold">Upgrade to Pro</Text>
        </View>
      </TouchableOpacity>

      <View className="flex-row justify-between items-center my-2 px-1">
        <Text className="text-base text-gray-800">Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={onDarkModeChange}
          trackColor={{ false: "#D1D5DB", true: "#A1DD70" }}
          thumbColor={darkMode ? "#4CD964" : "#F3F4F6"}
        />
      </View>

      <View className="flex-row items-center my-2">
        <View className="w-10 h-10 rounded-full bg-primary-oceanBlue50 justify-center items-center mr-3">
          <Ionicons name="language-outline" size={wp(6)} color="#4DA6FF" />
        </View>
        <View className="flex-1">
          <Text className="text-base text-gray-800 font-semibold">Language</Text>
        </View>
      </View>

      <View className="flex-row items-center my-2">
        <View className="w-10 h-10 rounded-full bg-primary-oceanBlue50 justify-center items-center mr-3">
          <Ionicons name="cash-outline" size={wp(6)} color="#4DA6FF" />
        </View>
        <View className="flex-1">
          <Text className="text-base text-gray-800 font-semibold">Currency</Text>
        </View>
      </View>
    </SettingsSection>
  );
};

/**
 * Data Backup section component
 */
export const DataBackupSection = ({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) => {
  return (
    <SettingsSection title="Data Backup" expanded={expanded} onToggle={onToggle}>
      <View className="flex-row items-center my-2">
        <View className="w-10 h-10 rounded-full bg-primary-oceanBlue50 justify-center items-center mr-3">
          <Ionicons name="logo-google" size={wp(6)} color="#4DA6FF" />
        </View>
        <View className="flex-1">
          <Text className="text-base text-gray-800 font-semibold">Google Drive</Text>
        </View>
      </View>

      <View className="flex-row items-center my-2">
        <View className="w-10 h-10 rounded-full bg-primary-oceanBlue50 justify-center items-center mr-3">
          <Ionicons name="cloud-upload-outline" size={wp(6)} color="#4DA6FF" />
        </View>
        <View className="flex-1">
          <Text className="text-base text-gray-800 font-semibold">Create backup</Text>
        </View>
      </View>

      <View className="flex-row items-center my-2">
        <View className="w-10 h-10 rounded-full bg-primary-oceanBlue50 justify-center items-center mr-3">
          <Ionicons name="cloud-download-outline" size={wp(6)} color="#4DA6FF" />
        </View>
        <View className="flex-1">
          <Text className="text-base text-gray-800 font-semibold">Restore data</Text>
        </View>
      </View>
    </SettingsSection>
  );
};
