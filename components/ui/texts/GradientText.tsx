import React from "react";
import { Text, StyleSheet } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { responsiveFontSize } from "@utils/responsive";

interface GradientTextProps {
  text: string;
  colors?: string[];
  style?: any;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export const GradientText = ({ text, colors = ["#33B7E9", "#006389"], style, start = { x: 0, y: 0 }, end = { x: 1, y: 0 } }: GradientTextProps) => {
  return (
    <MaskedView maskElement={<Text style={[styles.text, style, { opacity: 1 }]}>{text}</Text>}>
      <LinearGradient colors={colors as [string, string]} start={start} end={end} style={{ flexGrow: 1 }}>
        <Text style={[styles.text, style, { opacity: 0 }]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: responsiveFontSize(16),
    fontFamily: "Montserrat_600SemiBold",
  },
});
