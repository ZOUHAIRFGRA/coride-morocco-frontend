import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "@constants/theme";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

type TabRoute =
  | "/investment/(tabs)"
  | "/investment/(tabs)/crypto"
  | "/investment/(tabs)/voice"
  | "/investment/(tabs)/stocks"
  | "/investment/(tabs)/portfolio"
  | "/investment/(tabs)/budgeting";
type IconName =
  | "home-outline"
  | "home"
  | "trending-up-outline"
  | "trending-up"
  | "mic-outline"
  | "mic"
  | "location-outline"
  | "location"
  | "wallet-outline"
  | "wallet"
  | "folder-outline"
  | "folder";

interface TabItem {
  name: string;
  icon: IconName;
  activeIcon: IconName;
  route: TabRoute;
}

const TabBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs: TabItem[] = [
    {
      name: "Home",
      icon: "home-outline",
      activeIcon: "home",
      route: "/investment/(tabs)",
    },
    {
      name: "Crypto",
      icon: "trending-up-outline",
      activeIcon: "trending-up",
      route: "/investment/(tabs)/crypto",
    },
    {
      name: "Portfolio",
      icon: "folder-outline",
      activeIcon: "folder",
      route: "/investment/(tabs)/portfolio",
    },
    {
      name: "Voice",
      icon: "mic-outline",
      activeIcon: "mic",
      route: "/investment/(tabs)/voice",
    },
    {
      name: "Stocks",
      icon: "location-outline",
      activeIcon: "location",
      route: "/investment/(tabs)/stocks",
    },
    {
      name: "Budget",
      icon: "wallet-outline",
      activeIcon: "wallet",
      route: "/investment/(tabs)/budgeting",
    },
  ];

  const isActive = (route: TabRoute) => {
    if (route === "/investment/(tabs)" && pathname === "/") return true;
    return pathname.includes(route);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const active = isActive(tab.route);
        return (
          <TouchableOpacity key={index} style={styles.tab} onPress={() => router.push(tab.route as any)}>
            <Ionicons name={active ? tab.activeIcon : tab.icon} size={wp(6)} color={active ? COLORS.primary.oceanBlue700 : "#666"} />
            <Text style={[styles.tabText, { color: active ? COLORS.primary.oceanBlue700 : "#666" }]}>{tab.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(0.5),
  },
  tabText: {
    fontSize: hp(1.4),
    fontFamily: FONTS.regular,
    marginTop: hp(0.5),
  },
});

export default TabBar;
