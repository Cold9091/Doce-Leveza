import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { Pathology, Video } from "@shared/schema";
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  FileText, 
  Eye,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  PlayCircle,
  CheckCircle,
  Download,
  Shield,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { VideoPlayer } from "@/components/video-player";
import { Slider } from "@/components/ui/slider";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useContentProtection, ProtectionOverlay, ScreenCaptureBlocker } from "@/hooks/use-content-protection";

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

const mockPdfs = [
  { id: 1, title: "Guia Completo de Tratamento", pages: 45, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
  { id: 2, title: "Protocolo de Exercícios", pages: 28, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
  { id: 3, title: "Material de Apoio - Anatomia", pages: 62, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
];

export default function PathologyDetail() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [showCourseView, setShowCourseView] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [apiReady, setApiReady] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [hasCountedView, setHasCountedView] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<typeof mockPdfs[0] | null>(null);
  const [rightPanelView, setRightPanelView] = useState<'lessons' | 'pdf'>('lessons');
  
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [, params] = useRoute("/dashboard/patologias/:slug");
  const slug = params?.slug;

  const { data: pathologies } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
  });

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
    enabled: !!pathologies,
  });

  const pathology = pathologies?.find((p) => p.slug === slug);
  const pathologyVideos = videos?.filter(
    (v) => v.pathologyId === pathology?.id
  );

  const currentVideo = pathologyVideos?.[currentVideoIndex];
  const videoId = currentVideo ? getYouTubeVideoId(currentVideo.videoUrl) : null;
  
  useContentProtection({ 
    enabled: showCourseView,
    showWarning: true,
    warningMessage: "Este vídeo é protegido por direitos autorais.",
    userIdentifier: "Usuário",
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
    if (!showCourseView || !currentVideo || !apiReady) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
      setPlayerReady(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setHasCountedView(false);
      return;
    }

    const ytVideoId = getYouTubeVideoId(currentVideo.videoUrl);
    if (!ytVideoId) return;

    const containerId = `yt-player-inline-${currentVideo.id}`;
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
            autoplay: 0,
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
              
              if (playing && !hasCountedView && currentVideo) {
                setHasCountedView(true);
                incrementViewMutation.mutate(currentVideo.id);
              }
            },
          },
        });
      } catch (e) {
        console.error("Failed to create YouTube player:", e);
      }
    };

    const timer = setTimeout(initPlayer, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [showCourseView, currentVideo?.id, apiReady]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

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

  const handleVideoSelect = (index: number) => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {}
      playerRef.current = null;
    }
    setPlayerReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasCountedView(false);
    setCurrentVideoIndex(index);
    setRightPanelView('lessons');
    setSelectedPdf(null);
  };

  const handlePdfSelect = (pdf: typeof mockPdfs[0]) => {
    setSelectedPdf(pdf);
    setRightPanelView('pdf');
  };

  const handleClosePdf = () => {
    setSelectedPdf(null);
    setRightPanelView('lessons');
  };

  if (!pathology) {
    return (
      <div className="p-6 space-y-4 sm:space-y-6">
        <Link href="/dashboard/patologias">
          <a className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Voltar para Patologias
          </a>
        </Link>
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">Patologia não encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCourseView && currentVideo) {
    return (
      <div className="flex h-full overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-4">
              <div className="mb-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowCourseView(false)}
                  className="text-muted-foreground"
                  data-testid="button-back-videos"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para lista de vídeos
                </Button>
              </div>

              <div 
                ref={containerRef}
                className="relative w-full bg-black rounded-2xl overflow-hidden protected-content shadow-lg"
                style={{ aspectRatio: '16/9' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => isPlaying && setShowControls(false)}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              >
                <ScreenCaptureBlocker enabled={showCourseView} />

                <Badge className="absolute top-4 left-4 z-30 bg-red-500 text-white border-0">
                  <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  {formatTime(currentTime)}
                </Badge>
                
                {videoId ? (
                  <>
                    <div 
                      id={`yt-player-inline-${currentVideo.id}`}
                      className="absolute inset-0 w-full h-full"
                    />
                    
                    <ProtectionOverlay userIdentifier="Usuário" showWatermark={true} />
                    
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
                          <div className="flex items-center gap-4">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white"
                              onClick={(e) => { e.stopPropagation(); skipBack(); }}
                              data-testid="button-skip-back"
                            >
                              <SkipBack className="h-6 w-6" />
                            </Button>
                            
                            <Button
                              size="icon"
                              className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                              data-testid="button-play-pause"
                            >
                              {isPlaying ? (
                                <Pause className="h-8 w-8 text-white" />
                              ) : (
                                <Play className="h-8 w-8 text-white ml-1" />
                              )}
                            </Button>
                            
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white"
                              onClick={(e) => { e.stopPropagation(); skipForward(); }}
                              data-testid="button-skip-forward"
                            >
                              <SkipForward className="h-6 w-6" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="space-y-2">
                          <Slider
                            value={[currentTime]}
                            max={duration || 100}
                            step={1}
                            onValueChange={handleProgressChange}
                            className="cursor-pointer"
                            data-testid="slider-progress"
                          />
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-white hover:bg-white/20"
                                onClick={togglePlay}
                                data-testid="button-play-small"
                              >
                                {isPlaying ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              
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
                              </div>
                              
                              <span className="text-white text-sm ml-2">
                                {formatTime(currentTime)} / {formatTime(duration)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs text-white border-white/30 bg-black/30">
                                <Shield className="mr-1 h-3 w-3" />
                                Protegido
                              </Badge>
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
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white/60">Carregando vídeo...</p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h2 className="text-lg font-semibold text-foreground" data-testid="heading-video-title">
                  {currentVideo.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{currentVideo.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="mr-1 h-3 w-3" />
                    {currentVideo.duration}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Eye className="mr-1 h-3 w-3" />
                    {(currentVideo.viewCount || 0).toLocaleString()} visualizações
                  </Badge>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Materiais de Apoio
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {mockPdfs.map((pdf) => (
                    <Card 
                      key={pdf.id} 
                      className="hover-elevate active-elevate-2 cursor-pointer transition-all"
                      onClick={() => handlePdfSelect(pdf)}
                      data-testid={`card-pdf-${pdf.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-14 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-2">{pdf.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{pdf.pages} páginas</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          data-testid={`button-read-pdf-${pdf.id}`}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Ler PDF
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="w-80 border-l bg-card flex flex-col">
          {rightPanelView === 'lessons' ? (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-foreground" data-testid="heading-next-lessons">Próximas Aulas</h3>
                <Badge variant="secondary" className="text-xs">
                  {pathologyVideos?.length || 0} aulas
                </Badge>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2">
                  {pathologyVideos?.map((video, index) => (
                    <div
                      key={video.id}
                      className={`flex gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        index === currentVideoIndex 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleVideoSelect(index)}
                      data-testid={`lesson-item-${video.id}`}
                    >
                      <div className="relative w-24 h-14 rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        {index === currentVideoIndex ? (
                          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                            <PlayCircle className="h-6 w-6 text-white" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <Badge className="absolute bottom-1 right-1 bg-black/70 text-[10px] px-1 py-0">
                          {video.duration}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium line-clamp-2 ${
                          index === currentVideoIndex ? 'text-primary' : 'text-foreground'
                        }`}>
                          {video.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {index === currentVideoIndex && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">
                              Assistindo
                            </Badge>
                          )}
                          {index < currentVideoIndex && (
                            <span className="flex items-center text-[10px] text-green-600">
                              <CheckCircle className="h-3 w-3 mr-0.5" />
                              Concluído
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleClosePdf}
                    data-testid="button-close-pdf"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-semibold text-foreground text-sm line-clamp-1" data-testid="heading-pdf-title">
                    {selectedPdf?.title}
                  </h3>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={handleClosePdf}
                  data-testid="button-close-pdf-x"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 bg-muted/50">
                {selectedPdf && (
                  <iframe
                    src={`${selectedPdf.url}#toolbar=0&navpanes=0`}
                    className="w-full h-full border-0"
                    title={selectedPdf.title}
                    data-testid="iframe-pdf-viewer"
                  />
                )}
              </div>

              <div className="p-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => selectedPdf && window.open(selectedPdf.url, '_blank')}
                  data-testid="button-download-pdf"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar PDF
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 sm:space-y-6">
      <Link href="/dashboard/patologias">
        <a
          className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground"
          data-testid="link-back-pathologies"
        >
          <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Voltar para Patologias
        </a>
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground" data-testid={`heading-pathology-${slug}`}>
          {pathology.title}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">{pathology.description}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-56 sm:h-64 animate-pulse bg-muted" />
          ))}
        </div>
      ) : pathologyVideos && pathologyVideos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {pathologyVideos.map((video, index) => (
              <Card
                key={video.id}
                className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer"
                data-testid={`card-video-${video.id}`}
                onClick={() => {
                  setCurrentVideoIndex(index);
                  setShowCourseView(true);
                }}
              >
                <div className="relative aspect-video bg-muted">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm">
                    <Clock className="mr-1 h-3 w-3" />
                    {video.duration}
                  </Badge>
                  {video.viewCount !== undefined && video.viewCount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm">
                      <Eye className="mr-1 h-3 w-3" />
                      {video.viewCount.toLocaleString()}
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-base">
                    {video.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {video.description}
                  </CardDescription>
                </CardHeader>
                {video.resources && video.resources.length > 0 && (
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {video.resources.map((resource, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <FileText className="mr-1 h-3 w-3" />
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          <VideoPlayer
            video={selectedVideo}
            open={playerOpen}
            onOpenChange={setPlayerOpen}
          />
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Nenhum vídeo disponível para esta patologia ainda.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
