import { View, Text, StyleSheet, TouchableOpacity} from "react-native";
import { useRouter} from "expo-router";
import { COLORS, FONTS } from "@constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";


type StickyHeaderProps = {
    title: string;
    subtitle?: string;
    showBackIcon?: boolean;
  };
  
  /**
   * StickyHeader displays a centered title, optional subtitle, and an optional back icon.
   */
  export default function StickyHeader({ title, subtitle, showBackIcon = false }: StickyHeaderProps) {
    const router = useRouter();
  
    return (
      <View style={styles.stickyHeader}>
        {/* Back icon or placeholder for centering */}
        {showBackIcon ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={wp(8)} color="#000" />
          </TouchableOpacity>
        ) : (
          // Invisible placeholder to keep title centered
          <View style={styles.backButton} />
        )}
  
        <View style={styles.titleContainer}>
          <Text style={styles.screenTitle}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : null}
        </View>
  
        {/* Right side placeholder to balance the back button */}
        <View style={styles.backButton} />
      </View>
    );
  }
  
const styles = StyleSheet.create({
  stickyHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: hp(1.5),
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    width: wp(10),
    height: wp(10),
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "flex-start",

  },
  screenTitle: {
    fontSize: hp(2.4),
    fontFamily: FONTS.bold,
    color: COLORS.primary.dark,
  },
  subtitle: {
    fontSize: hp(1.7),
    color: COLORS.text.primary,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
});
