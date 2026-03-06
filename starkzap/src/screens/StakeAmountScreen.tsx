import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { NumberPad } from '../components/NumberPad';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const percentButtons = [10, 25, 50, 75, 100];

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
}

export const StakeAmountScreen: React.FC<Props> = ({ navigation, route }) => {
  const { symbol, name, price, apy, logoUrl, holdings, currency } =
    route.params as any;
  const [amount, setAmount] = useState('');

  const numAmount = parseFloat(amount) || 0;
  const canProceed = numAmount > 0 && numAmount <= holdings;

  const handleKey = (key: string) => {
    if (key === '.' && amount.includes('.')) return;
    setAmount((prev) => prev + key);
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const handlePercent = (pct: number) => {
    const val = (holdings * pct) / 100;
    setAmount(val.toString());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stake {symbol}</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.amountSection}>
        <Text style={styles.amountText}>
          {amount || '0'} {symbol}
        </Text>
        <Text style={styles.availableText}>
          Available: {holdings.toFixed(8)} {symbol}
        </Text>
        <Text style={styles.dollarValue}>
          ≈ {(numAmount * price).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          $
        </Text>
      </View>

      <View style={styles.percentRow}>
        {percentButtons.map((pct) => (
          <TouchableOpacity
            key={pct}
            style={styles.percentBtn}
            onPress={() => handlePercent(pct)}
          >
            <Text style={styles.percentText}>{pct}%</Text>
          </TouchableOpacity>
        ))}
      </View>

      <NumberPad onPress={handleKey} onDelete={handleDelete} light />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.confirmBtn, !canProceed && styles.confirmBtnDisabled]}
          disabled={!canProceed}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('StakeConfirm', {
              symbol,
              name,
              price,
              apy: apy * 0.9,
              logoUrl,
              holdings,
              currency,
              amount: numAmount,
            })
          }
        >
          <Text style={styles.confirmBtnText}>Review</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  amountText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
  },
  availableText: {
    fontSize: 13,
    color: '#888',
    marginTop: 8,
  },
  dollarValue: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  percentRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  percentBtn: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  percentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  confirmBtn: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
