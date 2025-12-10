import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Eye, Clock, FileText, Download } from "lucide-react";
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
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
  }
  
  return null;
}

export function VideoPlayer({ video, open, onOpenChange }: VideoPlayerProps) {
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  
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

        <div className="relative w-full aspect-video bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleVideoLoad}
              data-testid="video-iframe"
            />
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
