import { motion } from "framer-motion";
import { Star, MapPin, Clock } from "lucide-react";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const features = [
  { icon: Star, title: "Coctelería de Autor", description: "Creaciones únicas que desafían lo convencional." },
  { icon: MapPin, title: "Ubicación Privilegiada", description: "En el corazón de Crevillente, un oasis urbano." },
  { icon: Clock, title: "Ambiente Nocturno", description: "El lugar perfecto para acabar tus noches." },
];

const FeaturesGrid = () => {
  return (
    <section className="py-32 bg-black text-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-16">
          {features.map((feature, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: index * 0.15, ease: appleEase }}
              key={index}
              className="text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-500">
                <feature.icon className="w-6 h-6 text-white/60 group-hover:text-white transition-colors duration-500" />
              </div>
              <h4 className="font-serif text-2xl text-white mb-3">{feature.title}</h4>
              <p className="text-white/40 leading-relaxed font-light">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
