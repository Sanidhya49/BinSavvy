
import { useState, useEffect } from "react";
import { ImageUpload } from "@/types/waste";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api";

const UploadsManagement = () => {
  const [uploads, setUploads] = useState<ImageUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpload, setSelectedUpload] = useState<ImageUpload | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "processing" | "completed" | "ml_failed" | "ml_unavailable">("all");
  const [processingUpload, setProcessingUpload] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching uploads for management...');
      
      const response = await apiClient.getUserImages();
      console.log('Uploads management response:', response);
      
      if (response.success && response.data) {
        // Handle backend response format: { data: [...] }
        const uploadsData = Array.isArray(response.data) ? response.data : response.data.data || [];
        console.log('Setting uploads for management:', uploadsData);
        setUploads(uploadsData);
        setLastRefresh(new Date());
      } else {
        console.log('No uploads found or API error:', response.error);
        setUploads([]);
        if (response.error) {
          setError(response.error);
        }
      }
    } catch (error) {
      console.error('Error fetching uploads for management:', error);
      setError('Failed to load uploads');
      setUploads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAnalysis = async (upload: ImageUpload) => {
    try {
      setProcessingUpload(upload.image_id);
      
      // Call the reprocess endpoint
      const response = await apiClient.reprocessImage(upload.image_id, {
        use_roboflow: true
      });
      
      if (response.success) {
        toast.success("Analysis started successfully");
        // Refresh the uploads list
        await fetchUploads();
      } else {
        toast.error("Failed to start analysis");
      }
    } catch (error) {
      console.error("Error starting analysis:", error);
      toast.error("Failed to start analysis");
    } finally {
      setProcessingUpload(null);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "processing":
        return "Processing";
      case "completed":
        return "Completed";
      case "ml_failed":
        return "ML Failed";
      case "ml_unavailable":
        return "ML Unavailable";
      default:
        return "Pending";
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "processing":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "ml_failed":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">ML Failed</Badge>;
      case "ml_unavailable":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">ML Unavailable</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    }
  };

  const filteredUploads = filter === "all" 
    ? uploads 
    : uploads.filter(upload => upload.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Uploads</h1>
        <div className="flex space-x-2">
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Pending
          </Button>
          <Button 
            variant={filter === "processing" ? "default" : "outline"}
            onClick={() => setFilter("processing")}
          >
            Processing
          </Button>
          <Button 
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
          >
            Completed
          </Button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Uploads List */}
        <div className="md:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUploads.length === 0 ? (
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No {filter} uploads available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUploads.map((upload) => (
                <Card 
                  key={upload.image_id} 
                  className={`overflow-hidden cursor-pointer transition-all border-2 ${
                    selectedUpload?.image_id === upload.image_id ? "border-primary" : "border-border"
                  }`}
                  onClick={() => setSelectedUpload(upload)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={upload.image_url}
                      alt="Uploaded waste"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={upload.status} />
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Uploaded {formatDistanceToNow(new Date(upload.uploaded_at), { addSuffix: true })}
                      </p>
                      <p className="text-sm truncate">
                        {upload.location || "No location data"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Upload Details */}
        <div>
          {selectedUpload ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={selectedUpload.image_url}
                  alt="Selected waste"
                  className="w-full aspect-video object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium">Status</h4>
                    <div className="mt-1">
                      <StatusBadge status={selectedUpload.status} />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Location</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedUpload.location || "No address provided"}
                    </p>
                    {(selectedUpload.latitude && selectedUpload.longitude) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Coordinates: {selectedUpload.latitude.toFixed(6)}, 
                        {selectedUpload.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Upload Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedUpload.uploaded_at), "PPpp")}
                    </p>
                  </div>
                  
                  {selectedUpload.analysis_results ? (
                    <div>
                      <h4 className="text-sm font-medium">Analysis Results</h4>
                      <p className="text-sm text-muted-foreground">
                        Model: {selectedUpload.analysis_results.model_used || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Detections: {selectedUpload.analysis_results.total_detections || 0}
                      </p>
                      {selectedUpload.processed_image_url && (
                        <div className="mt-2">
                          <h5 className="text-xs font-medium">Processed Image</h5>
                          <img 
                            src={selectedUpload.processed_image_url} 
                            alt="Processed waste"
                            className="w-full mt-1 rounded border"
                          />
                        </div>
                      )}
                      <Link to={`/admin/analysis/${selectedUpload.image_id}`}>
                        <Button variant="outline" className="mt-2 text-xs" size="sm">
                          View Full Analysis
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-2">
                      {(selectedUpload.status === "pending" || 
                        selectedUpload.status === "ml_failed" || 
                        selectedUpload.status === "ml_unavailable" ||
                        selectedUpload.status === "completed") && (
                        <Button 
                          onClick={() => handleStartAnalysis(selectedUpload)}
                          disabled={processingUpload === selectedUpload.image_id}
                          className="w-full button-gradient"
                        >
                          {processingUpload === selectedUpload.image_id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            selectedUpload.status === "completed" ? "Reprocess Analysis" : "Start Analysis"
                          )}
                        </Button>
                      )}
                      
                      {selectedUpload.status === "processing" && (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Processing with ML...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Select an upload to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadsManagement;
