import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { AssetLogo } from './AssetLogo';

interface Props {
  symbol: string;
  name: string;
  changePercent: number;
  logoUrl: string;
  onPress?: () => void;
}

export const TrendingChip: React.FC<Props> = ({
  symbol,
  name,
  changePercent,
  logoUrl,
  onPress,
}) => {
  const isPositive = changePercent >= 0;

  return (
    <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.7}>
      <AssetLogo uri={logoUrl} name={name} size={24} />
      <Text style={styles.symbol}>{symbol}</Text>
      <Text style={[styles.change, { color: isPositive ? Colors.green : Colors.red }]}>
        {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
  },
  symbol: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  change: {
    fontSize: 12,
    fontWeight: '500',
  },
});
