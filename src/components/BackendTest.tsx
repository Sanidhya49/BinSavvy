import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Server, AlertCircle } from 'lucide-react';

export default function BackendTest() {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);

  const testBackend = async () => {
    setBackendStatus('loading');
    setErrorDetails('');
    setTestResults([]);

    try {
      // Test 1: Basic connectivity
      setTestResults(prev => [...prev, '🔄 Testing basic connectivity...']);
      
      const response = await fetch('http://localhost:8000/api/users/health/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBackendStatus('connected');
        setTestResults(prev => [...prev, '✅ Backend is running and responding']);
        setTestResults(prev => [...prev, `📊 Response: ${JSON.stringify(data)}`]);
      } else {
        setBackendStatus('error');
        setErrorDetails(`HTTP ${response.status}: ${response.statusText}`);
        setTestResults(prev => [...prev, `❌ Backend responded with error: ${response.status}`]);
      }
    } catch (error) {
      setBackendStatus('error');
      setErrorDetails(error instanceof Error ? error.message : 'Unknown error');
      setTestResults(prev => [...prev, '❌ Cannot connect to backend server']);
      setTestResults(prev => [...prev, '💡 Make sure Django server is running on port 8000']);
    }
  };

  useEffect(() => {
    testBackend();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'connected':
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
        return <Badge variant="secondary">Testing...</Badge>;
      case 'connected':
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
          Backend Connection Test
        </CardTitle>
        <CardDescription>
          Detailed test of Django backend connectivity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Status */}
        <div className="flex items-center justify-between p-3 border rounded">
          <div className="flex items-center gap-2">
            {getStatusIcon(backendStatus)}
            <span>Backend Server (localhost:8000)</span>
          </div>
          {getStatusBadge(backendStatus)}
        </div>

        {/* Error Details */}
        {errorDetails && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="font-semibold text-red-800">Error Details:</span>
            </div>
            <p className="text-sm text-red-700">{errorDetails}</p>
          </div>
        )}

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

        {/* Troubleshooting */}
        {backendStatus === 'error' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="font-semibold text-yellow-800 mb-2">Troubleshooting Steps:</h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Open terminal and navigate to backend folder</li>
              <li>2. Run: <code className="bg-yellow-100 px-1 rounded">cd backend</code></li>
              <li>3. Run: <code className="bg-yellow-100 px-1 rounded">python manage.py runserver</code></li>
              <li>4. Check if you see "Starting development server at http://127.0.0.1:8000/"</li>
              <li>5. If there are errors, run: <code className="bg-yellow-100 px-1 rounded">pip install -r requirements.txt</code></li>
              <li>6. Then run: <code className="bg-yellow-100 px-1 rounded">python manage.py migrate</code></li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={testBackend} variant="outline" size="sm">
            <Server className="h-4 w-4 mr-2" />
            Test Again
          </Button>
          <Button 
            onClick={() => window.open('http://localhost:8000/api/users/health/', '_blank')}
            variant="outline" 
            size="sm"
          >
            <Server className="h-4 w-4 mr-2" />
            Test in Browser
          </Button>
        </div>

        {/* Quick Commands */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
          <p className="font-semibold mb-1">Quick Commands:</p>
          <div className="space-y-1">
            <p><code>cd backend && python manage.py runserver</code></p>
            <p><code>pip install -r requirements.txt</code> (if dependencies missing)</p>
            <p><code>python manage.py migrate</code> (if database issues)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 