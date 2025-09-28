// Rides management hooks using the services
// Provides caching and state management similar to RTK Query

import { useCallback } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { ridesApiService } from '../services/ridesApi';
import type { 
  Ride, 
  CreateRideRequest, 
  RideSearchParams, 
  BookingRequest 
} from '../services/ridesApi';

export const useRides = () => {
  const { state, dispatch } = useAppState();

  const createRide = useCallback(async (rideData: CreateRideRequest) => {
    dispatch({ type: 'RIDES_LOADING', payload: true });
    try {
      const response = await ridesApiService.createRide(rideData);
      if (response.success && response.data) {
        // Refresh my rides to include the new ride
        const myRidesResponse = await ridesApiService.getMyRides();
        if (myRidesResponse.success && myRidesResponse.data) {
          dispatch({ type: 'RIDES_SET_MY_RIDES', payload: myRidesResponse.data });
        }
        return { success: true, data: response.data };
      }
      dispatch({ type: 'RIDES_ERROR', payload: response.error?.message || 'Failed to create ride' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create ride';
      dispatch({ type: 'RIDES_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const getMyRides = useCallback(async (forceRefresh = false) => {
    // Return cached data if available and not forcing refresh
    if (!forceRefresh && state.rides.myRides.length > 0 && !state.rides.isLoading) {
      return { success: true, data: state.rides.myRides };
    }

    dispatch({ type: 'RIDES_LOADING', payload: true });
    try {
      const response = await ridesApiService.getMyRides();
      if (response.success && response.data) {
        dispatch({ type: 'RIDES_SET_MY_RIDES', payload: response.data });
        return { success: true, data: response.data };
      }
      dispatch({ type: 'RIDES_ERROR', payload: response.error?.message || 'Failed to fetch rides' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rides';
      dispatch({ type: 'RIDES_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch, state.rides.myRides, state.rides.isLoading]);

  const searchRides = useCallback(async (params: RideSearchParams, useCache = true) => {
    // Check if we can use cached results
    if (useCache && 
        state.rides.searchResults.length > 0 && 
        state.rides.lastSearchParams &&
        JSON.stringify(state.rides.lastSearchParams) === JSON.stringify(params)) {
      return { success: true, data: state.rides.searchResults };
    }

    dispatch({ type: 'RIDES_LOADING', payload: true });
    dispatch({ type: 'RIDES_SET_SEARCH_PARAMS', payload: params });
    
    try {
      const response = await ridesApiService.searchRides(params);
      if (response.success && response.data) {
        dispatch({ type: 'RIDES_SET_SEARCH_RESULTS', payload: response.data });
        return { success: true, data: response.data };
      }
      dispatch({ type: 'RIDES_ERROR', payload: response.error?.message || 'Search failed' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      dispatch({ type: 'RIDES_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch, state.rides.searchResults, state.rides.lastSearchParams]);

  const getRideById = useCallback(async (rideId: number) => {
    // Check if we already have this ride in our cached data
    const cachedRide = state.rides.myRides.find(ride => ride.id === rideId) ||
                       state.rides.searchResults.find(ride => ride.id === rideId);
    
    if (cachedRide) {
      dispatch({ type: 'RIDES_SET_CURRENT', payload: cachedRide });
      return { success: true, data: cachedRide };
    }

    dispatch({ type: 'RIDES_LOADING', payload: true });
    try {
      const response = await ridesApiService.getRideById(rideId);
      if (response.success && response.data) {
        dispatch({ type: 'RIDES_SET_CURRENT', payload: response.data });
        return { success: true, data: response.data };
      }
      dispatch({ type: 'RIDES_ERROR', payload: response.error?.message || 'Failed to fetch ride' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch ride';
      dispatch({ type: 'RIDES_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch, state.rides.myRides, state.rides.searchResults]);

  const updateRide = useCallback(async (rideId: number, updates: Partial<CreateRideRequest>) => {
    dispatch({ type: 'RIDES_LOADING', payload: true });
    try {
      const response = await ridesApiService.updateRide(rideId, updates);
      if (response.success && response.data) {
        // Update the ride in our cached data
        const updatedMyRides = state.rides.myRides.map(ride =>
          ride.id === rideId ? response.data! : ride
        );
        dispatch({ type: 'RIDES_SET_MY_RIDES', payload: updatedMyRides });
        
        // Update current ride if it's the same
        if (state.rides.currentRide?.id === rideId) {
          dispatch({ type: 'RIDES_SET_CURRENT', payload: response.data });
        }
        
        return { success: true, data: response.data };
      }
      dispatch({ type: 'RIDES_ERROR', payload: response.error?.message || 'Failed to update ride' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update ride';
      dispatch({ type: 'RIDES_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch, state.rides.myRides, state.rides.currentRide]);

  const cancelRide = useCallback(async (rideId: number) => {
    dispatch({ type: 'RIDES_LOADING', payload: true });
    try {
      const response = await ridesApiService.cancelRide(rideId);
      if (response.success) {
        // Remove the ride from our cached data
        const updatedMyRides = state.rides.myRides.filter(ride => ride.id !== rideId);
        dispatch({ type: 'RIDES_SET_MY_RIDES', payload: updatedMyRides });
        
        // Clear current ride if it's the cancelled one
        if (state.rides.currentRide?.id === rideId) {
          dispatch({ type: 'RIDES_SET_CURRENT', payload: null });
        }
        
        return { success: true };
      }
      dispatch({ type: 'RIDES_ERROR', payload: response.error?.message || 'Failed to cancel ride' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel ride';
      dispatch({ type: 'RIDES_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch, state.rides.myRides, state.rides.currentRide]);

  const bookRide = useCallback(async (bookingData: BookingRequest) => {
    dispatch({ type: 'RIDES_LOADING', payload: true });
    try {
      const response = await ridesApiService.bookRide(bookingData);
      if (response.success && response.data) {
        // Optionally refresh my rides to show booked rides
        const myRidesResponse = await ridesApiService.getMyRides();
        if (myRidesResponse.success && myRidesResponse.data) {
          dispatch({ type: 'RIDES_SET_MY_RIDES', payload: myRidesResponse.data });
        }
        return { success: true, data: response.data };
      }
      dispatch({ type: 'RIDES_ERROR', payload: response.error?.message || 'Failed to book ride' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to book ride';
      dispatch({ type: 'RIDES_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const getRideBookings = useCallback(async (rideId: number) => {
    try {
      const response = await ridesApiService.getRideBookings(rideId);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bookings';
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateBookingStatus = useCallback(async (bookingId: number, status: 'accepted' | 'rejected') => {
    try {
      const response = await ridesApiService.updateBookingStatus(bookingId, status);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking status';
      return { success: false, error: errorMessage };
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'RIDES_CLEAR_ERROR' });
  }, [dispatch]);

  const clearSearchResults = useCallback(() => {
    dispatch({ type: 'RIDES_SET_SEARCH_RESULTS', payload: [] });
    dispatch({ type: 'RIDES_SET_SEARCH_PARAMS', payload: {} as RideSearchParams });
  }, [dispatch]);

  return {
    // State
    ...state.rides,
    // Actions
    createRide,
    getMyRides,
    searchRides,
    getRideById,
    updateRide,
    cancelRide,
    bookRide,
    getRideBookings,
    updateBookingStatus,
    clearError,
    clearSearchResults,
  };
};