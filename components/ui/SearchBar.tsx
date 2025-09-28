import React, { useState, useCallback, useMemo, useEffect } from "react";
import { View, TextInput, TouchableOpacity, TextInputProps, Platform, FlatList, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { COLORS } from "@/constants/theme";
import { useRouter, usePathname } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setBudgetingSearchQuery } from "@/redux/budgeting";
import { setBookkeepingSearchQuery } from "@/redux/bookkeeping";
import { setInvestmentSearchQuery } from "@/redux/investment";
import Sidebar from "./Sidebar";

type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  onPress: () => void;
};

type SearchBarProps = {
  placeholder?: string;
  onChangeText?: (text: string) => void;
  value?: string;
  onProfilePress?: () => void;
  showProfileIcon?: boolean;
  containerStyle?: string;
  inputStyle?: string;
  iconColor?: string;
  profileIconColor?: string;
  inputProps?: TextInputProps;
  searchResults?: SearchResult[];
  onSearchResultPress?: (result: SearchResult) => void;
  showSearchResults?: boolean;
  onSearchResultsToggle?: (show: boolean) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search",
  onChangeText,
  value: propValue,
  onProfilePress,
  showProfileIcon = true,
  containerStyle,
  inputStyle,
  iconColor = COLORS.primary.oceanBlue700,
  profileIconColor = COLORS.primary.oceanBlue700,
  inputProps,
  searchResults = [],
  onSearchResultPress,
  showSearchResults = false,
  onSearchResultsToggle,
}) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  // Determine current app section based on URL path
  const currentSection = useMemo(() => {
    if (pathname?.includes("/budgeting")) return "budgeting";
    if (pathname?.includes("/bookkeeping")) return "bookkeeping";
    if (pathname?.includes("/investment")) return "investment";
    return "budgeting";
  }, [pathname]);

  // Get search query from relevant Redux store slice
  const budgetingSearchQuery = useAppSelector((state) => state.budgeting.searchQuery);
  const bookkeepingSearchQuery = useAppSelector((state) => state.bookkeeping.searchQuery);
  const investmentSearchQuery = useAppSelector((state) => state.investment.searchQuery);

  // Determine which search query to use based on current section
  const reduxSearchValue = useMemo(() => {
    switch (currentSection) {
      case "budgeting":
        return budgetingSearchQuery;
      case "bookkeeping":
        return bookkeepingSearchQuery;
      case "investment":
        return investmentSearchQuery;
      default:
        return "";
    }
  }, [currentSection, budgetingSearchQuery, bookkeepingSearchQuery, investmentSearchQuery]);

  // Use either the prop value (if provided) or the Redux state value
  const value = propValue !== undefined ? propValue : reduxSearchValue;

  const handleProfilePress = () => {
    setSidebarVisible(true);
  };

  const handleCloseSidebar = () => {
    setSidebarVisible(false);
  };

  const handleChangeText = useCallback((text: string) => {
    // Update appropriate state in Redux based on current section
    switch (currentSection) {
      case "budgeting":
        dispatch(setBudgetingSearchQuery(text));
        break;
      case "bookkeeping":
        dispatch(setBookkeepingSearchQuery(text));
        break;
      case "investment":
        dispatch(setInvestmentSearchQuery(text));
        break;
    }

    // Also call the passed onChangeText prop if it exists
    if (onChangeText) {
      onChangeText(text);
    }

    // Show search results when typing
    if (onSearchResultsToggle && text.trim()) {
      onSearchResultsToggle(true);
    } else if (onSearchResultsToggle && !text.trim()) {
      onSearchResultsToggle(false);
    }
  }, [currentSection, dispatch, onChangeText, onSearchResultsToggle]);

  const handleOptionPress = (option: string) => {
    setSidebarVisible(false);

    if (option === "profile" && onProfilePress) {
      onProfilePress();
    }
  };

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (onSearchResultsToggle && value?.trim()) {
      onSearchResultsToggle(true);
    }
  }, [onSearchResultsToggle, value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Don't hide results immediately to allow for result selection
  }, []);

  // Animate search results appearance
  useEffect(() => {
    if (showSearchResults && searchResults.length > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showSearchResults, searchResults.length, fadeAnim, scaleAnim]);

  const handleSearchResultPress = useCallback((result: SearchResult) => {
    if (onSearchResultPress) {
      onSearchResultPress(result);
    }
    result.onPress();
    
    // Hide search results after selection
    if (onSearchResultsToggle) {
      onSearchResultsToggle(false);
    }
  }, [onSearchResultPress, onSearchResultsToggle]);

  const renderSearchResult = useCallback(({ item, index }: { item: SearchResult; index: number }) => (
    <TouchableOpacity
      style={{
        paddingHorizontal: wp(4),
        paddingVertical: hp(2.5),
        backgroundColor: COLORS.background.white,
        // Better visual separation between items
        marginHorizontal: wp(1),
        marginVertical: hp(0.3),
        borderRadius: wp(3),
        // Subtle border for each item
        borderWidth: 1,
        borderColor: COLORS.border.primary,
        // Enhanced shadow for depth
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
      }}
      onPress={() => handleSearchResultPress(item)}
      activeOpacity={0.7}
    >
      {/* Main title with better typography and search highlighting */}
      <Text style={{
        fontFamily: 'System',
        fontSize: hp(2.2),
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: hp(0.3),
        lineHeight: hp(2.8),
      }}>
        {item.title}
      </Text>
      
      {/* Subtitle with improved styling */}
      {item.subtitle && (
        <Text style={{
          fontFamily: 'System',
          fontSize: hp(1.7),
          color: COLORS.text.secondary,
          marginBottom: hp(1.2),
          lineHeight: hp(2.2),
        }}>
          {item.subtitle}
        </Text>
      )}
      
      {/* Type badge with enhanced design */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
      }}>
        <Text style={{
          fontFamily: 'System',
          fontSize: hp(1.3),
          fontWeight: '500',
          color: COLORS.primary.oceanBlue700,
          backgroundColor: COLORS.primary.oceanBlue50,
          paddingHorizontal: wp(2.5),
          paddingVertical: hp(0.4),
          borderRadius: wp(2),
          overflow: 'hidden',
        }}>
          {item.type}
        </Text>
      </View>
    </TouchableOpacity>
  ), [handleSearchResultPress]);

  return (
    <>
      <View className={`px-4 py-1 pb-3 ${containerStyle}`}>
        <View className="flex-row items-center bg-white rounded-full px-4 ios:py-3 android:py-2 shadow-sm shadow-black/5 border border-gray-200">
          <Ionicons name="search" size={23} color={iconColor} className="mr-2" />
          <TextInput
            className={`flex-1 text-md font-regular p-0 ios:py-1 ios:leading-5 placeholder:text-gray-500 ${inputStyle}`}
            placeholder={placeholder}
            placeholderTextColor="#999"
            value={value}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            keyboardType={Platform.OS === "ios" ? "default" : inputProps?.keyboardType}
            returnKeyType={Platform.OS === "ios" ? "search" : inputProps?.returnKeyType}
            {...inputProps}
          />
          {showProfileIcon && (
            <TouchableOpacity
              className="ml-2"
              onPress={handleProfilePress}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID="profile-button"
            >
              <Ionicons name="person-circle-outline" size={wp(7)} color={profileIconColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results Overlay */}
      {showSearchResults && searchResults.length > 0 && (
        <>
          {/* Subtle background overlay */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              zIndex: 9998,
            }}
            activeOpacity={1}
            onPress={() => onSearchResultsToggle?.(false)}
          />
          
          {/* Search results dropdown */}
          <Animated.View
            style={{
              position: "absolute",
              top: Platform.OS === "ios" ? 80 : 70, // Positioned directly below search bar
              left: wp(4),
              right: wp(4),
              backgroundColor: COLORS.background.white,
              borderRadius: wp(4), // Increased border radius for softer look
              maxHeight: hp(50),
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 8,
              },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 12,
              zIndex: 9999,
              borderWidth: 1,
              borderColor: COLORS.border.primary,
              // Add a subtle top border that connects to search bar
              borderTopWidth: 0,
              // Add a small arrow/triangle pointing up to search bar
              paddingTop: hp(1),
              // Animation properties
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            {/* Small arrow pointing up to search bar */}
            <View
              style={{
                position: 'absolute',
                top: -8,
                left: wp(8),
                width: 0,
                height: 0,
                backgroundColor: 'transparent',
                borderStyle: 'solid',
                borderLeftWidth: 8,
                borderRightWidth: 8,
                borderBottomWidth: 8,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: COLORS.background.white,
                zIndex: 10000,
              }}
            />
            
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={{
                paddingBottom: hp(1),
              }}
            />
                      </Animated.View>
          </>
        )}


      <Sidebar isVisible={sidebarVisible} onClose={handleCloseSidebar} onOptionPress={handleOptionPress} />
    </>
  );
};

export default SearchBar;
