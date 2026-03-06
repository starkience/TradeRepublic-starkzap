import 'react-native-get-random-values';
import 'fast-text-encoding';

import { Platform } from 'react-native';

const getServerUrl = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3001';
  return 'http://192.168.1.2:3001';
};

let sdkInstance: any = null;
let connectedWallet: any = null;
let starkzapModule: any = null;

async function getModule() {
  if (!starkzapModule) {
    starkzapModule = await import('starkzap');
  }
  return starkzapModule;
}

export async function initStarkZapSDK() {
  if (sdkInstance) return sdkInstance;

  const { StarkZap } = await getModule();
  const serverUrl = getServerUrl();

  sdkInstance = new StarkZap({
    network: 'mainnet' as const,
    paymaster: {
      nodeUrl: `${serverUrl}/api/paymaster`,
    },
  });

  return sdkInstance;
}

export async function getOrCreateWallet(
  userId: string
): Promise<{ walletId: string; publicKey: string; address: string }> {
  const serverUrl = getServerUrl();
  const res = await fetch(`${serverUrl}/api/wallet/starknet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `Server error: ${res.status}`);
  }

  const data = await res.json();
  return data.wallet;
}

export async function onboardWithPrivy(userId: string) {
  if (connectedWallet) return connectedWallet;

  const sdk = await initStarkZapSDK();
  const walletData = await getOrCreateWallet(userId);
  const { OnboardStrategy } = await getModule();
  const serverUrl = getServerUrl();

  const result = await sdk.onboard({
    strategy: OnboardStrategy.Privy,
    privy: {
      resolve: async () => ({
        walletId: walletData.walletId,
        publicKey: walletData.publicKey,
        serverUrl: `${serverUrl}/api/wallet/sign`,
      }),
    },
    accountPreset: 'argentXV050' as const,
    deploy: 'if_needed' as const,
    feeMode: 'sponsored' as const,
  });

  connectedWallet = result.wallet;
  return connectedWallet;
}

let cachedLbtcPool: any = null;

async function findLbtcPool(): Promise<any> {
  if (cachedLbtcPool) return cachedLbtcPool;

  const { mainnetValidators } = await getModule();

  const validators = Object.values(mainnetValidators) as any[];
  const poolResults = await Promise.all(
    validators.map(async (v) => {
      try {
        const pools = await sdkInstance.getStakerPools(v.stakerAddress);
        return pools.find((p: any) => p.token.symbol === 'LBTC') || null;
      } catch {
        return null;
      }
    })
  );

  cachedLbtcPool = poolResults.find((p) => p !== null) || null;
  return cachedLbtcPool;
}

export async function executeStake(
  userId: string,
  amountStr: string
): Promise<{ hash: string; explorerUrl: string }> {
  const wallet = await onboardWithPrivy(userId);
  const { Amount, mainnetTokens } = await getModule();

  const LBTC = mainnetTokens.LBTC;
  const stakeAmount = Amount.parse(amountStr, LBTC);

  const lbtcPool = await findLbtcPool();
  if (!lbtcPool) {
    throw new Error('No LBTC staking pool found across any validator');
  }

  const tx = await wallet.stake(lbtcPool.poolContract, stakeAmount, {
    feeMode: 'sponsored' as const,
  });

  return {
    hash: tx.hash,
    explorerUrl: tx.explorerUrl,
  };
}

export function getConnectedWallet() {
  return connectedWallet;
}

export function isWalletConnected() {
  return connectedWallet !== null;
}

export function resetWallet() {
  connectedWallet = null;
}
