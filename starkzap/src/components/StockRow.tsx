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

export const StockRow: React.FC<Props> = ({
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
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <AssetLogo uri={logoUrl} name={name} size={36} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.symbol}>{symbol}</Text>
      </View>
      <View style={styles.priceCol}>
        <Text style={styles.price}>
          {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
        </Text>
        <Text style={[styles.change, { color: isPositive ? Colors.green : Colors.red }]}>
          {isPositive ? '+' : ''}{changePercent.toFixed(2)} %
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  symbol: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  change: {
    fontSize: 13,
    marginTop: 2,
  },
});
