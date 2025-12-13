// Context-based state management to replace Redux
// Provides similar functionality to Redux with RTK Query using React Context

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { authService } from '../services/auth';
import { geospatialService } from '../services/geospatialService';
import { ridesApiService } from '../services/ridesApi';
import { userApiService } from '../services/userApi';
import type { 
  UserResponse, 
  TokenResponse, 
  UserLoginRequest, 
  UserRegistrationRequest, 
  PasswordChangeRequest 
} from '../types/auth';
import type { 
  Ride, 
  CreateRideRequest, 
  RideSearchParams, 
  BookingRequest 
} from '../services/ridesApi';
import type { 
  UserProfile, 
  UpdateProfileRequest, 
  UpdatePreferencesRequest
} from '../types/user';

// State interfaces
export interface AuthState {
  user: UserResponse | null;
  tokens: TokenResponse | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RidesState {
  myRides: Ride[];
  searchResults: Ride[];
  currentRide: Ride | null;
  isLoading: boolean;
  error: string | null;
  lastSearchParams: RideSearchParams | null;
}

export interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

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

export interface AppState {
  auth: AuthState;
  rides: RidesState;
  userProfile: UserProfileState;
  location: LocationState;
}

// Action types
type AuthAction = 
  | { type: 'AUTH_LOADING'; payload: boolean }
  | { type: 'AUTH_SUCCESS'; payload: { user: UserResponse; tokens?: TokenResponse | null } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' };

type RidesAction = 
  | { type: 'RIDES_LOADING'; payload: boolean }
  | { type: 'RIDES_SET_MY_RIDES'; payload: Ride[] }
  | { type: 'RIDES_SET_SEARCH_RESULTS'; payload: Ride[] }
  | { type: 'RIDES_SET_CURRENT'; payload: Ride | null }
  | { type: 'RIDES_ERROR'; payload: string }
  | { type: 'RIDES_CLEAR_ERROR' }
  | { type: 'RIDES_SET_SEARCH_PARAMS'; payload: RideSearchParams };

type UserProfileAction = 
  | { type: 'PROFILE_LOADING'; payload: boolean }
  | { type: 'PROFILE_SUCCESS'; payload: UserProfile }
  | { type: 'PROFILE_ERROR'; payload: string }
  | { type: 'PROFILE_CLEAR_ERROR' };

type LocationAction =
  | { type: 'LOCATION_LOADING'; payload: boolean }
  | { type: 'LOCATION_SUCCESS'; payload: CachedLocation }
  | { type: 'LOCATION_ERROR'; payload: string }
  | { type: 'LOCATION_CLEAR' };

type AppAction = AuthAction | RidesAction | UserProfileAction | LocationAction | { type: 'RESET_APP' };

// Initial states
const initialAuthState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const initialRidesState: RidesState = {
  myRides: [],
  searchResults: [],
  currentRide: null,
  isLoading: false,
  error: null,
  lastSearchParams: null,
};

const initialUserProfileState: UserProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

const initialLocationState: LocationState = {
  cachedLocation: null,
  isLoading: false,
  error: null,
};

const initialState: AppState = {
  auth: initialAuthState,
  rides: initialRidesState,
  userProfile: initialUserProfileState,
  location: initialLocationState,
};

// Reducers
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens || state.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case 'AUTH_LOGOUT':
      return {
        ...initialAuthState,
      };
    case 'AUTH_CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const ridesReducer = (state: RidesState, action: RidesAction): RidesState => {
  switch (action.type) {
    case 'RIDES_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'RIDES_SET_MY_RIDES':
      return { ...state, myRides: action.payload, isLoading: false };
    case 'RIDES_SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload, isLoading: false };
    case 'RIDES_SET_CURRENT':
      return { ...state, currentRide: action.payload };
    case 'RIDES_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'RIDES_CLEAR_ERROR':
      return { ...state, error: null };
    case 'RIDES_SET_SEARCH_PARAMS':
      return { ...state, lastSearchParams: action.payload };
    default:
      return state;
  }
};

const userProfileReducer = (state: UserProfileState, action: UserProfileAction): UserProfileState => {
  switch (action.type) {
    case 'PROFILE_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'PROFILE_SUCCESS':
      return { ...state, profile: action.payload, isLoading: false, error: null };
    case 'PROFILE_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'PROFILE_CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const locationReducer = (state: LocationState, action: LocationAction): LocationState => {
  switch (action.type) {
    case 'LOCATION_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'LOCATION_SUCCESS':
      return { ...state, cachedLocation: action.payload, isLoading: false, error: null };
    case 'LOCATION_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOCATION_CLEAR':
      return initialLocationState;
    default:
      return state;
  }
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  if (action.type === 'RESET_APP') {
    return initialState;
  }

  return {
    auth: authReducer(state.auth, action as AuthAction),
    rides: ridesReducer(state.rides, action as RidesAction),
    userProfile: userProfileReducer(state.userProfile, action as UserProfileAction),
    location: locationReducer(state.location, action as LocationAction),
  };
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// AsyncStorage keys
const CACHED_LOCATION_KEY = '@coride_cached_location';
const LOCATION_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Provider component
export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Fetch and cache user's current location
  const fetchAndCacheLocation = useCallback(async () => {
    dispatch({ type: 'LOCATION_LOADING', payload: true });
    
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission not granted');
        dispatch({ type: 'LOCATION_LOADING', payload: false });
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      
      // Reverse geocode to get address
      const reverseResponse = await geospatialService.reverseGeocode(latitude, longitude);
      
      const address = reverseResponse.success && reverseResponse.data 
        ? reverseResponse.data.formatted_address || reverseResponse.data.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      const cachedLocation: CachedLocation = {
        latitude,
        longitude,
        address,
        timestamp: Date.now(),
      };

      // Save to state
      dispatch({ type: 'LOCATION_SUCCESS', payload: cachedLocation });
      
      // Persist to AsyncStorage
      await AsyncStorage.setItem(CACHED_LOCATION_KEY, JSON.stringify(cachedLocation));
      
      console.log('Location cached successfully:', address);
    } catch (error) {
      console.error('Error fetching location:', error);
      dispatch({ type: 'LOCATION_ERROR', payload: 'Failed to fetch location' });
    }
  }, []);

  // Load cached location from AsyncStorage on app start
  useEffect(() => {
    const loadCachedLocation = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(CACHED_LOCATION_KEY);
        if (cachedData) {
          const cached: CachedLocation = JSON.parse(cachedData);
          const age = Date.now() - cached.timestamp;
          
          // If cache is still fresh (< 15 minutes), use it
          if (age < LOCATION_CACHE_DURATION) {
            dispatch({ type: 'LOCATION_SUCCESS', payload: cached });
            console.log('Loaded cached location from storage:', cached.address);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading cached location:', error);
      }
      
      // If no cache or cache is stale, fetch fresh location
      fetchAndCacheLocation();
    };

    loadCachedLocation();
  }, [fetchAndCacheLocation]);

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Don't initialize if we're already in a loading state or already authenticated
        if (state.auth.isLoading || state.auth.isAuthenticated) {
          return;
        }

        dispatch({ type: 'AUTH_LOADING', payload: true });

        const isAuthenticated = await authService.isAuthenticated();
        if (isAuthenticated) {
          // isAuthenticated() already called getCurrentUser(), so check cached data first
          let userData = authService.getUserData();
          
          // Only make API call if we don't have cached user data
          if (!userData) {
            const userResponse = await authService.getCurrentUser();
            if (userResponse.success && userResponse.data) {
              userData = userResponse.data;
            }
          }

          if (userData) {
            // Get tokens from storage for complete auth state
            const accessToken = await authService.getStoredAccessToken();
            const refreshToken = await authService.getStoredRefreshToken();
            
            const tokens = accessToken && refreshToken ? {
              access_token: accessToken,
              refresh_token: refreshToken,
              token_type: 'bearer',
              expires_in: 86400 // Default 24h
            } : undefined;
            
            dispatch({ 
              type: 'AUTH_SUCCESS', 
              payload: { 
                user: userData,
                tokens 
              } 
            });

            // Also populate the user profile with the same data since UserProfile extends UserResponse
            dispatch({ 
              type: 'PROFILE_SUCCESS', 
              payload: userData as any 
            });
          } else {
            dispatch({ type: 'AUTH_LOADING', payload: false });
          }
        } else {
          dispatch({ type: 'AUTH_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        dispatch({ type: 'AUTH_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []); // Keep empty dependency array

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use app state
export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

// Auth hooks (equivalent to Redux hooks)
export const useAuth = () => {
  const { state, dispatch } = useAppState();

  const login = useCallback(async (credentials: UserLoginRequest) => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        // Get cached user data from auth service
        const cachedUser = authService.getUserData();
        if (cachedUser) {
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { 
              user: cachedUser,
              tokens: response.data 
            } 
          });
          // Also populate the user profile
          dispatch({ 
            type: 'PROFILE_SUCCESS', 
            payload: cachedUser as any 
          });
          return { success: true };
        } else {
          // Fallback: fetch user data if not cached
          const userResponse = await authService.getCurrentUser();
          if (userResponse.success && userResponse.data) {
            dispatch({ 
              type: 'AUTH_SUCCESS', 
              payload: { 
                user: userResponse.data,
                tokens: response.data 
              } 
            });
            // Also populate the user profile
            dispatch({ 
              type: 'PROFILE_SUCCESS', 
              payload: userResponse.data as any 
            });
            return { success: true };
          }
        }
      }
      dispatch({ type: 'AUTH_ERROR', payload: response.error?.message || 'Login failed' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const register = useCallback(async (userData: UserRegistrationRequest) => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    try {
      // Step 1: Register user
      const registerResponse = await authService.register(userData);
      if (!registerResponse.success || !registerResponse.data) {
        dispatch({ type: 'AUTH_ERROR', payload: registerResponse.error?.message || 'Registration failed' });
        return { success: false, error: registerResponse.error?.message };
      }

      // Step 2: Auto-login after successful registration
      const loginResponse = await authService.login({
        email: userData.email,
        password: userData.password
      });
      
      if (loginResponse.success && loginResponse.data) {
        // Get user data with tokens
        const userResponse = await authService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { 
              user: userResponse.data,
              tokens: loginResponse.data 
            } 
          });
          // Also populate the user profile
          dispatch({ 
            type: 'PROFILE_SUCCESS', 
            payload: userResponse.data as any 
          });
          return { success: true };
        }
      }
      
      // If auto-login fails, still consider registration successful but require manual login
      dispatch({ type: 'AUTH_ERROR', payload: 'Registration successful but auto-login failed. Please login manually.' });
      return { success: false, error: 'Registration successful but auto-login failed. Please login manually.' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
      dispatch({ type: 'RESET_APP' }); // Reset entire app state
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server logout fails
      dispatch({ type: 'AUTH_LOGOUT' });
      dispatch({ type: 'RESET_APP' });
    }
  }, [dispatch]);

  const changePassword = useCallback(async (data: PasswordChangeRequest) => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    try {
      const response = await authService.changePassword(data);
      if (response.success) {
        dispatch({ type: 'AUTH_LOADING', payload: false });
        return { success: true };
      }
      dispatch({ type: 'AUTH_ERROR', payload: response.error?.message || 'Password change failed' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const verifyEmail = useCallback(async (code: string) => {
    dispatch({ type: 'AUTH_LOADING', payload: true });
    try {
      const response = await authService.verifyEmail(code);
      if (response.success) {
        // Refresh user data to get updated verification status
        const userResponse = await authService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { user: userResponse.data } 
          });
        }
        return { success: true };
      }
      dispatch({ type: 'AUTH_ERROR', payload: response.error?.message || 'Verification failed' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  }, [dispatch]);

  return {
    ...state.auth,
    login,
    register,
    logout,
    changePassword,
    verifyEmail,
    clearError,
  };
};

// useLocation hook - provides access to cached location and refresh functionality
export const useLocation = () => {
  const { state, dispatch } = useAppState();

  const refreshLocation = useCallback(async () => {
    dispatch({ type: 'LOCATION_LOADING', payload: true });
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission not granted');
        dispatch({ type: 'LOCATION_LOADING', payload: false });
        return { success: false, error: 'Location permission denied' };
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      
      const reverseResponse = await geospatialService.reverseGeocode(latitude, longitude);
      
      const address = reverseResponse.success && reverseResponse.data 
        ? reverseResponse.data.formatted_address || reverseResponse.data.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      const cachedLocation: CachedLocation = {
        latitude,
        longitude,
        address,
        timestamp: Date.now(),
      };

      dispatch({ type: 'LOCATION_SUCCESS', payload: cachedLocation });
      await AsyncStorage.setItem(CACHED_LOCATION_KEY, JSON.stringify(cachedLocation));
      
      return { success: true, data: cachedLocation };
    } catch (error) {
      console.error('Error refreshing location:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh location';
      dispatch({ type: 'LOCATION_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const clearLocation = useCallback(() => {
    dispatch({ type: 'LOCATION_CLEAR' });
    AsyncStorage.removeItem(CACHED_LOCATION_KEY).catch(console.error);
  }, [dispatch]);

  // Check if cached location is stale (older than 15 minutes)
  const isCacheStale = useCallback(() => {
    if (!state.location.cachedLocation) return true;
    const age = Date.now() - state.location.cachedLocation.timestamp;
    return age >= LOCATION_CACHE_DURATION;
  }, [state.location.cachedLocation]);

  return {
    ...state.location,
    refreshLocation,
    clearLocation,
    isCacheStale,
  };
};

export default AppStateProvider;