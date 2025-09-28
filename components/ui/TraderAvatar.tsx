import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '@/constants/theme';

interface TraderAvatarProps {
  imageUrl?: string;
  name: string;
  size: number;
  userId?: string;
}

// Generate consistent color based on user ID or name
const generateAvatarColor = (input: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];
  
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export const TraderAvatar: React.FC<TraderAvatarProps> = ({
  imageUrl,
  name,
  size,
  userId
}) => {
  const [imageError, setImageError] = useState(false);
  
  const avatarColor = generateAvatarColor(userId || name);
  const initials = getInitials(name);
  const fontSize = size * 0.4; // 40% of avatar size
  
  if (imageUrl && imageUrl.trim() !== '' && !imageError) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          }
        ]}
        onError={() => setImageError(true)}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        placeholder={require("@assets/images/mix/user.jpg")}
        placeholderContentFit="cover"
      />
    );
  }
  
  return (
    <View
      style={[
        styles.avatar,
        styles.fallbackAvatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: avatarColor,
        }
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize,
            lineHeight: fontSize * 1.2,
          }
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  fallbackAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
});
