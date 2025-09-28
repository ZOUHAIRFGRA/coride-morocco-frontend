import React, { ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

/**
 * Props for the SettingsSection component
 */
export type SettingsSectionProps = {
  /**
   * Title of the section
   */
  title: string;
  /**
   * Whether the section is expanded
   */
  expanded: boolean;
  /**
   * Function to toggle section expansion
   */
  onToggle: () => void;
  /**
   * Content to render inside the section
   */
  children?: ReactNode;
  /**
   * Whether to show bottom divider
   */
  showDivider?: boolean;
  /**
   * Icon color for the chevron
   */
  iconColor?: string;
  /**
   * Optional element to render on the right side of the header
   */
  rightElement?: ReactNode;
};

/**
 * A reusable settings section component with expandable/collapsible functionality
 */
const SettingsSection = ({ title, expanded, onToggle, children, showDivider = true, iconColor = "#4DA6FF", rightElement }: SettingsSectionProps) => {
  return (
    <View className="mx-[4vw] my-[0.5vh]">
      <View className="flex-row justify-between items-center py-[0.3vh]">
        <TouchableOpacity className="flex-row justify-between items-center flex-1" onPress={onToggle}>
          <Text className="text-[2vh] text-primary-oceanBlue700 font-semiBold">{title}</Text>
        </TouchableOpacity>

        <View className="flex-row items-center">
          {rightElement}
          <TouchableOpacity onPress={onToggle}>
            <Ionicons name={expanded ? "chevron-down" : "chevron-forward"} size={wp(6)} color={iconColor} />
          </TouchableOpacity>
        </View>
      </View>

      {expanded && children && <View className="py-[0.5vh]">{children}</View>}

      {showDivider && <View className="h-px bg-gray-200 my-[1vh]" />}
    </View>
  );
};

export default SettingsSection;
