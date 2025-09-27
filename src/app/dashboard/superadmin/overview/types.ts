import type {
  User,
  UserProfile,
  Doctor,
  Hospital,
  Subscription,
  SubscriptionPayment,
  SubscriptionPlan,
  SubscriberType,
  UserRole,
} from "@prisma/client";

// User with related entities
export interface UserWithRelations extends User {
  profile: UserProfile | null;
  doctor: Doctor | null;
  hospital: Hospital | null;
}

// Pending approval user
export interface PendingApprovalUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  profile: UserProfile | null;
  doctor: Doctor | null;
  hospital: Hospital | null;
}

// Subscription with related entities
export interface SubscriptionWithRelations extends Subscription {
  doctor?: Doctor | null;
  hospital?: Hospital | null;
  payments: SubscriptionPayment[];
}

// Payment with related entities
export interface SubscriptionPaymentWithRelations extends SubscriptionPayment {
  subscription: {
    id: string;
    plan: SubscriptionPlan;
    subscriberType: SubscriberType;
    doctor?: {
      id: string;
      user: {
        name: string;
        email: string;
      };
    } | null;
    hospital?: {
      id: string;
      name: string;
      email: string;
    } | null;
  };
}

// Subscription stats
export interface SubscriptionStats {
  totalActiveSubscriptions: number;
  totalRevenue: number;
  planStats: PlanStat[];
  recentPayments: SubscriptionPaymentWithRelations[];
}

// Plan statistics
export interface PlanStat {
  plan: SubscriptionPlan;
  //   subscriberType: SubscriberType;
  count: number;
  percentage: number;
  amount: number;
}

// Overview stat
export interface OverviewStat {
  title: string;
  value: string;
  icon: string;
  color: string;
}

// User growth data point
export interface UserGrowthDataPoint {
  month: string;
  patients: number;
  doctors: number;
  hospitals: number;
}

// Revenue data point
export interface RevenueDataPoint {
  date: string;
  subscriptions: number;
  total: number;
}

// User distribution data point
export interface DistributionDataPoint {
  name: string;
  value: number;
}

// Dashboard stats
export interface DashboardStats {
  overviewStats: OverviewStat[];
  userGrowthData: UserGrowthDataPoint[];
  revenueData: RevenueDataPoint[];
  userDistributionData: DistributionDataPoint[];
}

// KPI data
export interface KpiData {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  period: string;
  icon: string;
  color: string;
}

// Statistics data point
export interface StatisticsDataPoint {
  month: string;
  value: number;
}

// Statistics data
export interface StatisticsData {
  kpiData: KpiData[];
  userGrowthData: StatisticsDataPoint[];
  activeUsersData: StatisticsDataPoint[];
  revenueData: StatisticsDataPoint[];
  appointmentsData: StatisticsDataPoint[];
  userTypeData: DistributionDataPoint[];
  subscriptionTypeData: DistributionDataPoint[];
  platformUsageData: DistributionDataPoint[];
  regionData: DistributionDataPoint[];
}

export interface RevenueDataPoint {
  date: string;
  subscriptions: number;
  total: number;
}
