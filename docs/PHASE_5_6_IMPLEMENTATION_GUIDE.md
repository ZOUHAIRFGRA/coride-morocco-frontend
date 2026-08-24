# Phase 5 & 6 Implementation Checklist
**Status**: Partially Complete - Core Infrastructure Ready
**Date**: December 13, 2025

## ✅ COMPLETED

### Types & Interfaces
- ✅ tribe.ts - Complete tribe type definitions
- ✅ recommendation.ts - Complete AI recommendation types

### API Services
- ✅ tribesApi.ts - Full CRUD operations for tribes
- ✅ recommendationsApi.ts - AI recommendations & behavior tracking
- ✅ tribeWebSocket.ts - Real-time chat WebSocket service

### Screens (Existing)
- ✅ /tribes/index.tsx - Tribes list with search/filters
- ✅ /tribes/[id].tsx - Tribe details (partial)
- ✅ /tribes/create.tsx - Create tribe form
- ✅ /(main)/recommendations.tsx - AI recommendations screen (**JUST CREATED**)

---

## 🚧 REQUIRED IMPLEMENTATIONS

### 1. Complete Tribe Chat Screen
**File**: `/app/tribes/[id]/chat.tsx`
**Features Needed**:
- Real-time message display using WebSocket
- Message input with typing indicators
- Image/file upload support
- Infinite scroll for message history
- Online member indicators
- Announcement badges

**Key Components**:
```tsx
// Message list with FlatList
// WebSocket connection management
// Typing indicator UI
// Message bubbles (sender vs others)
// Timestamp grouping
// Send button with loading state
```

### 2. Tribe Members Screen
**File**: `/app/tribes/[id]/members.tsx`
**Features Needed**:
- Paginated member list
- Role badges (Admin/Moderator/Member)
- Online status indicators
- Member actions (promote/demote/remove for admins)
- Search/filter members

### 3. Tribe Announcements Screen
**File**: `/app/tribes/[id]/announcements.tsx`
**Features Needed**:
- List all tribe announcements
- Create announcement (Admin/Moderator only)
- Pin/unpin announcements
- Announcement expiry management

### 4. Join Requests Management (Admin)
**File**: `/app/tribes/[id]/join-requests.tsx`
**Features Needed**:
- List pending join requests
- Approve/reject buttons
- User preview cards
- Optional join message display

### 5. Smart Route Analyzer
**File**: `/app/(main)/smart-routes.tsx`
**Features Needed**:
- Input: Start and end locations
- Display route popularity
- Show demand level with color coding
- List active tribes on route
- Optimal departure times suggestion
- Estimated cost range

### 6. Behavior Analytics Dashboard
**File**: `/app/profile/analytics.tsx`
**Features Needed**:
- User behavior pattern visualization
- Top routes chart
- Peak hours graph
- Preference priorities pie chart
- Savings calculator integration
- Recommendation click-through rate

### 7. Integrate Recommendations Throughout App

#### a. Home Screen Integration
**File**: `/app/(main)/index.tsx`
**Add**:
- "Recommended for You" section
- Top 3 ride recommendations
- Top 2 tribe recommendations
- Link to full recommendations screen

#### b. Find Rides Screen Enhancement
**File**: `/app/rides/find.tsx`
**Add**:
- Toggle "Show Recommendations" filter
- Badge on recommended rides
- "Why this ride" expandable section

#### c. Tribes List Enhancement
**File**: `/app/tribes/index.tsx` (already has some)
**Enhance**:
- Dedicated "For You" tab (already exists)
- Better recommendation reason display
- Confidence score visualization

---

## 🎯 BEHAVIOR TRACKING INTEGRATION

### Track in Existing Screens

#### Home Screen (`/app/(main)/index.tsx`)
```tsx
useEffect(() => {
  // Track screen view
  recommendationsApiService.trackInteraction({
    interaction_type: 'view_profile',
    target_type: 'screen',
    metadata: { screen: 'home' },
  });
}, []);
```

