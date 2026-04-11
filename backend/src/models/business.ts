import type { UnifiedSignalSource } from "./signal.js";

export type DiscoveredBusinessCandidate = {
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
  latitude: number;
  longitude: number;
  website?: string;
  phone?: string;
  googlePlaceId?: string;
  yelpBusinessId?: string;
  source: UnifiedSignalSource;
};

export type SearchBusinessesParams = {
  query?: string;
  location?: string;
  page: number;
  pageSize: number;
};

