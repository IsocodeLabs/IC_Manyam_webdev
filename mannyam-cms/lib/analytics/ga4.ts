import { BetaAnalyticsDataClient } from "@google-analytics/data";

export interface GA4Overview {
  sessions: number;
  totalUsers: number;
  pageViews: number;
  avgSessionDuration: number; // seconds
  bounceRate: number; // 0-1
}

export interface GA4TopPage {
  path: string;
  pageViews: number;
  users: number;
}

export interface GA4TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
}

export interface GA4DailyData {
  date: string;
  sessions: number;
  pageViews: number;
}

export interface GA4Data {
  overview: GA4Overview;
  topPages: GA4TopPage[];
  trafficSources: GA4TrafficSource[];
  daily: GA4DailyData[];
}

function getDateRange(range: "7d" | "28d" | "90d") {
  const days = range === "7d" ? 7 : range === "28d" ? 28 : 90;
  return { startDate: `${days}daysAgo`, endDate: "today" };
}

/**
 * Fetches GA4 analytics data using the Google Analytics Data API.
 * Requires GA4_PROPERTY_ID env var (numeric property ID, e.g. "123456789").
 * Uses the same service account credentials as GSC.
 */
export async function getGA4Data(range: "7d" | "28d" | "90d"): Promise<GA4Data> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!propertyId || !email || !privateKeyRaw) {
    throw new Error("GA4_PROPERTY_ID or service account credentials not configured.");
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
  const { startDate, endDate } = getDateRange(range);

  const client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: email,
      private_key: privateKey,
    },
  });

  const property = `properties/${propertyId}`;

  // 1. Overview metrics
  const [overviewResponse] = await client.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
    ],
  });

  const overviewRow = overviewResponse.rows?.[0];
  const overview: GA4Overview = {
    sessions: Number(overviewRow?.metricValues?.[0]?.value || 0),
    totalUsers: Number(overviewRow?.metricValues?.[1]?.value || 0),
    pageViews: Number(overviewRow?.metricValues?.[2]?.value || 0),
    avgSessionDuration: Number(overviewRow?.metricValues?.[3]?.value || 0),
    bounceRate: Number(overviewRow?.metricValues?.[4]?.value || 0),
  };

  // 2. Top pages by page views
  const [pagesResponse] = await client.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "pagePath" }],
    metrics: [
      { name: "screenPageViews" },
      { name: "totalUsers" },
    ],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 15,
  });

  const topPages: GA4TopPage[] = (pagesResponse.rows || []).map((row) => ({
    path: row.dimensionValues?.[0]?.value || "/",
    pageViews: Number(row.metricValues?.[0]?.value || 0),
    users: Number(row.metricValues?.[1]?.value || 0),
  }));

  // 3. Traffic sources
  const [sourcesResponse] = await client.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: "sessionSource" },
      { name: "sessionMedium" },
    ],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
    ],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 10,
  });

  const trafficSources: GA4TrafficSource[] = (sourcesResponse.rows || []).map((row) => ({
    source: row.dimensionValues?.[0]?.value || "(direct)",
    medium: row.dimensionValues?.[1]?.value || "(none)",
    sessions: Number(row.metricValues?.[0]?.value || 0),
    users: Number(row.metricValues?.[1]?.value || 0),
  }));

  // 4. Daily sessions + page views for chart
  const [dailyResponse] = await client.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "date" }],
    metrics: [
      { name: "sessions" },
      { name: "screenPageViews" },
    ],
    orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
  });

  const daily: GA4DailyData[] = (dailyResponse.rows || []).map((row) => {
    const raw = row.dimensionValues?.[0]?.value || "";
    // GA4 returns dates as YYYYMMDD, convert to YYYY-MM-DD
    const formatted = raw.length === 8
      ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
      : raw;
    return {
      date: formatted,
      sessions: Number(row.metricValues?.[0]?.value || 0),
      pageViews: Number(row.metricValues?.[1]?.value || 0),
    };
  });

  return { overview, topPages, trafficSources, daily };
}
