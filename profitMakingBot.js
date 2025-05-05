const axios = require("axios");
const BigNumber = require("bignumber.js");
require("dotenv").config();
const Binance = require("binance-api-node").default;

const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
});

// Config variables
const INTERVAL = 10 * 1000; // 10 seconds (bot runs every 10 seconds)
const USDT_TRADE_AMOUNT = 10; // Amount of USDT to trade
const tradingPairs = [
  { buyTime: "01:35", sellTime: "03:49" },
  { buyTime: "07:59", sellTime: "12:22" },
  { buyTime: "13:59", sellTime: "19:56" }
];

let ethToSell = new BigNumber(0); // Track the amount of ETH to sell
let usdtSpentActual = new BigNumber(0); // Track the actual USDT spent while buying ETH
let buyPrice = 0; // Store buy price at 01:16 UTC

async function sendTelegramMessage(message) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: "Markdown",
  };

  try {
    await axios.post(url, payload);
    console.log("Telegram message sent");
  } catch (err) {
    console.error("Failed to send Telegram message:", err.message);
  }
}

// fetchs the current ETH price from Binance API
async function fetchETHPrice() {
  try {
    const res = await axios.get(
      "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"
    );
    const price = parseFloat(res.data.price);
    console.log(`Current ETH/USDT: $${price}`);
    return price;
  } catch (err) {
    console.error("Error fetching price:", err.message);
    return null;
  }
}

async function placeOrder(side = "BUY", quantity = "0.01", symbol = "ETHUSDT") {
  try {
    const order = await client.order({
      symbol,
      side: side,
      type: "MARKET",
      quantity: quantity,
    });
    console.log(`${side} order placed:`, order);
    return order;
  } catch (err) {
    console.error(`Order error: ${err.message}`);
  }
}

async function getBalance(asset = "USDT") {
  try {
    const account = await client.accountInfo();

    const balance = account.balances.find((b) => b.asset === asset);
    if (balance) {
      const freeBalance = new BigNumber(balance.free);
      console.log(`Balance of ${asset}:`, freeBalance.toString()); // Use toString for string representation
      return freeBalance; // Returning BigNumber for precision
    }
    return new BigNumber(0); // Return 0 as BigNumber if no balance found
  } catch (err) {
    console.error(`Error fetching ${asset} balance from Binance:`, err.message);
    return new BigNumber(0); // Return 0 as BigNumber in case of error
  }
}

async function executeBuyOrder() {
  const usdtBalance = await getBalance("USDT");

  if (usdtBalance.isGreaterThanOrEqualTo(new BigNumber(USDT_TRADE_AMOUNT))) {
    try {
      const order = await client.order({
        symbol: "ETHUSDT",
        side: "BUY",
        type: "MARKET",
        quoteOrderQty: USDT_TRADE_AMOUNT, // This will buy USDT_TRADE_AMOUNT USDT worth of ETH
      });

      const executedQty = new BigNumber(order.executedQty); // Total ETH bought (but we hve to subtract commission)
      let totalCommission = new BigNumber(0);

      for (const fill of order.fills) {
        if (fill.commissionAsset === "ETH") {
          totalCommission = totalCommission.plus(fill.commission);
        } else {
          console.warn(`Unexpected commission asset: ${fill.commissionAsset}`);
        }
      }

      const actualEthReceived = executedQty.minus(totalCommission);

      ethToSell = actualEthReceived; // Track the ETH bought for selling later
      usdtSpentActual = new BigNumber(order.cummulativeQuoteQty);

      console.log(
        `Bought ${actualEthReceived.toString()} ETH (after fees) using ${
          order.cummulativeQuoteQty
        } USDT Successfully`
      );
      console.log("Order details:", order);

      // Send summary message to Telegram
      const message = `🟢 *Trade Summary*\n\n*Buy Executed*\nBought: \`${actualEthReceived.toString()} ETH\`\nSpent: \`${usdtSpentActual.toString()} USDT\`\n`;

      await sendTelegramMessage(message);
    } catch (err) {
      console.error("Error executing buy order:", err.message);
    }
  } else {
    console.log("Not enough USDT to place buy order");
  }
}

