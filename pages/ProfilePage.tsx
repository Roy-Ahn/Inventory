import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Spinner from '../components/Spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfilePageProps {
  onNavigate: (page: Page) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { currentUser, updateProfile, isLoading: authLoading } = useAuth();
  const { bookings = [] } = useData();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Update name when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
    }
  }, [currentUser]);

  // Calculate user statistics
  const userBookings = bookings.filter(b => b?.userId === currentUser?.id);
  const totalSpent = userBookings.reduce((sum, booking) => sum + (booking?.totalPrice || 0), 0);
  const activeBookings = userBookings.filter(b => {
    if (!b?.endDate) return false;
    const endDate = new Date(b.endDate);
    return endDate >= new Date();
  }).length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile(name.trim());
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(currentUser?.name || '');
    setError('');
    setSuccess('');
    setIsEditing(false);
  };

  if (!currentUser) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
        <Button onClick={() => onNavigate('login')}>
          Login
        </Button>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Profile</h1>
            <p className="mt-2 text-lg text-gray-600">Manage your account information</p>
          </div>

          {/* Profile Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Account Information</CardTitle>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="bg-gray-100 text-gray-500"
                  />
                  <p className="text-sm text-gray-500">Email cannot be changed</p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <p className="text-lg text-gray-900">{currentUser.name}</p>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-lg text-gray-900">{currentUser.email}</p>
                </div>

                <div className="space-y-2">
                  <Label>User ID</Label>
                  <p className="text-sm text-gray-500 font-mono">{currentUser.id}</p>
                </div>

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{userBookings.length}</div>
                  <div className="text-gray-600">Total Bookings</div>
                </div>
                <div className="bg-green-50 rounded-xl p-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">{activeBookings}</div>
                  <div className="text-gray-600">Active Bookings</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-6">
                  <div className="text-3xl font-bold text-purple-600 mb-2">${totalSpent.toFixed(2)}</div>
                  <div className="text-gray-600">Total Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 flex justify-center space-x-4">
            <Button onClick={() => onNavigate('dashboard')}>
              View My Dashboard
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('spaces')}>
              Browse Spaces
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

