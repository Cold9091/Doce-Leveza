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
} from "lucide-react";
import { useState, useEffect } from "react";
import { LeadCaptureDialog } from "@/components/lead-capture-dialog";

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
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://res.cloudinary.com/dl90hjhoj/image/upload/v1763407837/Image_fx_i4qias.jpg')`,
        }}
        data-testid="section-hero"
      >
        <div className="absolute top-8 left-8">
          <div className="flex items-center gap-2" data-testid="logo-header">
            <ButterflyIcon />
            <div className="text-foreground">
              <span className="font-heading font-bold text-xl">
                Metamorfose
              </span>{" "}
              <span className="font-heading font-bold text-xl italic text-accent">
                Vital
              </span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center py-20">
          <div className="space-y-4" data-testid="hero-content" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <h1 className="text-2xl lg:text-3xl font-semibold text-white leading-snug">
              Emagreça até{" "}
              <span className="text-accent">5 kg em apenas 3 semanas</span> com
              um método rápido, comprovado e consistente!
            </h1>

            <p className="text-sm lg:text-base text-gray-200 leading-relaxed">
              Um programa exclusivo de emagrecimento e desinflação, com
              acompanhamento online. Prepare-se para transformar sua saúde e
              alcançar resultados duradouros!
            </p>

            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm lg:text-base px-6 py-5 rounded-lg uppercase"
              onClick={() => setDialogOpen(true)}
              data-testid="button-cta-hero"
            >
              Quero começar agora
            </Button>
          </div>
        </div>

        {/* Infinite Ticker */}
        <div className="absolute bottom-0 left-0 right-0 bg-foreground/90 backdrop-blur-sm py-4 overflow-hidden">
          <div className="flex animate-scroll whitespace-nowrap" style={{ width: "max-content" }}>
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 mx-6 text-background"
              >
                <ButterflyIcon />
                <span className="font-heading font-bold text-sm tracking-wide">
                  Metamorfose
                </span>
                <span className="font-heading font-bold text-sm italic text-accent">
                  Vital
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para Quem É Section */}
      <section
        className="py-20 bg-card"
        data-testid="section-target-audience"
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=600&fit=crop"
                alt="Transformação 1"
                className="rounded-lg w-full h-80 object-cover"
                data-testid="img-transformation-1"
              />
              <img
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=600&fit=crop"
                alt="Transformação 2"
                className="rounded-lg w-full h-80 object-cover"
                data-testid="img-transformation-2"
              />
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop"
                alt="Transformação 3"
                className="rounded-lg w-full h-80 object-cover"
                data-testid="img-transformation-3"
              />
              <img
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=600&fit=crop"
                alt="Transformação 4"
                className="rounded-lg w-full h-80 object-cover"
                data-testid="img-transformation-4"
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-card-foreground">
                Para quem <span className="text-accent">é</span> o metamorfose
                Vital?
              </h2>

              <div className="space-y-4">
                {[
                  {
                    title: "Pessoas ocupadas",
                    desc: "Ideal para quem tem uma agenda cheia e busca um método eficaz de emagrecimento.",
                  },
                  {
                    title: "Quem busca resultados rápidos",
                    desc: "Projetado para quem deseja perder peso de forma consistente e acelerada.",
                  },
                  {
                    title: "Pessoas que querem uma vida saudável",
                    desc: "Indicado para quem busca uma abordagem saudável e sustentável.",
                  },
                  {
                    title: "Iniciantes e experientes",
                    desc: "Tanto para você que está começando sua jornada de emagrecimento quanto já se tentou outras abordagens.",
                  },
                  {
                    title: "Quem deseja apoio online",
                    desc: "Se você valoriza o acompanhamento e suporte virtual, encontrará grande benefício aqui.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3"
                    data-testid={`target-item-${idx + 1}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <ButterflyIcon />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-card-foreground">
                        {item.title}:{" "}
                        <span className="font-normal text-muted-foreground">
                          {item.desc}
                        </span>
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pilares Section */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=300&fit=crop"
            alt="Kale decoration"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="mb-4 text-xs uppercase tracking-wide border-border bg-muted/30"
            >
              OS PILARES
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
              Os <span className="text-accent">4 principais pilares</span> que
              irão transformar o seu corpo
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {[
              {
                title: "Plano Alimentar Personalizado",
                desc: "Um plano alimentar balanceado é essencial. Consulte um nutricionista para criar um cardápio adequado às suas necessidades, com foco na redução de calorias e escolhas saudáveis.",
                image:
                  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop",
              },
              {
                title: "Exercícios Físicos Regularmente",
                desc: "Combine atividades aeróbicas (como caminhada, corrida ou ciclismo) com treinamento de força (musculação). Isso ajuda a queimar calorias e manter a massa muscular.",
                image:
                  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop",
              },
              {
                title: "Descanso e Sono",
                desc: "O descanso adequado é crucial para o emagrecimento. Durma bem para permitir a recuperação do corpo.",
                image:
                  "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop",
              },
              {
                title: "Mudança de Mentalidade",
                desc: "Cultive uma mentalidade positiva e focada. Acredite que é possível alcançar seus objetivos e mantenha-se motivado.",
                image:
                  "https://images.unsplash.com/photo-1599447292023-0598f79d8a4a?w=400&h=300&fit=crop",
              },
            ].map((pillar, idx) => (
              <Card
                key={idx}
                className="overflow-hidden border-card-border bg-card hover-elevate"
                data-testid={`pillar-card-${idx + 1}`}
              >
                <div className="flex gap-4 p-6">
                  <img
                    src={pillar.image}
                    alt={pillar.title}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg text-card-foreground mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold text-base px-8 py-6 rounded-lg uppercase"
              onClick={() => setDialogOpen(true)}
              data-testid="button-cta-pillars"
            >
              Quero começar agora
            </Button>
          </div>
        </div>
      </section>

      {/* Módulos Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="mb-4 text-xs uppercase tracking-wide border-border bg-muted"
            >
              MÓDULOS
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
              <span className="text-foreground">
                6 módulos completos e direto ao ponto para te auxiliar a
              </span>{" "}
              <span className="text-primary">alcançar os seu objetivos</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Accordion type="single" collapsible className="space-y-3">
              {[
                { title: "MÓDULO 01", subtitle: "Introdução" },
                { title: "MÓDULO 02", subtitle: "Metamorfose Vital" },
                {
                  title: "MÓDULO 03",
                  subtitle: "Plano alimentar personalizado",
                },
                { title: "MÓDULO 04", subtitle: "Exercícios físicos" },
                { title: "MÓDULO 05", subtitle: "Descanso e sono" },
                { title: "MÓDULO 06", subtitle: "Mudança de mentalidade" },
              ].map((module, idx) => (
                <AccordionItem
                  key={idx}
                  value={`module-${idx + 1}`}
                  className="border-border bg-muted/50 rounded-lg px-6"
                  data-testid={`accordion-module-${idx + 1}`}
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <span className="font-heading font-bold text-sm text-muted-foreground">
                        {module.title}
                      </span>
                      <span className="text-sm text-foreground">
                        {module.subtitle}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    Conteúdo detalhado sobre {module.subtitle.toLowerCase()}{" "}
                    será apresentado neste módulo do curso.
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop"
                alt="Mockup do curso"
                className="w-full rounded-lg shadow-xl"
                data-testid="img-course-mockup"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bonus Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="mb-4 text-xs uppercase tracking-wide border-border bg-muted/30"
            >
              BÔNUS
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
              <span className="text-primary">+10 aulas bônus</span> especiais
              com profissionais da nutrição
            </h2>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {professionalsList.map((prof, idx) => (
                <CarouselItem
                  key={idx}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <Card
                    className="overflow-hidden border-card-border bg-card hover-elevate"
                    data-testid={`professional-card-${idx + 1}`}
                  >
                    <img
                      src={prof.image}
                      alt={prof.name}
                      className="w-full h-64 object-cover"
                    />
                    <CardContent className="p-6 space-y-2">
                      <h3 className="font-heading font-bold text-lg text-card-foreground">
                        {prof.name}
                      </h3>
                      <p className="text-sm font-medium text-primary">
                        {prof.role}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {prof.description}
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-8">
              <CarouselPrevious
                className="static translate-y-0"
                data-testid="button-carousel-prev-bonus"
              />
              <CarouselNext
                className="static translate-y-0"
                data-testid="button-carousel-next-bonus"
              />
            </div>
          </Carousel>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold text-base px-8 py-6 rounded-lg uppercase"
              onClick={() => setDialogOpen(true)}
              data-testid="button-cta-bonus"
            >
              Quero começar agora
            </Button>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute top-10 right-10 w-48 h-48 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=200&h=200&fit=crop"
            alt="Orange decoration"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="mb-4 text-xs uppercase tracking-wide border-border bg-muted/30"
            >
              3 SEMANAS PARA TRANSFORMAR O SEU CORPO
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
              <span className="text-accent">Como funciona</span> o metamorfose
              Vital?
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
                desc: "com Dr. Priscila Canto.",
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
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute bottom-10 left-10 w-32 h-32 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=200&h=200&fit=crop"
            alt="Orange decoration"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="mb-4 text-xs uppercase tracking-wide border-border bg-muted/30"
            >
              DEPOIMENTOS
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
              Já são{" "}
              <span className="text-accent">milhares de pessoas</span> que
              mudaram de vida com o Metamorfose Vital:
            </h2>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, idx) => (
                <CarouselItem key={idx} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card
                    className="border-card-border bg-card p-6 h-full"
                    data-testid={`testimonial-card-${idx + 1}`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-heading font-bold text-card-foreground">
                          {testimonial.name}
                        </h4>
                        <div className="flex gap-1 mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-accent text-accent"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {testimonial.text}
                    </p>
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

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold text-base px-8 py-6 rounded-lg uppercase"
              onClick={() => setDialogOpen(true)}
              data-testid="button-cta-testimonials"
            >
              Quero começar agora
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="space-y-6 text-center lg:text-left">
              <div className="flex items-center gap-2 mb-4">
                <ButterflyIcon />
                <div className="text-foreground">
                  <span className="font-heading font-bold text-lg">
                    Metamorfose
                  </span>{" "}
                  <span className="font-heading font-bold text-lg italic text-accent">
                    Vital
                  </span>
                </div>
              </div>

              <h2 className="text-3xl font-heading font-bold text-foreground">
                Quanto você precisará investir
              </h2>

              <p className="text-muted-foreground">
                Torne-se um Editor de Vídeos de auto nível e construa uma
                carreira sólida para o seu futuro!
              </p>

              <Card className="bg-card border-card-border p-8 max-w-md mx-auto lg:mx-0">
                <div className="text-center mb-6">
                  <Badge className="mb-4 bg-muted text-foreground">
                    ASSINATURA ANUAL
                  </Badge>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground line-through">
                      DE R$547,00
                    </div>
                    <div className="text-5xl font-heading font-bold text-primary">
                      R$29,56
                    </div>
                    <div className="text-sm text-muted-foreground">
                      POR 12X DE
                    </div>
                    <div className="text-lg text-muted-foreground">
                      OU R$297,00 À VISTA
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-primary mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm font-bold">ENCERRA EM:</span>
                    </div>
                    <div className="flex justify-center gap-2 text-2xl font-heading font-bold text-primary">
                      <span>
                        {String(timeLeft.hours).padStart(2, "0")}
                      </span>
                      :
                      <span>
                        {String(timeLeft.minutes).padStart(2, "0")}
                      </span>
                      :
                      <span>
                        {String(timeLeft.seconds).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold text-base py-6 rounded-lg uppercase mb-4"
                  onClick={() => setDialogOpen(true)}
                  data-testid="button-cta-pricing"
                >
                  Quero começar agora
                </Button>

                <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                  <span>💳 VISA</span>
                  <span>ELO</span>
                  <span>💳</span>
                  <span>MASTERCARD</span>
                </div>

                <div className="mt-6 text-center">
                  <Badge className="bg-accent/10 text-accent-foreground border-accent/20">
                    7 dias de garantia
                  </Badge>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: PlayCircle,
                  text: "21 aulas científicas",
                },
                {
                  icon: Users,
                  text: "3 mentorias ao vivo no zoom",
                },
                {
                  icon: Gift,
                  text: "10 aulas bônus com nutricionistas",
                },
                {
                  icon: ShoppingCart,
                  text: "Plano alimentar especializado",
                },
                {
                  icon: Badge,
                  text: "Cupons de descontos para compras",
                },
                {
                  icon: Calendar,
                  text: "1 ano de acesso com atualizações",
                },
                {
                  icon: Clock,
                  text: "+ 32 horas de conteúdo e materiais",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3"
                  data-testid={`pricing-benefit-${idx + 1}`}
                >
                  <div className="flex-shrink-0">
                    <item.icon className="w-6 h-6 text-accent" />
                  </div>
                  <span className="text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=300&fit=crop"
            alt="Kale decoration"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <ButterflyIcon />
                <div className="text-foreground">
                  <span className="font-heading font-bold text-lg">
                    Metamorfose
                  </span>{" "}
                  <span className="font-heading font-bold text-lg italic text-accent">
                    Vital
                  </span>
                </div>
              </div>

              <Badge
                variant="outline"
                className="border-border bg-muted/30 text-xs uppercase"
              >
                RISCO ZERO!
              </Badge>

              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
                Você tem <span className="text-accent">7 dias para testar</span>
              </h2>

              <div className="space-y-4">
                <h3 className="text-xl font-heading font-bold text-foreground">
                  Garantia Incondicional
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Você tem, por lei, o direito de testar o produto durante 7
                  dias. Se dentro desse período você achar que o curso não é
                  pra você, basta enviar um e-mail para
                  Suporte@metamorfosevital.com para solicitar o reembolso.
                </p>
              </div>

              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold text-base px-8 py-6 rounded-lg uppercase"
                onClick={() => setDialogOpen(true)}
                data-testid="button-cta-guarantee"
              >
                Testar por 7 dias
              </Button>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>💳</span>
                <span>VISA</span>
                <span>ELO</span>
                <span>MASTERCARD</span>
                <span>🔒 HOTMART</span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 rounded-full bg-card border-8 border-accent/20 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                      <ButterflyIcon />
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wider">
                      TESTE 7 DIAS • RISCO ZERO
                    </div>
                    <div className="text-2xl font-heading font-bold text-accent">
                      100%
                    </div>
                    <div className="text-sm text-foreground">
                      DINHEIRO DE VOLTA
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=300&fit=crop"
            alt="Kale decoration"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
                Quem vai te guiar nessa Jornada?
              </h2>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <span className="font-bold text-foreground">
                    Dra. Priscila Canto
                  </span>{" "}
                  é uma profissional destacada na área de Nutrição interativa,
                  especializada em Gastroenterologia e emagrecimento. Com uma
                  vasta experiência que inclui o atendimento de mais de{" "}
                  <span className="font-bold text-foreground">
                    6 mil pacientes
                  </span>{" "}
                  em consultórios situados em São Paulo, Rio de Janeiro e em
                  mais de{" "}
                  <span className="font-bold text-foreground">
                    7 países através
                  </span>{" "}
                  de consultas online, Priscila se destaca pela sua abordagem
                  holística e focada na saúde intestinal e equilíbrio hormonal.
                </p>

                <p>
                  Ela é uma firme defensora da{" "}
                  <span className="font-bold text-foreground">
                    alimentação natural
                  </span>
                  , incentivando seus pacientes a optarem por alimentos não
                  processados e livres de aditivos prejudiciais à saúde. Sob a
                  filosofia "desembrutune menos, desloque mais", Priscila
                  orienta diariamente seus pacientes e participantes de seus
                  cursos sobre a importância de combinar uma alimentação
                  saudável com exercícios físicos, sono adequado e gestão do
                  estresse para alcançar uma vida plena e feliz.
                </p>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=600&fit=crop"
                alt="Dra. Priscila Canto"
                className="w-full rounded-lg shadow-xl"
                data-testid="img-instructor"
              />
            </div>
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
                      Mensagem para suporte@metamorfosevital.com
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
                    "Não, o Metamorfose Vital não é um plano de assinatura mensal, então não ocorre a cobrança automática. Os alunos do 3 semanas para transformar o seu corpo tem acesso ao curso por 06 meses e a partir da compra. Caso seja de interesse do aluno, após esse prazo, é possível a opção de renovação do curso por mais 12 meses.",
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
      <footer className="py-8 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2">
            <ButterflyIcon />
            <div className="text-card-foreground text-center">
              <span className="font-heading font-bold">Metamorfose</span>{" "}
              <span className="font-heading font-bold italic text-accent">
                Vital
              </span>
              <p className="text-sm text-muted-foreground mt-2">
                Dra. Priscila Canto
              </p>
            </div>
          </div>
        </div>
      </footer>

      <LeadCaptureDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
