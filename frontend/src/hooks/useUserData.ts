import { useAsync } from "@/hooks/useAsync";
import { api, getErrorMessage } from "@/lib/api";
import type {
  AdminBusinessesResponse,
  AdminOverviewResponse,
  AdminReportsResponse,
  AdminSystemResponse,
  AdminUsersResponse,
  AlertFeedResponse,
  CurrentUserResponse,
  HistoryResponse,
  OwnerAnalyticsResponse,
  OwnerOverviewResponse,
  OwnerResponsesResponse,
  UserSettingsResponse,
  UserReportsResponse,
  WatchlistResponse,
} from "@/lib/types";

export function useCurrentUser(refreshKey = 0) {
  return useAsync(
    async () => (await api.get<CurrentUserResponse>("/auth/me")).data,
    [refreshKey],
  );
}

export function useUserSettings(refreshKey = 0) {
  return useAsync(
    async () => (await api.get<UserSettingsResponse>("/user/settings")).data,
    [refreshKey],
  );
}

export function useWatchlist(refreshKey = 0) {
  return useAsync(
    async () => (await api.get<WatchlistResponse>("/watchlist")).data,
    [refreshKey],
  );
}

export function useAlertsFeed(severity = "all", refreshKey = 0) {
  return useAsync(
    async () =>
      (
        await api.get<AlertFeedResponse>("/alerts", {
          params: { severity },
        })
      ).data,
    [severity, refreshKey],
  );
}

export function useHistoryFeed(refreshKey = 0) {
  return useAsync(
    async () => (await api.get<HistoryResponse>("/history")).data,
    [refreshKey],
  );
}

export function useUserReports(refreshKey = 0) {
  return useAsync(
    async () => (await api.get<UserReportsResponse>("/user/reports")).data,
    [refreshKey],
  );
}

export function useOwnerOverview(refreshKey = 0) {
  return useAsync(
    async () => (await api.get<OwnerOverviewResponse>("/owner")).data,
    [refreshKey],
  );
}

export function useOwnerAnalytics(refreshKey = 0) {
  return useAsync(
    async () => (await api.get<OwnerAnalyticsResponse>("/owner/analytics")).data,
    [refreshKey],
  );
}

export function useOwnerResponses(refreshKey = 0) {
  return useAsync(
    async () => (await api.get<OwnerResponsesResponse>("/owner/responses")).data,
    [refreshKey],
  );
}

export function useAdminOverview(refreshKey = 0) {
  return useAsync(
    async () => (await api.get<AdminOverviewResponse>("/admin")).data,
    [refreshKey],
  );
}

export function useAdminUsers(refreshKey = 0) {
  return useAsync(
    async () => (await api.get<AdminUsersResponse>("/admin/users")).data,
    [refreshKey],
  );
}

export function useAdminBusinesses(refreshKey = 0) {
  return useAsync(
    async () => (await api.get<AdminBusinessesResponse>("/admin/businesses")).data,
    [refreshKey],
  );
}

export function useAdminReports(refreshKey = 0) {
  return useAsync(
    async () => (await api.get<AdminReportsResponse>("/admin/reports")).data,
    [refreshKey],
  );
}

export function useAdminSystem(refreshKey = 0) {
  return useAsync(
    async () => (await api.get<AdminSystemResponse>("/admin/system")).data,
    [refreshKey],
  );
}

export async function apiAction<T>(factory: () => Promise<T>) {
  try {
    return await factory();
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
