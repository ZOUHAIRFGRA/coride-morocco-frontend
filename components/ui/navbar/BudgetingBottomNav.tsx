import React from "react";
import { Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { COLORS, FONTS } from "@constants/theme";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { horizontalScale, verticalScale, moderateScale } from "@utils/responsive";
import { Monicon } from "@monicon/native";
import { useUI } from "@/contexts/UIContext";

type BottomNavProps = {
  // Optional props can be added here if needed
};

const BudgetingBottomNav: React.FC<BottomNavProps> = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { bottomNavAnimation } = useUI();

  // Determine which tab is active based on the current path
  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  return (
    <Animated.View style={[styles.bottomNav, { transform: [{ translateY: bottomNavAnimation }] }]}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/budgeting/budget")}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
      >
        <Monicon name="iconamoon-home" size={24} color={isActive("budgeting/budget") ? COLORS.primary.light : COLORS.border.gray} />
        <Text style={[styles.navText, isActive("budgeting/budget") ? styles.activeNavText : null]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/budgeting/expense")}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
      >
        <Monicon name="game-icons:expense" size={24} color={isActive("expense") ? COLORS.primary.light : COLORS.border.gray} />
        <Text style={[styles.navText, isActive("expense") ? styles.activeNavText : null]}>Expense</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/budgeting/income")}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
      >
        <Monicon name="arcticons:atrad-stock-trading" size={24} color={isActive("income") ? COLORS.primary.light : COLORS.border.gray} />
        <Text style={[styles.navText, isActive("income") ? styles.activeNavText : null]}>Income</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(20),
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  navIcon: {
    width: wp(6),
    height: wp(6),
    resizeMode: "contain",
    marginBottom: hp(0.5),
  },
  activeNavIcon: {
    tintColor: COLORS.primary.light,
  },
  navText: {
    fontSize: hp(1.4),
    fontFamily: FONTS.regular,
    color: "#666",
  },
  activeNavText: {
    color: COLORS.primary.light,
  },
});

export default BudgetingBottomNav;
