import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, X, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockEvents, cities, categories } from "@/data/mockEvents";
import { motion, AnimatePresence } from "framer-motion";
import { eventsService } from "@/services/eventsService";

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQ);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await eventsService.getAllEvents({
          category_id: selectedCategory,
          city: selectedCity,
          is_online: onlineOnly || undefined,
          is_free: freeOnly || undefined,
        });
        
        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents(mockEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCategory, selectedCity, onlineOnly, freeOnly]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const searchContent = `${e.title} ${e.description} ${e.location}`;
      if (query && !searchContent.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [events, query]);

  const activeFilterCount = [selectedCity, selectedCategory, onlineOnly, freeOnly].filter(Boolean).length;

  const clearFilters = () => {
    setQuery("");
    setSelectedCity("");
    setSelectedCategory("");
    setOnlineOnly(false);
    setFreeOnly(false);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Tüm Fırsatlar
            </h1>
            <p className="text-muted-foreground">
              Türkiye'deki startup etkinlikleri, yatırımcılar ve programlar
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Etkinlik veya şehir ara..."
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-border text-foreground hover:bg-secondary"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtreler
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display font-semibold text-foreground">Filtreler</span>
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4 mr-1" /> Temizle
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Kategori</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedCategory(selectedCategory === c.id ? "" : c.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                              selectedCategory === c.id
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-secondary text-muted-foreground border-border hover:border-primary/30"
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Şehir</label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                      >
                        <option value="">Tüm Şehirler</option>
                        {cities.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Format</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setOnlineOnly(!onlineOnly)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                            onlineOnly
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary text-muted-foreground border-border hover:border-primary/30"
                          }`}
                        >
                          Online
                        </button>
                        <button
                          onClick={() => setFreeOnly(!freeOnly)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                            freeOnly
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary text-muted-foreground border-border hover:border-primary/30"
                          }`}
                        >
                          Ücretsiz
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-sm text-muted-foreground mb-4">
            {loading ? "Yükleniyor..." : `${filtered.length} sonuç bulundu`}
          </p>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((event, i) => (
                  <EventCard key={event.id} event={event} index={i} />
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg mb-2">Sonuç bulunamadı</p>
                  <p className="text-muted-foreground text-sm">Filtrelerinizi değiştirmeyi deneyin</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
