/**
 * Shared utility to trigger on-demand ISR revalidation via secure POST.
 */
export async function triggerRevalidation(payload: {
  type: "page" | "post" | "package";
  slug: string;
  isFestival?: boolean;
  packageType?: string;
}) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const secret = process.env.REVALIDATE_SECRET;

    if (!secret) {
      console.warn("REVALIDATE_SECRET is not configured in process.env. Skipping on-demand revalidation.");
      return;
    }

    // Server-side fetch requires an absolute URL
    const response = await fetch(`${siteUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Revalidate-Secret": secret,
      },
      body: JSON.stringify({
        ...payload,
        secret,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Revalidation endpoint returned status ${response.status}:`, errText);
    } else {
      const result = await response.json().catch(() => ({}));
      console.log(`Successfully triggered revalidation for type ${payload.type} (slug: ${payload.slug}):`, result);
    }
  } catch (error) {
    console.error("Error triggering on-demand revalidation:", error);
  }
}
