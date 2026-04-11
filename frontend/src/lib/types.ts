export type SourceBreakdown = {
  source: string;
  signalCount: number;
  weightedSentiment: number;
  complaintCount: number;
  responseRate: number;
  activityLevel: number;
};

export type BusinessSummary = {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  website: string | null;
  phone: string | null;
  healthScore: number;
  trustScore: number;
  riskLevel: "low" | "medium" | "high";
  trend: "improving" | "declining" | "stable";
  lastSignalAt: string | null;
  lastSyncedAt: string | null;
  sourceBreakdown: SourceBreakdown[];
  activeAlerts: Array<{
    severity: string;
    title: string;
  }>;
  location: {
    city: string;
    state: string;
    postalCode: string | null;
    country: string;
    latitude: number;
    longitude: number;
    label: string;
  };
};

export type SearchResponse = {
  data: BusinessSummary[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    hasNextPage: boolean;
  };
};

export type BusinessProfile = {
  data: BusinessSummary & {
    reports: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      severity: number;
      status: string;
      createdAt: string;
      user: {
        name: string;
        email: string;
      } | null;
    }>;
    alerts: Array<{
      id: string;
      severity: string;
      category: string;
      title: string;
      description: string;
      metricDelta: number | null;
      createdAt: string;
    }>;
    trendSnapshots: Array<{
      id: string;
      healthScore: number;
      trustScore: number;
      riskLevel: string;
      trend: string;
      weightedSentiment: number;
      complaintVelocity: number;
      activityConsistency: number;
      responsivenessRate: number;
      createdAt: string;
    }>;
    signalFeed: {
      data: Array<{
        id: string;
        source: string;
        tone: string;
        severity: string;
        type: string;
        sentiment: number;
        content: string;
        occurredAt: string;
        sourceUrl: string | null;
      }>;
      meta: {
        page: number;
        pageSize: number;
        total: number;
        hasNextPage: boolean;
      };
    };
    hiringInsights: {
      summary: string;
      classification: string;
      velocityPerWeek: number;
      growthRate: number;
      openRoles: Array<{
        externalId: string;
        source: "linkedin" | "indeed";
        role: string;
        frequency: number;
        timestamp: number;
        seniority: "entry" | "mid" | "senior";
        department: string;
      }>;
      recentSignals: Array<{
        id: string;
        source: string;
        role: string;
        frequency: number;
        department: string;
        seniority: string;
        timestamp: number;
      }>;
    };
    hiringTrends: {
      series7d: Array<{ date: string; value: number }>;
      series30d: Array<{ date: string; value: number }>;
      roles: Array<{
        id: string;
        source: string;
        role: string;
        frequency: number;
        department: string;
        seniority: string;
        timestamp: number;
      }>;
    };
  };
};

export type AnalyticsResponse = {
  data: {
    id: string;
    healthScore: number;
    trustScore: number;
    riskLevel: string;
    trend: string;
    sourceBreakdown: SourceBreakdown[];
    alerts: Array<{
      id: string;
      severity: string;
      category: string;
      title: string;
      description: string;
      createdAt: string;
    }>;
    trendSnapshots: Array<{
      createdAt: string;
      healthScore: number;
      trustScore: number;
      weightedSentiment: number;
      complaintVelocity: number;
      activityConsistency: number;
      responsivenessRate: number;
    }>;
    hiring: {
      summary: string;
      classification: string;
      velocityPerWeek: number;
      growthRate: number;
    };
  };
};

export type HiringInsightsResponse = {
  data: {
    summary: string;
    classification: string;
    velocityPerWeek: number;
    growthRate: number;
    openRoles: Array<{
      externalId: string;
      source: string;
      role: string;
      frequency: number;
      timestamp: number;
      seniority: string;
      department: string;
    }>;
    recentSignals: Array<{
      id: string;
      source: string;
      role: string;
      frequency: number;
      department: string;
      seniority: string;
      timestamp: number;
    }>;
  };
};

export type HiringTrendsResponse = {
  data: {
    series7d: Array<{ date: string; value: number }>;
    series30d: Array<{ date: string; value: number }>;
    roles: Array<{
      id: string;
      source: string;
      role: string;
      frequency: number;
      department: string;
      seniority: string;
      timestamp: number;
    }>;
  };
};

