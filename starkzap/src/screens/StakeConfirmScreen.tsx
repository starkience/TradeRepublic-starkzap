import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { AssetLogo } from '../components/AssetLogo';
import { useAuth } from '../context/AuthContext';
import { executeStake } from '../services/starkzapService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

const HP = 20;

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
}

const DetailRow = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text
      style={[styles.detailValue, highlight && { color: '#00C853' }]}
    >
      {value}
    </Text>
  </View>
);

export const StakeConfirmScreen: React.FC<Props> = ({ navigation, route }) => {
  const p = route.params as any;
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const GROSS_APY = 4;
  const NET_APY = GROSS_APY * 0.9;
  const dollarStaked = p.amount * p.price;
  const expectedAnnualReturn = dollarStaked * (NET_APY / 100);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await executeStake(
        auth.email,
        p.amount.toString()
      );

      navigation.navigate('StakeSuccess', {
        symbol: p.symbol,
        name: p.name,
        price: p.price,
        apy: NET_APY,
        logoUrl: p.logoUrl,
        holdings: p.holdings,
        currency: p.currency,
        amount: p.amount,
        txHash: result.hash,
        explorerUrl: result.explorerUrl,
      });
    } catch (err: any) {
      const msg = err?.message || 'Transaction failed';
      if (msg.includes('InsufficientBalance') || msg.includes('insufficient')) {
        setError('Insufficient LBTC balance for this transaction.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm staking</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.assetRow}>
          <AssetLogo uri={p.logoUrl} name={p.name} size={48} />
          <View style={styles.assetInfo}>
            <Text style={styles.assetName}>{p.name}</Text>
            <Text style={styles.assetSymbol}>{p.symbol}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.details}>
          <DetailRow label="Amount" value={`${p.amount} ${p.symbol}`} />
          <DetailRow
            label="Value staked"
            value={`${dollarStaked.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} $`}
          />
          <DetailRow label="APY" value={`${NET_APY.toFixed(1)} %`} highlight />
          <DetailRow
            label="Est. annual return"
            value={`+${expectedAnnualReturn.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })} $`}
            highlight
          />
          <DetailRow label="Network" value="Starknet" />
          <DetailRow label="Gas" value="Sponsored (AVNU)" />
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="warning" size={16} color={Colors.red} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.confirmBtn}
          activeOpacity={0.7}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.confirmBtnText}>Confirm stake</Text>
          )}
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
    paddingHorizontal: HP,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  scroll: { paddingHorizontal: HP, paddingBottom: 120 },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  assetInfo: {
    marginLeft: 14,
  },
  assetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  assetSymbol: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  details: {
    paddingVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: '#888',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginTop: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: Colors.red,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: HP,
    paddingBottom: 36,
    paddingTop: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  confirmBtn: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
