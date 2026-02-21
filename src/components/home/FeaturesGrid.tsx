import { motion, useSpring, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { AnimatedMartiniSVG, AnimatedStarSVG, AnimatedKeySVG } from "@/components/ui/svg/AnimatedIcons";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const stats = [
  { value: 200, suffix: "+", label: "Cócteles Creados", icon: AnimatedMartiniSVG },
  { value: 5, suffix: " Años", label: "De Experiencia", icon: AnimatedStarSVG },
  { value: 1, suffix: "", label: "Reservado Privado Único", icon: AnimatedKeySVG },
];

const AnimatedNumber = ({ value, suffix }: { value: number; suffix: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const spring = useSpring(0, { duration: 2000, bounce: 0 });

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, spring, value]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest) + suffix;
      }
    });
    return unsubscribe;
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
};

const FeaturesGrid = () => {
  return (
    <section className="py-32 bg-black text-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: index * 0.15, ease: appleEase }}
                key={index}
                className="text-center group"
              >
                <div className="flex justify-center mb-8">
                  <Icon className="w-16 h-16 transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="font-serif text-6xl lg:text-7xl text-white mb-4 tabular-nums">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-white/40 text-sm tracking-[0.2em] uppercase font-light">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
