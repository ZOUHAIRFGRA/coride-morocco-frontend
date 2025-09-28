import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { alpacaWebSocketManager } from "@utils/alpacaWebSocketManager";
import { COLORS } from "@constants/theme";

interface WebSocketStatusProps {
  connectionState: "connecting" | "connected" | "authenticated" | "disconnected" | "error";
  error?: string | null;
  showDetails?: boolean;
}

/**
 * Component to display WebSocket connection status
 */
const WebSocketStatus: React.FC<WebSocketStatusProps> = ({ connectionState, error, showDetails = false }) => {
  const getStatusColor = (state: typeof connectionState) => {
    switch (state) {
      case "authenticated":
        return COLORS.success.light;
      case "connected":
        return COLORS.primary.light;
      case "connecting":
        return COLORS.primary.text;
      case "error":
        return COLORS.error.light;
      case "disconnected":
      default:
        return COLORS.text.gray;
    }
  };

  const getStatusText = (state: typeof connectionState) => {
    switch (state) {
      case "authenticated":
        return "Live Data";
      case "connected":
        return "Authenticating";
      case "connecting":
        return "Connecting";
      case "error":
        return "Error";
      case "disconnected":
      default:
        return "Disconnected";
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor(connectionState) }]} />
      <Text style={[styles.text, { color: getStatusColor(connectionState) }]}>{getStatusText(connectionState)}</Text>

      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.detailText}>Subscriptions: {alpacaWebSocketManager.getSubscriptionCount()}</Text>
          {alpacaWebSocketManager.getActiveSymbols().length > 0 && (
            <Text style={styles.detailText}>Symbols: {alpacaWebSocketManager.getActiveSymbols().join(", ")}</Text>
          )}
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
  details: {
    marginLeft: 12,
  },
  detailText: {
    fontSize: 10,
    color: COLORS.text.gray,
    marginTop: 2,
  },
  errorText: {
    fontSize: 10,
    color: COLORS.error.light,
    marginLeft: 8,
    flex: 1,
  },
});

export default WebSocketStatus;
