# Alpaca WebSocket Integration

This document explains the Alpaca WebSocket integration for real-time stock data in the VoxProfit app.

## Overview

The integration provides real-time stock price updates using Alpaca's WebSocket API. Instead of polling for data, the app receives live price updates,
trades, and quotes as they happen.

## Architecture

### 1. WebSocket Client (`alpacaWebSocket.ts`)

- Handles connection to Alpaca's WebSocket endpoint
- Manages authentication with API keys
- Processes incoming messages (trades, quotes, bars)
- Handles reconnection logic
- Manages subscriptions to stock symbols

### 2. React Hook (`useAlpacaWebSocket.ts`)

- Provides a clean React interface to the WebSocket client
- Manages connection state
- Handles stock data updates
- Provides subscription management functions

### 3. Component Integration (`stocks.tsx`)

- Uses the hook to connect to real-time data
- Merges real-time updates with existing stock data
- Shows connection status to users
- Handles pagination with real-time subscriptions

## Features

### Real-time Data

- **Trades**: Live trade execution data with price, volume, and timestamp
- **Quotes**: Bid/ask prices and sizes
- **Bars**: OHLCV data for price movements

### Connection Management

- Automatic connection on app startup
- Reconnection with exponential backoff
- Connection status indicators
- Error handling and user notifications

### Subscription Management

- Subscribe to specific stock symbols
- Automatic subscription when loading new pages
- Unsubscribe when no longer needed
- Efficient batch subscriptions
- **Symbol Limit Handling**: Automatic management of IEX feed limits
- **Subscription Queue**: Queue symbols when at capacity
- **Smart Pagination**: Replace subscriptions for new page views

### Symbol Limit Management

- **IEX Feed Limit**: 30 concurrent symbol subscriptions
- **Batch Processing**: Subscribe in batches of 10 symbols
- **Queue System**: Automatically queue symbols when limit reached
- **Smart Replacement**: Replace subscriptions when viewing new pages
- **Error Recovery**: Automatic reduction of subscriptions on limit errors

## Usage

### Basic Usage with Hook

```typescript
import { useAlpacaWebSocket } from '@hooks/useAlpacaWebSocket';

const MyComponent = () => {
  const {
    connectionState,
    stockUpdates,
    subscribe,
    isAuthenticated
  } = useAlpacaWebSocket({
    onError: (error) => console.error('WebSocket error:', error)
  });

  // Subscribe to symbols when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      subscribe(['AAPL', 'MSFT', 'GOOGL']);
    }
  }, [isAuthenticated, subscribe]);

  // Access real-time data
  const appleData = stockUpdates.get('AAPL');

  return (
    <View>
      <Text>Connection: {connectionState}</Text>
      {appleData && (
        <Text>AAPL: ${appleData.price.toFixed(2)}</Text>
      )}
    </View>
  );
};
```

### Direct Client Usage

```typescript
import { initializeAlpacaWebSocket } from "@utils/alpacaWebSocket";

const client = await initializeAlpacaWebSocket({
  onStockUpdate: (data) => {
    console.log(`${data.symbol}: $${data.price}`);
  },
  onConnectionStateChange: (state) => {
    console.log("Connection:", state);
  },
});

// Subscribe to symbols
client.subscribeToStocks(["AAPL", "MSFT"]);
```

### Subscription Management Example

```typescript
import { useAlpacaWebSocket } from "@hooks/useAlpacaWebSocket";

const StockList = () => {
  const {
    connectionState,
    stockUpdates,
    subscribe,
    replaceSubscriptions,
    getSubscriptionStatus,
    isAuthenticated
  } = useAlpacaWebSocket();

  // Check subscription status
  const status = getSubscriptionStatus();
  console.log(`Subscribed: ${status.subscribed}/${status.limit}`);
  console.log(`Queued: ${status.queued}`);

  // Replace all subscriptions when viewing new page
  const handlePageChange = (newSymbols: string[]) => {
    replaceSubscriptions(newSymbols);
  };

  // Add symbols if space available
  const handleAddSymbols = (symbols: string[]) => {
    if (status.available > 0) {
      subscribe(symbols);
    } else {
      console.log('At symbol limit, symbols will be queued');
      subscribe(symbols); // Will automatically queue
    }
  };

  return (
    <View>
      <Text>Status: {connectionState}</Text>
      <Text>Live Symbols: {status.subscribed}/{status.limit}</Text>
      {status.queued > 0 && <Text>Queued: {status.queued}</Text>}
    </View>
  );
};
```

