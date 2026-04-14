import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { CategorySection } from "@/components/CategorySection";
import { FeaturedEvents } from "@/components/FeaturedEvents";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />

        <FeaturedEvents
          title="Öne Çıkan Etkinlikler"
          subtitle="Kaçırmamanız gereken fırsatlar"
          filter={(e) => e.isFeatured}
        />

        <CategorySection />

        <FeaturedEvents
          title="Yeni Eklenen Fırsatlar"
          subtitle="En son eklenen etkinlik ve programlar"
          limit={4}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
