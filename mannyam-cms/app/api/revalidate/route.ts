import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { type, slug, isFestival, packageType } = body;

    // Check secrets in authorization header, custom header, and body
    const secret = process.env.REVALIDATE_SECRET;
    const authHeader = request.headers.get("authorization");
    const customHeader = request.headers.get("x-revalidate-secret");

    let incomingSecret = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      incomingSecret = authHeader.substring(7);
    } else if (authHeader) {
      incomingSecret = authHeader;
    } else if (customHeader) {
      incomingSecret = customHeader;
    } else if (body.secret) {
      incomingSecret = body.secret;
    }

    if (!secret || incomingSecret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!type || !slug) {
      return NextResponse.json(
        { error: "Missing type or slug in payload" },
        { status: 400 }
      );
    }

    const paths: string[] = [];

    // Base paths that should always be revalidated for robustness
    // Keep it extremely robust: always revalidate the listing pages and sitemaps too (e.g., /experiences, /festivals, /journal, /sitemap.xml).
    const robustPaths = [
      "/experiences",
      "/festivals",
      "/journal",
      "/sitemap.xml",
    ];

    if (type === "page") {
      paths.push("/");
      // If slug is "/", it's already covered by homepage, otherwise /[slug]
      if (slug !== "/") {
        paths.push(`/${slug}`);
      }
    } else if (type === "post") {
      paths.push("/journal");
      paths.push(`/journal/${slug}`);
    } else if (type === "package") {
      paths.push("/");
      paths.push("/experiences");
      paths.push("/festivals");
      if (isFestival || packageType === "Festival") {
        paths.push(`/festivals/${slug}`);
      } else {
        paths.push(`/experiences/${slug}`);
      }
    } else {
      return NextResponse.json(
        { error: `Invalid type: ${type}` },
        { status: 400 }
      );
    }

    // Combine paths and remove duplicates
    const allPathsToRevalidate = Array.from(new Set([...paths, ...robustPaths]));

    // Execute revalidation
    for (const p of allPathsToRevalidate) {
      revalidatePath(p);
    }

    return NextResponse.json({
      revalidated: true,
      paths: allPathsToRevalidate,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
