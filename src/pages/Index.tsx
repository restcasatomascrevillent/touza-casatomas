import { Link } from "react-router-dom";
import { ArrowRight, Wine, Sparkles, Users, ChevronDown } from "lucide-react";
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
        {/* Background Image with Parallax */}
        <div className="absolute inset-0">
          <img
            src="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-2-scaled.webp"
            alt="Bar ambiente"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 container-custom text-center px-4">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block text-primary text-sm md:text-base tracking-[0.3em] uppercase mb-6 opacity-0 animate-fade-up">
              Cocktail Bar
            </span>
            <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-foreground mb-6 opacity-0 animate-fade-up animation-delay-100 text-shadow-lg">
              TOUZA
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-foreground/90 font-light leading-relaxed mb-10 opacity-0 animate-fade-up animation-delay-200 text-shadow max-w-2xl mx-auto">
              Momentos de ensueño con los mejores cócteles
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-up animation-delay-300">
              <Button
                asChild
                size="lg"
                className="btn-elegant bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 group"
              >
                <Link to="/carta">
                  Descubre nuestra carta
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-foreground/30 text-foreground hover:bg-foreground/10 hover:border-primary text-lg px-8 py-6 transition-all duration-300"
              >
                <Link to="/reservado">El Reservado</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator with pulse */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in animation-delay-500">
          <div className="flex flex-col items-center gap-2 animate-bounce-subtle">
            <span className="text-xs text-muted-foreground tracking-widest uppercase">Scroll</span>
            <div className="w-8 h-12 border-2 border-primary/40 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Decorative floating elements */}
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-primary/30 rounded-full animate-float" style={{ animationDelay: "0s" }} />
        <div className="absolute top-1/3 right-20 w-3 h-3 bg-primary/20 rounded-full animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-primary/25 rounded-full animate-float" style={{ animationDelay: "2s" }} />
      </section>

      {/* ¿Qué es Touza? */}
      <section className="section-padding bg-charcoal overflow-hidden">
        <div 
          ref={aboutSection.ref}
          className={cn(
            "container-custom transition-all duration-1000",
            aboutSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block">
                Nuestra esencia
              </span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                ¿Qué es Touza?
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Touza es un refugio donde las raíces gallegas se entrelazan con el 
                encanto mediterráneo. Un espacio íntimo diseñado para los amantes 
                de los buenos cócteles y las conversaciones memorables.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Cada copa que servimos cuenta una historia, cada ingrediente es 
                seleccionado con mimo, y cada momento está pensado para 
                transportarte a un estado de puro disfrute.
              </p>
              <div className="grid sm:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "text-center sm:text-left group transition-all duration-500",
                      aboutSection.isVisible && "animate-fade-up"
                    )}
                    style={{ animationDelay: `${400 + index * 100}ms` }}
                  >
                    <div className="relative">
                      <feature.icon className="w-8 h-8 text-primary mb-3 mx-auto sm:mx-0 transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 relative group">
              <div className="aspect-[4/5] rounded-lg overflow-hidden">
                <img
                  src="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-5-scaled.webp"
                  alt="Interior Touza"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              {/* Decorative elements with animation */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-2 border-primary/30 rounded-lg -z-10 transition-all duration-500 group-hover:border-primary/50 group-hover:-translate-x-1 group-hover:translate-y-1" />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-lg -z-10 transition-all duration-500 group-hover:bg-primary/20 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Cócteles Destacados */}
      <section className="section-padding overflow-hidden">
        <div 
          ref={cocktailsSection.ref}
          className={cn(
            "container-custom transition-all duration-1000",
            cocktailsSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <div className="text-center mb-16">
            <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block">
              Nuestra selección
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Cócteles Destacados
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Descubre algunas de nuestras creaciones más emblemáticas, 
              elaboradas con pasión y los mejores ingredientes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCocktails.map((cocktail, index) => (
              <div
                key={cocktail.id}
                className={cn(
                  "group relative overflow-hidden rounded-lg bg-card border border-border/50",
                  "transition-all duration-500 hover:border-primary/50",
                  "card-hover-lift card-premium",
                  cocktailsSection.isVisible && "animate-stagger-fade-up"
                )}
                style={{ 
                  animationDelay: `${200 + index * 100}ms`,
                  opacity: cocktailsSection.isVisible ? undefined : 0,
                }}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={cocktail.image}
                    alt={cocktail.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-500 group-hover:translate-y-[-4px]">
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {cocktail.name}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 transition-colors duration-300 group-hover:text-foreground/80">
                    {cocktail.description}
                  </p>
                </div>
                {/* Hover shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground group transition-all duration-300"
            >
              <Link to="/carta">
                Ver carta completa
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-10.webp"
            alt="Ambiente bar"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/85" />
        </div>
        <div 
          ref={ctaSection.ref}
          className={cn(
            "relative z-10 container-custom text-center transition-all duration-1000",
            ctaSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            ¿Buscas un espacio único?
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Descubre El Reservado, nuestro espacio privado perfecto para 
            celebraciones íntimas y eventos exclusivos.
          </p>
          <Button
            asChild
            size="lg"
            className="btn-elegant bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-6 group animate-pulse-glow"
          >
            <Link to="/reservado">
              Conoce El Reservado
              <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
