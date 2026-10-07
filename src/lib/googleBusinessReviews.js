export const GOOGLE_REVIEWS_CACHE_KEY = 'google-business-reviews:v1';
export const GOOGLE_REVIEWS_REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

export const GOOGLE_REVIEWS_FALLBACK = {
  rating: 5,
  reviewCount: 15,
  updatedAt: null,
  featuredReview: null,
};

export function isInterestingFiveStarReview(review) {
  if (review?.starRating !== 'FIVE') return false;

  const comment = String(review.comment || '').replace(/\s+/g, ' ').trim();
  const wordCount = comment ? comment.split(' ').length : 0;

  return comment.length >= 60 && wordCount >= 10;
}

export function selectFeaturedReview(reviews = [], currentReview = null) {
  const candidate = reviews
    .filter(isInterestingFiveStarReview)
    .sort((a, b) => reviewTimestamp(b) - reviewTimestamp(a))[0];

  if (!candidate) return currentReview;
  if (currentReview && reviewTimestamp(candidate) <= reviewTimestamp(currentReview)) {
    return currentReview;
  }

  return {
    id: candidate.reviewId,
    text: String(candidate.comment).replace(/\s+/g, ' ').trim(),
    author: candidate.reviewer?.displayName || 'Client Google',
    authorPhoto: candidate.reviewer?.profilePhotoUrl || null,
    createdAt: candidate.createTime || candidate.updateTime || null,
    updatedAt: candidate.updateTime || candidate.createTime || null,
  };
}

export function isFreshGoogleReviewsCache(data, now = Date.now()) {
  if (!data?.updatedAt) return false;
  const updatedAt = Date.parse(data.updatedAt);
  return Number.isFinite(updatedAt) && now - updatedAt < GOOGLE_REVIEWS_REFRESH_MS;
}

function reviewTimestamp(review) {
  const value = review?.updatedAt || review?.updateTime || review?.createdAt || review?.createTime;
  const timestamp = Date.parse(value || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}
