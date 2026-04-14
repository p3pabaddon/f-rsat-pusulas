import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, Clock, ExternalLink, ArrowLeft, Tag, Building2, Bookmark, Rocket } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockEvents } from "@/data/mockEvents";
import { motion } from "framer-motion";

const categoryLabels: Record<string, string> = {
  etkinlik: "Etkinlik",
  yatirimci: "Yatırımcı",
  hizlandirici: "Hızlandırıcı",
  yarisma: "Yarışma",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EventDetail() {
  const { slug } = useParams();
  const event = mockEvents.find((e) => e.slug === slug);

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-4 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">Etkinlik bulunamadı</h1>
          <Link to="/etkinlikler">
            <Button className="bg-primary text-primary-foreground">Etkinliklere Dön</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/etkinlikler"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Etkinliklere Dön
            </Link>

            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {categoryLabels[event.category]}
                </Badge>
                {event.isOnline && (
                  <Badge variant="outline" className="bg-secondary text-muted-foreground border-border">Online</Badge>
                )}
                {event.isFree && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Ücretsiz</Badge>
                )}
              </div>

              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {event.title}
              </h1>

              <p className="text-muted-foreground text-sm">
                Düzenleyen: <span className="text-foreground">{event.organizer}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="lg:col-span-2">
                <div className="rounded-xl border border-border bg-card p-6 mb-6">
                  <h2 className="font-display font-semibold text-foreground text-lg mb-4">Hakkında</h2>
                  <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                </div>

                {/* Tags */}
                {event.tags.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" /> Etiketler
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-secondary text-muted-foreground border-border text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{formatDate(event.date)}</p>
                      {event.endDate && (
                        <p className="text-xs text-muted-foreground">— {formatDate(event.endDate)}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.city}</p>
                      <p className="text-xs text-muted-foreground">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.organizer}</p>
                    </div>
                  </div>

                  {event.deadline && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Son Başvuru</p>
                        <p className="text-xs text-muted-foreground">{formatDate(event.deadline)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Link to={`/basvur/${event.slug}`} className="block">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base py-6 glow">
                    Başvur <Rocket className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <Button variant="outline" className="w-full border-border text-foreground hover:bg-secondary">
                  <Bookmark className="w-4 h-4 mr-2" /> Kaydet
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
