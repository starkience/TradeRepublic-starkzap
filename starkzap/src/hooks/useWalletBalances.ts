import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DefiAsset } from '../data/mockStocks';

const getServerUrl = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3001';
  return 'http://192.168.1.2:3001';
};

interface TokenMeta {
  symbol: string;
  name: string;
  logoUrl: string;
  apy: number;
  onChainSymbol: string;
}

const TOKEN_META: TokenMeta[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    logoUrl: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png',
    apy: 3.3,
    onChainSymbol: 'LBTC',
  },
  {
    symbol: 'STRK',
    name: 'Starknet',
    logoUrl: 'https://assets.coingecko.com/coins/images/26433/small/starknet.png',
    apy: 4.0,
    onChainSymbol: 'STRK',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    logoUrl: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
    apy: 0,
    onChainSymbol: 'ETH',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    apy: 0,
    onChainSymbol: 'USDC',
  },
];

export interface WalletBalances {
  assets: DefiAsset[];
  walletAddress: string | null;
  totalValue: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

const DEFAULT_ASSETS: DefiAsset[] = TOKEN_META.map((m) => ({
  symbol: m.symbol,
  name: m.name,
  price: 0,
  apy: m.apy,
  changePercent: 0,
  logoUrl: m.logoUrl,
  currency: '$',
  holdings: 0,
  stakedAmount: 0,
}));

export function useWalletBalances(): WalletBalances {
  const { auth, setWalletAddress } = useAuth();
  const [assets, setAssets] = useState<DefiAsset[]>(DEFAULT_ASSETS);
  const [walletAddress, setLocalAddress] = useState<string | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (address: string) => {
    const serverUrl = getServerUrl();

    try {
      const [balRes, priceRes] = await Promise.all([
        fetch(`${serverUrl}/api/balances/${address}`).then((r) => r.json()),
        fetch(`${serverUrl}/api/prices`).then((r) => r.json()),
      ]);

      const balances = balRes.balances || {};
      const prices = priceRes.prices || {};

      let total = 0;
      const result: DefiAsset[] = TOKEN_META.map((meta) => {
        const bal = parseFloat(balances[meta.onChainSymbol]?.balance || '0');
        const priceUsd = prices[meta.onChainSymbol]?.price || 0;
        const change24h = prices[meta.onChainSymbol]?.change24h || 0;
        const value = bal * priceUsd;
        total += value;

        return {
          symbol: meta.symbol,
          name: meta.name,
          price: priceUsd,
          apy: meta.apy,
          changePercent: change24h,
          logoUrl: meta.logoUrl,
          currency: '$',
          holdings: bal,
          stakedAmount: 0,
        };
      });

      setAssets(result);
      setTotalValue(total);
    } catch (err) {
      console.warn('[useWalletBalances] fetchData failed:', err);
    }
  }, []);

  const walletAddressRef = useRef<string | null>(null);

  const initWallet = useCallback(async () => {
    if (!auth.isAuthenticated || !auth.email) {
      setAssets(DEFAULT_ASSETS);
      setTotalValue(0);
      setLoading(false);
      return;
    }

    if (walletAddressRef.current) {
      await fetchData(walletAddressRef.current);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const serverUrl = getServerUrl();
      const walletRes = await fetch(`${serverUrl}/api/wallet/starknet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: auth.email }),
      });
      const walletData = await walletRes.json();
      const addr = walletData.wallet?.address;

      if (addr) {
        walletAddressRef.current = addr;
        setLocalAddress(addr);
        setWalletAddress(addr);
        await fetchData(addr);
      }
    } catch (err) {
      console.warn('[useWalletBalances] Init failed:', err);
    } finally {
      setLoading(false);
    }
  }, [auth.isAuthenticated, auth.email, fetchData, setWalletAddress]);

  const refresh = useCallback(async () => {
    if (walletAddress) {
      await fetchData(walletAddress);
    }
  }, [walletAddress, fetchData]);

  useEffect(() => {
    initWallet();
  }, [initWallet]);

  useEffect(() => {
    if (!walletAddress) return;
    intervalRef.current = setInterval(() => fetchData(walletAddress), 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [walletAddress, fetchData]);

  return { assets, walletAddress, totalValue, loading, refresh };
}
