# Frontend Widget Architecture

This directory contains an example of how to create a secure frontend widget that integrates with the server-side Soroswap SDK.

## 🔐 Security Architecture

The widget follows a secure architecture where:

1. **Frontend Widget**: Handles UI/UX and user interactions
2. **Backend API**: Uses the Soroswap SDK for sensitive operations
3. **Clear Separation**: No sensitive data (credentials, tokens) exposed to frontend

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Frontend       │    │  Your Backend   │    │  Soroswap API   │
│  Widget         │◄──►│  (SDK)          │◄──►│                 │
│                 │    │                 │    │                 │
│ • UI/UX         │    │ • Authentication│    │ • Quotes        │
│ • User Input    │    │ • SDK Calls     │    │ • Transactions  │
│ • Wallet Conn.  │    │ • Token Mgmt    │    │ • Pool Data     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Implementation

### Backend Setup

Create API endpoints that use the Soroswap SDK:

```typescript
// server.ts
import express from 'express';
import { SoroswapSDK } from 'soroswap-sdk';

const app = express();
const sdk = new SoroswapSDK({
  email: process.env.SOROSWAP_EMAIL!,
  password: process.env.SOROSWAP_PASSWORD!
});

app.post('/api/quote', async (req, res) => {
  try {
    const quote = await sdk.quote(req.body);
    // Only return necessary data to frontend
    res.json({
      trade: quote.trade,
      priceImpact: quote.priceImpact,
      xdr: quote.xdr // Safe to send XDR to frontend for signing
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/send', async (req, res) => {
  try {
    const { signedXdr, network } = req.body;
    const result = await sdk.send(signedXdr, 100, network);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Frontend Integration

The frontend widget handles:

1. **User Interface**: Token selection, amount input, network switching
2. **Quote Requests**: Calls backend API for quotes
3. **Wallet Integration**: Signs transactions locally
4. **Transaction Submission**: Sends signed XDR to backend

### Key Features

- **Network Selection**: Switch between mainnet/testnet
- **Token Swapping**: Intuitive token swap interface
- **Real-time Quotes**: Live quote updates
- **Price Impact Display**: Shows slippage and routing info
- **Error Handling**: User-friendly error messages
- **Loading States**: Clear loading indicators

### Security Benefits

✅ **Credentials Protected**: Never exposed to frontend
✅ **Token Management**: Handled server-side only  
✅ **API Rate Limiting**: Controlled by your backend
✅ **User Validation**: Can add custom validation logic
✅ **Audit Trail**: Server-side logging of all operations

## 🛠️ Customization

You can customize the widget by:

1. **Styling**: Modify CSS to match your brand
2. **Token Lists**: Add/remove supported tokens
3. **Features**: Add slippage settings, advanced options
4. **Integrations**: Connect to different wallet providers
5. **Analytics**: Add tracking and monitoring

## 📱 Mobile Responsive

The widget is designed to be responsive and works well on:
- Desktop browsers
- Mobile web browsers  
- WebView components
- PWA applications

## 🔗 Integration Examples

### React Integration

```jsx
// SwapWidget.jsx
import React, { useState } from 'react';

const SwapWidget = () => {
  const [quote, setQuote] = useState(null);
  
  const getQuote = async (params) => {
    const response = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const quoteData = await response.json();
    setQuote(quoteData);
  };
  
  // ... rest of component
};
```

### Vue.js Integration

```vue
<!-- SwapWidget.vue -->
<template>
  <div class="swap-widget">
    <!-- Widget UI -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      quote: null,
      loading: false
    }
  },
  methods: {
    async getQuote(params) {
      this.loading = true;
      try {
        const response = await this.$http.post('/api/quote', params);
        this.quote = response.data;
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
```

## 🚀 Deployment

1. Deploy your backend with the Soroswap SDK
2. Host the frontend widget (static files)
3. Configure CORS for cross-origin requests
4. Set up environment variables for credentials
5. Monitor and log API usage

This architecture ensures security while providing a smooth user experience! 