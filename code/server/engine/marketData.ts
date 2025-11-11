/**
 * Market Data Fetcher
 * Uses CoinGecko API for crypto price data
 */

import { MarketData } from "../strategies/rsiBET";

// CoinGecko API configuration
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || "";
const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

// Top crypto assets to monitor (MVP focus)
export const CRYPTO_ASSETS = [
  { symbol: "BTC/USD", coinId: "bitcoin" },
  { symbol: "ETH/USD", coinId: "ethereum" },
  { symbol: "BNB/USD", coinId: "binancecoin" },
  { symbol: "XRP/USD", coinId: "ripple" },
  { symbol: "ADA/USD", coinId: "cardano" },
  { symbol: "SOL/USD", coinId: "solana" },
  { symbol: "DOGE/USD", coinId: "dogecoin" },
  { symbol: "MATIC/USD", coinId: "matic-network" },
  { symbol: "DOT/USD", coinId: "polkadot" },
  { symbol: "AVAX/USD", coinId: "avalanche-2" },
];

interface CoinGeckoOHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Fetch OHLCV data from CoinGecko
 */
async function fetchCoinGeckoOHLCV(coinId: string, days: number = 30): Promise<CoinGeckoOHLCV[]> {
  try {
    const url = `${COINGECKO_BASE_URL}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;
    const headers: Record<string, string> = {
      "accept": "application/json",
    };
    
    if (COINGECKO_API_KEY) {
      headers["x-cg-demo-api-key"] = COINGECKO_API_KEY;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // CoinGecko returns: [[timestamp, open, high, low, close], ...]
    return data.map((candle: number[]) => ({
      timestamp: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: 0, // CoinGecko OHLC endpoint doesn't include volume
    }));
  } catch (error) {
    console.error(`Failed to fetch data for ${coinId}:`, error);
    return [];
  }
}

/**
 * Fetch current price and volume from CoinGecko
 */
async function fetchCoinGeckoPrice(coinId: string): Promise<{ price: number; volume: number }> {
  try {
    const url = `${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_vol=true`;
    const headers: Record<string, string> = {
      "accept": "application/json",
    };
    
    if (COINGECKO_API_KEY) {
      headers["x-cg-demo-api-key"] = COINGECKO_API_KEY;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      price: data[coinId]?.usd || 0,
      volume: data[coinId]?.usd_24h_vol || 0,
    };
  } catch (error) {
    console.error(`Failed to fetch price for ${coinId}:`, error);
    return { price: 0, volume: 0 };
  }
}

/**
 * Convert OHLCV data to MarketData format for strategy evaluation
 */
export async function fetchMarketData(asset: { symbol: string; coinId: string }): Promise<MarketData | null> {
  try {
    // Fetch historical OHLCV data (30 days for indicators)
    const ohlcv = await fetchCoinGeckoOHLCV(asset.coinId, 30);
    
    if (ohlcv.length === 0) {
      console.warn(`No data available for ${asset.symbol}`);
      return null;
    }

    // Fetch current price and volume
    const current = await fetchCoinGeckoPrice(asset.coinId);

    // Extract arrays for indicators
    const prices = ohlcv.map(c => c.close);
    const highs = ohlcv.map(c => c.high);
    const lows = ohlcv.map(c => c.low);
    
    // For volume, we need to fetch from market chart API
    const volumes = await fetchVolumeData(asset.coinId);

    return {
      asset: asset.symbol,
      prices,
      highs,
      lows,
      volumes,
      currentPrice: current.price,
    };
  } catch (error) {
    console.error(`Error fetching market data for ${asset.symbol}:`, error);
    return null;
  }
}

/**
 * Fetch volume data from CoinGecko market chart
 */
async function fetchVolumeData(coinId: string): Promise<number[]> {
  try {
    const url = `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily`;
    const headers: Record<string, string> = {
      "accept": "application/json",
    };
    
    if (COINGECKO_API_KEY) {
      headers["x-cg-demo-api-key"] = COINGECKO_API_KEY;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      // Fallback to zeros if volume data unavailable
      return new Array(30).fill(1000000); // Default volume
    }

    const data = await response.json();
    
    // Extract volume values: [[timestamp, volume], ...]
    return data.total_volumes?.map((v: number[]) => v[1]) || [];
  } catch (error) {
    console.error(`Failed to fetch volume data for ${coinId}:`, error);
    return new Array(30).fill(1000000); // Default volume
  }
}

/**
 * Fetch market data for all monitored assets
 */
export async function fetchAllMarketData(): Promise<MarketData[]> {
  const results: MarketData[] = [];
  
  for (const asset of CRYPTO_ASSETS) {
    const data = await fetchMarketData(asset);
    if (data) {
      results.push(data);
    }
    
    // Rate limiting: wait 1 second between requests (CoinGecko free tier)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}
