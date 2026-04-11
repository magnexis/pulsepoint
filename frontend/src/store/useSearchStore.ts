import { create } from "zustand";

type SearchState = {
  query: string;
  location: string;
  page: number;
  pageSize: number;
  setQuery: (value: string) => void;
  setLocation: (value: string) => void;
  setPage: (value: number) => void;
};

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  location: "",
  page: 1,
  pageSize: 8,
  setQuery: (value) => set({ query: value, page: 1 }),
  setLocation: (value) => set({ location: value, page: 1 }),
  setPage: (value) => set({ page: value }),
}));

