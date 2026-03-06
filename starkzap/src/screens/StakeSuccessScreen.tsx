import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { PortfolioChart } from '../components/PortfolioChart';
import { AssetLogo } from '../components/AssetLogo';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

function generateYieldChart(principal: number, apyPercent: number, period: string): number[] {
  const dailyRate = apyPercent / 100 / 365;
  const points = 30;
  let days: number;

  switch (period) {
    case '1D': days = 1; break;
    case '1W': days = 7; break;
    case '1M': days = 30; break;
    case '1Y': days = 365; break;
    default: days = 365 * 3; break;
  }

  const data: number[] = [];
  for (let i = 0; i <= points; i++) {
    const d = (i / points) * days;
    data.push(principal * (1 + dailyRate * d));
  }
  return data;
}

const { width, height: screenH } = Dimensions.get('window');
const HP = 20;
const timeFilters = ['1D', '1W', '1M', '1Y', 'Max'];

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
}

export const StakeSuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const p = route.params as any;
  const insets = useSafeAreaInsets();
  const [activeTime, setActiveTime] = useState('1W');
  const APY = p.apy || 4;

  const bannerY = useRef(new Animated.Value(-80)).current;
  const [bannerVisible, setBannerVisible] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(bannerY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(bannerY, {
        toValue: -80,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setBannerVisible(false));
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const handleDone = () => {
    Animated.timing(slideAnim, {
      toValue: screenH,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('MainTabs');
    });
  };

  const txHash: string | undefined = p.txHash;
  const explorerUrl: string | undefined = p.explorerUrl;

  const dollarStaked = p.amount * p.price;
  const annualReturn = dollarStaked * (APY / 100);
  const chartData = generateYieldChart(dollarStaked, APY, activeTime);
  const projectedValue = chartData[chartData.length - 1];
  const projectedGain = projectedValue - dollarStaked;

  return (
    <Animated.View style={[styles.root, { transform: [{ translateY: slideAnim }] }]}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        {bannerVisible && (
          <Animated.View
            style={[
              styles.banner,
              { paddingTop: insets.top + 16, transform: [{ translateY: bannerY }] },
            ]}
          >
            <Ionicons name="checkmark-circle" size={22} color="#000" />
            <Text style={styles.bannerText}>Staking plan created</Text>
          </Animated.View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {projectedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $
            </Text>
            <Text style={styles.change}>
              +{projectedGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $
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
              data={chartData}
              width={width - HP * 2}
              height={200}
              color="#00C853"
              showGradient
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Staking plans</Text>

          <View style={styles.planRow}>
            <AssetLogo uri={p.logoUrl} name={p.name} size={40} />
            <View style={styles.planInfo}>
              <Text style={styles.planName}>{p.name}</Text>
              <Text style={styles.planSub}>Active · Staking</Text>
            </View>
            <Text style={styles.planAmount}>
              {p.amount} {p.symbol}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Yield summary</Text>

          <View style={styles.yieldCard}>
            <View style={styles.yieldRow}>
              <Text style={styles.yieldLabel}>Staked amount</Text>
              <Text style={styles.yieldValue}>{p.amount} {p.symbol}</Text>
            </View>
            <View style={styles.yieldRow}>
              <Text style={styles.yieldLabel}>Value staked</Text>
              <Text style={styles.yieldValue}>
                {dollarStaked.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $
              </Text>
            </View>
            <View style={styles.yieldRow}>
              <Text style={styles.yieldLabel}>Net APY</Text>
              <Text style={[styles.yieldValue, { color: '#00C853' }]}>{APY} %</Text>
            </View>
            <View style={styles.yieldRow}>
              <Text style={styles.yieldLabel}>Est. annual return</Text>
              <Text style={[styles.yieldValue, { color: '#00C853' }]}>
                +{annualReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $
              </Text>
            </View>
            <View style={styles.yieldRow}>
              <Text style={styles.yieldLabel}>Est. monthly return</Text>
              <Text style={[styles.yieldValue, { color: '#00C853' }]}>
                +{(annualReturn / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} $
              </Text>
            </View>
          </View>

          {txHash && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Transaction</Text>
              <TouchableOpacity
                style={styles.txCard}
                activeOpacity={0.7}
                onPress={() => explorerUrl && Linking.openURL(explorerUrl)}
              >
                <Ionicons name="link-outline" size={18} color="#666" />
                <View style={styles.txInfo}>
                  <Text style={styles.txLabel}>Tx Hash</Text>
                  <Text style={styles.txHash} numberOfLines={1} ellipsizeMode="middle">
                    {txHash}
                  </Text>
                </View>
                <Ionicons name="open-outline" size={16} color="#999" />
              </TouchableOpacity>
            </>
          )}

          <View style={styles.divider} />

          <TouchableOpacity style={styles.infoRow}>
            <Text style={styles.infoTitle}>Information</Text>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>

          <Text style={styles.infoDesc}>
            Your {p.symbol} is now being staked on Starknet. Rewards are
            calculated daily and distributed to your account. Gas fees are
            sponsored by the AVNU paymaster. You can unstake at any time.
          </Text>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.doneBtn}
            activeOpacity={0.7}
            onPress={handleDone}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#D4FF00',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  bannerText: { fontSize: 16, fontWeight: '700', color: '#000' },
  scroll: { paddingHorizontal: HP, paddingBottom: 110 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 16, marginBottom: 16 },
  price: { fontSize: 28, fontWeight: '700', color: '#000' },
  change: { fontSize: 14, fontWeight: '500', color: '#00C853' },
  timeRow: { flexDirection: 'row', gap: 4, marginBottom: 8 },
  timeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  timeBtnActive: { backgroundColor: '#F0F0F0' },
  timeText: { fontSize: 13, fontWeight: '500', color: '#999' },
  timeTextActive: { color: '#000', fontWeight: '700' },
  chartWrap: { marginVertical: 16 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 14 },
  planRow: { flexDirection: 'row', alignItems: 'center' },
  planInfo: { flex: 1, marginLeft: 12 },
  planName: { fontSize: 16, fontWeight: '600', color: '#000' },
  planSub: { fontSize: 12, color: '#999', marginTop: 2 },
  planAmount: { fontSize: 15, fontWeight: '600', color: '#000' },
  yieldCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
  },
  yieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  yieldLabel: { fontSize: 14, color: '#888' },
  yieldValue: { fontSize: 14, fontWeight: '600', color: '#000' },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  txInfo: { flex: 1 },
  txLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  txHash: { fontSize: 13, fontWeight: '500', color: '#000' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
  infoDesc: { fontSize: 14, color: '#888', lineHeight: 20 },
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
  doneBtn: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneBtnText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
