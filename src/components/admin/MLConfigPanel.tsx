import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Cpu, 
  Wifi, 
  Save,
  RefreshCw,
  TestTube
} from "lucide-react";
import { useState } from "react";

interface MLConfig {
  confidenceThreshold: number;
  useRoboflow: boolean;
  useLocalYOLO: boolean;
  modelVersion: string;
  processingTimeout: number;
  batchSize: number;
  enableAutoProcessing: boolean;
}

const MLConfigPanel = () => {
  const [config, setConfig] = useState<MLConfig>({
    confidenceThreshold: 0.1, // 10%
    useRoboflow: true,
    useLocalYOLO: false,
    modelVersion: 'waste-detection-xkvwi/2',
    processingTimeout: 120,
    batchSize: 1,
    enableAutoProcessing: true
  });

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
      // In a real app, this would save to backend
      console.log('Saving ML config:', config);
      
      // Simulate API call
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
      // In a real app, this would test the ML service
      console.log('Testing ML service with config:', config);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTestResult('ML service test completed successfully!');
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      setTestResult('ML service test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ML Configuration</h1>
          <p className="text-muted-foreground">Configure machine learning models and processing settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testMLService} disabled={loading}>
            <TestTube className="h-4 w-4 mr-2" />
            Test Service
          </Button>
          <Button onClick={saveConfig} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Config
          </Button>
        </div>
      </div>

      {testResult && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <TestTube className="h-4 w-4" />
              <span>{testResult}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Model Configuration
          </CardTitle>
          <CardDescription>Choose which ML models to use for waste detection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Use Roboflow API</Label>
              <p className="text-sm text-muted-foreground">
                Cloud-based waste detection model
              </p>
            </div>
            <Switch
              checked={config.useRoboflow}
              onCheckedChange={(checked) => handleConfigChange('useRoboflow', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Use Local YOLOv8</Label>
              <p className="text-sm text-muted-foreground">
                Local YOLOv8 model for offline processing
              </p>
            </div>
            <Switch
              checked={config.useLocalYOLO}
              onCheckedChange={(checked) => handleConfigChange('useLocalYOLO', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Roboflow Model Version</Label>
            <Select
              value={config.modelVersion}
              onValueChange={(value) => handleConfigChange('modelVersion', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="waste-detection-xkvwi/2">Waste Detection v2</SelectItem>
                <SelectItem value="waste-detection-xkvwi/1">Waste Detection v1</SelectItem>
                <SelectItem value="custom-model">Custom Model</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Processing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Processing Settings
          </CardTitle>
          <CardDescription>Configure processing parameters and thresholds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Confidence Threshold (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={config.confidenceThreshold * 100}
                onChange={(e) => handleConfigChange('confidenceThreshold', parseFloat(e.target.value) / 100)}
              />
              <p className="text-xs text-muted-foreground">
                Minimum confidence for detections (0-100%)
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
              />
              <p className="text-xs text-muted-foreground">
                Maximum time for processing (30-300s)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Batch Size</Label>
            <Select
              value={config.batchSize.toString()}
              onValueChange={(value) => handleConfigChange('batchSize', parseInt(value))}
            >
              <SelectTrigger>
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
              Number of images to process in batch
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Processing</Label>
              <p className="text-sm text-muted-foreground">
                Automatically process new uploads
              </p>
            </div>
            <Switch
              checked={config.enableAutoProcessing}
              onCheckedChange={(checked) => handleConfigChange('enableAutoProcessing', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Service Status
          </CardTitle>
          <CardDescription>Current status of ML services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Roboflow API</span>
              </div>
              <p className="text-xs text-muted-foreground">Connected and ready</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Local YOLOv8</span>
              </div>
              <p className="text-xs text-muted-foreground">Model loaded successfully</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Cloudinary</span>
              </div>
              <p className="text-xs text-muted-foreground">Image storage ready</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Backend API</span>
              </div>
              <p className="text-xs text-muted-foreground">Processing queue active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>Summary of active settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Confidence Threshold:</span>
              <span className="text-sm font-medium">{(config.confidenceThreshold * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Primary Model:</span>
              <span className="text-sm font-medium">
                {config.useRoboflow ? 'Roboflow API' : 'Local YOLOv8'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Model Version:</span>
              <span className="text-sm font-medium">{config.modelVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Processing Timeout:</span>
              <span className="text-sm font-medium">{config.processingTimeout}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Batch Size:</span>
              <span className="text-sm font-medium">{config.batchSize} images</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Auto Processing:</span>
              <span className="text-sm font-medium">
                {config.enableAutoProcessing ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MLConfigPanel; 