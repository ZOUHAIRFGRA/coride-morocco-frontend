import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

interface LocationSelectorRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  value?: { display_name?: string; address?: string } | null;
  placeholder: string;
  onPress: () => void;
}

/**
 * Shared "tap to select a location" trigger row, used by the Home and
 * Request Ride screens ahead of their respective location search modals.
 */
export const LocationSelectorRow: React.FC<LocationSelectorRowProps> = ({
  icon,
  value,
  placeholder,
  onPress,
}) => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.row, {
        backgroundColor: colors.background.tertiary,
        borderColor: colors.border.primary,
      }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={colors.primary.dark} />
      <View style={styles.content}>
        {value ? (
          <>
            <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>
              {value.display_name}
            </Text>
            <Text style={[styles.address, { color: colors.text.secondary }]} numberOfLines={1}>
              {value.address}
            </Text>
          </>
        ) : (
          <Text style={[styles.placeholder, { color: colors.text.tertiary }]}>
            {placeholder}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  address: {
    fontSize: 13,
  },
  placeholder: {
    fontSize: 15,
  },
});

export default LocationSelectorRow;
