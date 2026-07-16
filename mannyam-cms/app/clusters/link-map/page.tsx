import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LinkMapClient } from "./LinkMapClient";

export const dynamic = "force-dynamic";

export default async function LinkMapPage() {
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

  // 1. Fetch all internal links
  const { data: linksData } = await supabase
    .from("internal_links")
    .select("id, source_id, target_id, anchor_text");

  const rawLinks = linksData || [];

  // 2. Fetch all published pages, posts, and packages
  const [
    { data: pagesData },
    { data: postsData },
    { data: pkgsData },
    { data: clustersData },
    { data: clusterItemsData }
  ] = await Promise.all([
    supabase.from("pages").select("id, title, slug").eq("status", "Published"),
    supabase.from("posts").select("id, title, slug").eq("status", "Published"),
    supabase.from("packages").select("id, title, slug"),
    supabase.from("clusters").select("id, name, pillar_page_id"),
    supabase.from("cluster_items").select("id, cluster_id, page_id, post_id, package_id")
  ]);

  const pages = pagesData || [];
  const posts = postsData || [];
  const packages = pkgsData || [];
  const clusters = clustersData || [];
  const clusterItems = clusterItemsData || [];

  // 3. Create a mapping from document ID to its parent Cluster Name
  const idToClusterName: Record<string, string> = {};
  clusters.forEach((cluster) => {
    if (cluster.pillar_page_id) {
      idToClusterName[cluster.pillar_page_id] = cluster.name;
    }
  });
  clusterItems.forEach((item) => {
    const cluster = clusters.find((c) => c.id === item.cluster_id);
    if (cluster) {
      const spokeId = item.page_id || item.post_id || item.package_id;
      if (spokeId) {
        idToClusterName[spokeId] = cluster.name;
      }
    }
  });

  // 4. Create lookup structures and map nodes
  const idToNodeInfo: Record<string, { title: string; slug: string; type: "Page" | "Post" | "Package"; clusterName: string }> = {};
  
  const allNodesList: { id: string; title: string; slug: string; type: "Page" | "Post" | "Package"; clusterName: string }[] = [];

  pages.forEach(p => {
    const node = { id: p.id, title: p.title, slug: p.slug, type: "Page" as const, clusterName: idToClusterName[p.id] || "-" };
    idToNodeInfo[p.id] = node;
    allNodesList.push(node);
  });

  posts.forEach(p => {
    const node = { id: p.id, title: p.title, slug: p.slug, type: "Post" as const, clusterName: idToClusterName[p.id] || "-" };
    idToNodeInfo[p.id] = node;
    allNodesList.push(node);
  });

  packages.forEach(p => {
    const node = { id: p.id, title: p.title, slug: p.slug, type: "Package" as const, clusterName: idToClusterName[p.id] || "-" };
    idToNodeInfo[p.id] = node;
    allNodesList.push(node);
  });

  // 5. Build active node IDs set from links to represent the link map
  // However, we want the summary table and orphans lists to display all pages,
  // while the graph only needs to show nodes that have at least one link (or show all nodes to be comprehensive).
  // The prompt says:
  // "Nodes: each unique page/post that appears as source or target"
  // So the nodes in the graph should ONLY be pages/posts/packages that appear in the links!
  const activeNodeIds = new Set<string>();
  rawLinks.forEach(link => {
    if (idToNodeInfo[link.source_id] && idToNodeInfo[link.target_id]) {
      activeNodeIds.add(link.source_id);
      activeNodeIds.add(link.target_id);
    }
  });

  // 6. Calculate inbound and outbound counts
  const inboundCounts: Record<string, number> = {};
  const outboundCounts: Record<string, number> = {};

  rawLinks.forEach(link => {
    if (idToNodeInfo[link.source_id] && idToNodeInfo[link.target_id]) {
      outboundCounts[link.source_id] = (outboundCounts[link.source_id] || 0) + 1;
      inboundCounts[link.target_id] = (inboundCounts[link.target_id] || 0) + 1;
    }
  });

  // 7. Filter nodes and links for the visual graph
  const graphNodes = allNodesList
    .filter(n => activeNodeIds.has(n.id))
    .map(n => ({
      id: n.id,
      title: n.title,
      slug: n.slug,
      type: n.type,
      inboundCount: inboundCounts[n.id] || 0,
      outboundCount: outboundCounts[n.id] || 0,
      clusterName: n.clusterName
    }));

  const graphLinks = rawLinks
    .filter(link => idToNodeInfo[link.source_id] && idToNodeInfo[link.target_id])
    .map(link => ({
      id: link.id,
      source: link.source_id,
      target: link.target_id,
      anchorText: link.anchor_text
    }));

  // 8. Prepare all document rows for the summary table
  const summaryRows = allNodesList.map(n => ({
    id: n.id,
    title: n.title,
    slug: n.slug,
    type: n.type,
    inboundCount: inboundCounts[n.id] || 0,
    outboundCount: outboundCounts[n.id] || 0,
    clusterName: n.clusterName
  })).sort((a, b) => b.inboundCount - a.inboundCount); // Sort by inbound links descending

  // 9. Find Orphan Pages (pages and posts with zero inbound links)
  // Packages are excluded from orphans because they are commercial destinations, not SEO contents
  const orphans = allNodesList
    .filter(n => (n.type === "Page" || n.type === "Post") && (inboundCounts[n.id] || 0) === 0)
    .map(n => ({
      id: n.id,
      title: n.title,
      slug: n.slug,
      type: n.type,
      clusterName: n.clusterName
    }));

  return (
    <LinkMapClient
      initialNodes={graphNodes}
      initialLinks={graphLinks}
      summaryRows={summaryRows}
      orphans={orphans}
    />
  );
}
