
import React from 'react';
import { Page } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AccessDeniedPageProps {
  onNavigate: (page: Page) => void;
}

const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({ onNavigate }) => {
  return (
    <div className="container mx-auto px-6 py-24 text-center">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 1a9 9 0 100 18 9 9 0 000-18zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          <CardTitle className="text-3xl">Access Denied</CardTitle>
          <CardDescription>You do not have permission to view this page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => onNavigate('home')} size="lg">
            Go to Homepage
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDeniedPage;