#### Ride Details (`/app/rides/[id].tsx`)
```tsx
// On component mount
recommendationsApiService.trackRideView(rideId, {
  source: 'search_results',
  timestamp: new Date().toISOString(),
});

// On join button press
recommendationsApiService.trackRideJoin(rideId);

// On booking complete
recommendationsApiService.trackRideComplete(rideId);

// On cancel
recommendationsApiService.trackRideCancel(rideId, cancelReason);
```

#### Tribe Details (`/app/tribes/[id].tsx`)
```tsx
// On tribe join
recommendationsApiService.trackTribeJoin(tribeId);

// On message send
recommendationsApiService.trackMessageSend('tribe', tribeId);
```

#### Location Picker Modal
```tsx
// On location search
recommendationsApiService.trackLocationSearch(
  { latitude, longitude },
  address
);

// On location save
recommendationsApiService.trackLocationSave(
  { latitude, longitude },
  address
);
```

#### User Profile View (`/app/profile/[id].tsx`)
```tsx
// On profile view
recommendationsApiService.trackProfileView(userId);
```

#### Rating Screen
```tsx
// After rating submission
recommendationsApiService.trackUserRating(userId, rating);
```

---

## 🔄 WEBSOCKET INTEGRATION

### Tribe Chat Hook
**File**: `/hooks/useTribeChat.ts`
```tsx
import { useState, useEffect, useCallback } from 'react';
import { tribeWebSocketService } from '@/services/tribeWebSocket';
import type { TribeMessage, TribeMember } from '@/types/tribe';

export const useTribeChat = (tribeId: number) => {
  const [messages, setMessages] = useState<TribeMessage[]>([]);
  const [members, setMembers] = useState<TribeMember[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    tribeWebSocketService.connect(tribeId, {
      onConnectionEstablished: (tribeId, userId) => {
        console.log('Connected to tribe:', tribeId);
        setIsConnected(true);
      },
      onNewMessage: (message) => {
        setMessages(prev => [...prev, message]);
      },
      onMemberJoined: (member) => {
        setMembers(prev => [...prev, member]);
      },
      onMemberLeft: (userId, userName) => {
        setMembers(prev => prev.filter(m => m.user_id !== userId));
      },
      onTypingIndicator: (userId, userName, isTyping) => {
        setTypingUsers(prev => {
          const next = new Set(prev);
          if (isTyping) {
            next.add(userId);
          } else {
            next.delete(userId);
          }
          return next;
        });
      },
      onConnectionStatusChange: (connected) => {
        setIsConnected(connected);
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
      },
    });

    return () => {
      tribeWebSocketService.disconnect();
    };
  }, [tribeId]);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    tribeWebSocketService.sendTypingIndicator(isTyping);
  }, []);

  return {
    messages,
    members,
    typingUsers,
    isConnected,
    sendTypingIndicator,
  };
};
```

---

## 📱 NAVIGATION SETUP

### Update Main Layout
**File**: `/app/(main)/_layout.tsx`

Add recommendations to navigation:
```tsx
{/* Add to drawer/tab navigator */}
<Screen 
  name="recommendations" 
  options={{
    title: "For You",
    drawerIcon: ({ color, size }) => (
      <Ionicons name="sparkles" size={size} color={color} />
    ),
  }}
/>
```

### Update Tribes Layout
**File**: `/app/tribes/_layout.tsx`

Ensure nested routes work:
```tsx
<Stack>
  <Stack.Screen name="index" options={{ title: "Tribes" }} />
  <Stack.Screen name="create" options={{ title: "Create Tribe" }} />
  <Stack.Screen name="[id]" options={{ headerShown: false }} />
  <Stack.Screen name="[id]/chat" options={{ title: "Chat" }} />
  <Stack.Screen name="[id]/members" options={{ title: "Members" }} />
  <Stack.Screen name="[id]/announcements" options={{ title: "Announcements" }} />
  <Stack.Screen name="[id]/join-requests" options={{ title: "Join Requests" }} />
</Stack>
```

---

## 🎨 UI COMPONENTS NEEDED

### 1. RecommendationCard Component
**File**: `/components/RecommendationCard.tsx`
Reusable card with confidence badge and reasons

