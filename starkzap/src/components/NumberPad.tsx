import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface Props {
  onPress: (key: string) => void;
  onDelete: () => void;
  light?: boolean;
}

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'del'],
];

export const NumberPad: React.FC<Props> = ({ onPress, onDelete, light = false }) => {
  const textColor = light ? '#000' : Colors.textPrimary;

  return (
    <View style={styles.container}>
      {keys.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.key}
              activeOpacity={0.5}
              onPress={() => {
                if (key === 'del') onDelete();
                else onPress(key);
              }}
            >
              {key === 'del' ? (
                <Ionicons name="backspace-outline" size={24} color={textColor} />
              ) : (
                <Text style={[styles.keyText, { color: textColor }]}>{key}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  key: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '400',
  },
});
