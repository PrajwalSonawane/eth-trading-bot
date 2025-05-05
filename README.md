# Profit Making Trading Bot

This is a simple **Trading Bot** that interacts with the **Binance API** to execute buy and sell orders on the **ETH/USDT** pair. The bot executes trades at scheduled times and tracks the profit made from those trades.

## Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)
- Binance API keys (API Key and Secret)

## Setup Instructions

Follow the steps below to get the bot running on your local machine:

### 1. Clone the repository

Clone the repository to your local machine using the following command:

```
git clone https://github.com/your-username/eth-trading-bot.git
cd eth-trading-bot
```

### 2. Install dependencies

```npm install```

### 3. Create .env file

Create a .env file in the root directory of the project and add the following API keys:  
BINANCE_API_KEY=your-binance-api-key  
BINANCE_API_SECRET=your-binance-api-secret  
TELEGRAM_BOT_TOKEN=your-telegram-bot-token  
TELEGRAM_CHAT_ID=chat-id  

You can generate these keys from your Binance account and telegram. Make sure the API has access to the necessary permissions (e.g., Spot trading permissions).

### 4. Running the Bot

Once the dependencies are installed and the .env file is configured, you can start the bot with the following command:

```node profitMakingBot.js```

The bot will run and start making trades based on the specified parameters in the script.

Use pm2 for smooth running of bot  
Commands:  
**Install**: npm install pm2 -g  
**Start Bot:** pm2 start profitMakingBot.js --name "eth-trading-bot"  
**Show logs:** pm2 logs eth-trading-bot  
**Stop the bot:** pm2 stop eth-trading-bot  
**Restart the bot after code changes:** pm2 restart eth-trading-bot  

### 5. Customization

Trade Times: You can adjust the buy and sell times in the code to match your desired schedule.

Amount: You can change the amount of ETH to trade by modifying the **global variables** in the script.

Market Pair: The script is set to trade **ETH/USDT**. You can modify it to trade other pairs if needed.

### Notes
Ensure you have **sufficient funds** in your Binance account to execute trades.

The bot uses market orders, so trades will be executed at the current market price.

Make sure to test the bot in a safe environment with a **small amount** of funds before using it with a larger amount.
