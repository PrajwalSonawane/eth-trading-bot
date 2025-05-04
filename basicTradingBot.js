const axios = require('axios');
const { SMA, EMA, RSI } = require('technicalindicators');
require('dotenv').config();
const Binance = require('binance-api-node').default;

const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
});

let priceHistory = [];

const SMA_PERIOD = 14;
const EMA_PERIOD = 14;
const RSI_PERIOD = 14;
const INTERVAL = 10 * 1000; // 10 seconds

async function fetchETHPrice() {
  try {
    const res = await axios.get(
      'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'
    );
    const price = parseFloat(res.data.price);
    console.log(`Current ETH/USDT: $${price}`);
    return price;
  } catch (err) {
    console.error('Error fetching price:', err.message);
    return null;
  }
}

async function placeOrder(side = 'BUY', quantity = '0.01', symbol = 'ETHUSDT') {
  try {
    const order = await client.order({
      symbol,
      side: side,
      type: 'MARKET',
      quantity: quantity,
    });
    console.log(`${side} order placed:`, order);
  } catch (err) {
    console.error(`Order error: ${err.message}`);
  }
}

async function getBalance(asset = 'USDT') {
  try {
    const account = await client.accountInfo();
    const balance = account.balances.find(b => b.asset === asset);
    console.log(`Balance of ${asset}:`, balance ? parseFloat(balance.free) : 0);
    return balance ? parseFloat(balance.free) : 0;
  } catch(err) {
    console.error(`Error fetching ${asset} balance from Binance:`, err.message);
    return 0;
  }
}

async function executeTrade(signal) {
  try {
    const ethBalance = await getBalance('ETH');
    const usdtBalance = await getBalance('USDT');

    if (signal === 'BUY' && usdtBalance > 10) {
      await placeOrder('BUY', '0.01', 'ETHUSDT');
    } else if (signal === 'SELL' && ethBalance > 0.01) {
      await placeOrder('SELL', '0.01', 'ETHUSDT');
    } else {
      console.log('Order execution skipped: Not enough balance or no valid signal');
    }
  } catch (err) {
    console.error('Error executing trade:', err.message);
  }
}

function analyzeIndicators(price) {
  priceHistory.push(price);
  if (priceHistory.length < RSI_PERIOD + 2) return; // wait for enough data

  // Trim history to avoid memory bloat
  if (priceHistory.length > 100) priceHistory.shift();

  const sma = SMA.calculate({ period: SMA_PERIOD, values: priceHistory });
  const ema = EMA.calculate({ period: EMA_PERIOD, values: priceHistory });
  const rsi = RSI.calculate({ period: RSI_PERIOD, values: priceHistory });

  const lastSMA = sma[sma.length - 1];
  const lastEMA = ema[ema.length - 1];
  const lastRSI = rsi[rsi.length - 1];

  console.log(`SMA: ${lastSMA?.toFixed(2)} | EMA: ${lastEMA?.toFixed(2)} | RSI: ${lastRSI?.toFixed(2)}`);

  // Simple decision logic
  if (price > lastSMA && lastRSI < 30) {
    console.log('🟢 BUY signal: Price above SMA and RSI low');
    executeTrade('BUY');
  } else if (price < lastSMA && lastRSI > 70) {
    console.log('🔴 SELL signal: Price below SMA and RSI high');
    executeTrade('SELL');
  } else {
    console.log('⏸️ No clear signal. Hold.');
  }
}

async function runBot() {
  const price = await fetchETHPrice();
  if (price) analyzeIndicators(price);
}

// Run the bot every 10 seconds
console.log('🤖 Trading bot started...');
setInterval(runBot, INTERVAL);
