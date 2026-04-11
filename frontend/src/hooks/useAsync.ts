import { useEffect, useState } from "react";

export function useAsync<T>(
  factory: () => Promise<T>,
  dependencies: unknown[],
  enabled = true,
) {
  const [state, setState] = useState<{
    data: T | null;
    isLoading: boolean;
    error: string | null;
  }>({
    data: null,
    isLoading: enabled,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({
        data: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    let mounted = true;
    setState((current) => ({ ...current, isLoading: true, error: null }));

    factory()
      .then((data) => {
        if (!mounted) {
          return;
        }

        setState({
          data,
          isLoading: false,
          error: null,
        });
      })
      .catch((error: Error) => {
        if (!mounted) {
          return;
        }

        setState({
          data: null,
          isLoading: false,
          error: error.message,
        });
      });

    return () => {
      mounted = false;
    };
  }, dependencies);

  return state;
}
