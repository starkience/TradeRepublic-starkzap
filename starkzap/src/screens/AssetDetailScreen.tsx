import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { AssetLogo } from '../components/AssetLogo';
import { PortfolioChart } from '../components/PortfolioChart';
import { portfolioChartData } from '../data/mockStocks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const HP = 20;
const timeFilters = ['1D', '1W', '1M', '1Y', 'Max'];

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
}

export const AssetDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { symbol, name, price, apy, logoUrl, holdings, currency } =
    route.params as any;
  const [activeTime, setActiveTime] = useState('1W');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-down" size={28} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <AssetLogo uri={logoUrl} name={name} size={28} />
            <Text style={styles.headerTitle}>{name}</Text>
          </View>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {(holdings * price).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            $
          </Text>
        </View>

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
            width={width - HP * 2}
            height={200}
            color={Colors.green}
            showGradient
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.statsTitle}>Key statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Net APY</Text>
            <Text style={styles.statValue}>{(apy * 0.9).toFixed(1)} %</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Holdings</Text>
            <Text style={styles.statValue}>
              {(holdings * price).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              $
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {apy > 0 && (
          <TouchableOpacity
            style={styles.stakeBtn}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('StakeAmount', {
                symbol,
                name,
                price,
                apy,
                logoUrl,
                holdings,
                currency,
              })
            }
          >
            <Text style={styles.stakeBtnText}>Stake {symbol}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingHorizontal: HP, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  priceRow: {
    marginTop: 8,
    marginBottom: 16,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
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
    backgroundColor: '#F0F0F0',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
  },
  timeTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  chartWrap: { marginVertical: 16 },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 14,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  stakeBtn: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  stakeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
