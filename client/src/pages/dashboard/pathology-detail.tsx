import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { Pathology, Video } from "@shared/schema";
import { ArrowLeft, Play, Clock, FileText, Eye } from "lucide-react";
import { VideoPlayer } from "@/components/video-player";

export default function PathologyDetail() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
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

  if (!pathology) {
    return (
      <div className="space-y-4 sm:space-y-6">
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

  return (
    <div className="space-y-4 sm:space-y-6">
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
            {pathologyVideos.map((video) => (
              <Card
                key={video.id}
                className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer"
                data-testid={`card-video-${video.id}`}
                onClick={() => {
                  setSelectedVideo(video);
                  setPlayerOpen(true);
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
