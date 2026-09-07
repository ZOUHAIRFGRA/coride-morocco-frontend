# Role-Based UI Implementation

## Overview
Implemented role-based interface separation to provide distinct experiences for drivers and riders. Each role now sees only relevant features and screens.

## Changes Made

### 1. Home Screen ([app/(main)/index.tsx](app/(main)/index.tsx))

#### Role Detection
```tsx
const userRole = (profile || user)?.role || 'rider';
```

#### Quick Actions (Role-Based)
- **Rider**:
  - Primary: "Request a Ride" → `/request`
  - Tertiary: "My Rides" → `/rides`
- **Driver**:
  - Primary: "Offer a Ride" → `/offer`
  - Tertiary: "My Rides" → `/rides`

#### Search Section (Rider Only)
- Location picker (From/To)
- Passenger count selector
- "Find Available Rides" button
- **Hidden for drivers** since they don't search for rides

#### Route Results (Rider Only)
- Available rides list
- Driver details, ratings, pricing
- **Hidden for drivers**

#### Enhanced Role Indicator
- Shows icon + role text ("Driver"/"Rider")
- Color-coded background:
  - Driver: Green (`#10B98120`)
  - Rider: Blue (`#3B82F620`)

### 2. Rides Screen ([app/(main)/rides.tsx](app/(main)/rides.tsx))

#### Role Detection
```tsx
const userRole = (profile || user)?.role || 'rider';
```

#### Initial Tab Selection
- Driver: `offered` (shows offered rides by default)
- Rider: `joined` (shows booked rides by default)

#### Tab Display (Role-Specific)
- **Driver**: Single tab "My Offered Rides (count)"
- **Rider**: Single tab "My Booked Rides (count)"
- **Admin/Other**: Both tabs with switcher (original behavior)

#### Header Add Button
- Driver: Routes to `/offer` (offer new ride)
- Rider: Routes to `/request` (request new ride)

#### New Style Added
```tsx
singleTab: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 12,
  gap: 8,
}
```

## User Experience

### Driver Interface
1. **Home Screen**:
   - Role badge: "Driver" (green)
   - Subtitle: "Offer rides and earn money"
   - Quick action: "Offer a Ride" (primary)
   - No search functionality (drivers don't search)
   - No route results display

2. **Rides Screen**:
   - Single tab: "My Offered Rides"
   - Shows rides they've offered
   - Add button → Offer new ride

### Rider Interface
1. **Home Screen**:
   - Role badge: "Rider" (blue)
   - Subtitle: "Find affordable rides near you"
   - Quick action: "Request a Ride" (primary)
   - Full search functionality (location picker, passenger count)
   - Route results with available rides

2. **Rides Screen**:
   - Single tab: "My Booked Rides"
   - Shows rides they've joined
   - Add button → Request new ride

## Role Switching
- Users can switch roles via the drawer menu (CoRideSidebar)
- UI updates automatically when role changes
- No app restart required

## Technical Details

### Dependencies
- `useAuth()` - Authentication state
- `useUser()` - User profile data
- Role stored in: `user.role` or `profile.role`
- Default role: `'rider'` if not specified

### Conditional Rendering Pattern
```tsx
{userRole === 'rider' ? (
  // Rider-specific UI
) : userRole === 'driver' ? (
  // Driver-specific UI
) : (
  // Admin/fallback UI (shows both)
)}
```

## Testing Checklist
- [ ] Test as driver: Should only see offer functionality
- [ ] Test as rider: Should only see search/request functionality
- [ ] Test role switching: UI should update immediately
- [ ] Test admin role: Should see all features (both tabs)
- [ ] Verify no TypeScript errors
- [ ] Verify no runtime errors

## Future Enhancements
- Consider role-based sidebar navigation
- Add role-specific analytics
- Implement role-based notifications
- Add role-specific tutorials/onboarding
