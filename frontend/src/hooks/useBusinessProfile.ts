import { useEffect, useState } from "react";

import { api, getErrorMessage } from "@/lib/api";
import type { AnalyticsResponse, BusinessProfile } from "@/lib/types";

type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

export function useBusinessProfile(
  id: string | undefined,
  page = 1,
  pageSize = 12,
  refreshKey = 0,
) {
  const [state, setState] = useState<AsyncState<BusinessProfile>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!id) {
      return;
    }

    let mounted = true;
    setState({
      data: null,
      isLoading: true,
      error: null,
    });

    api
      .get<BusinessProfile>(`/business/${id}`, {
        params: {
          page,
          pageSize,
        },
      })
      .then((response) => {
        if (!mounted) {
          return;
        }

        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }

        setState({
          data: null,
          isLoading: false,
          error: getErrorMessage(error),
        });
      });

    return () => {
      mounted = false;
    };
  }, [id, page, pageSize, refreshKey]);

  return state;
}

export function useAnalytics(id: string | undefined) {
  const [state, setState] = useState<AsyncState<AnalyticsResponse>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!id) {
      return;
    }

    let mounted = true;

    api
      .get<AnalyticsResponse>(`/analytics/${id}`)
      .then((response) => {
        if (!mounted) {
          return;
        }

        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }

        setState({
          data: null,
          isLoading: false,
          error: getErrorMessage(error),
        });
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  return state;
}
