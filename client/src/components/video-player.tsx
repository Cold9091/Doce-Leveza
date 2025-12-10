import { useState, useRef, useEffect, useCallback } from "react";
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
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Shield
} from "lucide-react";
import type { Video } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useContentProtection, ProtectionOverlay, ScreenCaptureBlocker } from "@/hooks/use-content-protection.js";

interface VideoPlayerProps {
  video: Video | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userIdentifier?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let ytApiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (ytApiPromise) return ytApiPromise;
  
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }

  ytApiPromise = new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existingScript) {
      const checkReady = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkReady);
          resolve();
        }
      }, 100);
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  });

  return ytApiPromise;
}

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VideoPlayer({ video, open, onOpenChange, userIdentifier = "Usuário" }: VideoPlayerProps) {
  const [apiReady, setApiReady] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasCountedView, setHasCountedView] = useState(false);
  
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useContentProtection({ 
    enabled: open,
    showWarning: true,
    warningMessage: "Este vídeo é protegido por direitos autorais.",
    userIdentifier,
  });
  
  const incrementViewMutation = useMutation({
    mutationFn: async (videoId: number) => {
      const response = await apiRequest("POST", `/api/videos/${videoId}/view`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    },
  });

  useEffect(() => {
    loadYouTubeApi().then(() => {
      setApiReady(true);
    });
  }, []);

  const updateProgress = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      setCurrentTime(playerRef.current.getCurrentTime());
    }
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, updateProgress]);

  useEffect(() => {
    if (!open || !video || !apiReady) {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      setPlayerReady(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setHasCountedView(false);
      return;
    }

    const ytVideoId = getYouTubeVideoId(video.videoUrl);
    if (!ytVideoId) return;

    const containerId = `yt-player-${video.id}`;
    let cancelled = false;

    const initPlayer = () => {
      if (cancelled) return;
      
      const container = document.getElementById(containerId);
      if (!container) {
        setTimeout(initPlayer, 50);
        return;
      }

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }

      try {
        playerRef.current = new window.YT.Player(containerId, {
          videoId: ytVideoId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            disablekb: 0,
            fs: 0,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              setPlayerReady(true);
              setDuration(event.target.getDuration());
              event.target.setVolume(volume);
            },
            onStateChange: (event: any) => {
              const playing = event.data === window.YT.PlayerState.PLAYING;
              setIsPlaying(playing);
              
              if (playing && !hasCountedView && video) {
                setHasCountedView(true);
                incrementViewMutation.mutate(video.id);
              }
            },
          },
        });
      } catch (e) {
        console.error('Failed to create YouTube player:', e);
      }
    };

    setTimeout(initPlayer, 100);

    return () => {
      cancelled = true;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
    };
  }, [open, video, apiReady]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  const togglePlay = useCallback(() => {
    if (!playerRef.current || !playerReady) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (e) {}
  }, [playerReady, isPlaying]);

  const seekTo = useCallback((seconds: number) => {
    if (!playerRef.current || !playerReady) return;
    try {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    } catch (e) {}
  }, [playerReady]);

  const skipBack = useCallback(() => {
    seekTo(Math.max(0, currentTime - 10));
  }, [seekTo, currentTime]);

  const skipForward = useCallback(() => {
    seekTo(Math.min(duration, currentTime + 10));
  }, [seekTo, currentTime, duration]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (playerRef.current && playerReady) {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(newVolume);
      } catch (e) {}
    }
  }, [playerReady]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current || !playerReady) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume > 0 ? volume : 50);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (e) {}
  }, [playerReady, isMuted, volume]);

  const handleProgressChange = useCallback((value: number[]) => {
    seekTo(value[0]);
  }, [seekTo]);

  const handleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  if (!video) return null;

  const videoId = getYouTubeVideoId(video.videoUrl);
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
            <Badge variant="outline" className="text-xs text-green-600 border-green-600/30">
              <Shield className="mr-1 h-3 w-3" />
              Conteúdo Protegido
            </Badge>
          </div>
        </DialogHeader>

        <div 
          ref={containerRef}
          className="relative w-full aspect-video bg-black protected-content"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          style={{ 
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          <ScreenCaptureBlocker enabled={open} />
          {videoId ? (
            <>
              <div 
                id={`yt-player-${video.id}`}
                className="absolute inset-0 w-full h-full"
              />
              
              <ProtectionOverlay userIdentifier={userIdentifier} showWatermark={true} />
              
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />

              <div 
                className={`absolute inset-0 z-20 transition-opacity duration-300 ${
                  showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  onClick={togglePlay}
                >
                  {playerReady && (
                    <div className="h-16 w-16 rounded-full bg-black/50 flex items-center justify-center">
                      {isPlaying ? (
                        <Pause className="h-8 w-8 text-white" />
                      ) : (
                        <Play className="h-8 w-8 text-white ml-1" />
                      )}
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="mb-3">
                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={0.1}
                      onValueChange={handleProgressChange}
                      className="cursor-pointer"
                      data-testid="slider-progress"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={skipBack}
                        data-testid="button-skip-back"
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-white hover:bg-white/20"
                        onClick={togglePlay}
                        data-testid="button-play-toggle"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5 ml-0.5" />
                        )}
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={skipForward}
                        data-testid="button-skip-forward"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>

                      <span className="text-xs text-white ml-2 font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
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
                </div>
              </div>

              {!playerReady && (
                <div className="absolute inset-0 flex items-center justify-center z-30 bg-black">
                  <div className="text-white text-sm">Carregando vídeo...</div>
                </div>
              )}
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
