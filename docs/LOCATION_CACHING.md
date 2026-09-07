# Location Caching System

## Overview
Production-level location caching system that fetches user's location once on app startup and caches it for future use in LocationPickerModal and other location-based features.

## Implementation

### 1. AppStateContext Enhancement
**File**: `contexts/AppStateContext.tsx`

#### New State
```typescript
export interface CachedLocation {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: number;
}

export interface LocationState {
  cachedLocation: CachedLocation | null;
  isLoading: boolean;
  error: string | null;
}
```

#### Cache Configuration
- **Duration**: 15 minutes (configurable via `LOCATION_CACHE_DURATION`)
- **Storage**: AsyncStorage key `@coride_cached_location`
- **Persistence**: Survives app restarts

#### Automatic Location Fetching
Location is automatically fetched on app startup via `AppStateProvider`:
1. Checks AsyncStorage for existing cache
2. If cache exists and is fresh (< 15 min), uses it immediately
3. If cache is stale or missing, fetches fresh location
4. Saves to both state and AsyncStorage

### 2. useLocation Hook
**File**: `contexts/AppStateContext.tsx`

Provides access to cached location and management functions:

```typescript
const { 
  cachedLocation,      // Current cached location
  isLoading,           // Loading state
  error,               // Error message if any
  refreshLocation,     // Manually refresh location
  clearLocation,       // Clear cache
  isCacheStale         // Check if cache is stale
} = useLocation();
```

#### Methods

**refreshLocation()**
- Manually fetches fresh location
- Updates cache in state and AsyncStorage
- Returns: `{ success: boolean, data?: CachedLocation, error?: string }`

**clearLocation()**
- Clears cached location from state and AsyncStorage
- Useful for privacy/logout scenarios

**isCacheStale()**
- Returns `true` if cache is older than 15 minutes
- Returns `true` if no cache exists

### 3. LocationPickerModal Updates
**File**: `components/modals/LocationPickerModal.tsx`

#### Instant Display
- Modal opens immediately with cached location (no loading spinner)
- Map centers on cached location instantly
- Background refresh if cache is stale

#### User Flow
1. User opens modal → Map shows instantly at cached location
2. If cache is stale → Badge shows "Using cached location • Tap refresh to update"
3. User can tap refresh button to get fresh location
4. Background refresh happens automatically if cache > 15 min

#### Visual Indicators
- **Current Location Button**: Tap to manually refresh
- **Cache Status Badge**: Shows when using stale cache (bottom of map)
- **Loading State**: Only shows during manual refresh

### 4. Integration Points

#### Main Screen
No changes needed! The location is automatically cached on app load.

#### Request Ride Screen
Can use `useLocation()` hook to pre-fill user's location:

```typescript
const { cachedLocation } = useLocation();

useEffect(() => {
  if (cachedLocation && !startLocation) {
    setStartLocation({
      latitude: cachedLocation.latitude,
      longitude: cachedLocation.longitude,
      address: cachedLocation.address,
      // ... other fields
    });
  }
}, [cachedLocation]);
```

## Benefits

### Performance
✅ **Instant UI** - No waiting for GPS on modal open  
✅ **Reduced API Calls** - Location fetched once, reused everywhere  
✅ **Battery Efficient** - GPS not constantly activated  

### User Experience
✅ **No Loading Spinner** - Modal opens immediately  
✅ **Offline Support** - Cached location available even without GPS  
✅ **Smart Refresh** - Auto-refresh in background if cache is stale  

### Technical
✅ **Persistent Cache** - Survives app restarts via AsyncStorage  
✅ **Configurable Duration** - Easy to adjust cache expiry  
✅ **Error Handling** - Graceful fallbacks if location fetch fails  
✅ **Type Safe** - Full TypeScript support  

## Configuration

### Adjust Cache Duration
Edit `LOCATION_CACHE_DURATION` in `AppStateContext.tsx`:

```typescript
const LOCATION_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
```

Options:
- 5 minutes: `5 * 60 * 1000`
- 30 minutes: `30 * 60 * 1000`
- 1 hour: `60 * 60 * 1000`

### Disable Auto-Refresh
Remove the stale cache check in `LocationPickerModal.tsx`:

```typescript
// Comment out this section to disable background refresh
if (isCacheStale()) {
  console.log('Cache is stale, refreshing in background...');
  refreshLocation();
}
```

## Testing

### Test Cache on App Startup
1. Fresh install → Location should be fetched and cached
2. Close app
3. Reopen app within 15 min → Should use cached location (instant)
4. Wait 15+ min → Should fetch fresh location

### Test LocationPickerModal
1. Open modal → Should show map instantly at cached location
2. If cache is stale → Badge appears at bottom
3. Tap refresh button → Loading indicator, then fresh location
4. Close and reopen modal → Still instant (no refetch)

### Test Manual Refresh
1. Open modal
2. Tap the circular "locate" button (top right)
3. Should show loading spinner
4. Location updates to current GPS position

## Future Enhancements

### Location History
Already implemented! The `geospatialService.getLocationHistory()` shows recent locations in the modal.

### Smart Predictions
Could predict user's next location based on:
- Time of day (morning = home, evening = work)
- Day of week (weekday vs weekend patterns)
- Previous ride history

### Accuracy Levels
Could add location accuracy indicator:
- Green: Cache < 5 min old
- Yellow: Cache 5-15 min old  
- Red: Cache > 15 min old

### Background Updates
Could periodically refresh location when app is in foreground (every 15 min) without user interaction.

## Troubleshooting

### Location Not Caching
1. Check AsyncStorage permissions
2. Verify location permissions granted
3. Check console for error messages

### Cache Always Stale
1. Verify device clock is correct
2. Check `LOCATION_CACHE_DURATION` value
3. Ensure `timestamp` is being saved correctly

### Modal Still Loading
1. Verify `cachedLocation` exists in state
2. Check `useLocation()` hook is imported
3. Ensure `AppStateProvider` wraps the app
