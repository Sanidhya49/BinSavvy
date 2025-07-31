import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';

export default function DebugInfo() {
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugInfo = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getUserImages();
      setDebugData({
        timestamp: new Date().toISOString(),
        response: response,
        imagesCount: response.data ? response.data.length : 0
      });
    } catch (error) {
      setDebugData({
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        response: null
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
        <CardDescription>
          API response data and debugging information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex items-center justify-between">
          <span>API Status:</span>
          <Badge variant={debugData?.error ? "destructive" : "default"}>
            {debugData?.error ? "Error" : "Success"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span>Images Count:</span>
          <Badge variant="outline">{debugData?.imagesCount || 0}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span>Last Updated:</span>
          <span className="text-sm text-muted-foreground">
            {debugData?.timestamp || "Never"}
          </span>
        </div>

        <Button onClick={fetchDebugInfo} disabled={loading} variant="outline" size="sm">
          {loading ? "Refreshing..." : "Refresh Debug Info"}
        </Button>

        {debugData && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Raw API Response:</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 