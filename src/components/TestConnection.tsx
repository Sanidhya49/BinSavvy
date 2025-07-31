import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Server, Database, Image, Upload } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function TestConnection() {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [userServiceStatus, setUserServiceStatus] = useState<'loading' | 'healthy' | 'error'>('loading');
  const [imageServiceStatus, setImageServiceStatus] = useState<'loading' | 'healthy' | 'error'>('loading');
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    testConnections();
  }, []);

  const testConnections = async () => {
    setTestResults([]);
    
    // Test backend connectivity
    try {
      const response = await fetch('http://localhost:8000/api/users/health/');
      if (response.ok) {
        setBackendStatus('connected');
        setTestResults(prev => [...prev, '✅ Backend server is running']);
      } else {
        setBackendStatus('error');
        setTestResults(prev => [...prev, '❌ Backend server returned error']);
      }
    } catch (error) {
      setBackendStatus('error');
      setTestResults(prev => [...prev, '❌ Cannot connect to backend server']);
    }

    // Test user service
    try {
      await apiClient.checkUserServiceHealth();
      setUserServiceStatus('healthy');
      setTestResults(prev => [...prev, '✅ User service is healthy']);
    } catch (error) {
      setUserServiceStatus('error');
      setTestResults(prev => [...prev, '❌ User service is not responding']);
    }

    // Test image service
    try {
      await apiClient.checkImageServiceHealth();
      setImageServiceStatus('healthy');
      setTestResults(prev => [...prev, '✅ Image service is healthy']);
    } catch (error) {
      setImageServiceStatus('error');
      setTestResults(prev => [...prev, '❌ Image service is not responding']);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'connected':
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
      case 'connected':
      case 'healthy':
        return <Badge variant="default">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Application Status Test
        </CardTitle>
        <CardDescription>
          Testing frontend-backend connectivity and service health
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Service Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-2">
              {getStatusIcon(backendStatus)}
              <span>Backend Server</span>
            </div>
            {getStatusBadge(backendStatus)}
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-2">
              {getStatusIcon(userServiceStatus)}
              <span>User Service</span>
            </div>
            {getStatusBadge(userServiceStatus)}
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-2">
              {getStatusIcon(imageServiceStatus)}
              <span>Image Service</span>
            </div>
            {getStatusBadge(imageServiceStatus)}
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-2">
          <h4 className="font-semibold">Test Results:</h4>
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm">
                {result}
              </div>
            ))}
          </div>
        </div>

        {/* Current Functionality */}
        <div className="space-y-2">
          <h4 className="font-semibold">Current Functionality:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Frontend UI</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>React Components</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>TypeScript</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Tailwind CSS</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>ML Model Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Firebase Auth</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Cloudinary Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Real-time Processing</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={testConnections} variant="outline" size="sm">
            <Server className="h-4 w-4 mr-2" />
            Test Again
          </Button>
          <Button 
            onClick={() => window.open('http://localhost:8000/admin/', '_blank')}
            variant="outline" 
            size="sm"
          >
            <Database className="h-4 w-4 mr-2" />
            Django Admin
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
          <p className="font-semibold mb-1">Next Steps:</p>
          <ul className="space-y-1">
            <li>• Start backend: <code>cd backend && python manage.py runserver</code></li>
            <li>• Test API endpoints: <code>http://localhost:8000/api/users/health/</code></li>
            <li>• Check Django admin: <code>http://localhost:8000/admin/</code></li>
            <li>• Test image upload (will show placeholder response)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 