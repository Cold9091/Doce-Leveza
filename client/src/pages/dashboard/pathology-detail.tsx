import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { Pathology, Video } from "@shared/schema";
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  FileText, 
  Eye,
  Mic,
  Video as VideoIcon,
  Maximize2,
  Settings,
  Phone,
  MonitorUp,
  Paperclip,
  Image,
  FileCheck,
  ClipboardList,
  MessageSquare,
  Send,
  ChevronRight
} from "lucide-react";
import { VideoPlayer } from "@/components/video-player";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const mockParticipants = [
  { id: 1, name: "Maria Silva", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
  { id: 2, name: "João Santos", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
  { id: 3, name: "Ana Costa", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
];

const mockMessages = [
  { id: 1, user: "Maria", message: "Olá a todos!", time: "09:58", color: "text-orange-500" },
  { id: 2, user: "João", message: "Oi pessoal", time: "09:59", color: "text-orange-400" },
  { id: 3, user: "Maria", message: "Olá João!", time: "09:59", color: "text-orange-500" },
  { id: 4, user: "Ana", message: "Bom dia", time: "10:00", color: "text-green-500" },
  { id: 5, user: "Carla", message: "Olá!", time: "10:00", color: "text-blue-500" },
  { id: 6, user: "Maria", message: "Animados para a aula de hoje?", time: "10:01", color: "text-orange-500" },
  { id: 7, user: "João", message: "Sim, espero que seja ótima", time: "10:02", color: "text-orange-400" },
];

const toolbarItems = [
  { icon: MonitorUp, label: "Compartilhar tela" },
  { icon: Paperclip, label: "Anexo" },
  { icon: Image, label: "Imagem" },
  { icon: FileCheck, label: "Documentos" },
  { icon: ClipboardList, label: "Testes" },
  { icon: MessageSquare, label: "Mensagens" },
];

export default function PathologyDetail() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [showCourseView, setShowCourseView] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [message, setMessage] = useState("");
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
      <div className="flex h-full">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 flex flex-col gap-4">
            <div className="relative flex-1 bg-card rounded-2xl overflow-hidden shadow-lg">
              <Badge className="absolute top-4 left-4 z-10 bg-red-500 text-white border-0">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                {currentVideo.duration || "00:05:45"}
              </Badge>

              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                {mockParticipants.map((participant, idx) => (
                  <div 
                    key={participant.id}
                    className="relative"
                    style={{ marginLeft: idx > 0 ? "-0.5rem" : 0 }}
                  >
                    <Avatar className="h-12 w-12 border-2 border-card">
                      <AvatarImage src={participant.image} alt={participant.name} />
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] bg-card/80 backdrop-blur-sm px-1 rounded text-foreground whitespace-nowrap">
                      {participant.name.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <img 
                  src={currentVideo.thumbnailUrl} 
                  alt={currentVideo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Button
                    size="icon"
                    className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    onClick={() => {
                      setSelectedVideo(currentVideo);
                      setPlayerOpen(true);
                    }}
                    data-testid="button-play-video"
                  >
                    <Play className="h-8 w-8 text-white" />
                  </Button>
                </div>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <Button size="icon" variant="secondary" className="h-12 w-12 rounded-full bg-card/80 backdrop-blur-sm" data-testid="button-mic">
                  <Mic className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="secondary" className="h-12 w-12 rounded-full bg-card/80 backdrop-blur-sm" data-testid="button-video">
                  <VideoIcon className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="secondary" className="h-12 w-12 rounded-full bg-card/80 backdrop-blur-sm" data-testid="button-fullscreen">
                  <Maximize2 className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="secondary" className="h-12 w-12 rounded-full bg-card/80 backdrop-blur-sm" data-testid="button-settings">
                  <Settings className="h-5 w-5" />
                </Button>
                <Button size="icon" className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600" data-testid="button-end-call">
                  <Phone className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 p-4 bg-card rounded-xl">
              {toolbarItems.map((item) => (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex flex-col items-center gap-2 h-auto py-3 px-4 hover:bg-muted"
                      data-testid={`button-toolbar-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                    >
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{item.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          <div className="p-4 pt-0">
            <Button 
              variant="ghost" 
              onClick={() => setShowCourseView(false)}
              className="text-muted-foreground"
              data-testid="button-back-videos"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista de vídeos
            </Button>
          </div>
        </div>

        <div className="w-80 border-l bg-card flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-foreground" data-testid="heading-group-chat">Grupo de Chat</h3>
            <Button size="icon" variant="ghost" data-testid="button-toggle-chat">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {mockMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`${msg.color} bg-muted`}>
                      {msg.user.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${msg.color}`}>{msg.user}</span>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-sm text-foreground">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="relative">
              <Input
                placeholder="Mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="pr-10 bg-muted border-0"
                data-testid="input-chat-message"
              />
              <Button 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-primary"
                data-testid="button-send-message"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <VideoPlayer
          video={selectedVideo}
          open={playerOpen}
          onOpenChange={setPlayerOpen}
        />
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
