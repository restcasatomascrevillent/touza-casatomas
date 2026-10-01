import { motion } from "framer-motion";
import { Star, MapPin, Clock } from "lucide-react";

const features = [
  { icon: Star, title: "Coctelería de Autor", description: "Creaciones únicas que desafían lo convencional." },
  { icon: MapPin, title: "Ubicación Privilegiada", description: "En el corazón de Crevillente, un oasis urbano." },
  { icon: Clock, title: "Ambiente Nocturno", description: "El lugar perfecto para acabar tus noches." },
];

const FeaturesMobile = () => {
  return (
    <section className="py-10 px-5 bg-black text-white">
      <div className="space-y-0">
        {features.map((feature, index) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            key={index}
            className="flex items-start gap-4 py-4 border-b border-white/5 last:border-0"
          >
            <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
              <feature.icon className="w-[18px] h-[18px] text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-serif text-base text-white mb-0.5">{feature.title}</h3>
              <p className="text-white/65 text-sm font-light leading-relaxed">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesMobile;
