import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  return (
    <header className="flex items-center justify-between gap-4 border-b p-4 bg-background">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger data-testid="button-sidebar-toggle" className="text-muted-foreground hover:text-foreground md:hidden" />
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground" data-testid="text-greeting">
            Olá, {userName}
          </span>
        </div>

        <div className="hidden sm:flex relative flex-1 max-w-md ml-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Pesquisar..."
            className="pl-10 bg-muted/50 border-0 h-10"
            data-testid="input-search"
          />
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

        <Button 
          size="icon" 
          variant="ghost" 
          className="relative text-muted-foreground hover:text-foreground"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
            3
          </span>
        </Button>

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
