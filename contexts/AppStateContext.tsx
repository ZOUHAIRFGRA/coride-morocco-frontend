// Context-based state management to replace Redux
// Provides similar functionality to Redux with RTK Query using React Context

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { authService } from '../services/auth';
import { ridesApiService } from '../services/ridesApi';
import { userProfileApiService } from '../services/userProfileApi';
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
  UpdateVehicleRequest, 
  UpdatePreferencesRequest, 
  RatingRequest 
} from '../services/userProfileApi';

// State interfaces
export interface AuthState {
  user: UserResponse | null;
  tokens: TokenResponse | null;
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

export interface AppState {
  auth: AuthState;
  rides: RidesState;
  userProfile: UserProfileState;
}

// Action types
type AuthAction = 
  | { type: 'AUTH_LOADING'; payload: boolean }
  | { type: 'AUTH_SUCCESS'; payload: { user: UserResponse; tokens?: TokenResponse } }
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

type AppAction = AuthAction | RidesAction | UserProfileAction | { type: 'RESET_APP' };

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

const initialState: AppState = {
  auth: initialAuthState,
  rides: initialRidesState,
  userProfile: initialUserProfileState,
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

const appReducer = (state: AppState, action: AppAction): AppState => {
  if (action.type === 'RESET_APP') {
    return initialState;
  }

  return {
    auth: authReducer(state.auth, action as AuthAction),
    rides: ridesReducer(state.rides, action as RidesAction),
    userProfile: userProfileReducer(state.userProfile, action as UserProfileAction),
  };
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        if (isAuthenticated) {
          const userResponse = await authService.getCurrentUser();
          if (userResponse.success && userResponse.data) {
            dispatch({ 
              type: 'AUTH_SUCCESS', 
              payload: { user: userResponse.data } 
            });
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      }
    };

    initializeAuth();
  }, []);

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
        // Get user data after login
        const userResponse = await authService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { 
              user: userResponse.data,
              tokens: response.data 
            } 
          });
          return { success: true };
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
      const response = await authService.register(userData);
      if (response.success && response.data) {
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { user: response.data } 
        });
        return { success: true };
      }
      dispatch({ type: 'AUTH_ERROR', payload: response.error?.message || 'Registration failed' });
      return { success: false, error: response.error?.message };
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

export default AppStateProvider;