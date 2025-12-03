import React, { useEffect, useState } from 'react';
import { Page, Profile, Review } from '../types';
import { useData } from '../contexts/DataContext';
import Spinner from '../components/Spinner';

interface HostProfilePageProps {
    hostId: string;
    onNavigate: (page: Page) => void;
}

const HostProfilePage: React.FC<HostProfilePageProps> = ({ hostId, onNavigate }) => {
    const { getProfile, getHostReviews } = useData();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [profileData, reviewsData] = await Promise.all([
                    getProfile(hostId),
                    getHostReviews(hostId)
                ]);
                setProfile(profileData);
                setReviews(reviewsData);
            } catch (error) {
                console.error('Error loading host profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (hostId) {
            loadData();
        }
    }, [hostId, getProfile, getHostReviews]);

    if (loading) return <Spinner />;

    if (!profile) {
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Host not found</h2>
                <button
                    onClick={() => onNavigate('spaces')}
                    className="mt-4 text-blue-600 hover:underline"
                >
                    Back to Spaces
                </button>
            </div>
        );
    }

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 'New';

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-6">
                <button
                    onClick={() => onNavigate('spaces')}
                    className="mb-6 text-gray-600 hover:text-gray-900 flex items-center"
                >
                    ← Back to Spaces
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Host Info Card */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center text-4xl font-bold text-blue-600 mb-4">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                                <p className="text-gray-500 mb-4">Joined {new Date(profile.createdAt).toLocaleDateString()}</p>

                                <div className="flex items-center justify-center space-x-2 bg-gray-50 px-4 py-2 rounded-full">
                                    <span className="text-yellow-400 text-xl">★</span>
                                    <span className="font-bold text-gray-900">{averageRating}</span>
                                    <span className="text-gray-500">({reviews.length} reviews)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews from Guests</h2>

                        {reviews.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
                                This host has no reviews yet.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="bg-white rounded-xl shadow p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                                                    {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{review.user?.name || 'Guest'}</p>
                                                    <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostProfilePage;
