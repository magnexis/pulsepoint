import { useEffect, useState } from "react";

import { api, getErrorMessage } from "@/lib/api";
import type { SearchResponse } from "@/lib/types";

type State = {
  data: SearchResponse | null;
  isLoading: boolean;
  error: string | null;
};

export function useBusinesses(params: {
  query?: string;
  location?: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}) {
  const [state, setState] = useState<State>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (params.enabled === false) {
      setState({
        data: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    let isMounted = true;
    setState((current) => ({
      ...current,
      isLoading: true,
      error: null,
    }));

    api
      .get<SearchResponse>("/businesses", {
        params: {
          query: params.query,
          location: params.location,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 8,
        },
      })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setState({
          data: null,
          isLoading: false,
          error: getErrorMessage(error),
        });
      });

    return () => {
      isMounted = false;
    };
  }, [params.enabled, params.location, params.page, params.pageSize, params.query]);

  return state;
}

