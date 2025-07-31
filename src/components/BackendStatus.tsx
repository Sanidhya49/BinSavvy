import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function BackendStatus() {
  const [userServiceStatus, setUserServiceStatus] = useState<'loading' | 'healthy' | 'error'>('loading');
  const [imageServiceStatus, setImageServiceStatus] = useState<'loading' | 'healthy' | 'error'>('loading');

  useEffect(() => {
    const checkServices = async () => {
      try {
        // Check user service
        await apiClient.checkUserServiceHealth();
        setUserServiceStatus('healthy');
      } catch (error) {
        setUserServiceStatus('error');
      }

      try {
        // Check image service
        await apiClient.checkImageServiceHealth();
        setImageServiceStatus('healthy');
      } catch (error) {
        setImageServiceStatus('error');
      }
    };

    checkServices();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">Checking...</Badge>;
      case 'healthy':
        return <Badge variant="default">Healthy</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Backend Status</CardTitle>
        <CardDescription>
          Check if the Django backend services are running
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(userServiceStatus)}
            <span>User Service</span>
          </div>
          {getStatusBadge(userServiceStatus)}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(imageServiceStatus)}
            <span>Image Service</span>
          </div>
          {getStatusBadge(imageServiceStatus)}
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p>Backend URL: http://localhost:8000</p>
          <p>Frontend URL: http://localhost:8080</p>
        </div>
      </CardContent>
    </Card>
  );
} 