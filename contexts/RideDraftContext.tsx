import React, { createContext, useContext, useState } from "react";
import type { LocationSuggestion } from "@/types/geospatial";

interface RideDraftContextType {
  pickup: LocationSuggestion | null;
  destination: LocationSuggestion | null;
  setPickup: (location: LocationSuggestion | null) => void;
  setDestination: (location: LocationSuggestion | null) => void;
  clearDraft: () => void;
}

const RideDraftContext = createContext<RideDraftContextType | undefined>(undefined);

/**
 * Shared pickup/destination selection, kept in sync across Home, Request Ride,
 * and Offer Ride so a location chosen on one screen isn't lost when navigating
 * to another (e.g. Home's "No Routes Found" -> "Request a Ride").
 */
export const RideDraftProvider = ({ children }: { children: React.ReactNode }) => {
  const [pickup, setPickup] = useState<LocationSuggestion | null>(null);
  const [destination, setDestination] = useState<LocationSuggestion | null>(null);

  const clearDraft = () => {
    setPickup(null);
    setDestination(null);
  };

  return (
    <RideDraftContext.Provider value={{ pickup, destination, setPickup, setDestination, clearDraft }}>
      {children}
    </RideDraftContext.Provider>
  );
};

export const useRideDraft = () => {
  const context = useContext(RideDraftContext);
  if (!context) {
    throw new Error("useRideDraft must be used within a RideDraftProvider");
  }
  return context;
};

export default RideDraftProvider;
