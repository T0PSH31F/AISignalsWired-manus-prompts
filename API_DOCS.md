# API Documentation - AI Signals Wired

## Base URL
```
Production: https://api.aisignalswired.com/v1
Development: http://localhost:3000/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Elite tier users can also authenticate via API key:
```
X-API-Key: <your_api_key>
```

---

## Rate Limiting

| Tier | Requests per 15 min |
|------|---------------------|
| Free | 100 |
| Basic | 300 |
| Premium | 1,000 |
| Elite | 5,000 |

Rate limit headers included in every response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1699564800
```

---

## Authentication Endpoints

### POST /api/auth/register
Create a new user account.

**Request Body:**
```json
{
  "email": "trader@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Trader"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "trader@example.com",
      "subscription_tier": "free",
      "created_at": "2025-11-09T20:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Account created. Check email for verification."
}
```

---

### POST /api/auth/login
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "trader@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "trader@example.com",
      "subscription_tier": "premium"
    }
  }
}
```

---

### POST /api/auth/verify-email
Verify email with token sent to inbox.

**Request Body:**
```json
{
  "token": "abc123def456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## Signal Endpoints

### GET /api/signals/latest
Retrieve recent signals (filtered by your subscription tier).

**Query Parameters:**
- `limit` (optional): Number of signals (default: 10, max: 100)
- `asset` (optional): Filter by asset (e.g., "BTC/USD")
- `strategy` (optional): Filter by strategy type
- `outcome` (optional): Filter by outcome ("open", "win", "loss")

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN"   "https://api.aisignalswired.com/v1/signals/latest?limit=5&asset=BTC/USD"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "signals": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "asset": "BTC/USD",
        "action": "BUY",
        "strategy_type": "rsiBET",
        "entry_price": 43250.00,
        "stop_loss": 42100.00,
        "take_profit": 45800.00,
        "position_size_percent": 2.00,
        "confidence_score": 87,
        "rationale": "RSI dropped to 28 with 2.3x volume spike above EMA20",
        "created_at": "2025-11-09T14:30:00Z",
        "outcome": "open",
        "timeframe": "1h"
      }
    ],
    "pagination": {
      "total": 243,
      "page": 1,
      "limit": 5,
      "pages": 49
    }
  }
}
```

---

### GET /api/signals/:id
Get detailed information about a specific signal.

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN"   "https://api.aisignalswired.com/v1/signals/550e8400-e29b-41d4-a716-446655440000"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "signal": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "asset": "BTC/USD",
      "action": "BUY",
      "strategy_type": "rsiBET",
      "entry_price": 43250.00,
      "stop_loss": 42100.00,
      "take_profit": 45800.00,
      "confidence_score": 87,
      "rationale": "RSI dropped to 28 with 2.3x volume spike above EMA20",
      "created_at": "2025-11-09T14:30:00Z",
      "closed_at": "2025-11-09T18:45:00Z",
      "outcome": "win",
      "actual_return_percent": 5.9,
      "indicators": {
        "rsi": 28.3,
        "volume_ratio": 2.31,
        "ema20": 42800.00,
        "atr": 383.50
      }
    }
  }
}
```

---

### GET /api/signals/performance
Get aggregate performance statistics.

**Query Parameters:**
- `days` (optional): Lookback period (default: 30, max: 365)
- `strategy` (optional): Filter by specific strategy

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN"   "https://api.aisignalswired.com/v1/signals/performance?days=30"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": {
      "days": 30,
      "start_date": "2025-10-10",
      "end_date": "2025-11-09"
    },
    "overall": {
      "total_signals": 623,
      "closed_signals": 580,
      "open_signals": 43,
      "winners": 391,
      "losers": 189,
      "win_rate": 67.4,
      "avg_winner_percent": 4.2,
      "avg_loser_percent": -2.1,
      "risk_reward_ratio": 2.0,
      "total_return_percent": 128.6
    },
    "by_strategy": [
      {
        "strategy": "macdCrossover",
        "signals": 145,
        "win_rate": 68.3,
        "avg_return": 2.8
      },
      {
        "strategy": "tema",
        "signals": 132,
        "win_rate": 65.7,
        "avg_return": 2.5
      }
    ]
  }
}
```

---

## User Endpoints

### GET /api/users/me
Get current user profile and subscription details.

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN"   "https://api.aisignalswired.com/v1/users/me"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "trader@example.com",
      "subscription_tier": "premium",
      "email_verified": true,
      "discord_webhook": "https://discord.com/api/webhooks/...",
      "created_at": "2025-10-01T00:00:00Z",
      "subscription": {
        "status": "active",
        "current_period_end": "2025-12-01T00:00:00Z",
        "cancel_at_period_end": false
      },
      "usage": {
        "signals_viewed_today": 23,
        "api_calls_today": 145
      }
    }
  }
}
```

---

### PUT /api/users/me
Update user profile settings.

