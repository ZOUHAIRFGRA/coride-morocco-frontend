# Location Caching - Usage Guide

## Quick Start

### Using Cached Location in Any Component

```typescript
import { useLocation } from '@/contexts/AppStateContext';

function MyComponent() {
  const { cachedLocation, refreshLocation, isCacheStale } = useLocation();
  
  // Use cached location instantly
  if (cachedLocation) {
    console.log('User is at:', cachedLocation.address);
    console.log('Coordinates:', cachedLocation.latitude, cachedLocation.longitude);
  }
  
  // Check if cache is fresh
  if (isCacheStale()) {
    console.log('Cache is old, consider refreshing');
  }
  
  // Manual refresh
  const handleRefresh = async () => {
    const result = await refreshLocation();
    if (result.success) {
      console.log('Location updated:', result.data);
    }
  };
}
```

## Common Use Cases

### 1. Pre-fill Start Location in Request Ride

```typescript
// In request ride screen
const { cachedLocation } = useLocation();
const [startLocation, setStartLocation] = useState(null);

useEffect(() => {
  if (cachedLocation && !startLocation) {
    // Auto-fill start location with cached position
    setStartLocation({
      display_name: cachedLocation.address,
      address: cachedLocation.address,
      latitude: cachedLocation.latitude,
      longitude: cachedLocation.longitude,
      relevance_score: 1.0,
      distance_km: 0,
      country: 'Morocco'
    });
  }
}, [cachedLocation]);
```

### 2. Show User's Location on Map

```typescript
// In map component
const { cachedLocation } = useLocation();

return (
  <MapView
    initialRegion={{
      latitude: cachedLocation?.latitude || 31.7917,
      longitude: cachedLocation?.longitude || -7.0926,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }}
  >
    {cachedLocation && (
      <Marker
        coordinate={{
          latitude: cachedLocation.latitude,
          longitude: cachedLocation.longitude,
        }}
        title="You are here"
      />
    )}
  </MapView>
);
```

### 3. Calculate Distance from User

```typescript
// Calculate distance to a destination
const { cachedLocation } = useLocation();

const calculateDistance = (destination) => {
  if (!cachedLocation) return null;
  
  // Use your distance calculation function
  return getDistanceBetween(
    cachedLocation.latitude,
    cachedLocation.longitude,
    destination.latitude,
    destination.longitude
  );
};
```

### 4. Show Location Freshness Indicator

```typescript
const { cachedLocation, isCacheStale } = useLocation();

return (
  <View>
    {cachedLocation && (
      <View style={styles.locationBadge}>
        <Ionicons 
          name="location" 
          color={isCacheStale() ? 'orange' : 'green'} 
        />
        <Text>
          {cachedLocation.address}
        </Text>
        {isCacheStale() && (
          <Text style={styles.staleText}>
            (Location may be outdated)
          </Text>
        )}
      </View>
    )}
  </View>
);
```

### 5. Background Location Updates

```typescript
// In a component that needs fresh location periodically
const { cachedLocation, refreshLocation, isCacheStale } = useLocation();

useEffect(() => {
  const interval = setInterval(() => {
    if (isCacheStale()) {
      refreshLocation();
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
  
  return () => clearInterval(interval);
}, [isCacheStale, refreshLocation]);
```

## API Reference

### useLocation() Hook

Returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `cachedLocation` | `CachedLocation \| null` | Current cached location data |
| `isLoading` | `boolean` | True when fetching location |
| `error` | `string \| null` | Error message if fetch failed |
| `refreshLocation` | `() => Promise<Result>` | Manually fetch fresh location |
| `clearLocation` | `() => void` | Clear cached location |
| `isCacheStale` | `() => boolean` | Check if cache is > 15 min old |

### CachedLocation Type

```typescript
interface CachedLocation {
  latitude: number;      // GPS latitude
  longitude: number;     // GPS longitude
  address: string;       // Human-readable address
  timestamp: number;     // Unix timestamp (ms)
}
```

### refreshLocation() Result

```typescript
{
  success: boolean;
  data?: CachedLocation;   // Present if success is true
  error?: string;          // Present if success is false
}
```

## Best Practices

### ✅ DO

1. **Check for null before using**
   ```typescript
   if (cachedLocation) {
     // Use location
   }
   ```

2. **Use cached location for initial display**
   ```typescript
   // Show map immediately with cached location
   // User can manually refresh if needed
   ```

3. **Provide manual refresh option**
   ```typescript
   <Button onPress={refreshLocation}>
     Refresh Location
   </Button>
   ```

4. **Show loading state during refresh**
   ```typescript
   {isLoading && <ActivityIndicator />}
   ```

### ❌ DON'T

1. **Don't fetch location on every render**
   ```typescript
   // BAD
   useEffect(() => {
     refreshLocation();
   }, []);
   ```

2. **Don't ignore cache staleness for critical operations**
   ```typescript
   // For ride booking, consider refreshing if stale
   if (isCacheStale()) {
     await refreshLocation();
   }
   ```

3. **Don't assume location exists**
   ```typescript
   // BAD
   const lat = cachedLocation.latitude;
   
   // GOOD
   const lat = cachedLocation?.latitude ?? defaultLat;
   ```

## Performance Tips

### 1. Lazy Loading
Only use location when needed:

```typescript
const { cachedLocation } = useLocation();

// Don't access location until needed
const handleBookRide = () => {
  if (cachedLocation) {
    bookRide(cachedLocation);
  }
};
```

### 2. Memoization
Memoize expensive calculations:

```typescript
const nearbyRides = useMemo(() => {
  if (!cachedLocation) return [];
  return rides.filter(ride => 
    getDistance(cachedLocation, ride) < 10
  );
}, [cachedLocation, rides]);
```

### 3. Conditional Refresh
Only refresh when necessary:

```typescript
const handleBookRide = async () => {
  // Refresh only for critical operations
  if (isCacheStale()) {
    await refreshLocation();
  }
  // Proceed with booking
};
```

## Troubleshooting

### Issue: Location is null
**Solution**: 
- Check if location permissions are granted
- Verify device has GPS enabled
- Check console for error messages

### Issue: Location not updating
**Solution**:
- Call `refreshLocation()` manually
- Check if device is in airplane mode
- Verify network connectivity for geocoding

### Issue: Location is inaccurate
**Solution**:
- Call `refreshLocation()` to get fresh GPS fix
- Ensure device has good GPS signal (outdoors)
- Check if cache is stale: `isCacheStale()`

### Issue: Performance issues
**Solution**:
- Don't call `refreshLocation()` frequently
- Use cached location for initial display
- Only refresh on user action or critical operations

## Migration from Old System

### Before (Old Way)
```typescript
// Every component fetched location separately
const [location, setLocation] = useState(null);

useEffect(() => {
  const getLocation = async () => {
    const loc = await Location.getCurrentPositionAsync();
    setLocation(loc);
  };
  getLocation();
}, []);
```

### After (New Way)
```typescript
// Use cached location instantly
const { cachedLocation } = useLocation();

// Location is already available!
// No loading, no waiting, no duplicate GPS calls
```

## Examples in Codebase

Look at these files for real implementation examples:

1. **LocationPickerModal.tsx** - Full implementation with refresh
2. **Main Screen (index.tsx)** - Could use for pre-filling search
3. **Request Ride Screen** - Could use for start location

## Questions?

Check the main documentation: `docs/LOCATION_CACHING.md`
