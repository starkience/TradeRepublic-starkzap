import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { AssetLogo } from '../components/AssetLogo';
import { TopMoverCard } from '../components/TopMoverCard';
import { TrendingChip } from '../components/TrendingChip';
import {
  stocks,
  topMovers,
  trending,
  bonds,
  derivatives,
} from '../data/mockStocks';
import { useWalletBalances } from '../hooks/useWalletBalances';
import { useNavigation } from '@react-navigation/native';

export const BrowseScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { assets: defiAssets, refresh: refreshBalances } = useWalletBalances();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshBalances();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.textPrimary}
          />
        }
      >
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={Colors.placeholder}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Trending */}
        <Text style={styles.sectionTitle}>Trending</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {trending.map((t) => (
            <TrendingChip
              key={t.symbol}
              symbol={t.symbol}
              name={t.name}
              changePercent={t.changePercent}
              logoUrl={t.logoUrl}
            />
          ))}
        </ScrollView>

        {/* Top Movers */}
        <Text style={styles.sectionTitle}>Top movers</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moverRow}>
          {topMovers.map((m) => (
            <TopMoverCard
              key={m.symbol}
              symbol={m.symbol}
              name={m.name}
              price={m.price}
              changePercent={m.changePercent}
              logoUrl={m.logoUrl}
              currency={m.currency}
            />
          ))}
        </ScrollView>

        {/* Stocks */}
        <Text style={styles.sectionTitle}>Stocks</Text>
        {stocks.map((s) => (
          <TouchableOpacity key={s.symbol} style={styles.listRow}>
            <AssetLogo uri={s.logoUrl} name={s.name} size={36} />
            <View style={styles.listInfo}>
              <Text style={styles.listName}>{s.name}</Text>
              <Text style={styles.listSub}>{s.symbol}</Text>
            </View>
            <View style={styles.listValues}>
              <Text style={styles.listPrice}>
                {s.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} {s.currency}
              </Text>
              <Text
                style={[
                  styles.listChange,
                  { color: s.changePercent >= 0 ? Colors.green : Colors.red },
                ]}
              >
                {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)} %
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* DeFi yield */}
        <Text style={styles.sectionTitle}>DeFi yield</Text>
        {defiAssets.map((asset) => {
          const defiValue = (asset.holdings * asset.price).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

          return (
            <TouchableOpacity
              key={asset.symbol}
              style={styles.listRow}
              onPress={() =>
                navigation.navigate('AssetDetail', {
                  symbol: asset.symbol,
                  name: asset.name,
                  price: asset.price,
                  apy: asset.apy,
                  logoUrl: asset.logoUrl,
                  holdings: asset.holdings,
                  currency: asset.currency,
                })
              }
            >
              <AssetLogo uri={asset.logoUrl} name={asset.name} size={36} />
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{asset.name}</Text>
                <Text style={styles.listSub}>
                  {asset.apy > 0 ? `${asset.apy}% APY` : asset.symbol}
                </Text>
              </View>
              <View style={styles.listValues}>
                <Text style={styles.defiValue}>{defiValue} $</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Derivatives */}
        <Text style={styles.sectionTitle}>Derivatives</Text>
        {derivatives.map((d) => (
          <TouchableOpacity key={d.name} style={styles.listRow}>
            <AssetLogo uri={d.logoUrl} name={d.name} size={36} />
            <View style={styles.listInfo}>
              <Text style={styles.listName}>{d.name}</Text>
              <Text style={styles.listSub}>{d.type} · {d.underlying}</Text>
            </View>
            <View style={styles.listValues}>
              <Text style={styles.listPrice}>
                {d.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} {d.currency}
              </Text>
              <Text
                style={[
                  styles.listChange,
                  { color: d.changePercent >= 0 ? Colors.green : Colors.red },
                ]}
              >
                {d.changePercent >= 0 ? '+' : ''}{d.changePercent.toFixed(2)} %
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Bonds */}
        <Text style={styles.sectionTitle}>Bonds</Text>
        {bonds.map((b) => (
          <TouchableOpacity key={b.name} style={styles.listRow}>
            <View style={styles.bondIcon}>
              <Ionicons name="trending-up" size={20} color={Colors.green} />
            </View>
            <View style={styles.listInfo}>
              <Text style={styles.listName}>{b.name}</Text>
              <Text style={styles.listSub}>Maturity {b.maturity}</Text>
            </View>
            <View style={styles.listValues}>
              <Text style={styles.listPrice}>{b.yield.toFixed(2)} %</Text>
              <Text style={styles.listSub}>{b.price} {b.currency}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 16 },
  searchRow: { marginTop: 10, marginBottom: 20 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  chipRow: { marginBottom: 8 },
  moverRow: { marginBottom: 8 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  listSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listValues: {
    alignItems: 'flex-end',
  },
  listPrice: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  listChange: {
    fontSize: 13,
    marginTop: 2,
  },
  defiValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  bondIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
