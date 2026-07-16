import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClusterFormOptions } from "../../actions";
import { ClusterEditor } from "@/components/clusters/ClusterEditor";

export const dynamic = "force-dynamic";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClusterPage({ params }: EditPageProps) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile to verify role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["Admin", "Content Manager"].includes(profile.role)) {
    redirect("/clusters?error=access_denied");
  }

  // 1. Fetch Cluster
  const { data: clusterData } = await supabase
    .from("clusters")
    .select("id, name, pillar_page_id")
    .eq("id", id)
    .single();

  if (!clusterData || !clusterData.pillar_page_id) {
    redirect("/clusters");
  }

  const pillarPageId = clusterData.pillar_page_id;

  // 2. Fetch Spokes (cluster_items) with content/description
  const { data: items } = await supabase
    .from("cluster_items")
    .select(`
      id,
      page_id,
      post_id,
      package_id,
      pages(id, title, slug, content),
      posts(id, title, slug, content),
      packages(id, title, slug, description)
    `)
    .eq("cluster_id", id);

  type SpokeQueryResult = {
    pages: { id: string; title: string; slug: string; content: unknown } | null;
    posts: { id: string; title: string; slug: string; content: unknown } | null;
    packages: { id: string; title: string; slug: string; description: unknown } | null;
  };

  type MappedSpoke = {
    id: string;
    title: string;
    slug: string;
    type: "Page" | "Post" | "Package";
    content: unknown;
  };

  const spokes = ((items || []) as unknown as SpokeQueryResult[]).map((item) => {
    if (item.pages) {
      return {
        id: item.pages.id,
        title: item.pages.title,
        slug: item.pages.slug,
        type: "Page" as const,
        content: item.pages.content
      };
    } else if (item.posts) {
      return {
        id: item.posts.id,
        title: item.posts.title,
        slug: item.posts.slug,
        type: "Post" as const,
        content: item.posts.content
      };
    } else if (item.packages) {
      return {
        id: item.packages.id,
        title: item.packages.title,
        slug: item.packages.slug,
        type: "Package" as const,
        content: item.packages.description
      };
    }
    return null;
  }).filter((s): s is MappedSpoke => s !== null);

  // 3. Fetch Pillar details to resolve title/slug
  let pillarTitle = "Pillar Page";
  
  // Try fetching from pages
  const { data: pPage } = await supabase
    .from("pages")
    .select("title, slug")
    .eq("id", pillarPageId)
    .maybeSingle();

  if (pPage) {
    pillarTitle = pPage.title;
  } else {
    // Try posts
    const { data: pPost } = await supabase
      .from("posts")
      .select("title, slug")
      .eq("id", pillarPageId)
      .maybeSingle();
    if (pPost) {
      pillarTitle = pPost.title;
    }
  }

  // 4. Fetch internal links between the cluster nodes
  const clusterNodeIds = [pillarPageId, ...spokes.map(s => s.id)];
  
  const { data: linksData } = await supabase
    .from("internal_links")
    .select("id, source_id, target_id, anchor_text, created_at")
    .in("source_id", clusterNodeIds)
    .in("target_id", clusterNodeIds);

  // Map source and target titles in JS
  const idToTitle: Record<string, string> = {
    [pillarPageId]: pillarTitle
  };
  spokes.forEach(s => {
    idToTitle[s.id] = s.title;
  });

  const internalLinks = (linksData || []).map(link => ({
    id: link.id,
    source_id: link.source_id,
    target_id: link.target_id,
    anchor_text: link.anchor_text,
    created_at: link.created_at,
    src_title: idToTitle[link.source_id] || "Unknown Page",
    tgt_title: idToTitle[link.target_id] || "Unknown Page"
  }));

  // 5. Fetch general selector options
  const { pillarOptions, spokeOptions } = await getClusterFormOptions();

  const clusterPayload = {
    id: clusterData.id,
    name: clusterData.name,
    pillar_page_id: pillarPageId,
    spokes,
    internalLinks
  };

  return (
    <ClusterEditor
      cluster={clusterPayload}
      pillarOptions={pillarOptions}
      spokeOptions={spokeOptions}
      role={profile.role}
    />
  );
}
