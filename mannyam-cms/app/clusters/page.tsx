import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClustersClient } from "./ClustersClient";

export const dynamic = "force-dynamic";

export default async function ClustersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["Admin", "Content Manager", "Marketer"].includes(profile.role)) {
    redirect("/dashboard?error=access_denied");
  }

  // 1. Fetch all clusters
  const { data: clustersData } = await supabase
    .from("clusters")
    .select("*")
    .order("name", { ascending: true });

  const clusters = clustersData || [];

  // 2. Fetch pages & posts to resolve pillar titles
  const [pagesResult, postsResult] = await Promise.all([
    supabase.from("pages").select("id, title, slug"),
    supabase.from("posts").select("id, title, slug")
  ]);

  const idToTitle: Record<string, string> = {};
  (pagesResult.data || []).forEach(p => { idToTitle[p.id] = p.title; });
  (postsResult.data || []).forEach(p => { idToTitle[p.id] = p.title; });

  // 3. Fetch cluster_items (spokes) to count spokes and calculate coverage
  const { data: itemsData } = await supabase
    .from("cluster_items")
    .select("id, cluster_id, page_id, post_id, package_id");

  const items = itemsData || [];

  // 4. Fetch internal links to calculate coverage percentage
  const { data: linksData } = await supabase
    .from("internal_links")
    .select("source_id, target_id");

  const links = linksData || [];

  // 5. Map cluster details and calculate coverage
  const formattedClusters = clusters.map(cluster => {
    const pillarTitle = cluster.pillar_page_id ? (idToTitle[cluster.pillar_page_id] || "Unknown Page") : "Unknown Page";
    
    // Find all spokes for this cluster
    const clusterSpokes = items.filter(item => item.cluster_id === cluster.id);
    const spokeCount = clusterSpokes.length;

    // Get the IDs of the spokes (can be page_id, post_id, or package_id)
    const spokeIds = clusterSpokes
      .map(item => item.page_id || item.post_id || item.package_id)
      .filter((id): id is string => id !== null);

    // Calculate coverage: how many spokes have a link pointing back to the pillar page
    let linkedSpokes = 0;
    if (spokeCount > 0 && cluster.pillar_page_id) {
      const linkedIdsSet = new Set<string>();
      links.forEach(link => {
        if (link.target_id === cluster.pillar_page_id && spokeIds.includes(link.source_id)) {
          linkedIdsSet.add(link.source_id);
        }
      });
      linkedSpokes = linkedIdsSet.size;
    }

    const coverage = spokeCount > 0 ? Math.round((linkedSpokes / spokeCount) * 100) : 0;

    return {
      id: cluster.id,
      name: cluster.name,
      pillarTitle,
      spokeCount,
      coverage
    };
  });

  const canWrite = ["Admin", "Content Manager"].includes(profile.role);

  return (
    <ClustersClient
      initialClusters={formattedClusters}
      canWrite={canWrite}
    />
  );
}
