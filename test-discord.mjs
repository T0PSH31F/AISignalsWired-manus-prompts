/**
 * Test Discord Webhook Integration
 * Run with: node test-discord.mjs
 */

const DISCORD_WEBHOOK = "https://canary.discord.com/api/webhooks/1437089525666021497/j5Chc6wf83zF73lRA7OxURarLKsFLi70nPIKENtn8xQ6RxqYOT7yP7lYh1Mnp9h_yttV";

// Test signal data
const testSignal = {
  asset: "BTC/USD",
  action: "BUY",
  entryPrice: "45250.00",
  stopLoss: "44500.00",
  takeProfit: "47000.00",
  confidenceScore: 78,
  strategyType: "rsiBET",
  rationale: "RSI oversold + volume spike + bullish momentum detected"
};

async function testDiscordWebhook() {
  try {
    console.log("🧪 Testing Discord webhook integration...\n");

    const entryPrice = parseFloat(testSignal.entryPrice);
    const stopLoss = parseFloat(testSignal.stopLoss);
    const takeProfit = parseFloat(testSignal.takeProfit);
    const riskReward = ((takeProfit - entryPrice) / (entryPrice - stopLoss)).toFixed(2);

    const embed = {
      title: `🎯 ${testSignal.action} Signal: ${testSignal.asset}`,
      description: testSignal.rationale,
      color: 0x3de8b5, // Green for BUY
      fields: [
        {
          name: "📊 Entry Price",
          value: `$${entryPrice.toFixed(2)}`,
          inline: true,
        },
        {
          name: "🛑 Stop Loss",
          value: `$${stopLoss.toFixed(2)}`,
          inline: true,
        },
        {
          name: "🎯 Take Profit",
          value: `$${takeProfit.toFixed(2)}`,
          inline: true,
        },
        {
          name: "📈 Confidence",
          value: `${testSignal.confidenceScore}%`,
          inline: true,
        },
        {
          name: "⚖️ Risk:Reward",
          value: `1:${riskReward}`,
          inline: true,
        },
        {
          name: "🤖 Strategy",
          value: testSignal.strategyType,
          inline: true,
        },
      ],
      footer: {
        text: "AI Signals Wired • Trade responsibly",
      },
      timestamp: new Date().toISOString(),
    };

    const payload = {
      username: "AI Signals Wired",
      content: "🧪 **Test Signal - Discord Integration Verification**",
      embeds: [embed],
    };

    console.log("📤 Sending test signal to Discord...");
    console.log(`   Webhook: ${DISCORD_WEBHOOK.substring(0, 50)}...`);
    console.log(`   Signal: ${testSignal.action} ${testSignal.asset} @ $${testSignal.entryPrice}\n`);

    const response = await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log("✅ SUCCESS! Discord webhook test passed!");
      console.log("   Status: 204 No Content (expected for webhooks)");
      console.log("   Check your Discord channel for the test signal!\n");
      return true;
    } else {
      console.error("❌ FAILED! Discord webhook returned error:");
      console.error(`   Status: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      if (errorText) {
        console.error(`   Error: ${errorText}`);
      }
      return false;
    }
  } catch (error) {
    console.error("❌ FAILED! Error sending Discord webhook:");
    console.error(`   ${error.message}`);
    return false;
  }
}

// Run the test
testDiscordWebhook()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
