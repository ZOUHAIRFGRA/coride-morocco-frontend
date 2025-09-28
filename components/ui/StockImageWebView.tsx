import React, { useState } from "react";
import { View, ViewStyle, Platform } from "react-native";
import { Image } from "expo-image";
import { horizontalScale } from "@utils/responsive";

interface StockImageWebViewProps {
  uri: string;
  style?: ViewStyle;
}

/**
 * StockImageWebView component that renders stock logos using expo-image with caching
 * Optimized for Android compatibility with explicit dimensions and error handling
 */
const StockImageWebView: React.FC<StockImageWebViewProps> = ({ uri, style }) => {
  const [imageError, setImageError] = useState(false);
  const fallbackImage = require("@assets/images/mix/user.jpg");

  // Ensure we have a valid URI
  const isValidUri = uri && uri.startsWith('http');

  return (
    <View style={style}>
      <Image
        source={imageError || !isValidUri ? fallbackImage : { uri }}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: horizontalScale(10),
          backgroundColor: 'transparent'
        }}
        contentFit="contain"
        transition={Platform.OS === 'android' ? 0 : 200}
        cachePolicy={Platform.OS === 'android' ? 'memory' : 'memory-disk'}
        recyclingKey={uri}
        placeholder={fallbackImage}
        placeholderContentFit="contain"
        onError={() => {
          console.log('Failed to load stock image this img is not valid (not a valid crypto symbol):', uri);
          setImageError(true);
        }}
       
       
      />
    </View>
  );
};

export default StockImageWebView;
