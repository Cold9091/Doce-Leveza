import { Bell, Calendar, Video, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardHeaderProps {
  userName?: string;
  showCourseButton?: boolean;
  courseButtonText?: string;
  onCourseButtonClick?: () => void;
}

export function DashboardHeader({
  userName = "Aluno",
  showCourseButton = false,
  courseButtonText = "Ver Aula",
  onCourseButtonClick
}: DashboardHeaderProps) {
  const userId = 1;

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications/user", userId],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/user", userId] });
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "consultation": return <Calendar className="h-4 w-4 text-emerald-500" />;
      case "content": return <Video className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <header className="flex items-center justify-between gap-4 border-b p-4 bg-background">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger data-testid="button-sidebar-toggle" className="text-muted-foreground hover:text-foreground" />

        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground" data-testid="text-greeting">
            Olá, {userName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showCourseButton && (
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 hidden sm:flex"
            onClick={onCourseButtonClick}
            data-testid="button-course"
          >
            {courseButtonText}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="relative text-muted-foreground hover:text-foreground"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="p-4 font-semibold border-b flex items-center justify-between">
              <span>Notificações</span>
              {unreadCount > 0 && (
                <span className="text-xs font-normal text-muted-foreground">{unreadCount} não lidas</span>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex flex-col items-start gap-1 p-4 cursor-default focus:bg-accent ${!notification.read ? 'bg-primary/5' : ''}`}
                    onClick={(e) => {
                      if (!notification.read) {
                        markAsReadMutation.mutate(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {getIcon(notification.type)}
                      <span className="font-medium flex-1">{notification.title}</span>
                      {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {notification.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR }) : "Há pouco tempo"}
                    </span>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Nenhuma notificação por enquanto
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-8 bg-border mx-2 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full p-0"
              data-testid="button-avatar"
            >
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" alt={userName} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Meu Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
