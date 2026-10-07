import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isFreshGoogleReviewsCache,
  isInterestingFiveStarReview,
  selectFeaturedReview,
} from '../src/lib/googleBusinessReviews.js';

test('accepte uniquement un commentaire cinq étoiles suffisamment développé', () => {
  assert.equal(isInterestingFiveStarReview({ starRating: 'FOUR', comment: 'Un commentaire très détaillé qui ne doit pas être retenu car il manque une étoile.' }), false);
  assert.equal(isInterestingFiveStarReview({ starRating: 'FIVE', comment: 'Excellent !' }), false);
  assert.equal(isInterestingFiveStarReview({
    starRating: 'FIVE',
    comment: 'Benjamin nous a préparé un excellent repas avec des produits locaux, savoureux et parfaitement présenté.',
  }), true);
});

test('conserve l’avis actuel quand aucun avis plus récent ne convient', () => {
  const current = {
    id: 'current',
    text: 'Avis actuel',
    author: 'Marie',
    updatedAt: '2026-09-01T10:00:00Z',
  };
  const selected = selectFeaturedReview([
    { reviewId: 'short', starRating: 'FIVE', comment: 'Très bon !', updateTime: '2026-10-01T10:00:00Z' },
    {
      reviewId: 'old',
      starRating: 'FIVE',
      comment: 'Benjamin nous a préparé un excellent repas avec des produits locaux, savoureux et parfaitement présenté.',
      updateTime: '2026-08-01T10:00:00Z',
    },
  ], current);

  assert.deepEqual(selected, current);
});

test('sélectionne le nouvel avis admissible le plus récent', () => {
  const selected = selectFeaturedReview([
    {
      reviewId: 'newest',
      starRating: 'FIVE',
      comment: 'Benjamin nous a préparé un excellent repas avec des produits locaux, savoureux et parfaitement présenté.',
      reviewer: { displayName: 'Paul' },
      createTime: '2026-10-01T10:00:00Z',
      updateTime: '2026-10-02T10:00:00Z',
    },
  ]);

  assert.equal(selected.id, 'newest');
  assert.equal(selected.author, 'Paul');
});

test('le cache reste valable pendant sept jours', () => {
  const now = Date.parse('2026-10-07T12:00:00Z');
  assert.equal(isFreshGoogleReviewsCache({ updatedAt: '2026-10-01T12:00:01Z' }, now), true);
  assert.equal(isFreshGoogleReviewsCache({ updatedAt: '2026-09-30T11:59:59Z' }, now), false);
});
