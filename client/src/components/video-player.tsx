import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Eye, 
  Clock, 
  FileText, 
  Download,
  Volume2,
  VolumeX,
  Maximize
} from "lucide-react";
import type { Video } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface VideoPlayerProps {
  video: Video | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3`;
    }
  }
  
  return null;
}

export function VideoPlayer({ video, open, onOpenChange }: VideoPlayerProps) {
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const incrementViewMutation = useMutation({
    mutationFn: async (videoId: number) => {
      const response = await apiRequest("POST", `/api/videos/${videoId}/view`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setHasStartedPlaying(false);
    }
    onOpenChange(newOpen);
  };

  const handleVideoLoad = () => {
    if (!hasStartedPlaying && video) {
      setHasStartedPlaying(true);
      incrementViewMutation.mutate(video.id);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      const iframe = containerRef.current.querySelector('iframe');
      if (iframe) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          iframe.requestFullscreen();
        }
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  if (!video) return null;

  const embedUrl = getYouTubeEmbedUrl(video.videoUrl);
  const viewCount = video.viewCount || 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-lg sm:text-xl font-semibold">
                {video.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {video.description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              {video.duration}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Eye className="mr-1 h-3 w-3" />
              {viewCount.toLocaleString()} visualizações
            </Badge>
          </div>
        </DialogHeader>

        <div 
          ref={containerRef}
          className="relative w-full aspect-video bg-black"
        >
          {embedUrl ? (
            <>
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full z-10"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                onLoad={handleVideoLoad}
                data-testid="video-iframe"
              />
              
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-20" />
              
              <div className="absolute bottom-0 left-0 right-0 p-3 z-20 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={toggleMute}
                    data-testid="button-mute"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="w-20 cursor-pointer"
                    data-testid="slider-volume"
                  />

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={handleFullscreen}
                    data-testid="button-fullscreen"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <p>Vídeo não disponível</p>
            </div>
          )}
        </div>

        {video.resources && video.resources.length > 0 && (
          <div className="p-4 border-t">
            <h4 className="text-sm font-medium mb-2">Materiais complementares</h4>
            <div className="flex flex-wrap gap-2">
              {video.resources.map((resource, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  data-testid={`button-resource-${idx}`}
                >
                  <FileText className="mr-1 h-3 w-3" />
                  {resource}
                  <Download className="ml-1 h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
