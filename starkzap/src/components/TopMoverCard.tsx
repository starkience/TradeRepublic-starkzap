import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { AssetLogo } from './AssetLogo';

interface Props {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  logoUrl: string;
  currency?: string;
  onPress?: () => void;
}

export const TopMoverCard: React.FC<Props> = ({
  symbol,
  name,
  price,
  changePercent,
  logoUrl,
  currency = '$',
  onPress,
}) => {
  const isPositive = changePercent >= 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <AssetLogo uri={logoUrl} name={name} size={32} />
      <Text style={styles.symbol} numberOfLines={1}>{symbol}</Text>
      <Text style={styles.price}>
        {price.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}
      </Text>
      <Text style={[styles.change, { color: isPositive ? Colors.green : Colors.red }]}>
        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    width: 130,
    marginRight: 10,
    alignItems: 'flex-start',
    gap: 6,
  },
  symbol: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  price: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  change: {
    fontSize: 13,
    fontWeight: '600',
  },
});
