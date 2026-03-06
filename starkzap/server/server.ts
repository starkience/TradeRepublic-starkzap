import express from "express";
import cors from "cors";
import { PrivyClient } from "@privy-io/node";
import fs from "fs";
import path from "path";

const PRIVY_APP_ID = process.env.PRIVY_APP_ID || "cmmdnp3sa01g90cjstevcpmdt";
const PRIVY_APP_SECRET =
  process.env.PRIVY_APP_SECRET ||
  "privy_app_secret_pz2nhfaAKG5PYyxsxnBrqjBNMx9btV1api9iq1NPcfEiF9e8JBuyRj1wyskLS1XfFhcwexMSBBh8HD8pXFpZLLb";
const AVNU_API_KEY =
  process.env.AVNU_API_KEY || "18fbce31-5da0-4264-b89a-8fcc09be9ff8";
const AVNU_PAYMASTER_URL =
  process.env.AVNU_PAYMASTER_URL || "https://starknet.paymaster.avnu.fi";
const STARKNET_RPC =
  process.env.STARKNET_RPC ||
  "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_10/36Yk32Oit6p-vfYD4GsLv";
const PORT = Number(process.env.PORT) || 3001;

const privy = new PrivyClient({
  appId: PRIVY_APP_ID,
  appSecret: PRIVY_APP_SECRET,
});

const WALLETS_FILE = path.join(__dirname, "wallets.json");

type WalletEntry = { walletId: string; publicKey: string; address: string };

function loadWallets(): Record<string, WalletEntry> {
  try {
    if (fs.existsSync(WALLETS_FILE)) {
      return JSON.parse(fs.readFileSync(WALLETS_FILE, "utf-8"));
    }
  } catch {}
  return {};
}

function saveWallets(data: Record<string, WalletEntry>) {
  fs.writeFileSync(WALLETS_FILE, JSON.stringify(data, null, 2));
}

const TOKEN_CONFIG: Record<
  string,
  { address: string; decimals: number; coingeckoId: string }
> = {
  LBTC: {
    address:
      "0x036834a40984312f7f7de8d31e3f6305b325389eaeea5b1c0664b2fb936461a4",
    decimals: 8,
    coingeckoId: "lombard-staked-btc",
  },
  STRK: {
    address:
      "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    decimals: 18,
    coingeckoId: "starknet",
  },
  ETH: {
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    decimals: 18,
    coingeckoId: "ethereum",
  },
  USDC: {
    address:
      "0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb",
    decimals: 6,
    coingeckoId: "usd-coin",
  },
};

const BALANCE_OF_SELECTOR =
  "0x2e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e";

