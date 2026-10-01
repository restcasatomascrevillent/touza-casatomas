import Header from "./Header";
import Footer from "./Footer";
import CustomCursor from "@/components/CustomCursor";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    // overflow-x-CLIP, no hidden: `overflow-x: hidden` convierte este div en
    // contenedor de scroll y los `position: sticky` de dentro (pestañas de la
    // carta, filtros de la galería) dejaban de pegarse arriba al hacer scroll.
    // `hidden` queda solo como respaldo para navegadores sin `clip` (Safari < 16).
    <div className="min-h-screen flex flex-col overflow-x-hidden overflow-x-clip">
      <CustomCursor />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
