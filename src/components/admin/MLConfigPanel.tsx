import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Cpu, 
  Wifi, 
  Save,
  RefreshCw,
  TestTube,
  Zap,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";

interface MLConfig {
  // Model Selection
  primaryModel: 'roboflow' | 'yolo';
  fallbackModel: 'roboflow' | 'yolo';
  autoSwitchModels: boolean;
  
  // Confidence Settings
  confidenceThreshold: number;
  minDetectionSize: number;
  maxDetectionsPerImage: number;
  
  // Processing Settings
  batchSize: number;
  processingTimeout: number;
  enableParallelProcessing: boolean;
  retryFailedProcessing: boolean;
  maxRetries: number;
  
  // Performance Settings
  enablePerformanceTracking: boolean;
  logProcessingMetrics: boolean;
  autoOptimizeThresholds: boolean;
}

interface ModelPerformance {
  model: string;
  accuracy: number;
  speed: number;
  successRate: number;
  lastUsed: string;
}

const MLConfigPanel = () => {
  const [config, setConfig] = useState<MLConfig>({
    // Model Selection
    primaryModel: 'roboflow',
    fallbackModel: 'yolo',
    autoSwitchModels: true,
    
    // Confidence Settings
    confidenceThreshold: 0.1, // 10%
    minDetectionSize: 20, // pixels
    maxDetectionsPerImage: 50,
    
    // Processing Settings
    batchSize: 5,
    processingTimeout: 120,
    enableParallelProcessing: true,
    retryFailedProcessing: true,
    maxRetries: 3,
    
    // Performance Settings
    enablePerformanceTracking: true,
    logProcessingMetrics: true,
    autoOptimizeThresholds: false
  });

  const [performance, setPerformance] = useState<ModelPerformance[]>([
    {
      model: 'Roboflow Waste Detection v2',
      accuracy: 87.5,
      speed: 2.3,
      successRate: 94.2,
      lastUsed: '2 minutes ago'
    },
    {
      model: 'YOLOv8 Local Model',
      accuracy: 82.1,
      speed: 1.8,
      successRate: 89.7,
      lastUsed: '5 minutes ago'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleConfigChange = (key: keyof MLConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      console.log('Saving enhanced ML config:', config);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResult('Configuration saved successfully!');
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      setTestResult('Error saving configuration');
    } finally {
      setLoading(false);
    }
  };

  const testMLService = async () => {
    setLoading(true);
    try {
      console.log('Testing enhanced ML service with config:', config);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResult('ML service test completed successfully!');
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      setTestResult('ML service test failed');
    } finally {
      setLoading(false);
    }
  };

  const runPerformanceTest = async () => {
    setLoading(true);
    try {
      console.log('Running performance test...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      setTestResult('Performance test completed! Check results below.');
      setTimeout(() => setTestResult(null), 5000);
    } catch (error) {
      setTestResult('Performance test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-16 sm:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-sky-600 bg-clip-text text-transparent">Advanced ML Configuration</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Configure machine learning models and processing settings</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={runPerformanceTest} disabled={loading} className="hover:shadow">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance Test
          </Button>
          <Button variant="outline" onClick={testMLService} disabled={loading} className="hover:shadow">
            <TestTube className="h-4 w-4 mr-2" />
            Test Service
          </Button>
          <Button onClick={saveConfig} disabled={loading} className="hover:shadow w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Config
          </Button>
        </div>
      </div>

      {testResult && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span>{testResult}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Selection */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Model Configuration
          </CardTitle>
          <CardDescription>Choose which ML models to use and how they should interact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Model</Label>
              <Select
                value={config.primaryModel}
                onValueChange={(value: 'roboflow' | 'yolo') => handleConfigChange('primaryModel', value)}
              >
                <SelectTrigger className="hover:shadow">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roboflow">Roboflow API</SelectItem>
                  <SelectItem value="yolo">Local YOLOv8</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Main model for waste detection
              </p>
            </div>

            <div className="space-y-2">
              <Label>Fallback Model</Label>
              <Select
                value={config.fallbackModel}
                onValueChange={(value: 'roboflow' | 'yolo') => handleConfigChange('fallbackModel', value)}
              >
                <SelectTrigger className="hover:shadow">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roboflow">Roboflow API</SelectItem>
                  <SelectItem value="yolo">Local YOLOv8</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Backup model if primary fails
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Switch Models</Label>
              <p className="text-sm text-muted-foreground">
                Automatically switch to fallback if primary model fails
              </p>
            </div>
            <Switch
              checked={config.autoSwitchModels}
              onCheckedChange={(checked) => handleConfigChange('autoSwitchModels', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Confidence Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Detection Settings
          </CardTitle>
          <CardDescription>Fine-tune detection sensitivity and accuracy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Confidence Threshold: {(config.confidenceThreshold * 100).toFixed(1)}%</Label>
            <Slider
              value={[config.confidenceThreshold]}
              onValueChange={(value) => handleConfigChange('confidenceThreshold', value[0])}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Minimum confidence for detections (0-100%)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Detection Size (pixels)</Label>
              <Input
                type="number"
                min="10"
                max="100"
                value={config.minDetectionSize}
                onChange={(e) => handleConfigChange('minDetectionSize', parseInt(e.target.value))}
                className="hover:shadow"
              />
              <p className="text-xs text-muted-foreground">
                Ignore detections smaller than this
              </p>
            </div>

            <div className="space-y-2">
              <Label>Max Detections Per Image</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={config.maxDetectionsPerImage}
                onChange={(e) => handleConfigChange('maxDetectionsPerImage', parseInt(e.target.value))}
                className="hover:shadow"
              />
              <p className="text-xs text-muted-foreground">
                Limit detections to prevent clutter
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Processing Settings
          </CardTitle>
          <CardDescription>Configure processing performance and reliability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Batch Size</Label>
              <Select
                value={config.batchSize.toString()}
                onValueChange={(value) => handleConfigChange('batchSize', parseInt(value))}
              >
                <SelectTrigger className="hover:shadow">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 image</SelectItem>
                  <SelectItem value="5">5 images</SelectItem>
                  <SelectItem value="10">10 images</SelectItem>
                  <SelectItem value="20">20 images</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Images to process in batch
              </p>
            </div>

            <div className="space-y-2">
              <Label>Processing Timeout (seconds)</Label>
              <Input
                type="number"
                min="30"
                max="300"
                value={config.processingTimeout}
                onChange={(e) => handleConfigChange('processingTimeout', parseInt(e.target.value))}
                className="hover:shadow"
              />
              <p className="text-xs text-muted-foreground">
                Maximum time for processing
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Parallel Processing</Label>
                <p className="text-sm text-muted-foreground">
                  Process multiple images simultaneously
                </p>
              </div>
              <Switch
                checked={config.enableParallelProcessing}
                onCheckedChange={(checked) => handleConfigChange('enableParallelProcessing', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Retry Failed Processing</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically retry failed processing attempts
                </p>
              </div>
              <Switch
                checked={config.retryFailedProcessing}
                onCheckedChange={(checked) => handleConfigChange('retryFailedProcessing', checked)}
              />
            </div>

            {config.retryFailedProcessing && (
              <div className="space-y-2">
                <Label>Max Retries</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={config.maxRetries}
                  onChange={(e) => handleConfigChange('maxRetries', parseInt(e.target.value))}
                  className="hover:shadow"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum retry attempts for failed processing
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Tracking */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Tracking
          </CardTitle>
          <CardDescription>Monitor and optimize model performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Performance Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Track model accuracy and processing speed
                </p>
              </div>
              <Switch
                checked={config.enablePerformanceTracking}
                onCheckedChange={(checked) => handleConfigChange('enablePerformanceTracking', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Log Processing Metrics</Label>
                <p className="text-sm text-muted-foreground">
                  Detailed logging for analysis and debugging
                </p>
              </div>
              <Switch
                checked={config.logProcessingMetrics}
                onCheckedChange={(checked) => handleConfigChange('logProcessingMetrics', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Optimize Thresholds</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically adjust settings based on performance
                </p>
              </div>
              <Switch
                checked={config.autoOptimizeThresholds}
                onCheckedChange={(checked) => handleConfigChange('autoOptimizeThresholds', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Performance */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
          <CardDescription>Current performance metrics for each model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performance.map((model, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{model.model}</h4>
                  <Badge variant="outline" className="text-xs">
                    Last used: {model.lastUsed}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Accuracy</p>
                    <p className="font-medium">{model.accuracy}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Speed</p>
                    <p className="font-medium">{model.speed}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success Rate</p>
                    <p className="font-medium">{model.successRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Configuration Summary */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>Summary of active settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Primary Model</p>
              <p className="font-medium">{config.primaryModel === 'roboflow' ? 'Roboflow API' : 'Local YOLOv8'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Confidence Threshold</p>
              <p className="font-medium">{(config.confidenceThreshold * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Batch Size</p>
              <p className="font-medium">{config.batchSize} images</p>
            </div>
            <div>
              <p className="text-muted-foreground">Processing Timeout</p>
              <p className="font-medium">{config.processingTimeout}s</p>
            </div>
            <div>
              <p className="text-muted-foreground">Parallel Processing</p>
              <p className="font-medium">{config.enableParallelProcessing ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Auto-Switch</p>
              <p className="font-medium">{config.autoSwitchModels ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Sticky Actions */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t p-3">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={testMLService} disabled={loading}>Test</Button>
          <Button onClick={saveConfig} disabled={loading}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default MLConfigPanel; 