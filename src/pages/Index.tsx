import { Link } from "react-router-dom";
import { ArrowRight, Wine, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

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

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1920&h=1080&fit=crop"
            alt="Bar ambiente"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 container-custom text-center px-4">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block text-primary text-sm md:text-base tracking-[0.3em] uppercase mb-6 animate-fade-up">
              Cocktail Bar
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 animate-fade-up animation-delay-100 text-shadow">
              TOUZA
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-foreground/90 font-light leading-relaxed mb-8 animate-fade-up animation-delay-200 text-shadow max-w-2xl mx-auto">
              Momentos de ensueño con los mejores cócteles
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animation-delay-300">
              <Button
                asChild
                size="lg"
                className="btn-elegant bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6"
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
                className="border-foreground/30 text-foreground hover:bg-foreground/10 text-lg px-8 py-6"
              >
                <Link to="/reservado">El Reservado</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-primary rounded-full" />
          </div>
        </div>
      </section>

      {/* ¿Qué es Touza? */}
      <section className="section-padding bg-charcoal">
        <div className="container-custom">
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
                <div className="text-center sm:text-left">
                  <Wine className="w-8 h-8 text-primary mb-3 mx-auto sm:mx-0" />
                  <h4 className="font-semibold text-foreground mb-1">Cócteles Artesanales</h4>
                  <p className="text-sm text-muted-foreground">Creaciones únicas</p>
                </div>
                <div className="text-center sm:text-left">
                  <Sparkles className="w-8 h-8 text-primary mb-3 mx-auto sm:mx-0" />
                  <h4 className="font-semibold text-foreground mb-1">Ambiente Único</h4>
                  <p className="text-sm text-muted-foreground">Diseño exclusivo</p>
                </div>
                <div className="text-center sm:text-left">
                  <Users className="w-8 h-8 text-primary mb-3 mx-auto sm:mx-0" />
                  <h4 className="font-semibold text-foreground mb-1">El Reservado</h4>
                  <p className="text-sm text-muted-foreground">Eventos privados</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="aspect-[4/5] rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&h=750&fit=crop"
                  alt="Interior Touza"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-2 border-primary/30 rounded-lg -z-10" />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-lg -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Cócteles Destacados */}
      <section className="section-padding">
        <div className="container-custom">
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
                className="group relative overflow-hidden rounded-lg bg-card border border-border/50 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={cocktail.image}
                    alt={cocktail.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {cocktail.name}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {cocktail.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=1920&h=600&fit=crop"
            alt="Ambiente bar"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/85" />
        </div>
        <div className="relative z-10 container-custom text-center">
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
            className="btn-elegant bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-6"
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
