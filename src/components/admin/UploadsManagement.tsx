
import { useState, useEffect } from "react";
import { ImageUpload } from "@/types/waste";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { Trash2 } from "lucide-react";

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

  const handleDeleteUpload = async (imageId: string) => {
    try {
      const ok = window.confirm("Delete this upload? This will also remove the asset from Cloudinary.");
      if (!ok) return;
      const res = await apiClient.deleteImage(imageId);
      if (res.success) {
        setUploads((prev) => prev.filter((u) => u.image_id !== imageId));
        if (selectedUpload?.image_id === imageId) setSelectedUpload(null);
        toast.success("Upload deleted");
      } else {
        toast.error(res.error || "Failed to delete upload");
      }
    } catch (e) {
      toast.error("Failed to delete upload");
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
    <div className="space-y-5 sm:space-y-6 pb-16 sm:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">User Uploads</h1>
        <div className="flex flex-wrap gap-2 sm:space-x-2 w-full sm:w-auto">
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            onClick={() => setFilter("all")}
            className="transition-all hover:shadow w-full sm:w-auto"
          >
            All
          </Button>
          <Button 
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            className="transition-all hover:shadow w-full sm:w-auto"
          >
            Pending
          </Button>
          <Button 
            variant={filter === "processing" ? "default" : "outline"}
            onClick={() => setFilter("processing")}
            className="transition-all hover:shadow w-full sm:w-auto"
          >
            Processing
          </Button>
          <Button 
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
            className="transition-all hover:shadow w-full sm:w-auto"
          >
            Completed
          </Button>
        </div>
      </div>
      
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Uploads List */}
        <div className="md:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUploads.length === 0 ? (
            <Card className="text-center p-6 border-0 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No {filter} uploads available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUploads.map((upload) => (
                <Card 
                  key={upload.image_id} 
                  className={`overflow-hidden cursor-pointer transition-all border-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-xl ${
                    selectedUpload?.image_id === upload.image_id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedUpload(upload)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={upload.image_url}
                      alt="Uploaded waste"
                      className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    {/* Quick delete on card */}
                    <div className="absolute top-2 left-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleDeleteUpload(upload.image_id); }}
                        className="h-7 px-2 text-red-600 hover:text-red-700 border-red-200 bg-white/80 backdrop-blur"
                        title="Delete upload"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Upload Details</CardTitle>
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
                        {selectedUpload.analysis_results.total_detections && selectedUpload.analysis_results.total_detections > 0 
                          ? 'Garbage detected' 
                          : 'Not detected'
                        }
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
                        <Button variant="outline" className="mt-2 text-xs hover:shadow" size="sm">
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
                          className="w-full button-gradient hover:shadow"
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

                      <Button
                        variant="outline"
                        onClick={() => handleDeleteUpload(selectedUpload.image_id)}
                        className="mt-2 w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Upload
                      </Button>
                      
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
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Select an upload to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {/* Mobile Sticky Actions */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t p-3">
        <div className="flex gap-2">
          <Button onClick={fetchUploads} className="w-full">Refresh</Button>
          <Button variant="outline" className="w-full" onClick={() => setFilter('all')}>All</Button>
        </div>
      </div>
    </div>
  );
};

export default UploadsManagement;
