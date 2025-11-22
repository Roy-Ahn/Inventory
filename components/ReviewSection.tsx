import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Review } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ReviewSectionProps {
    spaceId: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ spaceId }) => {
    const { currentUser: user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReviews();
    }, [spaceId]);

    const fetchReviews = async () => {
        try {
            // First, get reviews
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select('*')
                .eq('space_id', spaceId)
                .order('created_at', { ascending: false });

            if (reviewsError) throw reviewsError;

            if (!reviewsData || reviewsData.length === 0) {
                setReviews([]);
                return;
            }

            // Get unique user IDs
            const userIds = [...new Set(reviewsData.map((r: any) => r.user_id))];

            // Fetch user data from auth.users
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('id, name')
                .in('id', userIds);

            if (usersError) {
                console.error('Error fetching users:', usersError);
                // Continue without user data
            }

            // Map user data to reviews
            const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);

            const formattedReviews = reviewsData.map((review: any) => ({
                ...review,
                user: usersMap.get(review.user_id),
                userId: review.user_id,
                spaceId: review.space_id,
                createdAt: review.created_at
            }));

            setReviews(formattedReviews);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        setError(null);

        try {
            const { error } = await supabase
                .from('reviews')
                .insert([
                    {
                        space_id: spaceId,
                        user_id: user.id,
                        rating: newRating,
                        comment: newComment,
                    },
                ]);

            if (error) throw error;

            setNewComment('');
            setNewRating(5);
            fetchReviews(); // Refresh reviews
        } catch (err: any) {
            console.error('Error submitting review:', err);
            setError(err.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading reviews...</div>;

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">Reviews</h3>

            {/* Review List */}
            <div className="space-y-4 mb-8">
                {reviews.length === 0 ? (
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">{review.user?.name || 'Anonymous'}</span>
                                <div className="flex text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                            <span className="text-xs text-gray-400 mt-2 block">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Review Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h4 className="text-lg font-semibold mb-4">Leave a Review</h4>
                    {error && <p className="text-red-500 mb-4">{error}</p>}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewRating(star)}
                                    className={`text-2xl focus:outline-none ${star <= newRating ? 'text-yellow-500' : 'text-gray-300'
                                        }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                            required
                            placeholder="Share your experience..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            ) : (
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <p>Please log in to leave a review.</p>
                </div>
            )}
        </div>
    );
};
