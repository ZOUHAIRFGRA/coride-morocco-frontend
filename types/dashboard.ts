// Dashboard Types for Trading Dashboard
export type TimeRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";

export interface KpiItem {
  title: string;
  value: number;
  changeAbs: number;
  changePct: number;
  valueLabel?: string;
}

export type PlPeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface PlData {
  daily: KpiItem;
  weekly: KpiItem;
  monthly: KpiItem;
  yearly: KpiItem;
}

export interface KpiData {
  portfolioValue: KpiItem;
  plData: PlData;
  cashAvailable: KpiItem;
  investedPct: number;
}

export interface TimeSeriesPoint {
  t: number; // timestamp
  v: number; // value
}

export interface AllocationSlice {
  ticker: string;
  value: number;
  percent: number;
  unrealizedPlAbs: number;
  unrealizedPlPct: number;
  color: string;
}

export interface Trade {
  id: string;
  ticker: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  timestamp: number;
  pl?: number;
}

export interface ContributionItem {
  month: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL";
}

export interface RiskData {
  band: "Low" | "Medium" | "High";
  bandValue: number; // 0-100
  topPositionConcentrationPct: number;
  volatilityLevel: "Low" | "Medium" | "High";
  sharpe: number;
}

export interface LeaderboardItem {
  ticker: string;
  name: string;
  changePct: number;
  changeAbs: number;
  value: number;
}

export interface LeaderboardData {
  winners: LeaderboardItem[];
  losers: LeaderboardItem[];
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  imageUrl?: string;
  category?: string;
  url?: string;
}

export interface NewsData {
  topStories: NewsItem[];
}

export interface DashboardState {
  range: TimeRange;
  accountCurrency: string;
  kpis: KpiData;
  equitySeries: TimeSeriesPoint[];
  benchmarkSeries?: TimeSeriesPoint[];
  allocation: AllocationSlice[];
  trades: Trade[];
  contributions: ContributionItem[];
  risk: RiskData;
  leaderboard: LeaderboardData;
  news: NewsData;
}
