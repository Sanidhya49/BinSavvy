
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

const UploadForm = () => {
  const { user, refreshData } = useAuth();
  const navigate = useNavigate();
  type QueueItem = {
    id: string;
    file: File;
    previewUrl: string;
    progress: number | null;
    status: 'queued' | 'uploading' | 'done' | 'failed';
  };
  const [items, setItems] = useState<QueueItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  type LogEntry = { id: string; message: string; ts: number };
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [useGps, setUseGps] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInitedRef = useRef<boolean>(false);

  // Queue limits
  const MAX_QUEUE_ITEMS = 10;
  const MAX_TOTAL_MB = 40; // max combined size
  const bytesLimit = MAX_TOTAL_MB * 1024 * 1024;
  const queueTotalBytes = (arr: QueueItem[]) => arr.reduce((acc, it) => acc + it.file.size, 0);
  const addLog = (message: string) => setLogs((prev) => [{ id: `${Date.now()}-${Math.random()}`, message, ts: Date.now() }, ...prev].slice(0, 8));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const take = Array.from(fileList);
      // process sequentially to keep UI responsive
      const processAll = async () => {
        const newItems: QueueItem[] = [];
        for (const file of take) {
          if (items.length + newItems.length >= MAX_QUEUE_ITEMS) {
            toast.error(`Queue limit reached (${MAX_QUEUE_ITEMS}).`);
            addLog(`Skipped extra file: queue limit ${MAX_QUEUE_ITEMS}`);
            break;
          }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        addLog("Rejected non-image file");
        continue;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("File size must be less than 10MB");
        addLog("Rejected file >10MB");
        continue;
      }

      // Optional client-side compression for very large images
      const maybeCompress = async (f: File): Promise<File> => {
        if (f.size < 2 * 1024 * 1024) return f; // under 2MB keep as-is
        try {
          const img = new Image();
          const objectUrl = URL.createObjectURL(f);
          img.src = objectUrl;
          await new Promise((res, rej) => { img.onload = () => res(null); img.onerror = rej; });
          const canvas = document.createElement('canvas');
          const maxDim = 1600;
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          if (!ctx) return f;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85));
          URL.revokeObjectURL(objectUrl);
          if (!blob) return f;
          return new File([blob], f.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
        } catch {
          return f;
        }
      };

          const processed = await maybeCompress(file);
          const wouldBe = [...items, ...newItems];
          const projectedBytes = queueTotalBytes(wouldBe) + processed.size;
          if (projectedBytes > bytesLimit) {
            toast.error(`Queue total exceeds ${MAX_TOTAL_MB} MB. Skipping.`);
            addLog(`Skipped ${file.name}: total size limit ${MAX_TOTAL_MB}MB`);
            continue;
          }
          const fileUrl = URL.createObjectURL(processed);
          newItems.push({ id: `${Date.now()}-${Math.random()}`, file: processed, previewUrl: fileUrl, progress: null, status: 'queued' });
          addLog(`Added ${processed.name} (${(processed.size/1024/1024).toFixed(1)}MB)`);
        }
        setItems((prev) => [...prev, ...newItems]);
        if (items.length === 0) setActiveIndex(0);
        if ((latitude == null || longitude == null) && newItems[0]) {
          tryExtractExifGps(newItems[0].file);
        }
      };
      processAll();
    }
  };

  const getGeoLocation = () => {
    if (navigator.geolocation) {
      setUseGps(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          toast.success("GPS location captured successfully!");
        },
        () => {
          toast.error("Unable to retrieve your location");
          setUseGps(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };

  const stopCamera = () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } finally {
      streamRef.current = null;
      if (videoRef.current) {
        // @ts-expect-error - MediaStream typing for srcObject
        videoRef.current.srcObject = null;
      }
    }
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Camera is not supported on this device/browser");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        // @ts-expect-error - MediaStream typing for srcObject
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOpen(true);
    } catch (err) {
      console.error("Camera open failed:", err);
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  const captureFromCamera = async () => {
    const video = videoRef.current;
    if (!video) return;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Capture failed. Try again.");
          return;
        }
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        setItems((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, file, previewUrl: url, progress: null, status: 'queued' }]);
        setActiveIndex(items.length);
        setCameraOpen(false);
        stopCamera();
        toast.success("Photo captured from camera");
        if (latitude == null || longitude == null) tryExtractExifGps(file);
        addLog("Captured photo from camera");
      },
      "image/jpeg",
      0.92
    );
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Initialize Leaflet from CDN when opening map (fallbacks gracefully)
  useEffect(() => {
    if (!mapOpen) return;
    const ensureLeaflet = async () => {
      try {
        // Load CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        if (!(window as any).L) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Leaflet load failed'));
            document.body.appendChild(script);
          });
        }
        const L = (window as any).L;
        if (!L || !mapContainerRef.current || mapInitedRef.current) return;
        mapInitedRef.current = true;
        const center = [latitude ?? 26.9124, longitude ?? 75.7873]; // Jaipur default
        const map = L.map(mapContainerRef.current).setView(center, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
        let marker: any = null;
        const setPoint = (latlng: any) => {
          if (marker) marker.remove();
          marker = L.marker(latlng).addTo(map);
          setLatitude(Number(latlng.lat));
          setLongitude(Number(latlng.lng));
          setUseGps(true);
        };
        map.on('click', (e: any) => setPoint(e.latlng));
        if (latitude && longitude) setPoint({ lat: latitude, lng: longitude });
      } catch (e) {
        console.warn('Map picker unavailable:', e);
      }
    };
    ensureLeaflet();
  }, [mapOpen]);

  const transformActive = async (action: 'rotate' | 'flip') => {
    const current = items[activeIndex];
    if (!current) return;
    const img = new Image();
    img.src = current.previewUrl;
    await new Promise((res, rej) => { img.onload = () => res(null); img.onerror = rej; });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (action === 'rotate') {
      canvas.width = img.height;
      canvas.height = img.width;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
    }
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92));
    if (!blob) return;
    const file = new File([blob], current.file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    setItems((prev) => prev.map((it, idx) => idx === activeIndex ? { ...it, file, previewUrl: url } : it));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddress(e.target.value);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error("Please add at least one image to upload");
      return;
    }
    
    if (!address.trim() && !useGps) {
      toast.error("Please provide location information");
      return;
    }
    
    try {
      setLoading(true);
      console.log('Uploading images with location:', address.trim() || "GPS Location");

      // Upload sequentially for stable progress UI
      for (let i = 0; i < items.length; i++) {
        setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, status: 'uploading', progress: 0 } : it));
        addLog(`Uploading ${items[i].file.name}...`);
        const current = items[i];
        const response = await apiClient.uploadImage(
          current.file,
          address.trim() || "GPS Location",
          latitude ?? undefined,
          longitude ?? undefined,
          false,
          (p) => {
            setUploadProgress(p);
            setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, progress: p } : it));
          }
        );
        if (response.success) {
          setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, status: 'done', progress: 100 } : it));
          addLog(`Uploaded ${items[i].file.name}`);
        } else {
          setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, status: 'failed' } : it));
          // Queue offline if network issue
          if (!navigator.onLine || (response.error && response.error.includes('Failed to fetch'))) {
            await queueOffline(current.file, address.trim() || "GPS Location", latitude ?? undefined, longitude ?? undefined);
            toast.message("Saved offline", { description: "We will retry when you're back online." });
            addLog(`Saved offline: ${items[i].file.name}`);
          } else {
            toast.error(response.error || "Failed to upload image");
            addLog(`Failed upload: ${items[i].file.name}`);
          }
        }
      }

      // Trigger global data refresh
      refreshData();

      // Reset state and go to history
      setItems([]);
      setAddress("");
      setLatitude(null);
      setLongitude(null);
      setUseGps(false);
      setTimeout(() => navigate("/history"), 700);
      addLog("All uploads processed");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
      addLog("Unexpected upload error");
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  // --- Offline queue using localStorage (data URL) ---
  const OFFLINE_KEY = 'binsavvy_offline_queue_v1';
  const fileToDataUrl = (file: File): Promise<string> => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(String(reader.result));
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
  const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || 'image/jpeg' });
  };
  const queueOffline = async (file: File, loc: string, lat?: number, lng?: number) => {
    try {
      const encoded = await fileToDataUrl(file);
      const entry = { filename: file.name, dataUrl: encoded, loc, lat, lng, ts: Date.now() };
      const arr = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
      arr.push(entry);
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('Failed saving offline upload', e);
    }
  };
  const retryOffline = async () => {
    const raw = localStorage.getItem(OFFLINE_KEY);
    if (!raw) return;
    const arr: Array<{ filename: string; dataUrl: string; loc: string; lat?: number; lng?: number; ts: number }> = JSON.parse(raw);
    if (arr.length === 0) return;
    for (const entry of arr) {
      const f = await dataUrlToFile(entry.dataUrl, entry.filename || `offline-${entry.ts}.jpg`);
      const res = await apiClient.uploadImage(f, entry.loc, entry.lat, entry.lng, false);
      if (!res.success) {
        toast.error('Offline upload retry failed. Will keep for later.');
        addLog('Offline retry failed');
        return; // stop to avoid loop
      }
    }
    localStorage.removeItem(OFFLINE_KEY);
    toast.success('Pending offline uploads have been sent.');
    addLog('Offline uploads sent');
  };
  useEffect(() => {
    const onOnline = () => { if (navigator.onLine) retryOffline(); };
    window.addEventListener('online', onOnline);
    if (navigator.onLine) { retryOffline(); }
    return () => window.removeEventListener('online', onOnline);
  }, []);

  // --- EXIF GPS extraction (optional via CDN) ---
  const ensureExifr = async (): Promise<any | null> => {
    const w = window as any;
    if (w.exifr) return w.exifr;
    try {
      await new Promise<void>((resolve, reject) => {
        const existing = document.getElementById('exifr-umd');
        if (existing) { resolve(); return; }
        const script = document.createElement('script');
        script.id = 'exifr-umd';
        script.src = 'https://unpkg.com/exifr/dist/full.umd.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('exifr load failed'));
        document.body.appendChild(script);
      });
      return w.exifr || null;
    } catch {
      return null;
    }
  };

  const tryExtractExifGps = async (file: File) => {
    try {
      const exifr: any = await ensureExifr();
      if (!exifr) return;
      const output: any = await exifr.gps(file).catch(() => null);
      if (output && typeof output.latitude === 'number' && typeof output.longitude === 'number') {
        setLatitude(output.latitude);
        setLongitude(output.longitude);
        setUseGps(true);
        toast.success('GPS auto-filled from photo metadata');
      }
    } catch {
      // ignore silently
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Upload Waste Image</CardTitle>
        <CardDescription>
          Upload photos of waste in your surroundings to help us analyze and address waste management issues. 
          Your uploads will be automatically processed using our ML models.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleUpload}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Image</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <div
                  className="border rounded-md p-2 hover:shadow-sm transition-shadow"
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) {
                      const fakeEvent = { target: { files: [f] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                      handleFileChange(fakeEvent);
                    }
                  }}
                  onPaste={(e) => {
                    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith('image/'));
                    if (item) {
                      const blob = item.getAsFile();
                      if (blob) {
                        const file = new File([blob], 'pasted-image.png', { type: blob.type });
                        const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                        handleFileChange(fakeEvent);
                      }
                    }
                  }}
                >
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    {...({ capture: "environment" } as any)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={openCamera} className="text-xs hover:shadow">
                    Use Camera
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPEG, PNG, WebP. Max size: 10MB.
                </p>
              </div>
              <div className="flex items-center justify-center border rounded-md p-2 min-h-[150px] bg-muted/30">
                {items.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {items.map((it, idx) => (
                      <div key={it.id} className={`relative rounded overflow-hidden border group ${idx===activeIndex?'ring-2 ring-primary':''}`}>
                        <button type="button" className="w-full" onClick={() => setActiveIndex(idx)}>
                          <img src={it.previewUrl} alt="Preview" className="h-24 w-full object-cover" />
                        </button>
                        {it.status !== 'queued' && (
                          <span className="absolute bottom-0 left-0 right-0 text-[10px] bg-black/50 text-white px-1">{it.status}{it.progress!==null?` ${it.progress}%`:''}</span>
                        )}
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-white/80 hover:bg-white text-xs rounded px-1 shadow hidden group-hover:block"
                          onClick={() => {
                            setItems((prev) => prev.filter((_, j) => j !== idx));
                            if (activeIndex === idx) setActiveIndex(0);
                            addLog(`Removed ${it.file.name} from queue`);
                          }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Drag & drop, paste, capture, or choose a file</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="location">Location Information</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getGeoLocation}
                className="text-xs hover:shadow"
                disabled={useGps && latitude !== null}
              >
                {useGps && latitude !== null ? "GPS Location Captured" : "Use GPS"}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Queue: {items.length}/{MAX_QUEUE_ITEMS} · Total size: {((items.reduce((a,b)=>a+b.file.size,0))/1024/1024).toFixed(1)}MB / {MAX_TOTAL_MB}MB
            </div>
            <Textarea
              id="location"
              placeholder="Enter the address or description of where this photo was taken..."
              value={address}
              onChange={handleAddressChange}
              rows={3}
              disabled={loading}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" step="0.000001" placeholder="Latitude" value={latitude ?? ''} onChange={(e)=> setLatitude(e.target.value? Number(e.target.value): null)} />
              <Input type="number" step="0.000001" placeholder="Longitude" value={longitude ?? ''} onChange={(e)=> setLongitude(e.target.value? Number(e.target.value): null)} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setMapOpen(true)} className="text-xs hover:shadow">Pick on Map</Button>
              {items[activeIndex] && (
                <>
                  <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => transformActive('rotate')}>Rotate 90°</Button>
                  <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => transformActive('flip')}>Flip</Button>
                  <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => tryExtractExifGps(items[activeIndex].file)}>Auto GPS from EXIF</Button>
                </>
              )}
            </div>
            {useGps && latitude !== null && (
              <div className="text-xs text-muted-foreground">
                GPS Coordinates: {latitude.toFixed(6)}, {longitude?.toFixed(6)}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full button-gradient"
            disabled={loading || items.length===0}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">○</span>
                {uploadProgress !== null ? `Uploading ${uploadProgress}%` : "Uploading..."}
              </>
            ) : (
              items.length > 1 ? `Upload ${items.length} Images` : "Upload Image"
            )}
          </Button>
        </CardFooter>
      </form>
      {logs.length > 0 && (
        <div className="mt-4 text-xs text-muted-foreground">
          <div className="font-medium mb-1">Activity</div>
          <ul className="space-y-1 max-h-28 overflow-auto pr-1">
            {logs.map((l) => (
              <li key={l.id}>• {new Date(l.ts).toLocaleTimeString()} — {l.message}</li>
            ))}
          </ul>
        </div>
      )}
      <Dialog open={cameraOpen} onOpenChange={(open) => { setCameraOpen(open); if (!open) stopCamera(); }}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Camera</DialogTitle>
            <DialogDescription>Align the waste in frame and tap capture.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative bg-black rounded-md overflow-hidden aspect-video">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={captureFromCamera}>
                Capture Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={mapOpen} onOpenChange={(o)=> setMapOpen(o)}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Select Location</DialogTitle>
            <DialogDescription>Click on the map to set latitude/longitude.</DialogDescription>
          </DialogHeader>
          <div className="h-[420px] w-full rounded-md overflow-hidden" ref={mapContainerRef} />
          <div className="text-xs text-muted-foreground">Jaipur set as default view if GPS not available.</div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UploadForm;
