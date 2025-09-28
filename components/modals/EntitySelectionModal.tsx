/**
 * Entity Selection Modal Component
 * 
 * Modal that allows users to choose which business entity to manage.
 * Shows when multiple entities exist and user hasn't selected one yet.
 * 
 * @author VoxProfit Development Team
 * @version 1.0.0
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  PanResponder,
  Animated,
  Image,
} from "react-native";
import { COLORS, FONTS } from "@/constants/theme";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";

interface Entity {
  uuid: string;
  name: string;
  picture?: string;
  created: string;
}

interface EntitySelectionModalProps {
  visible: boolean;
  entities: Entity[];
  onSelectEntity: (entity: Entity) => void;
  onClose: () => void;
}

export function EntitySelectionModal({
  visible,
  entities,
  onSelectEntity,
  onClose,
}: EntitySelectionModalProps) {
  const panY = useRef(new Animated.Value(0)).current;
  
  // Reset animation value when modal becomes visible
  useEffect(() => {
    if (visible) {
      panY.setValue(0);
    }
  }, [visible, panY]);
  
  const translateY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });

  // Configure the pan responder for swipe gestures (only on drag indicator)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // Don't intercept initial touches
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to significant downward swipes (not small scroll movements)
        // Require a minimum threshold and clear downward direction
        return gestureState.dy > 20 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx * 2);
      },
      onPanResponderGrant: () => {
        panY.setOffset(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward swipes and only after significant movement
        if (gestureState.dy > 20) {
          panY.setValue(gestureState.dy - 20); // Subtract threshold to make it feel natural
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If the user swiped down more than 120 units, close the modal
        if (gestureState.dy > 120) {
          closeModal();
        } else {
          // Otherwise, reset the position
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Function to close the modal with animation
  const closeModal = () => {
    Animated.timing(panY, {
      toValue: 500,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Small delay to ensure animation completes before callback
      setTimeout(() => {
        onClose();
      }, 50);
    });
  };

  /**
   * Handle entity selection
   */
  const handleSelectEntity = (entity: Entity) => {
    // Close modal with animation first
    Animated.timing(panY, {
      toValue: 500,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // After animation completes, call the selection handler
      setTimeout(() => {
        onSelectEntity(entity);
      }, 50);
    });
  };

  /**
   * Render entity item
   */
  const renderEntityItem = (entity: Entity) => (
    <TouchableOpacity
      key={entity.uuid}
      style={styles.entityItem}
      onPress={() => handleSelectEntity(entity)}
      activeOpacity={0.7}
    >
      <View style={styles.entityContent}>
        {/* Entity Logo */}
        <View style={styles.entityLogoContainer}>
          {entity.picture ? (
            <Image source={{ uri: entity.picture }} style={styles.entityLogo} />
          ) : (
            <View style={styles.entityLogoPlaceholder}>
              <Ionicons name="business-outline" size={wp(6)} color={COLORS.primary.oceanBlue200} />
            </View>
          )}
        </View>

        {/* Entity Info */}
        <View style={styles.entityInfo}>
          <Text style={styles.entityName}>{entity.name}</Text>
          <Text style={styles.entityDetails}>
            Created: {new Date(entity.created).toLocaleDateString()}
          </Text>
        </View>

        {/* Arrow Icon */}
        <Ionicons name="chevron-forward-outline" size={wp(5)} color={COLORS.primary.oceanBlue700} />
      </View>
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={closeModal} accessible={false}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.modalContent, { transform: [{ translateY }] }]}>
            {/* Drag indicator - Only this area handles pan gestures */}
            <View style={styles.dragIndicatorContainer} {...panResponder.panHandlers}>
              <View style={styles.dragIndicator} />
            </View>

            {/* Scrollable content - No pan responder interference */}
            <ScrollView 
              contentContainerStyle={styles.scrollContent} 
              showsVerticalScrollIndicator={false}
              bounces={true}
              scrollEventThrottle={16}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Choose a Business to manage</Text>
                <Text style={styles.subtitle}>Select which business you want to manage financial records for</Text>
              </View>

              {/* Entity List */}
              <View style={styles.entitiesList}>
                {entities.map(renderEntityItem)}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.background.white,
    borderTopLeftRadius: wp(8),
    borderTopRightRadius: wp(8),
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    maxHeight: hp(80),
  },
  dragIndicatorContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: hp(1.5),
    paddingBottom: hp(2), // Increased for better touch area
    minHeight: hp(4), // Minimum touch area
  },
  dragIndicator: {
    width: wp(10),
    height: hp(0.6),
    borderRadius: wp(1.5),
    backgroundColor: COLORS.primary.oceanBlue200,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
  },
  header: {
    paddingVertical: hp(2),
    alignItems: "center",
  },
  title: {
    fontSize: hp(2.5),
    fontFamily: FONTS.bold,
    color: COLORS.primary.oceanBlue700,
    textAlign: "center",
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: hp(1.8),
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
    textAlign: "center",
    paddingHorizontal: wp(4),
  },
  entitiesList: {
    marginTop: hp(2),
  },
  entityItem: {
    backgroundColor: "#fff",
    borderRadius: wp(3),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.primary.oceanBlue100,
  },
  entityContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(4),
  },
  entityLogoContainer: {
    marginRight: wp(3),
  },
  entityLogo: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: COLORS.primary.oceanBlue50,
  },
  entityLogoPlaceholder: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: COLORS.primary.oceanBlue50,
    alignItems: "center",
    justifyContent: "center",
  },
  entityInfo: {
    flex: 1,
  },
  entityName: {
    fontSize: hp(2),
    fontFamily: FONTS.bold,
    color: COLORS.text.primary,
    marginBottom: hp(0.5),
  },
  entityDetails: {
    fontSize: hp(1.6),
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
  },
});
