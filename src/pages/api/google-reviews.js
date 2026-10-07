import { env } from 'cloudflare:workers';
import {
  GOOGLE_REVIEWS_CACHE_KEY,
  GOOGLE_REVIEWS_FALLBACK,
  isFreshGoogleReviewsCache,
  selectFeaturedReview,
} from '../../lib/googleBusinessReviews.js';

export const prerender = false;

export async function GET() {
  const cached = await readCache();

  if (isFreshGoogleReviewsCache(cached)) {
    return json(cached);
  }

  if (!hasGoogleConfiguration()) {
    return json(cached || GOOGLE_REVIEWS_FALLBACK);
  }

  try {
    const live = await fetchGoogleBusinessReviews(cached);
    await env.SESSION?.put(GOOGLE_REVIEWS_CACHE_KEY, JSON.stringify(live));
    return json(live);
  } catch (error) {
    console.error('Google Business reviews refresh failed', error);
    return json(cached || GOOGLE_REVIEWS_FALLBACK);
  }
}

async function readCache() {
  try {
    return (await env.SESSION?.get(GOOGLE_REVIEWS_CACHE_KEY, 'json')) || null;
  } catch (error) {
    console.error('Google Business reviews cache read failed', error);
    return null;
  }
}

async function fetchGoogleBusinessReviews(cached) {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!tokenResponse.ok) throw new Error(`Google token request failed (${tokenResponse.status})`);

  const { access_token: accessToken } = await tokenResponse.json();
  const accountId = String(env.GOOGLE_BUSINESS_ACCOUNT_ID).replace(/^accounts\//, '');
  const locationId = String(env.GOOGLE_BUSINESS_LOCATION_ID).replace(/^locations\//, '');
  const reviewsUrl = new URL(
    `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`,
  );
  reviewsUrl.searchParams.set('pageSize', '50');
  reviewsUrl.searchParams.set('orderBy', 'updateTime desc');

  const reviewsResponse = await fetch(reviewsUrl, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!reviewsResponse.ok) throw new Error(`Google reviews request failed (${reviewsResponse.status})`);

  const data = await reviewsResponse.json();
  return {
    rating: Number(data.averageRating) || cached?.rating || GOOGLE_REVIEWS_FALLBACK.rating,
    reviewCount: Number(data.totalReviewCount) || cached?.reviewCount || GOOGLE_REVIEWS_FALLBACK.reviewCount,
    updatedAt: new Date().toISOString(),
    featuredReview: selectFeaturedReview(data.reviews, cached?.featuredReview || null),
  };
}

function hasGoogleConfiguration() {
  return [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
    'GOOGLE_BUSINESS_ACCOUNT_ID',
    'GOOGLE_BUSINESS_LOCATION_ID',
  ].every((name) => Boolean(env[name]));
}

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