function roundToStepSize(quantity, stepSize = "0.0001") {
  const qty = new BigNumber(quantity);
  const step = new BigNumber(stepSize);
  return qty.div(step).integerValue(BigNumber.ROUND_DOWN).times(step);
}

async function executeSellOrder() {
  try {
    const ethBalance = await getBalance("ETH");

    if (ethBalance.isGreaterThanOrEqualTo(ethToSell)) {
      const roundedQty = roundToStepSize(ethToSell, "0.0001"); // Round to step size of 0.0001 ETH
      const order = await placeOrder("SELL", roundedQty.toFixed(8), "ETHUSDT");

      const totalReceived = new BigNumber(order.cummulativeQuoteQty); // Total USDT before fees
      let totalCommission = new BigNumber(0);

      if (Array.isArray(order.fills)) {
        for (const fill of order.fills) {
          if (fill.commissionAsset === "USDT") {
            totalCommission = totalCommission.plus(fill.commission);
          }
        }
      }

      const netReceived = totalReceived.minus(totalCommission);

      const leftoverEth = ethToSell.minus(roundedQty);
      // Fetch current ETH price to value the unsold portion
      const ethPrice = await fetchETHPrice();
      const leftoverValue = leftoverEth.times(ethPrice);

      const totalProfit = netReceived.minus(usdtSpentActual);
      const totalProfitConsideringLeftoverETH = totalProfit.plus(leftoverValue);

      console.log(
        `Sold ${roundedQty.toString()} ETH for ${netReceived.toString()} USDT Successfully`
      );
      console.log(`Leftover ETH: ${leftoverEth.toString()} worth ~${leftoverValue.toString()} USDT`);
      console.log(
        "Realized Profit/Loss (without leftover ETH):",
        totalProfit.toString()
      );
      console.log(`Total Profit/Loss (including leftover ETH): ${totalProfitConsideringLeftoverETH.toString()} USDT`);
      console.log("Order details:", order);

      // Send summary message to Telegram
      const message = `🔴 *Trade Summary*\n\n*Sell Executed*\nSold: \`${roundedQty.toString()} ETH\`\nReceived: \`${netReceived.toString()} USDT\`\n\n*Leftover ETH*: \`${leftoverEth.toString()}\`\nValue: \`${leftoverValue.toString()} USDT\`\n\n*Realized P/L*: \`${totalProfit.toString()} USDT\`\n*Total P/L (with leftover)*: \`${totalProfitConsideringLeftoverETH.toString()} USDT\``;

      await sendTelegramMessage(message);

      // Reset ethToSell and usdtSpentActual to prevent duplicate sell
      ethToSell = new BigNumber(0);
      usdtSpentActual = new BigNumber(0);
    } else {
      console.log("Not enough ETH to sell");
    }
  } catch (err) {
    console.error("Error executing sell order:", err.message);
  }
}

function findCurrentPairIndex(currentTime) {
  for (let i = 0; i < tradingPairs.length; i++) {
    const { buyTime, sellTime } = tradingPairs[i];
    if (currentTime >= buyTime && currentTime <= sellTime) {
      return i;
    }
  }
  return -1;
}

async function runBot() {
  const currentTime = new Date().toISOString().slice(11, 16); // Get current UTC time in HH:MM format
  console.log(`Current UTC time: ${currentTime}`);

  const index = findCurrentPairIndex(currentTime);
  if (index === -1) {
    // current time is not within any trading pair's buy/sell time Interval
    return;
  }

  const { buyTime, sellTime } = tradingPairs[index];
  // Check if it's time to buy
  if (currentTime === buyTime && ethToSell.isEqualTo(0)) {
    console.log(`Executing Buy for interval #${index + 1}`);
    await executeBuyOrder();
  }

  // Check if it's time to sell
  if (currentTime === sellTime && ethToSell.isGreaterThan(0)) {
    console.log(`Executing Sell for interval #${index + 1}`);
    await executeSellOrder();
  }
}

// Run the bot every 10 seconds
console.log("Trading bot started...");
setInterval(runBot, INTERVAL);
