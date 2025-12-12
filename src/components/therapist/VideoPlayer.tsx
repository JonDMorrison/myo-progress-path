import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RefreshCw, 
  Loader 
} from "lucide-react";
import { getVideoUrl } from "@/lib/storage";

interface VideoPlayerProps {
  uploads: {
    id: string;
    file_url: string;
    kind: string;
    created_at: string;
  }[];
  onVideoError?: () => void;
}

const PLAYBACK_SPEEDS = [1, 1.25, 1.5];

const VideoPlayer = ({ uploads, onVideoError }: VideoPlayerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentUpload = uploads[currentIndex];

  // Load signed URL for current video
  useEffect(() => {
    if (!currentUpload) return;
    
    const loadUrl = async () => {
      setLoading(true);
      setError(false);
      try {
        const url = await getVideoUrl(currentUpload.file_url);
        setSignedUrl(url);
      } catch (err) {
        console.error("Error loading video URL:", err);
        setError(true);
        onVideoError?.();
      } finally {
        setLoading(false);
      }
    };

    loadUrl();
  }, [currentUpload?.id]);

  // Auto-play when URL loads
  useEffect(() => {
    if (signedUrl && videoRef.current && !loading) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked, that's ok
      });
    }
  }, [signedUrl, loading]);

  // Update playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleRefreshUrl = async () => {
    if (!currentUpload) return;
    setLoading(true);
    try {
      const url = await getVideoUrl(currentUpload.file_url);
      setSignedUrl(url);
      setError(false);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < uploads.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const cyclePlaybackSpeed = () => {
    const currentIdx = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIdx = (currentIdx + 1) % PLAYBACK_SPEEDS.length;
    setPlaybackSpeed(PLAYBACK_SPEEDS[nextIdx]);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  if (uploads.length === 0) {
    return (
      <div className="bg-muted rounded-lg p-8 text-center">
        <p className="text-sm text-muted-foreground">No videos uploaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Video container */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-[9/16] max-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-white/70">Failed to load video</p>
            <Button size="sm" variant="secondary" onClick={handleRefreshUrl}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : signedUrl ? (
          <video
            ref={videoRef}
            src={signedUrl}
            className="w-full h-full object-contain"
            controls={false}
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => {
              setPlaying(false);
              // Auto-advance to next video
              if (currentIndex < uploads.length - 1) {
                setTimeout(() => handleNext(), 500);
              }
            }}
            onError={() => {
              setError(true);
              onVideoError?.();
            }}
          />
        ) : null}

        {/* Video overlay controls */}
        {!loading && !error && signedUrl && (
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30"
            onClick={togglePlay}
          >
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/30 text-white"
            >
              {playing ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
          </div>
        )}
      </div>

      {/* Video info & controls */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            {currentUpload?.kind === "first_attempt" ? "First Attempt" : "Last Attempt"}
          </p>
          <p className="text-xs text-muted-foreground">
            {currentIndex + 1} of {uploads.length}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {/* Previous */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="h-8 w-8"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          {/* Play/Pause */}
          <Button
            size="icon"
            variant="ghost"
            onClick={togglePlay}
            className="h-8 w-8"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          {/* Next */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleNext}
            disabled={currentIndex === uploads.length - 1}
            className="h-8 w-8"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          {/* Playback speed */}
          <Button
            size="sm"
            variant="outline"
            onClick={cyclePlaybackSpeed}
            className="h-8 px-2 text-xs"
          >
            {playbackSpeed}x
          </Button>

          {/* Refresh URL */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleRefreshUrl}
            className="h-8 w-8"
            title="Refresh video URL"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
