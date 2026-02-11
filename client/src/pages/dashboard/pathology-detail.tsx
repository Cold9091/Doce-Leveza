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
  ArrowRight,
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
  Shield,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { VideoPlayer } from "@/components/video-player";
import { Slider } from "@/components/ui/slider";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useContentProtection, ProtectionOverlay, ScreenCaptureBlocker } from "@/hooks/use-content-protection";
import { Document, Page, pdfjs } from "react-pdf";
import { PdfReader } from "@/components/pdf-reader";
import type { Ebook } from "@shared/schema";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import pdfTestFile from "@assets/A-ARTE-DA-GUERRA_1765386889371.pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  { id: 1, title: "A Arte da Guerra - Sun Tzu", pages: 68, url: pdfTestFile },
  { id: 2, title: "Protocolo de Exercícios", pages: 28, url: pdfTestFile },
  { id: 3, title: "Material de Apoio - Anatomia", pages: 62, url: pdfTestFile },
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
  const [pdfNumPages, setPdfNumPages] = useState<number>(0);
  const [pdfPageNumber, setPdfPageNumber] = useState<number>(1);
  const [pdfScale, setPdfScale] = useState<number>(0.6);
  const [pdfLoading, setPdfLoading] = useState<boolean>(true);
  const [pdfReaderOpen, setPdfReaderOpen] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [, params] = useRoute("/dashboard/programas/:slug");
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
  const { data: ebooks, isLoading: ebooksLoading } = useQuery<Ebook[]>({
    queryKey: ["/api/ebooks", { pathologyId: pathology?.id }],
    enabled: !!pathology,
  });

  const { data: userSubscriptions } = useQuery<any>({
    queryKey: ["/api/subscriptions/user/1"], // Hardcoded user ID for demo
  });

  const isUnlocked = (pathologyId?: number) => {
    if (!pathologyId) return true;
    if (pathologyId === 1) return true; // Demo unlock
    return userSubscriptions?.pathologyIds?.includes(pathologyId);
  };

  const filteredEbooks = ebooks?.filter(e => isUnlocked(e.pathologyId ?? undefined));

  const currentVideo = pathologyVideos?.[currentVideoIndex];
  const videoId = currentVideo ? getYouTubeVideoId(currentVideo.videoUrl) : null;

  // NOTE: If useContentProtection is missing or errors out, ensure it's not the cause of early returns.
  // Assuming it's correctly exported from "@/hooks/use-content-protection".
  try {
    useContentProtection({
      enabled: showCourseView,
      showWarning: true,
      warningMessage: "Este vídeo é protegido por direitos autorais.",
      userIdentifier: "Usuário",
    });
  } catch (e) {
    console.error("useContentProtection failed:", e);
  }

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
      const time = playerRef.current.getCurrentTime();
      setCurrentTime(time);

      // Auto-switch to next video if near the end (15 seconds before)
      if (duration > 0 && duration - time <= 15) {
        if (pathologyVideos && currentVideoIndex < pathologyVideos.length - 1) {
          handleVideoSelect(currentVideoIndex + 1);
        } else {
          setShowCourseView(false);
        }
      }
    }
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying, duration, pathologyVideos, currentVideoIndex]);

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
        } catch (e) { }
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
        } catch (e) { }
        playerRef.current = null;
      }

      try {
        playerRef.current = new window.YT.Player(containerId, {
          videoId: ytVideoId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            mute: 1,
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
              event.target.playVideo();
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
    } catch (e) { }
  }, [playerReady, isPlaying]);

  const seekTo = useCallback((seconds: number) => {
    if (!playerRef.current || !playerReady) return;
    try {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    } catch (e) { }
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
      } catch (e) { }
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
    } catch (e) { }
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
      } catch (e) { }
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

  const handlePdfSelect = (ebook: Ebook) => {
    setSelectedPdf({
      id: ebook.id,
      title: ebook.title,
      pages: ebook.pages,
      url: ebook.downloadUrl
    });
    setRightPanelView('pdf');
    setPdfPageNumber(1);
    setPdfLoading(true);
  };

  const handleClosePdf = () => {
    setSelectedPdf(null);
    setRightPanelView('lessons');
    setPdfPageNumber(1);
    setPdfNumPages(0);
  };

  const onPdfLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setPdfNumPages(numPages);
    setPdfLoading(false);
  }, []);

  const goToPrevPdfPage = useCallback(() => {
    setPdfPageNumber((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNextPdfPage = useCallback(() => {
    setPdfPageNumber((prev) => Math.min(pdfNumPages, prev + 1));
  }, [pdfNumPages]);

  const zoomInPdf = useCallback(() => {
    setPdfScale((prev) => Math.min(1.5, prev + 0.1));
  }, []);

  const zoomOutPdf = useCallback(() => {
    setPdfScale((prev) => Math.max(0.3, prev - 0.1));
  }, []);

  const convertPdfToEbook = useCallback((pdf: typeof mockPdfs[0]): Ebook => {
    return {
      id: pdf.id,
      title: pdf.title,
      description: "Material de apoio para estudo",
      pages: pdf.pages,
      downloadUrl: pdf.url,
      coverUrl: "",
      tags: ["Material de Apoio"],
      pathologyId: pathology?.id || null,
    };
  }, [pathology?.id]);

  if (!pathology) {
    return (
      <div className="p-6 space-y-4 sm:space-y-6">
        <Link href="/dashboard/programas">
          <a className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Voltar para Programas
          </a>
        </Link>
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">Programa não encontrado</p>
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

                    {/* Thumbnail overlay when paused or loading */}
                    {(!isPlaying || !playerReady) && currentVideo.thumbnailUrl && (
                      <div className="absolute inset-0 z-10">
                        <img
                          src={currentVideo.thumbnailUrl}
                          alt={currentVideo.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                      </div>
                    )}

                    <ProtectionOverlay userIdentifier="Usuário" showWatermark={true} />

                    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-30" />

                    <div
                      className={`absolute inset-0 z-40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
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
                    <p className="text-white">Vídeo não disponível</p>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">{currentVideo.title}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        Módulo {currentVideoIndex + 1}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {currentVideo.duration}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {currentVideo.viewCount || 0} visualizações
                      </span>
                    </div>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {currentVideo.description}
                    </p>
                  </CardContent>
                </Card>

                {currentVideo.resources && currentVideo.resources.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Materiais de Apoio
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentVideo.resources.map((resource, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className="justify-start text-left h-auto py-3 px-4 hover:bg-primary/5 hover:border-primary/30"
                        >
                          <FileText className="mr-3 h-5 w-5 text-primary" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{resource}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">PDF • 2.4 MB</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel: Playlist or PDF Reader */}
        <div className="w-[350px] border-l bg-muted/30 hidden lg:flex flex-col">
          <div className="p-4 border-b bg-background">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                {rightPanelView === 'lessons' ? (
                  <>
                    <PlayCircle className="h-4 w-4 text-primary" />
                    Conteúdo do Programa
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 text-primary" />
                    Leitor de PDF
                  </>
                )}
              </h3>
              {rightPanelView === 'pdf' && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClosePdf}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {rightPanelView === 'lessons' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Progresso das aulas</span>
                  <span>{Math.round(((currentVideoIndex + 1) / (pathologyVideos?.length || 1)) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${((currentVideoIndex + 1) / (pathologyVideos?.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {rightPanelView === 'lessons' ? (
                <div className="space-y-1">
                  {pathologyVideos?.map((video, idx) => (
                    <button
                      key={video.id}
                      onClick={() => handleVideoSelect(idx)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left group ${idx === currentVideoIndex
                          ? "bg-primary/10 border-primary/20"
                          : "hover:bg-background border-transparent"
                        } border`}
                    >
                      <div className="relative flex-shrink-0 mt-0.5">
                        <div className={`h-14 w-24 rounded-md bg-muted overflow-hidden border ${idx === currentVideoIndex ? "border-primary/30" : "border-border/50"
                          }`}>
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Play className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        {idx < currentVideoIndex && (
                          <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${idx === currentVideoIndex ? "text-primary" : "text-muted-foreground"
                          }`}>
                          Aula {idx + 1}
                        </p>
                        <p className={`text-sm font-medium line-clamp-2 leading-snug ${idx === currentVideoIndex ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                          }`}>
                          {video.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {video.duration}
                        </p>
                      </div>
                    </button>
                  ))}

                  {/* Ebooks in the sidebar */}
                  {filteredEbooks && filteredEbooks.length > 0 && (
                    <div className="mt-6 px-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
                        Ebooks do Programa
                      </h4>
                      <div className="space-y-2">
                        {filteredEbooks.map((ebook) => (
                          <button
                            key={ebook.id}
                            onClick={() => handlePdfSelect(ebook)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-background transition-all text-left group"
                          >
                            <div className="h-10 w-8 bg-primary/5 rounded border border-primary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors">
                                {ebook.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{ebook.pages} páginas</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* PDF Preview in Sidebar */
                <div className="p-2 space-y-4">
                  <div className="bg-background rounded-lg border shadow-sm overflow-hidden p-1">
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded mb-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomOutPdf}>
                          <ZoomOut className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-[10px] font-medium w-8 text-center">{Math.round(pdfScale * 100)}%</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomInPdf}>
                          <ZoomIn className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToPrevPdfPage} disabled={pdfPageNumber <= 1}>
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-[10px] font-medium">{pdfPageNumber}/{pdfNumPages}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToNextPdfPage} disabled={pdfPageNumber >= pdfNumPages}>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="relative min-h-[400px] bg-muted/20 flex justify-center">
                      <Document
                        file={selectedPdf?.url}
                        onLoadSuccess={onPdfLoadSuccess}
                        loading={<div className="p-8 text-center text-xs">Carregando PDF...</div>}
                        error={<div className="p-8 text-center text-xs text-destructive">Erro ao carregar PDF</div>}
                      >
                        <Page
                          pageNumber={pdfPageNumber}
                          scale={pdfScale}
                          renderAnnotationLayer={false}
                          renderTextLayer={false}
                        />
                      </Document>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedEbook(convertPdfToEbook(selectedPdf!));
                      setPdfReaderOpen(true);
                    }}
                  >
                    Abrir em Tela Cheia
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <PdfReader
          ebook={selectedEbook}
          open={pdfReaderOpen}
          onOpenChange={setPdfReaderOpen}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/dashboard/programas">
          <a className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors group" data-testid="button-back">
            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para Programas
          </a>
        </Link>
        <div className="flex items-center gap-2">
          {pathologyVideos && pathologyVideos.length > 0 && (
            <Button
              className="w-full sm:w-auto shadow-lg shadow-primary/20"
              onClick={() => {
                setCurrentVideoIndex(0);
                setShowCourseView(true);
              }}
              data-testid="button-start-course"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Começar a Estudar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Conteúdo Exclusivo
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {pathologyVideos?.length || 0} aulas disponíveis
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight" data-testid="text-pathology-title">
              {pathology.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {pathology.description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                Vídeo-aulas
              </h2>
              <Badge variant="outline" className="text-xs">
                {pathologyVideos?.length || 0} aulas
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 w-full animate-pulse bg-muted rounded-xl" />
                ))
              ) : pathologyVideos && pathologyVideos.length > 0 ? (
                pathologyVideos.map((video, idx) => (
                  <Card
                    key={video.id}
                    className="hover-elevate cursor-pointer group border-transparent hover:border-primary/20 transition-all overflow-hidden"
                    onClick={() => {
                      setCurrentVideoIndex(idx);
                      setShowCourseView(true);
                    }}
                    data-testid={`card-video-${video.id}`}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-28 sm:h-20 sm:w-36 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Play className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-4 w-4 text-white fill-white" />
                            </div>
                          </div>
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-medium text-white">
                            {video.duration}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Aula {idx + 1}</p>
                          <h3 className="font-semibold text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">
                            {video.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-1">
                            {video.description}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors mr-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-2xl border-2 border-dashed">
                  <PlayCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma aula disponível para este programa no momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <Card className="overflow-hidden border-primary/10 shadow-xl shadow-primary/5">
            <div className="h-2 bg-gradient-to-r from-primary/80 to-primary" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Materiais de Apoio
              </CardTitle>
              <CardDescription>Complemente seu estudo com estes arquivos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {ebooksLoading ? (
                <div className="h-20 animate-pulse bg-muted rounded-lg" />
              ) : filteredEbooks && filteredEbooks.length > 0 ? (
                filteredEbooks.map((ebook) => (
                  <Button
                    key={ebook.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-primary/5 hover:border-primary/20 transition-all border-dashed"
                    onClick={() => handlePdfSelect(ebook)}
                  >
                    <div className="h-10 w-8 bg-primary/5 rounded border border-primary/10 flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{ebook.title}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{ebook.pages} páginas</p>
                    </div>
                  </Button>
                ))
              ) : (
                <p className="text-xs text-center text-muted-foreground py-4">Nenhum material de apoio disponível.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Suporte Premium
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm opacity-90 leading-relaxed">
                Tem alguma dúvida sobre o conteúdo deste programa? Nossa equipe de especialistas está pronta para ajudar.
              </p>
              <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">
                Falar com Especialista
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <PdfReader
        ebook={selectedEbook}
        open={pdfReaderOpen}
        onOpenChange={setPdfReaderOpen}
      />
    </div>
  );
}
