import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Zap,
  Upload,
  Plus,
  X,
  Target,
  Settings
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { ImageUpload } from "@/types/waste";
import { toast } from "sonner";

interface ProcessingJob {
  id: string;
  imageId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  model: string;
  progress: number;
  startTime: string;
  endTime?: string;
  error?: string;
}

interface ProcessingStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  currentThroughput: number;
}

interface UploadItem {
  id: string;
  file: File;
  preview: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

interface MLConfig {
  confidenceThreshold: number;
  minDetectionSize: number;
  maxDetectionsPerImage: number;
  batchSize: number;
  processingTimeout: number;
}

const EnhancedMLProcessor = () => {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [stats, setStats] = useState<ProcessingStats>({
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    averageProcessingTime: 0,
    currentThroughput: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'roboflow' | 'yolo'>('roboflow');
  const [batchSize, setBatchSize] = useState(5);
  
  // Upload state
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ML Configuration
  const [mlConfig, setMlConfig] = useState<MLConfig>({
    confidenceThreshold: 0.1, // 10%
    minDetectionSize: 20,
    maxDetectionsPerImage: 50,
    batchSize: 5,
    processingTimeout: 120
  });

  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchPendingImages();
    
    // Set up real-time updates every 5 seconds
    const interval = setInterval(() => {
      fetchPendingImages();
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchPendingImages = async () => {
    try {
      const response = await apiClient.getUserImages();
      
      // Handle backend response format: { data: [...] }
      const allImages = Array.isArray(response.data) ? response.data : response.data?.data || [];
      
      // Create processing jobs for pending and failed images
      const newJobs: ProcessingJob[] = allImages
        .filter((img: ImageUpload) => 
          img.status === 'pending' || img.status === 'ml_failed' || img.status === 'ml_unavailable'
        )
        .map((img: ImageUpload) => ({
          id: `job-${img.image_id}`,
          imageId: img.image_id,
          status: img.status === 'pending' ? 'pending' : 'failed',
          model: selectedModel,
          progress: 0,
          startTime: img.uploaded_at || new Date().toISOString()
        }));
      
      setJobs(newJobs);
      updateStats(newJobs);
    } catch (error) {
      console.error('Error fetching pending images:', error);
    }
  };

  const updateStats = (currentJobs: ProcessingJob[]) => {
    const completed = currentJobs.filter(job => job.status === 'completed').length;
    const failed = currentJobs.filter(job => job.status === 'failed').length;
    const total = currentJobs.length;
    
    // Calculate average processing time
    const completedJobs = currentJobs.filter(job => job.status === 'completed' && job.endTime);
    const avgTime = completedJobs.length > 0 
      ? completedJobs.reduce((sum, job) => {
          const start = new Date(job.startTime).getTime();
          const end = new Date(job.endTime!).getTime();
          return sum + (end - start);
        }, 0) / completedJobs.length / 1000
      : 0;

    setStats({
      totalJobs: total,
      completedJobs: completed,
      failedJobs: failed,
      averageProcessingTime: avgTime,
      currentThroughput: completed / Math.max(avgTime, 1) // jobs per second
    });
  };

  // Upload functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return;
      }
      
      const uploadItem: UploadItem = {
        id: `upload-${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        location: ''
      };
      
      setUploadItems(prev => [...prev, uploadItem]);
    });
  };

  const removeUploadItem = (id: string) => {
    setUploadItems(prev => {
      const item = prev.find(item => item.id === id);
      if (item) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const updateUploadItem = (id: string, field: keyof UploadItem, value: any) => {
    setUploadItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleBulkUpload = async () => {
    if (uploadItems.length === 0) {
      toast.error("Please select at least one image to upload");
      return;
    }

    const invalidItems = uploadItems.filter(item => !item.location.trim());
    if (invalidItems.length > 0) {
      toast.error("Please provide location for all images");
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = uploadItems.map(async (item) => {
        try {
          const response = await apiClient.uploadImage(
            item.file,
            item.location,
            item.latitude,
            item.longitude,
            true // Skip ML processing - we'll process them in batch
          );
          
          // Create a job for this upload
          const newJob: ProcessingJob = {
            id: `job-${response.data.image_id}`,
            imageId: response.data.image_id,
            status: 'pending',
            model: selectedModel,
            progress: 0,
            startTime: new Date().toISOString()
          };
          
          return newJob;
        } catch (error) {
          console.error(`Failed to upload ${item.file.name}:`, error);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const validJobs = results.filter(job => job !== null) as ProcessingJob[];
      
      setJobs(prev => [...prev, ...validJobs]);
      setUploadItems([]);
      setShowUploadSection(false);
      
      toast.success(`Successfully uploaded ${validJobs.length} images for processing`);
      updateStats([...jobs, ...validJobs]);
      
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const startBatchProcessing = async () => {
    const pendingJobs = jobs.filter(job => job.status === 'pending' || job.status === 'failed');
    
    if (pendingJobs.length === 0) {
      toast.error("No pending jobs to process");
      return;
    }

    setIsProcessing(true);
    const batch = pendingJobs.slice(0, mlConfig.batchSize);

    for (let i = 0; i < batch.length; i++) {
      const job = batch[i];
      
      // Update job status to processing
      setJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, status: 'processing', progress: 0 }
          : j
      ));

      try {
        // Simulate processing with progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setJobs(prev => prev.map(j => 
            j.id === job.id 
              ? { ...j, progress }
              : j
          ));
        }

        // Call the reprocess API with ML config
        await apiClient.reprocessImage(job.imageId, {
          use_roboflow: selectedModel === 'roboflow',
          confidence_threshold: mlConfig.confidenceThreshold,
          min_detection_size: mlConfig.minDetectionSize,
          max_detections: mlConfig.maxDetectionsPerImage
        });

        // Mark job as completed
        setJobs(prev => prev.map(j => 
          j.id === job.id 
            ? { 
                ...j, 
                status: 'completed', 
                progress: 100,
                endTime: new Date().toISOString()
              }
            : j
        ));

        toast.success(`Processed image ${job.imageId}`);

      } catch (error) {
        // Mark job as failed
        setJobs(prev => prev.map(j => 
          j.id === job.id 
            ? { 
                ...j, 
                status: 'failed', 
                error: error instanceof Error ? error.message : 'Processing failed',
                endTime: new Date().toISOString()
              }
            : j
        ));
        
        toast.error(`Failed to process image ${job.imageId}`);
      }

      updateStats(jobs);
    }

    setIsProcessing(false);
    toast.success("Batch processing completed!");
  };

  const pauseProcessing = () => {
    setIsProcessing(false);
    toast.info("Processing paused");
  };

  const stopProcessing = () => {
    setIsProcessing(false);
    setJobs(prev => prev.map(job => 
      job.status === 'processing' 
        ? { ...job, status: 'pending', progress: 0 }
        : job
    ));
    toast.info("Processing stopped");
  };

  const retryFailedJobs = async () => {
    const failedJobs = jobs.filter(job => job.status === 'failed');
    if (failedJobs.length === 0) {
      toast.info("No failed jobs to retry");
      return;
    }
    
    setJobs(prev => prev.map(job => 
      failedJobs.some(failed => failed.id === job.id)
        ? { ...job, status: 'pending', progress: 0, error: undefined }
        : job
    ));
    toast.success(`Retrying ${failedJobs.length} failed jobs`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleConfigChange = (key: keyof MLConfig, value: any) => {
    setMlConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">Enhanced ML Processor</h1>
          <p className="text-muted-foreground">
            Advanced batch processing with performance tracking
            <span className="ml-2 text-xs text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowUploadSection(!showUploadSection)}
            className="hover:shadow"
          >
            <Upload className="h-4 w-4 mr-2" />
            {showUploadSection ? 'Hide Upload' : 'Add Images'}
          </Button>
          <Button 
            onClick={startBatchProcessing} 
            disabled={isProcessing || jobs.filter(j => j.status === 'pending' || j.status === 'failed').length === 0}
            className="button-gradient hover:shadow"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Processing
          </Button>
          <Button 
            variant="outline" 
            onClick={pauseProcessing} 
            disabled={!isProcessing}
            className="hover:shadow"
          >
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </Button>
          <Button 
            variant="outline" 
            onClick={stopProcessing} 
            disabled={!isProcessing}
            className="hover:shadow"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      {showUploadSection && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Bulk Upload Images
            </CardTitle>
            <CardDescription>Upload multiple images for batch processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Images</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="cursor-pointer hover:shadow"
              />
              <p className="text-xs text-muted-foreground">
                Select multiple images (JPEG, PNG, WebP). Max 10MB per file.
              </p>
            </div>

            {uploadItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Upload Queue ({uploadItems.length} images)</Label>
                  <Button
                    onClick={handleBulkUpload}
                    disabled={uploading}
                    className="button-gradient hover:shadow"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload All
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {uploadItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{item.file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="aspect-square bg-muted rounded-md overflow-hidden">
                        <img
                          src={item.preview}
                          alt={item.file.name}
                          className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs">Location</Label>
                        <Input
                          value={item.location}
                          onChange={(e) => updateUploadItem(item.id, 'location', e.target.value)}
                          placeholder="Enter location description"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Processing Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              Pending processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedJobs}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedJobs}</div>
            <p className="text-xs text-muted-foreground">
              Processing errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProcessingTime.toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">
              Per job
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentThroughput.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Jobs/second
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ML Configuration */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ML Configuration
          </CardTitle>
          <CardDescription>Configure ML model settings for processing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Model Selection</Label>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as 'roboflow' | 'yolo')}
                  className="w-full p-2 border rounded-md hover:shadow"
                >
                  <option value="roboflow">Roboflow API</option>
                  <option value="yolo">Local YOLOv8</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Batch Size</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={mlConfig.batchSize}
                  onChange={(e) => handleConfigChange('batchSize', parseInt(e.target.value))}
                  className="hover:shadow"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Confidence Threshold: {(mlConfig.confidenceThreshold * 100).toFixed(1)}%</Label>
                <Slider
                  value={[mlConfig.confidenceThreshold]}
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

              <div className="space-y-2">
                <Label>Min Detection Size (pixels)</Label>
                <Input
                  type="number"
                  min="10"
                  max="100"
                  value={mlConfig.minDetectionSize}
                  onChange={(e) => handleConfigChange('minDetectionSize', parseInt(e.target.value))}
                  className="hover:shadow"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Max Detections Per Image</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={mlConfig.maxDetectionsPerImage}
              onChange={(e) => handleConfigChange('maxDetectionsPerImage', parseInt(e.target.value))}
              className="hover:shadow"
            />
          </div>
        </CardContent>
      </Card>

      {/* Job Queue */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Processing Queue</CardTitle>
              <CardDescription>Current jobs and their status</CardDescription>
            </div>
            <Button variant="outline" onClick={retryFailedJobs} size="sm" className="hover:shadow">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Failed
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No pending jobs to process
            </p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Job {job.imageId.slice(-6)}</span>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {job.model}
                    </span>
                  </div>
                  
                  {job.status === 'processing' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                  )}
                  
                  {job.error && (
                    <p className="text-xs text-red-600 mt-2">
                      Error: {job.error}
                    </p>
                  )}
                  
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Started: {new Date(job.startTime).toLocaleTimeString()}</span>
                    {job.endTime && (
                      <span>Completed: {new Date(job.endTime).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedMLProcessor; 