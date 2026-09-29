import { apiClient } from './apiClient'

export interface ReviewResponse {
    id: number;
    userName: string;
    placeName: string;
    rating: number;
    comment: string;
    sentimentScore: number;
    sentimentLabel: string;
    upvotes: number;
    createdAt: string;
}

const DEFAULT_MOCK_REVIEWS: ReviewResponse[] = [
  { id: 1, userName: 'Sarah Jenkins', placeName: 'Paris', rating: 5, comment: 'Absolutely breathtaking! The food, the culture, and the Eiffel Tower at night are a dream come true. Highly recommend!', sentimentScore: 0.9, sentimentLabel: 'Positive', upvotes: 24, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 2, userName: 'David Chen', placeName: 'Kyoto', rating: 5, comment: 'The bamboo forest is serene. We stayed at a traditional ryokan and it was the most peaceful experience of my life.', sentimentScore: 0.85, sentimentLabel: 'Positive', upvotes: 18, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 3, userName: 'Emma Watson', placeName: 'New York', rating: 3, comment: 'Very crowded and expensive, but the museums are world-class. You definitely need to plan ahead.', sentimentScore: 0.1, sentimentLabel: 'Neutral', upvotes: 7, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 4, userName: 'Michael Scott', placeName: 'Hallstatt', rating: 4, comment: 'Looks exactly like the pictures. A bit too many tourists during the day, but the mornings are magical.', sentimentScore: 0.6, sentimentLabel: 'Positive', upvotes: 12, createdAt: new Date(Date.now() - 86400000 * 15).toISOString() }
];

const getLocalReviews = (): ReviewResponse[] => {
  const stored = localStorage.getItem('mock_reviews');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('mock_reviews', JSON.stringify(DEFAULT_MOCK_REVIEWS));
  return DEFAULT_MOCK_REVIEWS;
};

const saveLocalReviews = (reviews: ReviewResponse[]) => {
  localStorage.setItem('mock_reviews', JSON.stringify(reviews));
};

export const reviewService = {
    async getGlobalReviews() {
        try {
            return await apiClient.get<ReviewResponse[]>('/reviews/all');
        } catch (e) {
            console.error('Error fetching reviews, falling back to mock:', e);
            return getLocalReviews();
        }
    },
    
    async getPlaceReviews(placeId: number) {
        try {
            return await apiClient.get<ReviewResponse[]>(`/reviews/place/${placeId}`);
        } catch (e) {
            console.error('Error fetching place reviews, falling back to mock:', e);
            return getLocalReviews().filter(r => r.placeName.length > 0); // Simplified for mock
        }
    },
    
    async submitReview(placeId: number, rating: number, comment: string, mockPlaceName?: string) {
        try {
            return await apiClient.post<ReviewResponse>('/reviews', { placeId, rating, comment, photos: [] });
        } catch (e) {
            console.error('Error submitting review, falling back to mock:', e);
            
            // Simple sentiment analysis mock for offline
            let sentimentLabel = 'Neutral';
            let sentimentScore = 0.5;
            const lowerComment = comment.toLowerCase();
            if (lowerComment.includes('great') || lowerComment.includes('beautiful') || lowerComment.includes('amazing')) {
                sentimentLabel = 'Positive';
                sentimentScore = 0.9;
            } else if (lowerComment.includes('bad') || lowerComment.includes('worst') || lowerComment.includes('terrible')) {
                sentimentLabel = 'Negative';
                sentimentScore = 0.1;
            }

            const newReview: ReviewResponse = {
                id: Date.now(),
                userName: 'You',
                placeName: mockPlaceName || ('Destination ' + placeId),
                rating,
                comment,
                sentimentScore,
                sentimentLabel,
                upvotes: 0,
                createdAt: new Date().toISOString()
            };
            
            const current = getLocalReviews();
            saveLocalReviews([newReview, ...current]);
            return newReview;
        }
    },
    
    async upvoteReview(reviewId: number, isUndo: boolean = false) {
        try {
            return await apiClient.post<void>(`/reviews/${reviewId}/upvote?undo=${isUndo ? 'true' : 'false'}`, {});
        } catch (e) {
            console.error('Error upvoting, falling back to mock:', e);
            const current = getLocalReviews();
            const delta = isUndo ? -1 : 1;
            const updated = current.map(r => r.id === reviewId ? { ...r, upvotes: Math.max(0, (r.upvotes || 0) + delta) } : r);
            saveLocalReviews(updated);
        }
    }
}
