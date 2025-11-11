/**
 * Discord Webhook Notification System
 * 
 * Sends formatted trading signal notifications to Discord channels via webhooks.
 * Supports rich embeds with color-coded signals and detailed trade information.
 */

interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
  };
  timestamp?: string;
}

interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: DiscordEmbed[];
}

interface SignalNotification {
  asset: string;
  action: "BUY" | "SELL";
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  confidenceScore: number;
  strategyType: string;
  rationale?: string;
}

/**
 * Send a trading signal notification to Discord
 */
export async function sendDiscordSignal(
  webhookUrl: string,
  signal: SignalNotification
): Promise<boolean> {
  try {
    const isBuy = signal.action === "BUY";
    const color = isBuy ? 0x3de8b5 : 0xff6767; // Green for BUY, Red for SELL
    
    const entryPrice = parseFloat(signal.entryPrice);
    const stopLoss = parseFloat(signal.stopLoss);
    const takeProfit = parseFloat(signal.takeProfit);
    const riskReward = ((takeProfit - entryPrice) / (entryPrice - stopLoss)).toFixed(2);

    const embed: DiscordEmbed = {
      title: `🎯 ${signal.action} Signal: ${signal.asset}`,
      description: signal.rationale || "AI-powered trading signal generated",
      color: color,
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
          value: `${signal.confidenceScore}%`,
          inline: true,
        },
        {
          name: "⚖️ Risk:Reward",
          value: `1:${riskReward}`,
          inline: true,
        },
        {
          name: "🤖 Strategy",
          value: signal.strategyType,
          inline: true,
        },
      ],
      footer: {
        text: "AI Signals Wired • Trade responsibly",
      },
      timestamp: new Date().toISOString(),
    };

    const payload: DiscordWebhookPayload = {
      username: "AI Signals Wired",
      avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png",
      embeds: [embed],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Discord webhook failed: ${response.status} ${response.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending Discord notification:", error);
    return false;
  }
}

/**
 * Send a batch of signals to Discord (max 10 embeds per message)
 */
export async function sendDiscordSignalBatch(
  webhookUrl: string,
  signals: SignalNotification[]
): Promise<boolean> {
  try {
    // Discord allows max 10 embeds per message
    const embeds: DiscordEmbed[] = signals.slice(0, 10).map((signal) => {
      const isBuy = signal.action === "BUY";
      const color = isBuy ? 0x3de8b5 : 0xff6767;
      
      const entryPrice = parseFloat(signal.entryPrice);
      const stopLoss = parseFloat(signal.stopLoss);
      const takeProfit = parseFloat(signal.takeProfit);
      const riskReward = ((takeProfit - entryPrice) / (entryPrice - stopLoss)).toFixed(2);

      return {
        title: `${signal.action} ${signal.asset}`,
        color: color,
        fields: [
          {
            name: "Entry",
            value: `$${entryPrice.toFixed(2)}`,
            inline: true,
          },
          {
            name: "Stop",
            value: `$${stopLoss.toFixed(2)}`,
            inline: true,
          },
          {
            name: "Target",
            value: `$${takeProfit.toFixed(2)}`,
            inline: true,
          },
          {
            name: "Confidence",
            value: `${signal.confidenceScore}%`,
            inline: true,
          },
          {
            name: "R:R",
            value: `1:${riskReward}`,
            inline: true,
          },
          {
            name: "Strategy",
            value: signal.strategyType,
            inline: true,
          },
        ],
        footer: {
          text: "AI Signals Wired",
        },
        timestamp: new Date().toISOString(),
      };
    });

    const payload: DiscordWebhookPayload = {
      username: "AI Signals Wired",
      content: `📊 **${signals.length} New Trading Signal${signals.length > 1 ? 's' : ''}**`,
      embeds: embeds,
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Discord webhook failed: ${response.status} ${response.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending Discord batch notification:", error);
    return false;
  }
}

/**
 * Send a system alert to Discord (circuit breaker, errors, etc.)
 */
export async function sendDiscordAlert(
  webhookUrl: string,
  title: string,
  message: string,
  severity: "info" | "warning" | "error" = "info"
): Promise<boolean> {
  try {
    const colorMap = {
      info: 0x61ffca, // Cyan
      warning: 0xffca85, // Orange
      error: 0xff6767, // Red
    };

    const iconMap = {
      info: "ℹ️",
      warning: "⚠️",
      error: "🚨",
    };

    const embed: DiscordEmbed = {
      title: `${iconMap[severity]} ${title}`,
      description: message,
      color: colorMap[severity],
      fields: [],
      footer: {
        text: "AI Signals Wired System Alert",
      },
      timestamp: new Date().toISOString(),
    };

    const payload: DiscordWebhookPayload = {
      username: "AI Signals Wired",
      embeds: [embed],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Discord webhook failed: ${response.status} ${response.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending Discord alert:", error);
    return false;
  }
}