### 2. TribeMessageBubble Component
**File**: `/components/tribe/MessageBubble.tsx`
Message display with sender differentiation

### 3. TypingIndicator Component
**File**: `/components/tribe/TypingIndicator.tsx`
Animated "User is typing..." indicator

### 4. OnlineStatusBadge Component
**File**: `/components/tribe/OnlineStatusBadge.tsx`
Green dot indicator for online members

### 5. ConfidenceScoreBadge Component
**File**: `/components/ConfidenceScoreBadge.tsx`
Visual representation of recommendation confidence

### 6. BehaviorPatternChart Component
**File**: `/components/analytics/BehaviorPatternChart.tsx`
Charts for behavior analytics

---

## 🧪 TESTING CHECKLIST

### Tribe Features
- [ ] Create tribe with valid data
- [ ] Search tribes by route
- [ ] Join public tribe
- [ ] Request to join private tribe (approval flow)
- [ ] Send/receive real-time messages
- [ ] Typing indicators work
- [ ] Member list updates in real-time
- [ ] Admin can promote/demote members
- [ ] Admin can remove members
- [ ] Create announcements (Admin only)
- [ ] Leave tribe

### Recommendation Features
- [ ] View personalized ride recommendations
- [ ] View personalized tribe recommendations
- [ ] View compatible user recommendations
- [ ] Click-through tracking works
- [ ] Behavior pattern displays correctly
- [ ] Smart route analyzer provides insights
- [ ] Recommendations refresh with new data

### WebSocket Features
- [ ] WebSocket connects successfully
- [ ] Messages appear in real-time
- [ ] Typing indicators show/hide
- [ ] Online status updates
- [ ] Reconnection works after disconnect
- [ ] Connection survives app backgrounding

### Behavior Tracking
- [ ] Ride view tracked
- [ ] Ride search tracked
- [ ] Tribe join tracked
- [ ] Location search tracked
- [ ] Profile view tracked
- [ ] Message send tracked
- [ ] User rating tracked

---

## 📝 ENVIRONMENT VARIABLES

Ensure `.env` has:
```
EXPO_PUBLIC_API_URL=http://YOUR_IP:8000/api
EXPO_PUBLIC_WS_URL=ws://YOUR_IP:8000
```

---

## 🚀 DEPLOYMENT STEPS

1. **Complete remaining screens** (chat, members, announcements, etc.)
2. **Integrate behavior tracking** throughout existing screens
3. **Test WebSocket stability** in production environment
4. **Add loading states** and error boundaries
5. **Implement caching** for recommendations
6. **Add offline support** for cached data
7. **Performance optimization** (FlatList, memo, callbacks)
8. **Accessibility** (screen readers, keyboard navigation)

---

## 📚 DOCUMENTATION UPDATES NEEDED

1. Update `README.md` with Phase 5 & 6 features
2. Create `TRIBE_CHAT_GUIDE.md` for chat implementation
3. Create `AI_RECOMMENDATIONS_GUIDE.md` for ML features
4. Document WebSocket message protocol
5. Add API endpoint examples to docs

---

## ⚠️ KNOWN LIMITATIONS

1. **Recommendation Cold Start**: New users won't have recommendations until they use the app
2. **WebSocket Scale**: May need Redis pub/sub for production scale
3. **Behavior Pattern**: Requires 7+ days of data for accurate patterns
4. **Smart Route**: Limited to registered routes in database

---

## 🎯 NEXT IMMEDIATE STEPS

1. **Create tribe chat screen** with WebSocket integration
2. **Add behavior tracking** to home, rides, and profile screens
3. **Test recommendations** with real user data
4. **Implement member management** screens
5. **Add smart route analyzer** feature

---

## 📞 SUPPORT & QUESTIONS

- Backend API Docs: `/docs/PHASE_5_TRIBES_API_DOCS.md`
- AI Recommendations API: `/docs/PHASE_6_AI_RECOMMENDATIONS_API_DOCS.md`
- Implementation Summary: `/docs/PHASE_5_SUMMARY.md` & `/docs/PHASE_6_SUMMARY.md`

