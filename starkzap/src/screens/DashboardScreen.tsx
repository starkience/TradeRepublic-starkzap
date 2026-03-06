import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { PortfolioChart } from '../components/PortfolioChart';
import { AssetLogo } from '../components/AssetLogo';
import {
  investments,
  totalPortfolioValue,
  portfolioChangePercent,
  portfolioChartData,
} from '../data/mockStocks';
import { useWalletBalances } from '../hooks/useWalletBalances';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Dimensions } from 'react-native';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

const CashView = () => (
  <View style={styles.cashContainer}>
    <Text style={styles.cashTitle}>Cash</Text>
    <Text style={styles.cashAmount}>0.00 €</Text>
    <Text style={styles.cashSub}>Available to invest</Text>
  </View>
);

const truncateAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'wealth' | 'cash'>('wealth');
  const [activeTime, setActiveTime] = useState('1Y');
  const [sortBy, setSortBy] = useState<'name' | 'value'>('value');
  const { walletAddress } = useWalletBalances();

  const timeFilters = ['1D', '1W', '1M', '1Y', 'Max'];

  const sortedInvestments = [...investments].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return b.value - a.value;
  });

  const copyAddress = async () => {
    if (walletAddress) {
      await Clipboard.setStringAsync(walletAddress);
      Alert.alert('Copied', 'Wallet address copied to clipboard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'wealth' && styles.tabActive]}
            onPress={() => setActiveTab('wealth')}
          >
            <Text style={[styles.tabText, activeTab === 'wealth' && styles.tabTextActive]}>
              Wealth
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'cash' && styles.tabActive]}
            onPress={() => setActiveTab('cash')}
          >
            <Text style={[styles.tabText, activeTab === 'cash' && styles.tabTextActive]}>
              Cash
            </Text>
          </TouchableOpacity>
        </View>

        {walletAddress && (
          <TouchableOpacity style={styles.addressBadge} onPress={copyAddress}>
            <Ionicons name="wallet-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.addressText}>{truncateAddress(walletAddress)}</Text>
            <Ionicons name="copy-outline" size={12} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}

        {activeTab === 'wealth' ? (
          <>
            <Text style={styles.totalValue}>
              {totalPortfolioValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              €
            </Text>
            <Text style={[styles.changeText, { color: Colors.green }]}>
              +{portfolioChangePercent.toFixed(2)} %
            </Text>

            <View style={styles.timeRow}>
              {timeFilters.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeBtn, activeTime === t && styles.timeBtnActive]}
                  onPress={() => setActiveTime(t)}
                >
                  <Text style={[styles.timeText, activeTime === t && styles.timeTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.chartWrap}>
              <PortfolioChart
                data={portfolioChartData}
                width={width - 40}
                height={180}
                color={Colors.green}
                showGradient
              />
            </View>

            <View style={styles.investmentsHeader}>
              <Text style={styles.sectionTitle}>Investments</Text>
              <TouchableOpacity
                style={styles.sortButton}
                onPress={() => setSortBy(sortBy === 'name' ? 'value' : 'name')}
              >
                <Text style={styles.sortText}>
                  {sortBy === 'name' ? 'A-Z' : 'Value'}
                </Text>
                <Ionicons name="swap-vertical" size={14} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {sortedInvestments.map((inv) => (
              <View key={inv.symbol} style={styles.investmentRow}>
                <AssetLogo uri={inv.logoUrl} name={inv.name} size={36} />
                <View style={styles.investmentInfo}>
                  <Text style={styles.investmentName}>{inv.name}</Text>
                  <Text style={styles.investmentSymbol}>{inv.symbol}</Text>
                </View>
                <View style={styles.investmentValues}>
                  <Text style={styles.investmentValue}>
                    {inv.value.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    {inv.currency}
                  </Text>
                  <Text
                    style={[
                      styles.investmentChange,
                      { color: inv.changePercent >= 0 ? Colors.green : Colors.red },
                    ]}
                  >
                    {inv.changePercent >= 0 ? '+' : ''}
                    {inv.changePercent.toFixed(2)} %
                  </Text>
                </View>
              </View>
            ))}
          </>
        ) : (
          <CashView />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  tabRow: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: Colors.surface,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  addressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  changeText: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  timeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  timeBtnActive: {
    backgroundColor: Colors.surface,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  timeTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  chartWrap: { marginVertical: 16 },
  investmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  investmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  investmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  investmentName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  investmentSymbol: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  investmentValues: {
    alignItems: 'flex-end',
  },
  investmentValue: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  investmentChange: {
    fontSize: 13,
    marginTop: 2,
  },
  cashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  cashTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cashAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  cashSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
