import { Link } from "react-router-dom";
import { ArrowRight, Wine, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { cn } from "@/lib/utils";

// Datos de ejemplo para cócteles destacados
const featuredCocktails = [
  {
    id: 1,
    name: "Touza Signature",
    description: "Nuestra creación estrella con ginebra premium, cítricos mediterráneos y un toque de romero.",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=500&fit=crop",
  },
  {
    id: 2,
    name: "Mediterranean Sunset",
    description: "Una explosión de sabores con ron añejo, maracuyá fresca y especias exóticas.",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=500&fit=crop",
  },
  {
    id: 3,
    name: "Galician Mist",
    description: "Homenaje a Galicia con orujo, miel de brezo y esencia de eucalipto.",
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&h=500&fit=crop",
  },
];

const features = [
  {
    icon: Wine,
    title: "Cócteles Artesanales",
    description: "Creaciones únicas",
  },
  {
    icon: Sparkles,
    title: "Ambiente Único",
    description: "Diseño exclusivo",
  },
  {
    icon: Users,
    title: "El Reservado",
    description: "Eventos privados",
  },
];

const Index = () => {
  const aboutSection = useAnimateOnScroll<HTMLDivElement>();
  const cocktailsSection = useAnimateOnScroll<HTMLDivElement>();
  const ctaSection = useAnimateOnScroll<HTMLDivElement>();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-2-scaled.webp"
            alt="Bar ambiente"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 container-custom text-center px-4 pt-20">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block text-primary text-sm tracking-[0.3em] uppercase mb-6 opacity-0 animate-fade-up">
              Cocktail Bar
            </span>
            <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-foreground mb-6 opacity-0 animate-fade-up animation-delay-100 text-shadow-lg tracking-tight">
              TOUZA
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-foreground/90 font-light leading-relaxed mb-10 opacity-0 animate-fade-up animation-delay-200 text-shadow max-w-xl mx-auto">
              Momentos de ensueño con los mejores cócteles
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-up animation-delay-300">
              <Button
                asChild
                size="lg"
                className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-medium"
              >
                <Link to="/carta">
                  Descubre nuestra carta
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 border-foreground/30 text-foreground hover:bg-foreground/10 hover:border-foreground/50 text-base font-medium"
              >
                <Link to="/reservado">El Reservado</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator - simplified */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in animation-delay-500">
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs text-muted-foreground tracking-widest uppercase">Scroll</span>
            <div className="w-6 h-10 border border-primary/40 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-primary/60 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ¿Qué es Touza? */}
      <section className="section-padding bg-charcoal">
        <div 
          ref={aboutSection.ref}
          className={cn(
            "container-custom transition-all duration-700 ease-out",
            aboutSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block">
                Nuestra esencia
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                ¿Qué es Touza?
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
                Touza es un refugio donde las raíces gallegas se entrelazan con el 
                encanto mediterráneo. Un espacio íntimo diseñado para los amantes 
                de los buenos cócteles y las conversaciones memorables.
              </p>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
                Cada copa que servimos cuenta una historia, cada ingrediente es 
                seleccionado con mimo, y cada momento está pensado para 
                transportarte a un estado de puro disfrute.
              </p>
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="text-center group"
                  >
                    <feature.icon className="w-7 h-7 md:w-8 md:h-8 text-primary mb-3 mx-auto" />
                    <h4 className="font-medium text-foreground text-sm md:text-base mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="aspect-[4/5] rounded-lg overflow-hidden">
                <img
                  src="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-5-scaled.webp"
                  alt="Interior Touza"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Decorative border */}
              <div className="absolute -bottom-4 -left-4 w-full h-full border border-primary/20 rounded-lg -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Cócteles Destacados */}
      <section className="section-padding">
        <div 
          ref={cocktailsSection.ref}
          className={cn(
            "container-custom transition-all duration-700 ease-out",
            cocktailsSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="text-center mb-12 md:mb-16">
            <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block">
              Nuestra selección
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Cócteles Destacados
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Descubre algunas de nuestras creaciones más emblemáticas, 
              elaboradas con pasión y los mejores ingredientes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredCocktails.map((cocktail) => (
              <div
                key={cocktail.id}
                className="group card-premium card-hover-lift"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-t-lg">
                  <img
                    src={cocktail.image}
                    alt={cocktail.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                    {cocktail.name}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {cocktail.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 md:mt-12">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Link to="/carta">
                Ver carta completa
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-10.webp"
            alt="Ambiente bar"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-background/80" />
        </div>
        <div 
          ref={ctaSection.ref}
          className={cn(
            "relative z-10 container-custom text-center transition-all duration-700 ease-out",
            ctaSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            ¿Buscas un espacio único?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-8">
            Descubre El Reservado, nuestro espacio privado perfecto para 
            celebraciones íntimas y eventos exclusivos.
          </p>
          <Button
            asChild
            size="lg"
            className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-medium"
          >
            <Link to="/reservado">
              Conoce El Reservado
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
