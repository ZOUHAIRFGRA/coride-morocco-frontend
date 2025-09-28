import React, { createContext, useContext, useState } from "react";
import { Animated } from "react-native";

interface UIContextType {
  isBottomNavVisible: boolean;
  bottomNavAnimation: Animated.Value;
  setBottomNavVisible: (visible: boolean) => void;
  bottomNavSlideOut: () => void;
  bottomNavSlideIn: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const bottomNavAnimation = new Animated.Value(0);

  const setBottomNavVisible = (visible: boolean) => {
    setIsBottomNavVisible(visible);
  };

  const bottomNavSlideOut = () => {
    Animated.timing(bottomNavAnimation, {
      toValue: 100, // Slide down by 100 units
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const bottomNavSlideIn = () => {
    Animated.timing(bottomNavAnimation, {
      toValue: 0, // Slide back to original position
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  return (
    <UIContext.Provider
      value={{
        isBottomNavVisible,
        bottomNavAnimation,
        setBottomNavVisible,
        bottomNavSlideOut,
        bottomNavSlideIn,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};
