import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-4xl font-bold text-destructive">Unauthorized</h1>
      <p className="text-muted-foreground">You do not have permission to access this page.</p>
      <Button onClick={() => navigate(-1)} variant="outline">
        Go Back
      </Button>
    </div>
  );
}
