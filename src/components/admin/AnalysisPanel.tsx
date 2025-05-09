
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ImageUpload, AnalysisResults } from "@/types/waste";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const AnalysisPanel = () => {
  const { uploadId } = useParams<{ uploadId: string }>();
  const navigate = useNavigate();
  
  const [upload, setUpload] = useState<ImageUpload | null>(null);
  const [analysisType, setAnalysisType] = useState<"segmentation" | "detection">("detection");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  
  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchUpload = () => {
      try {
        // Get uploads from localStorage
        const allUploads: ImageUpload[] = JSON.parse(localStorage.getItem('binsavvy-uploads') || '[]');
        
        // Find the specific upload
        const foundUpload = allUploads.find(u => u.id === uploadId);
        
        if (foundUpload) {
          setUpload(foundUpload);
          if (foundUpload.analysisResults) {
            setResults(foundUpload.analysisResults);
            setAnalysisType(foundUpload.analysisResults.model);
          }
        } else {
          toast.error("Upload not found");
          navigate("/admin/uploads");
        }
      } catch (error) {
        console.error("Error fetching upload:", error);
        toast.error("Error loading upload data");
      }
    };
    
    if (uploadId) {
      fetchUpload();
    }
  }, [uploadId, navigate]);

  const runAnalysis = async () => {
    if (!upload) return;
    
    setLoading(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    clearInterval(interval);
    setProgress(100);
    
    // Mock analysis results
    const mockResults: AnalysisResults = {
      model: analysisType,
      processedImageUrl: upload.imageUrl, // In a real app, this would be a new processed image
      detectedItems: analysisType === "detection" ? 
        [
          { label: "Plastic Bottle", confidence: 0.92, bbox: [50, 100, 100, 150] },
          { label: "Paper", confidence: 0.78, bbox: [200, 150, 100, 80] },
          { label: "Metal Can", confidence: 0.85, bbox: [300, 200, 80, 100] }
        ] : 
        [
          { label: "Plastic", confidence: 0.92, count: 4 },
          { label: "Paper", confidence: 0.84, count: 2 },
          { label: "Metal", confidence: 0.89, count: 1 },
          { label: "Glass", confidence: 0.76, count: 1 }
        ],
      processedAt: new Date().toISOString()
    };
    
    // Update upload with results
    const updatedUpload: ImageUpload = {
      ...upload,
      status: "processed",
      analysisResults: mockResults
    };
    
    // Update in localStorage
    const allUploads: ImageUpload[] = JSON.parse(localStorage.getItem('binsavvy-uploads') || '[]');
    const updatedUploads = allUploads.map(u => u.id === uploadId ? updatedUpload : u);
    localStorage.setItem('binsavvy-uploads', JSON.stringify(updatedUploads));
    
    // Update state
    setUpload(updatedUpload);
    setResults(mockResults);
    setLoading(false);
    
    toast.success("Analysis completed successfully");
  };

  if (!upload) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Image Analysis</h1>
        <Button variant="outline" onClick={() => navigate("/admin/uploads")}>
          Back to Uploads
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Image */}
        <Card>
          <CardHeader>
            <CardTitle>Original Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video relative overflow-hidden rounded-md">
              <img
                src={upload.imageUrl}
                alt="Original upload"
                className="w-full h-full object-contain bg-black/5"
              />
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium truncate max-w-[70%] text-right">
                  {upload.location.address || "No location data"}
                </span>
              </div>
              {(upload.location.latitude && upload.location.longitude) && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="font-medium">
                    {upload.location.latitude.toFixed(6)}, {upload.location.longitude.toFixed(6)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Analysis Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!results ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Analysis Type</label>
                  <Select
                    value={analysisType}
                    onValueChange={(value) => setAnalysisType(value as "segmentation" | "detection")}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select analysis type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detection">Object Detection</SelectItem>
                      <SelectItem value="segmentation">Instance Segmentation</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {analysisType === "detection" ? 
                      "Object detection identifies and locates waste items within the image." : 
                      "Instance segmentation creates precise outlines of individual waste objects."
                    }
                  </p>
                </div>
                
                {loading && (
                  <div className="space-y-2 py-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}
                
                <Button 
                  onClick={runAnalysis} 
                  className="w-full button-gradient" 
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Run Analysis"}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Analysis Results</h3>
                  <div className="bg-muted/30 rounded-md p-3 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Model Type:</span>
                      <span className="font-medium capitalize">{results.model}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items Detected:</span>
                      <span className="font-medium">{results.detectedItems.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Processed:</span>
                      <span className="font-medium">
                        {new Date(results.processedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Detected Items</h3>
                  <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
                    {results.detectedItems.map((item, index) => (
                      <div key={index} className="p-2 flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.label}</span>
                          {item.count && (
                            <span className="text-xs ml-2 text-muted-foreground">
                              Count: {item.count}
                            </span>
                          )}
                        </div>
                        <div className="bg-green-100 text-green-800 text-xs font-medium rounded px-2 py-1">
                          {Math.round(item.confidence * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setResults(null);
                    }}
                  >
                    Run New Analysis
                  </Button>
                  <Button className="flex-1 button-gradient">
                    Export Results
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Results Visualization (when analysis is complete) */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video relative overflow-hidden rounded-md bg-black/5">
              {/* 
                In a real app, this would be a visualization of the analyzed image
                with bounding boxes or segmentation masks
              */}
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Visualization would display here with detected objects highlighted
                </p>
              </div>
              <img
                src={upload.imageUrl}
                alt="Analyzed result"
                className="w-full h-full object-contain opacity-50"
              />
            </div>
            
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Waste Composition</h3>
                <div className="h-48 bg-muted/30 rounded-md flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Composition chart would appear here
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">Detection Confidence</h3>
                <div className="h-48 bg-muted/30 rounded-md flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Confidence metrics visualization would appear here
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisPanel;
