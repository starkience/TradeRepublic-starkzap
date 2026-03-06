import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  uri: string;
  name: string;
  size?: number;
}

export const AssetLogo: React.FC<Props> = ({ uri, name, size = 40 }) => {
  const [failed, setFailed] = useState(false);

  if (failed || !uri) {
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.fallbackText, { fontSize: size * 0.4 }]}>
          {name?.charAt(0)?.toUpperCase() || '?'}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      onError={() => setFailed(true)}
    />
  );
};

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
