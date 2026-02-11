import { MapPin, Clock, Phone, Mail, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollTextReveal from "@/components/ScrollTextReveal";

const VisitUs = () => {
    return (
        <section className="py-16 md:py-24 bg-black text-white relative overflow-hidden">
            {/* Background ambience */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-spin-slow" />
            </div>

            <div className="container-custom relative z-10">
                <div className="text-center mb-16">
                    <span className="text-primary text-xs tracking-[0.3em] uppercase mb-4 block font-semibold">
                        Contacto
                    </span>
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6">
                        Visítanos
                    </h2>
                    <div className="flex justify-center">
                        <ScrollTextReveal className="text-white/60 text-lg max-w-xl mx-auto font-light justify-center">
                            Descubre el lugar donde la magia sucede. Te esperamos en el corazón de Crevillente.
                        </ScrollTextReveal>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-12 text-center relative">
                    {/* Vertical Separators (Desktop) */}
                    <div className="hidden md:block absolute top-10 bottom-10 left-1/3 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                    <div className="hidden md:block absolute top-10 bottom-10 right-1/3 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center max-w-4xl mx-auto">
                        <div className="flex flex-col items-center group">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                                <MapPin className="w-6 h-6 text-primary" />
                            </div>
                            <h4 className="text-lg font-medium mb-3 font-playfair">Ubicación</h4>
                            <p className="text-white/80 leading-relaxed">
                                Calle de la Gratitud, 12<br />
                                28000 Madrid, España
                            </p>
                            <Button variant="link" className="text-primary mt-2 h-12">Ver en mapa</Button>
                        </div>

                        <div className="flex flex-col items-center group">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                                <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <h4 className="text-lg font-medium mb-3 font-playfair">Horario</h4>
                            <p className="text-white/80 leading-relaxed">
                                Mar - Dom: 13:00 - 16:00<br />
                                Jue - Sáb: 20:00 - 00:00
                            </p>
                            <p className="text-sm text-white/50 mt-2">Lunes cerrado</p>
                        </div>

                        <div className="flex flex-col items-center group">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                                <Phone className="w-6 h-6 text-primary" />
                            </div>
                            <h4 className="text-lg font-medium mb-3 font-playfair">Contacto</h4>
                            <p className="text-white/80 leading-relaxed mb-4">
                                +34 912 345 678<br />
                                info@touza.com
                            </p>
                            <div className="flex gap-4">
                                <a href="mailto:info@touza.com" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-primary hover:text-black transition-colors duration-300 cursor-pointer" aria-label="Email">
                                    <Mail className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-primary hover:text-black transition-colors duration-300 cursor-pointer" aria-label="Instagram">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VisitUs;