**Request Body:**
```json
{
  "discord_webhook": "https://discord.com/api/webhooks/YOUR_WEBHOOK",
  "email_frequency": "immediate",
  "notification_preferences": {
    "email_enabled": true,
    "discord_enabled": true,
    "min_confidence": 80
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

### POST /api/users/api-key
Generate API key (Elite tier only).

**Response (201):**
```json
{
  "success": true,
  "data": {
    "api_key": "ask_live_1a2b3c4d5e6f7g8h9i0j",
    "created_at": "2025-11-09T20:00:00Z"
  },
  "message": "Store this key securely. It won't be shown again."
}
```

---

### DELETE /api/users/api-key
Revoke API key.

**Response (200):**
```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

---

## Subscription Endpoints

### POST /api/subscriptions/checkout
Create Stripe checkout session.

**Request Body:**
```json
{
  "price_id": "price_premium_monthly",
  "success_url": "https://aisignalswired.com/dashboard?success=true",
  "cancel_url": "https://aisignalswired.com/pricing"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_...",
    "session_id": "cs_test_..."
  }
}
```

---

### GET /api/subscriptions/status
Check current subscription status.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "tier": "premium",
      "status": "active",
      "current_period_end": "2025-12-01T00:00:00Z",
      "cancel_at_period_end": false,
      "price_per_month": 149
    }
  }
}
```

---

### POST /api/subscriptions/cancel
Cancel subscription (access continues until period end).

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription canceled. Access continues until Dec 1, 2025."
}
```

---

## WebSocket (Real-Time Signals)

**Available to:** Premium & Elite tiers only

**Connection:**
```javascript
const ws = new WebSocket('wss://api.aisignalswired.com/ws/signals/live');

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'YOUR_JWT_TOKEN'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'signal') {
    console.log('New signal:', data.payload);
    // { asset: 'BTC/USD', action: 'BUY', ... }
  }
};
```

**Message Types:**
- `auth_success`: Authentication confirmed
- `signal`: New trading signal published
- `performance_update`: Daily stats update
- `strategy_status`: Strategy paused/resumed notification

---

## Webhooks (Elite Tier)

Elite users can register webhook URLs to receive signals at their own endpoints.

**Configure in Dashboard:**
Settings → Integrations → Webhook URL

**Payload Format:**
```json
{
  "event": "signal.created",
  "timestamp": "2025-11-09T20:00:00Z",
  "data": {
    "signal": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "asset": "BTC/USD",
      "action": "BUY",
      "entry_price": 43250.00,
      "stop_loss": 42100.00,
      "take_profit": 45800.00,
      "confidence_score": 87
    }
  }
}
```

**Signature Verification:**
All webhooks include `X-Signature` header:
```
X-Signature: sha256=abc123...
```

Verify with:
```javascript
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', YOUR_WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');
```

---

## Error Responses

All errors follow consistent format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password incorrect",
    "details": null
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` (401): Missing or invalid auth token
- `FORBIDDEN` (403): Insufficient subscription tier
- `NOT_FOUND` (404): Resource doesn't exist
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `VALIDATION_ERROR` (422): Invalid request data
- `INTERNAL_ERROR` (500): Server error

---

## Code Examples

### Python
```python
import requests

API_URL = "https://api.aisignalswired.com/v1"
TOKEN = "your_jwt_token"

headers = {"Authorization": f"Bearer {TOKEN}"}

# Get latest signals
response = requests.get(f"{API_URL}/signals/latest?limit=10", headers=headers)
signals = response.json()['data']['signals']

for signal in signals:
    print(f"{signal['action']} {signal['asset']} at ${signal['entry_price']}")
```

### JavaScript (Node.js)
```javascript
const axios = require('axios');

const API_URL = 'https://api.aisignalswired.com/v1';
const TOKEN = 'your_jwt_token';

const api = axios.create({
  baseURL: API_URL,
  headers: { Authorization: `Bearer ${TOKEN}` }
});

async function getLatestSignals() {
  const { data } = await api.get('/signals/latest?limit=10');
  return data.data.signals;
}

getLatestSignals().then(signals => {
  signals.forEach(signal => {
    console.log(`${signal.action} ${signal.asset} @ $${signal.entry_price}`);
  });
});
```

### cURL
```bash
# Get latest signals
curl -H "Authorization: Bearer YOUR_TOKEN"   "https://api.aisignalswired.com/v1/signals/latest?limit=10"

# Get performance stats
curl -H "Authorization: Bearer YOUR_TOKEN"   "https://api.aisignalswired.com/v1/signals/performance?days=30"

# Update profile
curl -X PUT   -H "Authorization: Bearer YOUR_TOKEN"   -H "Content-Type: application/json"   -d '{"discord_webhook":"https://discord.com/api/webhooks/..."}'   "https://api.aisignalswired.com/v1/users/me"
```

---

## Support

- **Documentation**: https://docs.aisignalswired.com
- **API Status**: https://status.aisignalswired.com
- **Discord**: https://discord.gg/aisignalswired
- **Email**: api-support@aisignalswired.com

---

**Last Updated**: November 9, 2025
