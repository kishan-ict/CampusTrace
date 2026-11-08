// ============================================================
// AI Match Radar - Similarity Engine (Feature 7)
// Matches category, location, tags, and keywords
// ============================================================

export const calculateSimilarityMatch = (targetItem, candidateItem) => {
  // Opposites only: Lost matches Found and vice-versa
  if (targetItem.type === candidateItem.type) return null;
  if (targetItem.id === candidateItem.id) return null;

  let score = 0;
  const matchReasons = [];

  // 1. Category exact match (35%)
  if (targetItem.category && candidateItem.category) {
    if (targetItem.category.toLowerCase() === candidateItem.category.toLowerCase()) {
      score += 35;
      matchReasons.push(`Same category (${targetItem.category})`);
    }
  }

  // 2. Location match (25%)
  if (targetItem.location && candidateItem.location) {
    if (targetItem.location.toLowerCase() === candidateItem.location.toLowerCase()) {
      score += 25;
      matchReasons.push(`Exact location match (${targetItem.location})`);
    }
  }

  // 3. Tag overlaps (25%)
  const tagsA = (targetItem.tags || []).map(t => String(t).toLowerCase());
  const tagsB = (candidateItem.tags || []).map(t => String(t).toLowerCase());
  const commonTags = tagsA.filter(t => tagsB.includes(t));
  if (commonTags.length > 0) {
    score += Math.min(25, commonTags.length * 10);
    matchReasons.push(`Matching tags: ${commonTags.slice(0, 3).join(', ')}`);
  }

  // 4. Keyword matches in Title (15%)
  const wordsA = (targetItem.title || '').toLowerCase().split(/[\s,.-]+/).filter(w => w.length > 3);
  const wordsB = (candidateItem.title || '').toLowerCase().split(/[\s,.-]+/).filter(w => w.length > 3);
  const commonWords = wordsA.filter(w => wordsB.includes(w));
  if (commonWords.length > 0) {
    score += Math.min(15, commonWords.length * 8);
    matchReasons.push(`Keyword match: "${commonWords[0]}"`);
  }

  if (score < 35) return null;

  return {
    matchedItem: candidateItem,
    score: Math.min(98, score),
    reasons: matchReasons
  };
};

export const findRadarMatches = (item, allItems) => {
  if (!item || !allItems || allItems.length === 0) return [];
  const results = [];
  for (const candidate of allItems) {
    const res = calculateSimilarityMatch(item, candidate);
    if (res) results.push(res);
  }
  return results.sort((a, b) => b.score - a.score);
};