export type HealthStatus = {
  status: string;
  service: string;
  timestamp: string;
};

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  bio: string;
  profileImage: string | null;
  isPrivate: boolean;
  isSharingData: boolean;
};

export type AuthResponse = {
  data: {
    user: CurrentUser;
    session: {
      id: string;
      label: string;
    };
  };
};

export type CurrentUserResponse = {
  data: {
    user: CurrentUser;
    sessions: Array<{
      id: string;
      label: string;
      status: string;
      lastSeenAt: string;
      createdAt: string;
    }>;
  };
};

export type UserSettingsResponse = {
  data: {
    profile: {
      name: string;
      email: string;
      username: string;
      bio: string;
      profileImage: string | null;
    };
    notifications: {
      emailAlerts: boolean;
      riskAlerts: boolean;
      hiringAlerts: boolean;
    };
    privacy: {
      visibility: "public" | "private";
      shareData: boolean;
    };
    preferences: {
      theme: string;
      plan: string;
    };
    apiKey: string | null;
    apiKeyCreatedAt: string | null;
    apiUsageCount: number;
    twoFactorEnabled: boolean;
    watchlistCount: number;
    recentHistory: HistoryItem[];
  };
};

export type WatchlistResponse = {
  data: Array<{
    id: string;
    createdAt: string;
    business: {
      id: string;
      name: string;
      category: string;
      description: string;
      healthScore: number;
      trustScore: number;
      riskLevel: string;
      trend: string;
      location: string;
      activeAlerts: number;
    };
  }>;
};

export type AlertFeedResponse = {
  data: Array<{
    id: string;
    severity: string;
    category: string;
    title: string;
    description: string;
    createdAt: string;
    business: {
      id: string;
      name: string;
    };
    isRead: boolean;
  }>;
};

export type HistoryItem = {
  id: string;
  actionType: string;
  label: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
  business: {
    id: string;
    name: string;
    healthScore: number;
  } | null;
};

export type HistoryResponse = {
  data: HistoryItem[];
};

export type OwnerOverviewResponse = {
  data: Array<{
    id: string;
    name: string;
    healthScore: number;
    trustScore: number;
    trend: string;
    stats: {
      reports: number;
      recentHiringSignalCount: number;
    };
    snapshots: Array<{
      createdAt: string;
      healthScore: number;
      complaintVelocity: number;
    }>;
  }>;
};

export type OwnerAnalyticsResponse = {
  data: Array<{
    businessId: string;
    name: string;
    score: number;
    sourceBreakdown: Array<{
      source: string;
      signalCount: number;
      weightedSentiment: number;
    }>;
    trendSnapshots: Array<{
      createdAt: string;
      healthScore: number;
      trustScore: number;
    }>;
  }>;
};

export type OwnerResponsesResponse = {
  data: Array<{
    id: string;
    business: string;
    title: string;
    status: string;
    type: string;
    createdAt: string;
  }>;
};

export type AdminOverviewResponse = {
  data: {
    metrics: {
      users: number;
      businesses: number;
      reports: number;
      alerts: number;
    };
  };
};

export type AdminUsersResponse = {
  data: Array<{
    id: string;
    name: string;
    email: string;
    username: string;
    isBanned: boolean;
    watchlistCount: number;
    plan: string;
  }>;
};

export type AdminBusinessesResponse = {
  data: Array<{
    id: string;
    name: string;
    healthScore: number;
    trustScore: number;
    riskLevel: string;
    reports: number;
    alerts: number;
  }>;
};

export type AdminReportsResponse = {
  data: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    severity: number;
    business: string;
    user: string;
    createdAt: string;
  }>;
};

export type AdminSystemResponse = {
  data: {
    activeSessions: number;
    apiUsageCount: number;
    scheduler: string;
    deploymentTargets: string[];
  };
};

export type UserReportsResponse = {
  data: Array<{
    id: string;
    business: {
      id: string;
      name: string;
    };
    type: string;
    title: string;
    description: string;
    severity: number;
    status: string;
    createdAt: string;
  }>;
};
