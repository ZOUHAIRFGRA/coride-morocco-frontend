import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { COLORS } from "@constants/theme";
import { Monicon } from "@monicon/native";
import { useUI } from "@/contexts/UIContext";
import BitcoinSvg from "@/assets/images/icons/BitcoinSvg";
import StocksSvg from "@/assets/images/icons/StocksSvg";

type BottomNavProps = {
  // Optional props can be added here if needed
};

const BottomNav: React.FC<BottomNavProps> = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { bottomNavAnimation } = useUI();

  // Determine which tab is active based on the current path
  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  return (
    <View
      className="flex-row justify-between bg-white py-2.5 px-5 rounded-t-3xl"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
      }}
    >
      <TouchableOpacity className="items-center justify-center" onPress={() => router.push("/investment/investment")}>
        <Monicon name="iconamoon-home" size={24} color={isActive("/investment/investment") ? COLORS.primary.light : COLORS.border.gray} />
        <Text className={`text-sm mt-0.5 ${isActive("/investment/investment") ? "text-primary-light" : "text-gray-600"}`}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity className="items-center justify-center" onPress={() => router.push("/investment/crypto")}>
        <BitcoinSvg width={24} height={24} fill={isActive("crypto") ? COLORS.primary.light : COLORS.border.gray} />
        <Text className={`text-sm mt-0.5 ${isActive("crypto") ? "text-primary-light" : "text-gray-600"}`}>Crypto</Text>
      </TouchableOpacity>

      <TouchableOpacity className="items-center justify-center" onPress={() => router.push("/investment/(tabs)/portfolio")}>
        <Monicon name="material-symbols:auto-graph" size={24} color={isActive("portfolio") ? COLORS.primary.light : COLORS.border.gray} />
        <Text className={`text-sm mt-0.5 ${isActive("portfolio") ? "text-primary-light" : "text-gray-600"}`}>Portfolio</Text>
      </TouchableOpacity>

      <TouchableOpacity className="items-center justify-center" onPress={() => router.push("/investment/stocks")}>
        <StocksSvg width={24} height={24} fill={isActive("stocks") ? COLORS.primary.light : COLORS.border.gray} />
        <Text className={`text-sm mt-0.5 ${isActive("stocks") ? "text-primary-light" : "text-gray-600"}`}>Stocks</Text>
      </TouchableOpacity>

      <TouchableOpacity className="items-center justify-center" onPress={() => router.push("/investment/trader")}>
        <Monicon name="ph:users-three" size={24} color={isActive("trader") ? COLORS.primary.light : COLORS.border.gray} />
        <Text className={`text-sm mt-0.5 ${isActive("trader") ? "text-primary-light" : "text-gray-600"}`}>Traders</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNav;
