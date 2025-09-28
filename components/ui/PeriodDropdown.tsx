import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/theme';
import { TimeRange } from '@/types/dashboard';
import { safeMax, responsiveWidth } from '@/utils/precision';

const { width: screenWidth } = Dimensions.get('window');

interface PeriodDropdownProps {
  selectedPeriod: TimeRange;
  onPeriodChange: (period: TimeRange) => void;
  style?: any;
}

const periodLabels: Record<TimeRange, string> = {
  '1D': '1D',
  '1W': '1W',
  '1M': '1M',
  '3M': '3M',
  '6M': '6M',
  '1Y': '1Y',
  'ALL': 'ALL',
};

const periodDescriptions: Record<TimeRange, string> = {
  '1D': '1 Day',
  '1W': '1 Week',
  '1M': '1 Month',
  '3M': '3 Months',
  '6M': '6 Months',
  '1Y': '1 Year',
  'ALL': 'All Time',
};

const periods: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

export default function PeriodDropdown({ selectedPeriod, onPeriodChange, style }: PeriodDropdownProps) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = useRef<View>(null);

  const handlePeriodSelect = useCallback((period: TimeRange) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPeriodChange(period);
    setDropdownVisible(false);
  }, [onPeriodChange]);

  const handleDropdownToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!dropdownVisible && buttonRef.current) {
      buttonRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setButtonLayout({ x: pageX, y: pageY, width, height });
        setDropdownVisible(true);
      });
    } else {
      setDropdownVisible(!dropdownVisible);
    }
  }, [dropdownVisible]);

  return (
    <View className="relative" style={style}>
      <TouchableOpacity
        ref={buttonRef}
        onPress={handleDropdownToggle}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.primary.light + '15',
          paddingHorizontal: 16,
          paddingVertical: 4,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: COLORS.primary.light + '30',
          shadowColor: COLORS.primary.light,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Current period: ${periodDescriptions[selectedPeriod]}. Tap to change period`}
        accessibilityHint="Opens period selection menu"
      >
        <Text
          style={{
            color: COLORS.primary.dark,
            fontSize: safeMax(13, responsiveWidth(screenWidth, 0.032)),
            fontFamily: 'Montserrat_600SemiBold',
            marginRight: 4,
          }}
        >
          {periodLabels[selectedPeriod]}
        </Text>
        <Ionicons 
          name={dropdownVisible ? "chevron-up" : "chevron-down"} 
          size={safeMax(14, responsiveWidth(screenWidth, 0.035))} 
          color={COLORS.primary.dark} 
        />
      </TouchableOpacity>
      
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'transparent',
          }}
          onPress={() => setDropdownVisible(false)}
          activeOpacity={1}
        >
          <View
            style={{
              position: 'absolute',
              top: buttonLayout.y + buttonLayout.height + 8,
              left: Math.max(8, Math.min(buttonLayout.x, screenWidth - 80)),
              backgroundColor: '#f3f4f6',
              borderRadius: 8,
              padding: 4,
              width: 70,
              maxHeight: 300,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {periods.map((period, index) => (
              <TouchableOpacity
                key={period}
                onPress={() => handlePeriodSelect(period)}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 4,
                  marginBottom: index === periods.length - 1 ? 0 : 2,
                  backgroundColor: selectedPeriod === period 
                    ? COLORS.primary.light + '20' 
                    : 'transparent',
                  borderWidth: selectedPeriod === period ? 1 : 0,
                  borderColor: COLORS.primary.light,
                  borderRadius: 4,
                  minHeight: 32,
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Select ${periodDescriptions[period]} period`}
                accessibilityState={{ selected: selectedPeriod === period }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: selectedPeriod === period 
                      ? 'Montserrat_700Bold' 
                      : 'Montserrat_600SemiBold',
                    color: selectedPeriod === period 
                      ? COLORS.primary.dark 
                      : COLORS.text.primary,
                    textAlign: 'center',
                    lineHeight: 12,
                  }}
                >
                  {periodLabels[period]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
