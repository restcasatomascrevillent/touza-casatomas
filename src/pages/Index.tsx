import { useIsMobile } from "@/hooks/use-mobile";
import IndexDesktop from "@/components/home/IndexDesktop";
import IndexMobile from "@/components/home/IndexMobile";

const Index = () => {
  const isMobile = useIsMobile();
  return isMobile ? <IndexMobile /> : <IndexDesktop />;
};

export default Index;
