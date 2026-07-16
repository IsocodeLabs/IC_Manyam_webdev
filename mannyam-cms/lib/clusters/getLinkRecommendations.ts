export type Recommendation = {
  spokeId: string;
  spokeTitle: string;
  suggestedAnchorText: string;
  keywordFound: string;
  pillarSlug: string;
  frequency: number;
};

// Helper to extract clean visible text from content (works for JSON blocks and HTML strings)
export function extractTextFromContent(content: unknown): string {
  if (!content) return "";
  
  let text = "";
  if (typeof content === "string") {
    text = content;
  } else if (Array.isArray(content)) {
    // If it is a Page's blocks array
    for (const block of content) {
      const data = block.data || {};
      if (data.headline) text += " " + data.headline;
      if (data.subheadline) text += " " + data.subheadline;
      if (data.content) text += " " + data.content;
      if (data.body) text += " " + data.body;
      if (data.quote) text += " " + data.quote;
      
      if (Array.isArray(data.features)) {
        for (const f of data.features) {
          if (f.title) text += " " + f.title;
          if (f.description) text += " " + f.description;
        }
      }
    }
  } else if (typeof content === "object") {
    // Fallback if it's already stringified or is a single block
    try {
      text = JSON.stringify(content);
    } catch {
      text = "";
    }
  }
  
  // Strip HTML tags to get clean visible words
  return text.replace(/<[^>]*>/g, " ");
}

export function getLinkRecommendations(
  pillarTitle: string,
  pillarSlug: string,
  spokes: { id: string; title: string; content: unknown }[],
  existingLinks: { source_id: string; target_id: string }[],
  pillarId: string
): Recommendation[] {
  const stopWords = new Set([
    "a", "an", "the", "in", "of", "for", "to", "and", "with", "on", "at", "by", "from", "is", "it"
  ]);

  // Clean title words (removing punctuation, filtering stop words)
  const words = pillarTitle
    .split(/\s+/)
    .map((w) => w.replace(/[.,;:!?"'()\[\]{}]/g, "").trim())
    .filter((w) => w && !stopWords.has(w.toLowerCase()));

  if (words.length === 0) return [];

  // Generate consecutive phrases of the title (longest phrases first)
  const phrases: string[] = [];
  const n = words.length;
  for (let len = n; len >= 1; len--) {
    for (let i = 0; i <= n - len; i++) {
      const phrase = words.slice(i, i + len).join(" ");
      phrases.push(phrase);
    }
  }

  const recommendations: Recommendation[] = [];

  for (const spoke of spokes) {
    // 1. Skip if there is already an existing internal link from this spoke to the pillar page
    const alreadyLinked = existingLinks.some(
      (link) => link.source_id === spoke.id && link.target_id === pillarId
    );
    if (alreadyLinked) continue;

    // 2. Extract plain text from spoke content
    const plainText = extractTextFromContent(spoke.content);
    if (!plainText.trim()) continue;

    // Keep track of matched text intervals to avoid sub-phrase overlap
    // (e.g. matching "festival" inside "festival tours" twice)
    const matchedIntervals: { start: number; end: number }[] = [];

    for (const phrase of phrases) {
      const escaped = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "gi");
      
      let match;
      while ((match = regex.exec(plainText)) !== null) {
        const start = match.index;
        const end = regex.lastIndex;

        // Check if this overlaps with an already matched interval
        const isOverlapped = matchedIntervals.some(
          (interval) => !(end <= interval.start || start >= interval.end)
        );

        if (!isOverlapped) {
          matchedIntervals.push({ start, end });

          // Calculate match frequency of this keyword in the spoke content
          const occurrences = (plainText.match(new RegExp(`\\b${escaped}\\b`, "gi")) || []).length;

          recommendations.push({
            spokeId: spoke.id,
            spokeTitle: spoke.title,
            suggestedAnchorText: match[0],
            keywordFound: phrase,
            pillarSlug: pillarSlug,
            frequency: occurrences,
          });
        }
      }
    }
  }

  // Sort by frequency descending, then return top 5
  return recommendations
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);
}
