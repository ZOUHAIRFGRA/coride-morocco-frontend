import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

interface PassengerStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

/**
 * Shared passenger count stepper used by the Home and Request Ride screens.
 * Fixed 44x44 touch targets to meet the accessible minimum tap size.
 */
export const PassengerStepper: React.FC<PassengerStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 4,
  label,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text.secondary }]}>{label}</Text>
      )}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, {
            backgroundColor: colors.background.primary,
            borderColor: colors.border.primary,
            opacity: value <= min ? 0.5 : 1,
          }]}
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          <Ionicons name="remove" size={20} color={colors.text.primary} />
        </TouchableOpacity>

        <Text style={[styles.count, { color: colors.text.primary }]}>{value}</Text>

        <TouchableOpacity
          style={[styles.button, {
            backgroundColor: colors.background.primary,
            borderColor: colors.border.primary,
            opacity: value >= max ? 0.5 : 1,
          }]}
          onPress={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          <Ionicons name="add" size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    minWidth: 24,
    textAlign: 'center',
  },
});

export default PassengerStepper;
