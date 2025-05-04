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
const buyTime = "19:00"; // Time to buy (UTC)
const sellTime = "19:06"; // Time to sell (UTC)


let ethToSell = new BigNumber(0); // Track the amount of ETH to sell
let usdtSpentActual = new BigNumber(0); // Track the actual USDT spent while buying ETH
let buyPrice = 0; // Store buy price at 01:16 UTC


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

  if (usdtBalance.isGreaterThanOrEqualTo(new BigNumber(10))) {
    try {
      const order = await client.order({
        symbol: "ETHUSDT",
        side: "BUY",
        type: "MARKET",
        quoteOrderQty: 10, // This will buy 10 USDT worth of ETH
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
        `Bought ${actualEthReceived.toFixed(8)} ETH (after fees) using ${
          order.cummulativeQuoteQty
        } USDT Successfully`
      );
      console.log("Order details:", order);
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

      console.log(
        `Sold ${roundedQty.toFixed(8)} ETH for ${netReceived.toString()} USDT Successfully`
      );
      console.log(
        "Net profit is",
        netReceived.minus(usdtSpentActual).toString()
      );
      console.log("Order details:", order);

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

async function runBot() {
  const currentTime = new Date().toISOString().slice(11, 16); // Get current UTC time in HH:MM format
  console.log(`Current UTC time: ${currentTime}`);


  // Check if it's time to buy (01:16 UTC)
  if (currentTime === buyTime && ethToSell.isEqualTo(0)) {
    console.log("Buying ETH with 10 USDT...");
    await executeBuyOrder();
  }

  // Check if it's time to sell (03:46 UTC)
  if (currentTime === sellTime && ethToSell.isGreaterThan(0)) {
    console.log("Selling ETH...");
    await executeSellOrder();
  }
}

// Run the bot every 10 seconds
console.log("Trading bot started...");
setInterval(runBot, INTERVAL);
