import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  length: number;
  filled: number;
}

export const PinDots: React.FC<Props> = ({ length, filled }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i < filled && styles.dotFilled]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.surface,
  },
  dotFilled: {
    backgroundColor: Colors.textPrimary,
  },
});
