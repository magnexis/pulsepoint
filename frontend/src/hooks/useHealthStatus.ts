import { useEffect, useState } from "react";

import { api, getErrorMessage } from "@/lib/api";
import type { HealthStatus } from "@/lib/types";

export function useHealthStatus() {
  const [state, setState] = useState<{
    data: HealthStatus | null;
    isLoading: boolean;
    error: string | null;
  }>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    api
      .get<HealthStatus>("/health")
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
  }, []);

  return state;
}