async function queryBalance(
  tokenAddress: string,
  walletAddress: string
): Promise<bigint> {
  const body = {
    jsonrpc: "2.0",
    method: "starknet_call",
    params: {
      request: {
        contract_address: tokenAddress,
        entry_point_selector: BALANCE_OF_SELECTOR,
        calldata: [walletAddress],
      },
      block_id: "latest",
    },
    id: 0,
  };

  const res = await fetch(STARKNET_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (data.error) return 0n;

  const result = data.result;
  if (!result || result.length === 0) return 0n;

  const low = BigInt(result[0]);
  const high = result[1] ? BigInt(result[1]) : 0n;
  return low + (high << 128n);
}

function formatBalance(raw: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = raw / divisor;
  const frac = raw % divisor;
  const fracStr = frac.toString().padStart(decimals, "0");
  const trimmed = fracStr.replace(/0+$/, "") || "0";
  return trimmed === "0" ? whole.toString() : `${whole}.${trimmed}`;
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/wallet/starknet", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const wallets = loadWallets();
    if (wallets[userId]) {
      return res.json({ wallet: wallets[userId] });
    }

    console.log(`  [wallet] Creating new Starknet wallet for ${userId}...`);
    const wallet = await privy.wallets().create({
      chain_type: "starknet",
    });

    const entry: WalletEntry = {
      walletId: wallet.id,
      publicKey: (wallet as any).public_key || "",
      address: wallet.address || "",
    };
    wallets[userId] = entry;
    saveWallets(wallets);

    console.log(`\n  [wallet] Created Starknet wallet for ${userId}:`);
    console.log(`           Address: ${entry.address}`);
    console.log(`           Send LBTC to this address to stake.\n`);
    res.json({ wallet: entry });
  } catch (err: any) {
    console.error("[wallet] Create failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/balances/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const balances: Record<string, { balance: string; raw: string }> = {};

    const results = await Promise.all(
      Object.entries(TOKEN_CONFIG).map(async ([symbol, cfg]) => {
        const raw = await queryBalance(cfg.address, address);
        return {
          symbol,
          balance: formatBalance(raw, cfg.decimals),
          raw: raw.toString(),
        };
      })
    );

    for (const r of results) {
      balances[r.symbol] = { balance: r.balance, raw: r.raw };
    }

    res.json({ address, balances });
  } catch (err: any) {
    console.error("[balances] Failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

let cachedPrices: Record<string, { price: number; change24h: number }> = {
  LBTC: { price: 91000, change24h: 0 },
  STRK: { price: 0.18, change24h: 0 },
  ETH: { price: 2200, change24h: 0 },
  USDC: { price: 1.0, change24h: 0 },
};
let lastPriceFetch = 0;
const PRICE_CACHE_MS = 60_000;

app.get("/api/prices", async (_req, res) => {
  const now = Date.now();
  if (now - lastPriceFetch > PRICE_CACHE_MS) {
    try {
      const ids = Object.values(TOKEN_CONFIG)
        .map((c) => c.coingeckoId)
        .join(",");
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
      const response = await fetch(url, {
        headers: { accept: "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        for (const [symbol, cfg] of Object.entries(TOKEN_CONFIG)) {
          const entry = data[cfg.coingeckoId];
          if (entry?.usd) {
            cachedPrices[symbol] = {
              price: entry.usd,
              change24h: entry.usd_24h_change ?? 0,
            };
          }
        }
        lastPriceFetch = now;
      }
    } catch {}
  }

  res.json({ prices: cachedPrices });
});

app.post("/api/wallet/sign", async (req, res) => {
  try {
    const { walletId, hash } = req.body;
    if (!walletId || !hash) {
      return res.status(400).json({ error: "walletId and hash are required" });
    }

    const hexHash = hash.startsWith("0x") ? hash : `0x${hash}`;

    const result = await privy.wallets().rawSign(walletId, {
      params: { hash: hexHash },
    });

    console.log(`  [sign] Signed hash for wallet ${walletId}`);
    res.json({ signature: result.signature });
  } catch (err: any) {
    console.error("[sign] Failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/paymaster", async (req, res) => {
  try {
    const response = await fetch(AVNU_PAYMASTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(AVNU_API_KEY && { "x-paymaster-api-key": AVNU_API_KEY }),
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err: any) {
    console.error("[paymaster] Proxy failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n  ╔══════════════════════════════════════════════╗`);
  console.log(`  ║         StarkZap Server v1.0                 ║`);
  console.log(`  ╠══════════════════════════════════════════════╣`);
  console.log(`  ║  URL:       http://0.0.0.0:${PORT}              ║`);
  console.log(`  ║  Privy:     ${PRIVY_APP_ID.slice(0, 20)}...     ║`);
  console.log(`  ║  Paymaster: AVNU                             ║`);
  console.log(`  ╚══════════════════════════════════════════════╝\n`);

  const wallets = loadWallets();
  const entries = Object.entries(wallets);
  if (entries.length > 0) {
    console.log(`  Existing wallets:`);
    for (const [userId, w] of entries) {
      console.log(`    ${userId}`);
      console.log(`      → ${w.address}`);
    }
    console.log(
      `\n  Send LBTC to the address above to fund your wallet.\n`
    );
  } else {
    console.log(`  No wallets yet. Log in via the app to create one.\n`);
  }
});
