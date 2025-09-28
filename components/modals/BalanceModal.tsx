import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, Dimensions, Platform } from "react-native";
import { COLORS, FONTS } from "@/constants/theme";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Transaction = {
  id: string;
  name: string;
  date: string;
  amount: number;
};

type Category = {
  id: string;
  name: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  count: number;
  amount: number;
  color: string;
  transactions?: Transaction[];
};

type BalanceModalProps = {
  isVisible: boolean;
  onClose: () => void;
  balance: number;
  accountData: Category[];
};

const BalanceModal: React.FC<BalanceModalProps> = ({ isVisible, onClose, balance, accountData }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const translateY = new Animated.Value(SCREEN_HEIGHT);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (isVisible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: Platform.OS === "ios" ? 8 : 0,
        speed: Platform.OS === "ios" ? 14 : 12,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleCategoryPress = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} transparent animationType="none">
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.closeOverlay} onPress={onClose} activeOpacity={1}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY }],
                paddingBottom: Platform.OS === "ios" ? insets.bottom : 0,
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
              {/* Handle indicator for iOS */}
              {Platform.OS === "ios" && (
                <View style={styles.handleIndicator}>
                  <View style={styles.handle} />
                </View>
              )}

              {/* Close button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>

              {/* Balance Header */}
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceTitle}>Balance</Text>
                <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
              </View>

              <View style={styles.divider} />

              {/* Categories List */}
              <ScrollView
                style={styles.categoriesList}
                contentContainerStyle={{
                  paddingBottom: Platform.OS === "ios" ? 20 : 0,
                }}
                showsVerticalScrollIndicator={false}
                bounces={Platform.OS === "ios"}
                overScrollMode={Platform.OS === "android" ? "never" : undefined}
              >
                {accountData.map((category) => (
                  <View key={category.id}>
                    {/* Category Item */}
                    <TouchableOpacity style={styles.categoryItem} onPress={() => handleCategoryPress(category.id)} activeOpacity={0.7}>
                      <View style={styles.categoryLeftSection}>
                        <Ionicons name={category.icon} size={24} color={category.color} />
                        <Text style={[styles.categoryName, { color: category.color }]}>{category.name}</Text>
                        <View style={[styles.countBadge, { backgroundColor: category.color + "20" }]}>
                          <Text style={styles.countText}>{category.count.toString().padStart(2, "0")}</Text>
                        </View>
                      </View>

                      <View style={styles.categoryRightSection}>
                        <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
                        <Ionicons
                          name={expandedCategory === category.id ? "chevron-up" : "chevron-down"}
                          size={20}
                          color="#999"
                          style={styles.expandIcon}
                        />
                      </View>
                    </TouchableOpacity>

                    {/* Expanded Transactions */}
                    {expandedCategory === category.id && category.transactions && (
                      <View style={styles.transactionsContainer}>
                        {category.transactions.map((transaction) => (
                          <View key={transaction.id} style={styles.transactionItem}>
                            <View style={styles.transactionLeftSection}>
                              <View style={[styles.transactionDot, { backgroundColor: category.color }]} />
                              <Text style={styles.transactionName}>{transaction.name}</Text>
                              <Text style={styles.transactionDate}>{transaction.date}</Text>
                            </View>
                            <Text style={styles.transactionAmount}>{formatCurrency(transaction.amount)}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  closeOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: SCREEN_HEIGHT * 0.9,
    minHeight: SCREEN_HEIGHT * 0.4,
  },
  modalContent: {
    paddingTop: Platform.OS === "ios" ? 8 : 20,
    paddingHorizontal: 20,
    position: "relative",
  },
  handleIndicator: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 12,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 20,
    right: 20,
    zIndex: 10,
  },
  balanceHeader: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  balanceTitle: {
    fontSize: Platform.OS === "ios" ? hp(2.2) : hp(2),
    fontFamily: FONTS.regular,
    color: "#555",
  },
  balanceAmount: {
    fontSize: Platform.OS === "ios" ? hp(4.2) : hp(4),
    fontFamily: FONTS.bold,
    color: COLORS.primary.oceanBlue700,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 10,
  },
  categoriesList: {
    maxHeight: SCREEN_HEIGHT * 0.65,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryLeftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryName: {
    fontSize: Platform.OS === "ios" ? hp(1.9) : hp(1.8),
    fontFamily: FONTS.semiBold,
    marginLeft: 12,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  countText: {
    fontSize: hp(1.5),
    fontFamily: FONTS.semiBold,
    color: "#555",
  },
  categoryRightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryAmount: {
    fontSize: Platform.OS === "ios" ? hp(2.1) : hp(2),
    fontFamily: FONTS.bold,
    color: "#555",
  },
  expandIcon: {
    marginLeft: 8,
  },
  transactionsContainer: {
    paddingLeft: 36,
    backgroundColor: "#F9F9F9",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  transactionLeftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  transactionName: {
    fontSize: hp(1.7),
    fontFamily: FONTS.regular,
    color: "#333",
    marginRight: 8,
  },
  transactionDate: {
    fontSize: hp(1.5),
    fontFamily: FONTS.regular,
    color: "#999",
  },
  transactionAmount: {
    fontSize: hp(1.7),
    fontFamily: FONTS.semiBold,
    color: "#333",
  },
});

export default BalanceModal;
