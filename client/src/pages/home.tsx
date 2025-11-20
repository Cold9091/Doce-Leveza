import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Check,
  PlayCircle,
  Users,
  Calendar,
  Gift,
  ShoppingCart,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight,
  Plus,
  Star,
  MessageCircle,
  Mail,
  Activity,
  TrendingDown,
  HeartPulse,
  Baby,
  Play,
  BookOpen,
  FileText,
  CreditCard,
  FileHeart,
  CalendarCheck,
  Instagram,
  Phone,
  GraduationCap,
  Video,
  Award,
  Utensils,
  Tag,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LeadCaptureDialog } from "@/components/lead-capture-dialog";
import logoImage from "@assets/Rectangle__1_-removebg-preview_1763494828422.png";
import videoImg from "@assets/stock_images/professional_woman_w_b6a99b19.jpg";
import ebookImg from "@assets/stock_images/person_reading_healt_ec03a133.jpg";
import programsImg from "@assets/stock_images/healthcare_professio_d0adc441.jpg";
import professionalImg from "@assets/stock_images/smiling_nutritionist_6abfbe04.jpg";

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 16,
    seconds: 38,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const ButterflyIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="text-accent"
    >
      <path
        d="M12 2C12 2 10 6 10 8C10 10 11 11 12 11C13 11 14 10 14 8C14 6 12 2 12 2Z"
        fill="currentColor"
      />
      <ellipse
        cx="7"
        cy="10"
        rx="4"
        ry="5"
        fill="currentColor"
        opacity="0.8"
      />
      <ellipse
        cx="17"
        cy="10"
        rx="4"
        ry="5"
        fill="currentColor"
        opacity="0.8"
      />
      <circle cx="7" cy="9" r="1.5" fill="white" opacity="0.9" />
      <circle cx="17" cy="9" r="1.5" fill="white" opacity="0.9" />
      <path
        d="M12 11C12 11 10 14 10 16C10 18 11 19 12 19C13 19 14 18 14 16C14 14 12 11 12 11Z"
        fill="currentColor"
      />
    </svg>
  );

  const professionalsList = [
    {
      name: "Dra. Camila Monteiro",
      role: "Nutricionista Clínica",
      description:
        "Especializada em dietas personalizadas para saúde e bem-estar.",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400",
    },
    {
      name: "Dra. Ana Costa",
      role: "Nutricionista Funcional",
      description:
        "Focada em dietas focadas na prevenção de doenças e promoção da saúde.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
    },
    {
      name: "Dr. João Silva",
      role: "Nutricionista Esportivo",
      description:
        "Orientação nutricional para atletas de alto rendimento.",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400",
    },
    {
      name: "Dra. Laura Mendes",
      role: "Nutricionista Pediátrica",
      description:
        "Orientação nutricional para crianças e adolescentes, focando no crescimento saudável.",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400",
    },
    {
      name: "Dr. Carlos Santos",
      role: "Nutricionista Geriátrico",
      description:
        "Nutrição voltada para idosos considerando as necessidades específicas dessa faixa etária.",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
    },
  ];

  const testimonials = [
    {
      name: "Luiza Portugal",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      rating: 5,
      text: "Lorem ipsum dolor sit amet consectetur. Amet senectus gravida risus quam massa. Nec vitae volutate sollicitudin. Nunc id metus odio id nam pharetra egestas. Donec varius eget cursus ut. At varius amet diam pellentesque lorem. Nisl semper at aget tempus torquet. Nec ultrices consectetur, vitae vestibul mauris eu maecentas. Amet finera tachet turpis cursum. Pellentum ac donec quam feugiat volutate sollicitudin elementum.",
    },
    {
      name: "Gabriela Pacheco",
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400",
      rating: 5,
      text: "Lorem ipsum dolor sit amet consectetur. Amet senectus gravida risus quam massa. Nec vitae volutate sollicitudin. Nunc id metus odio id nam pharetra egestas. Donec varius eget cursus ut. At varius amet diam pellentesque lorem. Nisl semper at aget tempus torquet. Nec ultrices consectetur, vitae vestibul mauris eu maecentas. Amet finera tachet turpis cursum. Pellentum ac donec quam feugiat volutate sollicitudin elementum.",
    },
    {
      name: "Fernanda Antunes",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      rating: 5,
      text: "Lorem ipsum dolor sit amet consectetur. Amet senectus gravida risus quam massa. Nec vitae volutate sollicitudin. Nunc id metus odio id nam pharetra egestas. Donec varius eget cursus ut. At varius amet diam pellentesque lorem. Nisl semper at aget tempus torquet. Nec ultrices consectetur, vitae vestibul mauris eu maecentas. Amet finera tachet turpis cursum. Pellentum ac donec quam feugiat volutate sollicitudin elementum.",
    },
  ];

  return (
    <div className="min-h-screen bg-background dark">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)), url('https://res.cloudinary.com/dl90hjhoj/image/upload/v1763480802/Brown_Yellow_Modern_Museum_Presentation_2_xizdht.svg')`,
        }}
        data-testid="section-hero"
      >
        <div className="container mx-auto px-4 sm:px-8 lg:px-16 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-16 sm:py-20">
          <div className="pl-0 sm:pl-8 lg:pl-16" data-testid="hero-content">
            <div 
              className="flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-700 mb-3" 
              data-testid="logo-header"
            >
              <img src={logoImage} alt="Doce Leveza" className="h-16 sm:h-20 lg:h-24 w-auto" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-white leading-snug animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 mb-4 sm:mb-5">
              Cuida da tua saúde com orientação nutricional profissional
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 mb-4 sm:mb-5">
              Vídeos, aulas, ebooks e programas especializados para Diabetes, Emagrecimento,
              Hipertensão e Gestantes — tudo num único lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-start animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <Button
                className="bg-accent hover:bg-accent/90 hover:scale-105 transition-all duration-300 text-accent-foreground font-semibold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-full uppercase whitespace-nowrap w-full sm:w-auto"
                onClick={() => setDialogOpen(true)}
                data-testid="button-cta-hero"
              >
                Assinar Acesso Anual
              </Button>
              
              <Button
                className="backdrop-blur-md bg-white/20 border-2 border-white text-white hover:bg-white/30 hover:scale-105 transition-all duration-300 font-semibold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-full uppercase whitespace-nowrap w-full sm:w-auto"
                onClick={() => setDialogOpen(true)}
                data-testid="button-members-hero"
              >
                Entrar na Área de Membros
              </Button>
            </div>
          </div>
        </div>

        {/* Infinite Ticker */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 py-1.5 overflow-hidden">
          <div className="flex animate-scroll whitespace-nowrap" style={{ width: "max-content" }}>
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 mx-6"
              >
                <img src={logoImage} alt="Doce Leveza" className="h-10 w-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Podemos Ajudarte Section */}
      <section
        className="py-20 bg-background"
        data-testid="section-help"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <h2 className="text-3xl lg:text-4xl font-heading text-foreground">
              Como podemos ajudarte?
            </h2>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => setDialogOpen(true)}
              data-testid="button-contact-consultant"
            >
              Fale agora com um consultor
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Aulas em Vídeo",
                subtitle: "Bloco 1",
                desc: "Conteúdos semanais sobre alimentação, hábitos saudáveis e prevenção.",
                image: videoImg,
              },
              {
                title: "Ebooks e Guias",
                subtitle: "Bloco 2",
                desc: "Materiais práticos para aplicares no dia a dia.",
                image: ebookImg,
              },
              {
                title: "Programas por Patologia",
                subtitle: "Bloco 3",
                desc: "Orientações específicas para Diabetes, Hipertensão, Emagrecimento e Gestantes.",
                image: programsImg,
              },
              {
                title: "Acompanhamento Profissional",
                subtitle: "Bloco 4",
                desc: "Conteúdos criados pela Dra. Angelina, com linguagem simples e prática.",
                image: professionalImg,
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: idx * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.03,
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                className="relative overflow-hidden rounded-md group aspect-[2/3]"
                data-testid={`help-card-${idx + 1}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"></div>
                <div className="relative h-full flex flex-col justify-end p-5 text-white">
                  <h3 className="text-lg font-normal mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/90 mb-4 line-clamp-2">
                    {item.desc}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-white border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/40 self-start"
                    data-testid={`button-learn-more-${idx + 1}`}
                    onClick={() => setDialogOpen(true)}
                  >
                    Saber mais
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Patologias Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Badge
                variant="outline"
                className="mb-4 text-xs uppercase tracking-wide border-border bg-muted text-white"
              >
                PATOLOGIA
              </Badge>
            </motion.div>
            <motion.h2 
              className="text-3xl lg:text-4xl font-heading text-foreground mb-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Conteúdos por Patologia
            </motion.h2>
            <motion.p 
              className="text-base text-muted-foreground"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Escolhe a categoria que corresponde às tuas necessidades.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Diabetes",
                desc: "Vídeos, planos e orientações para controlar a glicemia com segurança.",
                image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=450&fit=crop",
                icon: Activity,
              },
              {
                title: "Emagrecimento",
                desc: "Estratégias práticas para perder peso de forma saudável e sustentável.",
                image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop",
                icon: TrendingDown,
              },
              {
                title: "Hipertensão",
                desc: "Dicas e planos para equilibrar a pressão arterial com alimentação adequada.",
                image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=450&fit=crop",
                icon: HeartPulse,
              },
              {
                title: "Gestantes",
                desc: "Alimentação segura, prática e nutritiva para todas as fases da gestação.",
                image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&h=450&fit=crop",
                icon: Baby,
              },
            ].map((pathology, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: idx * 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                data-testid={`pathology-card-${idx + 1}`}
              >
                <Card className="overflow-hidden border-card-border bg-card h-full flex flex-col group">
                  <div className="relative aspect-video overflow-hidden">
                    <motion.img
                      src={pathology.image}
                      alt={pathology.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <motion.div 
                        className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center"
                        whileHover={{ 
                          scale: 1.15,
                          rotate: 5,
                          transition: { duration: 0.3 }
                        }}
                      >
                        <pathology.icon className="w-6 h-6 text-accent-foreground" />
                      </motion.div>
                    </div>
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <motion.h3 
                      className="font-heading font-bold text-lg text-card-foreground mb-2"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: idx * 0.15 + 0.3 }}
                    >
                      {pathology.title}
                    </motion.h3>
                    <motion.p 
                      className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: idx * 0.15 + 0.4 }}
                    >
                      {pathology.desc}
                    </motion.p>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => setDialogOpen(true)}
                        data-testid={`button-view-content-${idx + 1}`}
                      >
                        Ver Conteúdos
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold text-sm px-12 py-2.5 rounded-full uppercase"
                onClick={() => setDialogOpen(true)}
                data-testid="button-cta-pathologies"
              >
                Assina agora
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Assinatura Anual Section */}
      <section className="py-20 bg-gray-900 light">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 items-center max-w-7xl mx-auto">
            {/* Left Column - Title */}
            <motion.div 
              className="lg:col-span-1 space-y-4 text-center lg:text-left"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl lg:text-4xl font-heading font-normal text-white leading-tight">
                Quanto você precisará <span className="text-primary">Investir</span>
              </h2>
              <p className="text-base text-gray-300 leading-relaxed">
                Transforme sua saúde com conhecimento científico e construa uma vida mais saudável para o seu futuro!
              </p>
            </motion.div>

            {/* Center Column - Pricing Card */}
            <motion.div 
              className="lg:col-span-1 flex justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-white border-gray-200 shadow-2xl w-full max-w-xs aspect-[3/4] flex flex-col p-6 rounded-md mx-auto">
                <div className="text-center mb-4">
                  <Badge className="bg-gray-700 text-white border-gray-600 text-xs uppercase tracking-wide">
                    Assinatura Anual
                  </Badge>
                </div>

                <div className="text-center space-y-5 flex-1 flex flex-col justify-center">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500 line-through">
                      DE 547.000 Kwanzas
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">
                      Por 12x de
                    </div>
                    <div className="text-5xl font-heading font-bold text-primary">
                      29.560
                    </div>
                    <div className="text-sm text-gray-600 uppercase tracking-wide">
                      ou 297.000 Kwanzas à vista
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>ENCERRA EM:</span>
                    <span className="font-mono font-semibold">
                      {String(timeLeft.hours).padStart(2, "0")}:
                      {String(timeLeft.minutes).padStart(2, "0")}:
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-full uppercase whitespace-nowrap w-full mt-4"
                  onClick={() => setDialogOpen(true)}
                  data-testid="button-cta-subscription"
                >
                  Quero Começar Agora
                </Button>
              </Card>
            </motion.div>

            {/* Right Column - Benefits */}
            <motion.div 
              className="lg:col-span-1 space-y-4 text-center lg:text-left"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[
                { icon: GraduationCap, text: "21 aulas científicas", color: "text-lime-400" },
                { icon: Video, text: "3 mentorias ao vivo na zoom", color: "text-lime-400" },
                { icon: Award, text: "10 aulas bônus com nutricionistas", color: "text-lime-400" },
                { icon: Utensils, text: "Plano alimentar especializado", color: "text-lime-400" },
                { icon: Tag, text: "Cupons de descontos para compras", color: "text-lime-400" },
                { icon: RefreshCw, text: "1 ano de acesso com atualizações", color: "text-lime-400" },
                { icon: Clock, text: "+32 horas de conteúdo e materiais", color: "text-lime-400" },
              ].map((benefit, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center gap-3 justify-center lg:justify-start"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                  data-testid={`benefit-${idx + 1}`}
                >
                  <benefit.icon className={`w-5 h-5 ${benefit.color} flex-shrink-0`} />
                  <span className="text-white text-base font-normal">{benefit.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest Content Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              Últimos conteúdos <span className="text-accent">publicados</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Aprende no teu ritmo com materiais preparados para transformar a tua saúde.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            <Card className="overflow-hidden border-card-border bg-card hover-elevate" data-testid="content-card-1">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={videoImg}
                    alt="Vídeo sobre glicemia"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <Badge variant="outline" className="text-xs uppercase">
                    Vídeo
                  </Badge>
                  <h3 className="font-heading font-bold text-lg text-card-foreground">
                    Como reduzir a glicemia depois das refeições
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Descobre técnicas práticas e baseadas em ciência para controlar os níveis de açúcar no sangue.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-card-border bg-card hover-elevate" data-testid="content-card-2">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={programsImg}
                    alt="Aula sobre emagrecimento"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <Badge variant="outline" className="text-xs uppercase">
                    Aula
                  </Badge>
                  <h3 className="font-heading font-bold text-lg text-card-foreground">
                    Plano alimentar para emagrecimento sustentável
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Aprende a criar um plano alimentar equilibrado para resultados duradouros.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-card-border bg-card hover-elevate" data-testid="content-card-3">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={ebookImg}
                    alt="Ebook sobre pressão arterial"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <Badge variant="outline" className="text-xs uppercase">
                    Ebook
                  </Badge>
                  <h3 className="font-heading font-bold text-lg text-card-foreground">
                    Guia prático para controlar a pressão arterial
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Um guia completo com estratégias alimentares e lifestyle para manter a pressão saudável.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold text-base px-8 py-6 rounded-lg uppercase"
              onClick={() => setDialogOpen(true)}
              data-testid="button-view-all-content"
            >
              Ver todos os conteúdos
            </Button>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="mb-4 text-xs uppercase tracking-wide border-border bg-muted/30"
            >
              3 SEMANAS PARA TRANSFORMAR O SEU CORPO
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
              <span className="text-accent">Como funciona</span> o DOCE
              LEVEZA?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: PlayCircle,
                title: "21 aulas científicas",
                desc: "práticas e de fáceis entendimento para transformar a sua saúde.",
              },
              {
                icon: Users,
                title: "3 mentorias ao vivo",
                desc: "com a Dra. Angelina.",
              },
              {
                icon: Gift,
                title: "10 aulas bônus",
                desc: "com profissionais da especialização em nutrição.",
              },
              {
                icon: ShoppingCart,
                title: "Plano alimentar",
                desc: "com lista de compras + livro de receitas suculentas.",
              },
              {
                icon: Badge,
                title: "Cupons de desconto",
                desc: "para você economizar nas compras de alimentos e suplementos online.",
              },
              {
                icon: Calendar,
                title: "1 ano de acesso",
                desc: "para você rever as aulas quantas vezes quiser + atualizações durante todo o período.",
              },
              {
                icon: Shield,
                title: "7 dias de garantia",
                desc: "com 100% de reembolso e acesso imediato.",
              },
              {
                icon: Clock,
                title: "+ de 32 horas",
                desc: "de conteúdo e materiais de apoio para te auxiliar.",
              },
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="border-card-border bg-card hover-elevate p-6 text-center"
                data-testid={`feature-card-${idx + 1}`}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <h3 className="font-heading font-bold text-base text-card-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_1.8fr] gap-10 items-start">
            <div className="space-y-6">
              <Badge
                variant="outline"
                className="text-xs uppercase tracking-wide border-border bg-muted text-white"
              >
                DEPOIMENTOS
              </Badge>
              
              <h2 className="text-3xl lg:text-4xl font-heading text-foreground">
                Já são{" "}
                <span className="text-accent">milhares de pessoas</span> que
                mudaram de vida com o DOCE LEVEZA:
              </h2>

              <Button
                size="default"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold text-sm px-6 rounded-full uppercase w-fit"
                onClick={() => setDialogOpen(true)}
                data-testid="button-cta-testimonials"
              >
                Quero começar agora
              </Button>
            </div>

            <div>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {testimonials.map((testimonial, idx) => (
                    <CarouselItem key={idx} className="pl-4 basis-[240px] lg:basis-[260px]">
                      <Card
                        className="border-card-border bg-card hover-elevate max-h-[400px]"
                        data-testid={`testimonial-card-${idx + 1}`}
                      >
                        <CardContent className="p-5 flex flex-col items-center text-center gap-4">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          
                          <div className="flex gap-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-accent text-accent"
                              />
                            ))}
                          </div>

                          <h4 className="font-heading text-card-foreground text-sm">
                            {testimonial.name}
                          </h4>

                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-8">
                            {testimonial.text}
                          </p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center gap-2 mt-8">
                  <CarouselPrevious
                    className="static translate-y-0"
                    data-testid="button-carousel-prev-testimonials"
                  />
                  <CarouselNext
                    className="static translate-y-0"
                    data-testid="button-carousel-next-testimonials"
                  />
                </div>
              </Carousel>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
                Sobre a <span className="text-accent">Dra. Angelina</span>
              </h2>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  A Dra. Angelina é nutricionista especializada em acompanhamento nutricional por patologia.
                </p>

                <p>
                  A sua missão é oferecer orientação acessível, prática e segura, baseada em evidências
                  científicas e adaptada à realidade dos pacientes.
                </p>

                <p>
                  Através da Doce Leveza, ela concentra num único espaço conteúdos, aulas, ebooks e
                  programas que ajudam cada paciente a melhorar a saúde com confiança e autonomia.
                </p>
              </div>

              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold text-base px-8 py-6 rounded-lg uppercase"
                onClick={() => setDialogOpen(true)}
                data-testid="button-about-instructor"
              >
                Conhecer melhor
              </Button>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=600&fit=crop"
                alt="Dra. Angelina"
                className="w-full rounded-lg shadow-xl"
                data-testid="img-instructor"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Start Here Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              Começa a tua jornada <span className="text-accent">com leveza</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-card-border bg-card hover-elevate" data-testid="card-start-subscription">
              <CardContent className="p-8 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-heading font-bold text-xl text-foreground">
                    Assinar Acesso Anual
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Conteúdos exclusivos e acompanhamento contínuo.
                  </p>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold"
                  onClick={() => setDialogOpen(true)}
                  data-testid="button-subscribe"
                >
                  Assinar Agora
                </Button>
              </CardContent>
            </Card>

            <Card className="border-card-border bg-card hover-elevate" data-testid="card-start-pathology">
              <CardContent className="p-8 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileHeart className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-heading font-bold text-xl text-foreground">
                    Ver Conteúdos por Patologia
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Aprende exatamente o que precisas para o teu caso.
                  </p>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold"
                  onClick={() => setDialogOpen(true)}
                  data-testid="button-pathology-content"
                >
                  Explorar Conteúdos
                </Button>
              </CardContent>
            </Card>

            <Card className="border-card-border bg-card hover-elevate" data-testid="card-start-appointment">
              <CardContent className="p-8 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CalendarCheck className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-heading font-bold text-xl text-foreground">
                    Marcar Consulta
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Agenda atendimento direto com a Dra. Angelina.
                  </p>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold"
                  onClick={() => setDialogOpen(true)}
                  data-testid="button-book-appointment"
                >
                  Marcar Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground text-center mb-12">
            Ficou com alguma <span className="text-accent">dúvida?</span>
          </h2>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-4">
              <p className="text-muted-foreground mb-6">
                Confira as respostas das perguntas frequentes ou entre em
                contato conosco:
              </p>

              <Card className="border-card-border bg-card p-6 hover-elevate">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-foreground mb-1">
                      Atendimento via Whatsapp
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Fale diretamente com a minha equipe!
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-card-border bg-card p-6 hover-elevate">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-foreground mb-1">
                      Atendimento por E-mail
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Mensagem para suporte@doceleveza.com
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {[
                {
                  question: "O curso é um plano de assinatura?",
                  answer:
                    "Não, o DOCE LEVEZA não é um plano de assinatura mensal, então não ocorre a cobrança automática. Os alunos do 3 semanas para transformar o seu corpo tem acesso ao curso por 06 meses e a partir da compra. Caso seja de interesse do aluno, após esse prazo, é possível a opção de renovação do curso por mais 12 meses.",
                },
                {
                  question: "Qual o tempo de acesso ao curso?",
                  answer:
                    "Você terá acesso ao curso por 1 ano completo a partir da data de compra, podendo assistir as aulas quantas vezes quiser durante este período.",
                },
                {
                  question: "O curso é ao vivo?",
                  answer:
                    "O curso é gravado e você pode assistir no seu próprio ritmo. As mentorias ao vivo acontecem em datas específicas anunciadas com antecedência.",
                },
                {
                  question: "Como funciona o suporte?",
                  answer:
                    "Oferecemos suporte via WhatsApp e e-mail durante todo o período do curso. Nossa equipe está pronta para ajudar com suas dúvidas.",
                },
                {
                  question:
                    "Comprei o curso e recebi os dados de acesso. O que faço?",
                  answer:
                    "Após a compra, você receberá um e-mail com seus dados de login. Acesse a plataforma com essas credenciais e comece a estudar imediatamente.",
                },
                {
                  question: "Como faço para assistir as aulas?",
                  answer:
                    "Todas as aulas estão disponíveis na plataforma online. Basta fazer login e escolher o módulo que deseja estudar.",
                },
                {
                  question: "Quando os bônus são liberados?",
                  answer:
                    "Todos os bônus são liberados imediatamente após a confirmação do pagamento, junto com o acesso ao curso principal.",
                },
              ].map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx + 1}`}
                  className="border-card-border bg-card rounded-lg px-6"
                  data-testid={`accordion-faq-${idx + 1}`}
                >
                  <AccordionTrigger className="hover:no-underline py-4 text-left">
                    <span className="font-heading font-bold text-foreground">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-6 max-w-4xl mx-auto">
            <img src={logoImage} alt="Doce Leveza" className="h-20 w-auto" data-testid="img-footer-logo" />
            
            <p className="text-center text-muted-foreground">
              Doce Leveza — Nutrição com leveza, clareza e ciência.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
                data-testid="link-instagram"
              >
                <Instagram className="w-5 h-5" />
                <span className="text-sm">Instagram</span>
              </a>
              
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
                data-testid="link-whatsapp"
              >
                <Phone className="w-5 h-5" />
                <span className="text-sm">WhatsApp</span>
              </a>
              
              <a
                href="mailto:contato@doceleveza.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
                data-testid="link-email"
              >
                <Mail className="w-5 h-5" />
                <span className="text-sm">Email</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <a
                href="#"
                className="hover:text-accent transition-colors"
                data-testid="link-privacy"
              >
                Política de Privacidade
              </a>
              <span>|</span>
              <a
                href="#"
                className="hover:text-accent transition-colors"
                data-testid="link-terms"
              >
                Termos de Uso
              </a>
              <span>|</span>
              <a
                href="#"
                className="hover:text-accent transition-colors"
                data-testid="link-support"
              >
                Suporte
              </a>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} Doce Leveza. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      <LeadCaptureDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
