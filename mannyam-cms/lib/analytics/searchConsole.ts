import { google } from "googleapis";

export interface SearchConsoleRow {
  query?: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface Totals {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsoleData {
  rows: SearchConsoleRow[];
  totals: Totals;
  comparisonTotals: Totals;
}

/**
 * Calculates start and end dates for current and previous periods.
 * Google Search Console has a 3-day latency delay, so we offset by 3 days.
 */
export function getDatesForRange(range: "7d" | "28d" | "90d") {
  const days = range === "7d" ? 7 : range === "28d" ? 28 : 90;
  
  const today = new Date();
  
  // Offset by 3 days to ensure data is fully populated
  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 3);

  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (days - 1));

  const prevEndDate = new Date(startDate);
  prevEndDate.setDate(startDate.getDate() - 1);

  const prevStartDate = new Date(prevEndDate);
  prevStartDate.setDate(prevEndDate.getDate() - (days - 1));

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  return {
    current: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
    previous: {
      startDate: formatDate(prevStartDate),
      endDate: formatDate(prevEndDate),
    },
  };
}

/**
 * Fetches Search Console data for the specified date range.
 * Requires GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, and GSC_SITE_URL.
 */
export async function getSearchConsoleData(
  dateRange: "7d" | "28d" | "90d"
): Promise<SearchConsoleData> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const siteUrl = process.env.GSC_SITE_URL;

  if (!email || !privateKeyRaw || !siteUrl) {
    throw new Error("GSC credentials or site URL not configured.");
  }

  // Handle newline characters in the private key (often escaped as \n in env files)
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  const searchconsole = google.searchconsole({ version: "v1", auth });
  const { current, previous } = getDatesForRange(dateRange);

  // 1. Fetch detailed queries & pages for the current period
  const detailedQueryResponse = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: current.startDate,
      endDate: current.endDate,
      dimensions: ["query", "page"],
      rowLimit: 25000,
    },
  });

  const rawRows = detailedQueryResponse.data.rows || [];
  const rows: SearchConsoleRow[] = rawRows.map((r) => {
    // keys: [query, page]
    const query = r.keys?.[0] || "";
    const page = r.keys?.[1] || "";
    return {
      query,
      page,
      clicks: Number(r.clicks || 0),
      impressions: Number(r.impressions || 0),
      ctr: Number(r.ctr || 0),
      position: Number(r.position || 0),
    };
  });

  // 2. Fetch site-wide totals for the current period (without dimensions)
  const totalsResponse = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: current.startDate,
      endDate: current.endDate,
    },
  });

  const defaultTotals = { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const totals: Totals = totalsResponse.data.rows?.[0]
    ? {
        clicks: Number(totalsResponse.data.rows[0].clicks || 0),
        impressions: Number(totalsResponse.data.rows[0].impressions || 0),
        ctr: Number(totalsResponse.data.rows[0].ctr || 0),
        position: Number(totalsResponse.data.rows[0].position || 0),
      }
    : defaultTotals;

  // 3. Fetch site-wide totals for the previous period (for trend calculation)
  const prevTotalsResponse = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: previous.startDate,
      endDate: previous.endDate,
    },
  });

  const comparisonTotals: Totals = prevTotalsResponse.data.rows?.[0]
    ? {
        clicks: Number(prevTotalsResponse.data.rows[0].clicks || 0),
        impressions: Number(prevTotalsResponse.data.rows[0].impressions || 0),
        ctr: Number(prevTotalsResponse.data.rows[0].ctr || 0),
        position: Number(prevTotalsResponse.data.rows[0].position || 0),
      }
    : defaultTotals;

  return {
    rows,
    totals,
    comparisonTotals,
  };
}
