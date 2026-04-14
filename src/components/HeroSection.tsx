import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/etkinlikler?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/etkinlikler");
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20" style={{ background: "var(--gradient-glow)" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(48,100%,50%,0.06),transparent_60%)]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(0,0%,50%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,50%) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Türkiye'nin Startup Ekosistemi
          </motion.div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Startup Fırsatlarını</span>
            <br />
            <span className="text-gradient">Keşfet</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Etkinlikler, yatırımcılar, hızlandırıcılar ve yarışmalar — Türkiye'deki tüm girişimcilik fırsatları tek bir platformda.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur" />
              <div className="relative flex items-center bg-card border border-border rounded-xl overflow-hidden">
                <Search className="w-5 h-5 text-muted-foreground ml-4" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Etkinlik, şehir veya kategori ara..."
                  className="flex-1 bg-transparent px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                />
                <Button
                  type="submit"
                  className="m-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  Keşfet
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </form>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="text-center">
              <span className="block text-2xl font-display font-bold text-foreground">200+</span>
              Etkinlik
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <span className="block text-2xl font-display font-bold text-foreground">50+</span>
              Yatırımcı
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <span className="block text-2xl font-display font-bold text-foreground">30+</span>
              Şehir
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
