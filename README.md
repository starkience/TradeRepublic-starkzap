# Starkzap x Trade Republic , BTC Staking Demo

A proof-of-concept mobile app demonstrating how **real BTC staking** can be seamlessly integrated into a traditional stock trading interface like Trade Republic , powered by the [Starkzap TypeScript SDK](https://github.com/keep-starknet-strange/starkzap).

## What this demo shows

- **Trade Republic UI clone** , The app faithfully reproduces the Trade Republic mobile experience (portfolio, browse, stocks, bonds, derivatives) using React Native + Expo Go.
- **BTC staking in 3 taps** , Under "DeFi yield," users can stake their BTC (LBTC on Starknet) through a familiar checkout flow: amount → review → confirm → done.
- **Self-custodial** , User wallets are created via [Privy](https://privy.io) server-managed wallets on Starknet. The user owns their keys; the app never has direct access to funds.
- **Gasless transactions** , All staking transactions are sponsored by the [AVNU Paymaster](https://avnu.fi), so users never pay gas fees.
- **Real on-chain transactions** , Staking is not simulated. The app submits real Starknet transactions to delegate LBTC to validator staking pools.
- **Mockup trade capital** , Stock investments, bonds, and derivatives data are mockups. Only the crypto balances (BTC, ETH, STRK, USDC) and staking transactions are real and on-chain.

## Architecture

```
┌─────────────────────────────────────┐
│          React Native App           │
│         (Expo Go / SDK 54)          │
│                                     │
│  ┌───────────┐   ┌───────────────┐  │
│  │ Auth Flow │   │ Staking Flow  │  │
│  │ (Privy)   │   │ (Starkzap SDK)│  │
│  └─────┬─────┘   └──────┬────────┘  │
└────────┼─────────────────┼──────────┘
         │                 │
         ▼                 ▼
┌─────────────────────────────────────┐
│        Express.js Backend           │
│                                     │
│  • Privy wallet create/sign proxy   │
│  • AVNU Paymaster proxy             │
│  • Starknet RPC balance queries     │
│  • CoinGecko price feed (cached)    │
└─────────────────────────────────────┘
         │                 │
         ▼                 ▼
   ┌───────────┐    ┌─────────────┐
   │  Privy    │    │  Starknet   │
   │  (Wallets)│    │  Mainnet    │
   └───────────┘    └─────────────┘
```

## Where the Starkzap SDK is used

The [Starkzap SDK](https://github.com/keep-starknet-strange/starkzap) (`starkzap` npm package) is integrated in two files:

### 1. `starkzap/src/services/starkzapService.ts`

This is the core integration point. The SDK is used for:

- **`Starkzap` class** , Initializes the SDK with Starknet mainnet config and the AVNU paymaster endpoint.
- **`OnboardStrategy.Privy`** , Connects a Privy-managed Starknet wallet to the SDK, providing a custom signer that routes signing requests through the backend.
- **`mainnetTokens.LBTC`** , References the LBTC token for staking amount parsing.
- **`mainnetValidators`** , Iterates over all registered Starknet validators to discover LBTC staking pools.
- **`sdk.getStakerPools()`** , Queries each validator's staking pools to find one that accepts LBTC.
- **`wallet.stake()`** , Executes the actual on-chain staking transaction with sponsored gas fees (`feeMode: 'sponsored'`).
- **`Amount.parse()`** , Parses human-readable amounts into the correct token decimals.

### 2. `starkzap/server/server.ts`

The backend server acts as a proxy for SDK operations that require server-side credentials:

- **`POST /api/wallet/sign`** , Signs transaction hashes via Privy's `rawSign` API, called by the Starkzap SDK's Privy signer during `wallet.stake()`.
- **`POST /api/paymaster`** , Proxies requests to the AVNU paymaster for gas sponsorship.

### Staking flow in the app

1. User taps **BTC** under "DeFi yield" → `AssetDetailScreen`
2. Taps **Stake BTC** → `StakeAmountScreen` (enter amount, see available balance)
3. Taps **Review** → `StakeConfirmScreen` (APY, expected returns, gas = sponsored)
4. Taps **Confirm stake** → calls `executeStake()` in `starkzapService.ts`
   - SDK discovers LBTC pool across validators (parallel, cached)
   - SDK builds the staking transaction
   - Transaction is signed via Privy backend proxy
   - Gas is paid by AVNU paymaster
   - Transaction is submitted to Starknet mainnet
5. → `StakeSuccessScreen` (tx hash, explorer link, projected yield chart)

## Getting started

### Prerequisites

- Node.js 18+
- Expo Go app on your iOS/Android device
- A [Privy](https://privy.io) account with a native app client configured

### Run the backend

```bash
cd starkzap/server
npm install
npx tsx server.ts
```

The server starts on port 3001 and displays any existing wallet addresses.

### Run the app

```bash
cd starkzap
npm install
npx expo start
```

Scan the QR code with Expo Go. Log in with your email , Privy sends a 6-digit OTP.

### Fund your wallet

After logging in, the server terminal displays your Starknet wallet address. Send LBTC to that address, then navigate to "DeFi yield" → BTC to see your balance and stake.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Mobile app | React Native, TypeScript, Expo Go (SDK 54) |
| Navigation | React Navigation (stack + bottom tabs) |
| Auth | Privy (email + OTP, server-managed Starknet wallets) |
| Staking | Starkzap SDK (LBTC delegation to Starknet validators) |
| Gas sponsorship | AVNU Paymaster |
| Backend | Express.js + TypeScript |
| Blockchain | Starknet mainnet |
| Prices | CoinGecko API (cached) |
| Balances | Starknet RPC via Alchemy |

## Disclaimer

This is a **demo/proof-of-concept**. The Trade Republic brand and UI are used for illustrative purposes only. Stock and derivative data is mocked. Only crypto balances and staking transactions are real on-chain operations on Starknet mainnet.
