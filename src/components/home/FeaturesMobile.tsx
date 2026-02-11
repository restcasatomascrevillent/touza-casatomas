import { motion } from "framer-motion";
import { Star, MapPin, Clock } from "lucide-react";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const features = [
  { icon: Star, title: "Coctelería de Autor", description: "Creaciones únicas que desafían lo convencional." },
  { icon: MapPin, title: "Ubicación Privilegiada", description: "En el corazón de Crevillente, un oasis urbano." },
  { icon: Clock, title: "Ambiente Nocturno", description: "El lugar perfecto para acabar tus noches." },
];

const FeaturesMobile = () => {
  return (
    <section className="py-16 px-6 bg-black text-white">
      <div className="space-y-0">
        {features.map((feature, index) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: appleEase }}
            key={index}
            className="flex items-start gap-5 py-6 border-b border-white/5 last:border-0"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
              <feature.icon className="w-5 h-5 text-white/50" />
            </div>
            <div>
              <h4 className="font-serif text-lg text-white mb-1">{feature.title}</h4>
              <p className="text-white/40 text-sm font-light leading-relaxed">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesMobile;
