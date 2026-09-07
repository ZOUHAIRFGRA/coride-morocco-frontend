// Shared ride status presentation helpers, used by the rides list and ride detail screens
import { Ionicons } from '@expo/vector-icons';
import type { getColors } from '@/constants/theme';
import type { RideStatus } from '@/types/ride';

type ThemeColors = ReturnType<typeof getColors>;

export const getStatusColor = (status: RideStatus, colors: ThemeColors): string => {
  const statusColors: Record<RideStatus, string> = {
    offered: colors.success.light,
    requested: colors.primary.light,
    matched: colors.warning.light,
    in_progress: colors.primary.dark,
    completed: colors.success.dark,
    cancelled: colors.error.light,
  };
  return statusColors[status] || colors.text.secondary;
};

export const getStatusIcon = (status: RideStatus): keyof typeof Ionicons.glyphMap => {
  const statusIcons: Record<RideStatus, keyof typeof Ionicons.glyphMap> = {
    offered: 'checkmark-circle',
    requested: 'time',
    matched: 'people',
    in_progress: 'car',
    completed: 'checkmark-done',
    cancelled: 'close-circle',
  };
  return statusIcons[status] || 'help-circle';
};

export const getStatusLabel = (status: RideStatus): string => status.replace('_', ' ').toUpperCase();
