import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { moderateScale, verticalScale, responsiveFontSize } from '../../utils/responsive';

/**
 * Formats a number to a compact YouTube-like string (e.g., 1.1K, 1.5M, 1.9B).
 * Keeps one decimal when the leading number is < 10; otherwise no decimals.
 */
const formatCompactNumber = (n: number): string => {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  const units = [
    { value: 1e9, symbol: 'B' },
    { value: 1e6, symbol: 'M' },
    { value: 1e3, symbol: 'K' },
  ];

  if (abs < 1000) return `${n}`;

  for (const u of units) {
    if (abs >= u.value) {
      const num = abs / u.value;
      const rounded = num >= 10 ? Math.round(num) : Math.round(num * 10) / 10;
      return `${sign}${rounded}${u.symbol}`;
    }
  }

  return `${n}`;
};

/**
 * Checks whether a string is purely numeric (digits with optional single decimal point).
 */
const isPureNumericString = (str: string): boolean => /^[0-9]+(\.[0-9]+)?$/.test(str);

/**
 * Smartly formats a stat value:
 * - Numbers and pure numeric strings get compact formatting
 * - Everything else is returned unchanged (e.g., "95%", "24/7", "1M+")
 */
export const formatStatValue = (value: string | number): string => {
  if (typeof value === 'number') return formatCompactNumber(value);
  if (typeof value === 'string' && isPureNumericString(value)) {
    return formatCompactNumber(parseFloat(value));
  }
  return value as string;
};

type Stat = { value: string | number; label: string; color?: string };

type Props = {
  stats: Stat[];
  dividerColor?: string;
};

export const StatsRow: React.FC<Props> = ({ stats, dividerColor = '#E0E0E0' }) => {
  return (
    <View style={styles.container}>
      {stats.map((s, idx) => (
        <React.Fragment key={idx}>
          <View style={styles.item}>
            <Text style={[styles.number, { color: s.color ?? COLORS.primary.dark }]}>{formatStatValue(s.value)}</Text>
            <Text style={styles.label}>{s.label}</Text>
          </View>
          {idx < stats.length - 1 && (
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#F5F9FC',
    borderRadius: moderateScale(16),
    padding: moderateScale(10),
    marginBottom: verticalScale(22),
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: moderateScale(16),
    backgroundColor: '#E0E0E0',
  },
  number: {
    fontSize: responsiveFontSize(24),
    fontFamily: FONTS.bold,
    color: COLORS.primary.dark,
    marginBottom: verticalScale(4),
  },
  label: {
    fontSize: responsiveFontSize(12),
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default StatsRow;