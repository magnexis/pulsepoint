import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

const PublicLayout = lazy(() => import("@/components/public-layout").then((module) => ({ default: module.PublicLayout })));
const WorkspaceLayout = lazy(() => import("@/components/workspace-layout").then((module) => ({ default: module.WorkspaceLayout })));
const OwnerLayout = lazy(() => import("@/components/owner-layout").then((module) => ({ default: module.OwnerLayout })));
const SettingsLayout = lazy(() => import("@/components/settings-layout").then((module) => ({ default: module.SettingsLayout })));
const AdminLayout = lazy(() => import("@/components/admin-layout").then((module) => ({ default: module.AdminLayout })));

const HomePage = lazy(() => import("@/pages/HomePage").then((module) => ({ default: module.HomePage })));
const SearchPage = lazy(() => import("@/pages/SearchPage").then((module) => ({ default: module.SearchPage })));
const BusinessPage = lazy(() => import("@/pages/BusinessPage").then((module) => ({ default: module.BusinessPage })));
const PricingPage = lazy(() => import("@/pages/PricingPage").then((module) => ({ default: module.PricingPage })));
const AboutPage = lazy(() => import("@/pages/AboutPage").then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import("@/pages/ContactPage").then((module) => ({ default: module.ContactPage })));
const LoginPage = lazy(() => import("@/pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/RegisterPage").then((module) => ({ default: module.RegisterPage })));
const ApiDocsPage = lazy(() => import("@/pages/ApiDocsPage").then((module) => ({ default: module.ApiDocsPage })));

const DashboardPage = lazy(() => import("@/pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const WatchlistPage = lazy(() => import("@/pages/WatchlistPage").then((module) => ({ default: module.WatchlistPage })));
const AlertsPage = lazy(() => import("@/pages/AlertsPage").then((module) => ({ default: module.AlertsPage })));
const ReportsPage = lazy(() => import("@/pages/ReportsPage").then((module) => ({ default: module.ReportsPage })));
const HistoryPage = lazy(() => import("@/pages/HistoryPage").then((module) => ({ default: module.HistoryPage })));

const OwnerOverviewPage = lazy(() => import("@/pages/OwnerOverviewPage").then((module) => ({ default: module.OwnerOverviewPage })));
const OwnerAnalyticsPage = lazy(() => import("@/pages/OwnerAnalyticsPage").then((module) => ({ default: module.OwnerAnalyticsPage })));
const OwnerResponsesPage = lazy(() => import("@/pages/OwnerResponsesPage").then((module) => ({ default: module.OwnerResponsesPage })));
const OwnerSettingsPage = lazy(() => import("@/pages/OwnerSettingsPage").then((module) => ({ default: module.OwnerSettingsPage })));

const ProfileSettingsPage = lazy(() => import("@/pages/settings/ProfileSettingsPage").then((module) => ({ default: module.ProfileSettingsPage })));
const AccountSettingsPage = lazy(() => import("@/pages/settings/AccountSettingsPage").then((module) => ({ default: module.AccountSettingsPage })));
const NotificationSettingsPage = lazy(() => import("@/pages/settings/NotificationSettingsPage").then((module) => ({ default: module.NotificationSettingsPage })));
const PrivacySettingsPage = lazy(() => import("@/pages/settings/PrivacySettingsPage").then((module) => ({ default: module.PrivacySettingsPage })));
const SecuritySettingsPage = lazy(() => import("@/pages/settings/SecuritySettingsPage").then((module) => ({ default: module.SecuritySettingsPage })));
const ApiSettingsPage = lazy(() => import("@/pages/settings/ApiSettingsPage").then((module) => ({ default: module.ApiSettingsPage })));

const AdminPage = lazy(() => import("@/pages/AdminPage").then((module) => ({ default: module.AdminPage })));
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage").then((module) => ({ default: module.AdminUsersPage })));
const AdminBusinessesPage = lazy(() => import("@/pages/AdminBusinessesPage").then((module) => ({ default: module.AdminBusinessesPage })));
const AdminReportsPage = lazy(() => import("@/pages/AdminReportsPage").then((module) => ({ default: module.AdminReportsPage })));
const AdminSystemPage = lazy(() => import("@/pages/AdminSystemPage").then((module) => ({ default: module.AdminSystemPage })));

const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));

export default function App() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 text-sm text-muted-foreground">Loading PulsePoint workspace...</div>}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/business/:id" element={<BusinessPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/api-docs" element={<ApiDocsPage />} />
          <Route path="/404" element={<NotFoundPage />} />
        </Route>

        <Route element={<WorkspaceLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>

        <Route element={<OwnerLayout />}>
          <Route path="/owner" element={<OwnerOverviewPage />} />
          <Route path="/owner/analytics" element={<OwnerAnalyticsPage />} />
          <Route path="/owner/responses" element={<OwnerResponsesPage />} />
          <Route path="/owner/settings" element={<OwnerSettingsPage />} />
        </Route>

        <Route element={<SettingsLayout />}>
          <Route path="/settings/profile" element={<ProfileSettingsPage />} />
          <Route path="/settings/account" element={<AccountSettingsPage />} />
          <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
          <Route path="/settings/privacy" element={<PrivacySettingsPage />} />
          <Route path="/settings/security" element={<SecuritySettingsPage />} />
          <Route path="/settings/api" element={<ApiSettingsPage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/businesses" element={<AdminBusinessesPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/system" element={<AdminSystemPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