## Configuration

### API Credentials

```typescript
// In utils/getStocksData.ts
export const ALPACA_API_KEY = "your_api_key";
export const ALPACA_SECRET_KEY = "your_secret_key";
```

### WebSocket Endpoint

- **IEX Feed**: `wss://stream.data.alpaca.markets/v2/iex` (free, delayed)
- **SIP Feed**: `wss://stream.data.alpaca.markets/v2/sip` (paid, real-time)

Current implementation uses IEX feed for demo purposes.

### Symbol Limits

- **IEX Feed**: Maximum 30 concurrent subscriptions
- **SIP Feed**: Higher limits (requires paid subscription)
- **Automatic Management**: Queue system handles limit overruns
- **Batch Size**: 10 symbols per subscription request

## Message Types

### Trade Messages

```typescript
{
  T: 't',           // Message type
  S: 'AAPL',        // Symbol
  p: 150.25,        // Price
  s: 100,           // Size
  t: '2023-...',    // Timestamp
  x: 'K',           // Exchange
  // ... other fields
}
```

### Quote Messages

```typescript
{
  T: 'q',           // Message type
  S: 'AAPL',        // Symbol
  bp: 150.20,       // Bid price
  ap: 150.25,       // Ask price
  bs: 100,          // Bid size
  as: 200,          // Ask size
  // ... other fields
}
```

## Connection States

- `disconnected`: No connection
- `connecting`: Attempting to connect
- `connected`: Connected but not authenticated
- `authenticated`: Ready to receive data
- `error`: Connection error occurred

## Error Handling

### Automatic Reconnection

- Exponential backoff strategy
- Maximum retry attempts (5)
- Re-subscription to previous symbols

### Symbol Limit Handling

- Automatic detection of limit errors (code 405)
- Smart reduction of subscriptions
- Queue management for pending symbols
- User notifications for limit issues

### User Notifications

- Connection status indicators
- Error alerts for critical failures
- Fallback to cached data when disconnected

## Performance Considerations

### Subscription Management

- Only subscribe to visible stocks
- Unsubscribe when navigating away
- Batch subscriptions for efficiency
- Automatic queue management

### Memory Management

- Cleanup connections on component unmount
- Limit stored real-time data
- Efficient Map-based storage

### Rate Limiting

- Alpaca has connection limits
- Single connection per user
- Efficient message processing

## Troubleshooting

### Common Issues

1. **Authentication Failures**

   - Check API credentials
   - Verify account has data permissions
   - Check network connectivity

2. **Connection Drops**

   - Network issues
   - API rate limiting
   - Alpaca service interruptions

3. **Symbol Limit Exceeded**

   - Reduce number of simultaneous subscriptions
   - Use pagination to manage symbol visibility
   - Check subscription status regularly

4. **Missing Data**
   - Symbol not available on feed
   - Market hours restrictions
   - Subscription not confirmed

### Debug Mode

Enable detailed logging by setting debug flags in the WebSocket client.

## Future Enhancements

- Support for crypto data streams
- Options data integration
- Custom alert system
- Historical data backfill
- Advanced charting integration
- Dynamic symbol prioritization

## Resources

- [Alpaca WebSocket Documentation](https://docs.alpaca.markets/docs/real-time-stock-pricing-data)
- [Alpaca API Reference](https://docs.alpaca.markets/)
- [React Native WebSocket Guide](https://reactnative.dev/docs/network)

```

```
