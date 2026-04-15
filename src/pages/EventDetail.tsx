import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, ExternalLink, ArrowLeft, Tag, Building2, Bookmark, Rocket, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockEvents } from "@/data/mockEvents";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { favoriteService } from "@/services/favoriteService";
import { registrationService } from "@/services/registrationService";
import { eventsService } from "@/services/eventsService";

// Import icons correctly from lucide-react
import { 
  Calendar as CalendarIcon, 
  MapPin as MapPinIcon, 
  Clock as ClockIcon, 
  ExternalLink as ExternalLinkIcon, 
  ArrowLeft as ArrowLeftIcon, 
  Tag as TagIcon, 
  Building2 as Building2Icon, 
  Bookmark as BookmarkIcon, 
  Rocket as RocketIcon,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  etkinlik: "Etkinlikler",
  yatirimci: "Yatırımcılar",
  hizlandirici: "Hızlandırıcılar",
  yarisma: "Yarışmalar",
};

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
}

export default function EventDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  // Oturum değişikliklerini izle (Hesap değiştirildiğinde tetiklenir)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Kaydedilme ve Kayıt durumunu kontrol et
  useEffect(() => {
    const checkStatus = async () => {
      if (event?.id && user?.id) {
        try {
          const [fav, reg] = await Promise.all([
            favoriteService.isFavorite(event.id),
            registrationService.isRegistered(event.id)
          ]);
          setIsSaved(fav);
          setHasApplied(reg);
        } catch (e) {
          console.error("Status check failed:", e);
        }
      }
    };
    checkStatus();
  }, [event?.id, user?.id]);

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Giriş gerekli", variant: "destructive" });
      navigate("/giris");
      return;
    }

    setSaving(true);
    try {
      const newState = await favoriteService.toggleFavorite(event.id);
      setIsSaved(newState);
      toast({ title: newState ? "Kaydedildi" : "Kaldırıldı" });
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast({ title: "Giriş gerekli", variant: "destructive" });
      navigate("/giris");
      return;
    }

    setApplying(true);
    try {
      if (hasApplied) {
        await registrationService.cancelRegistration(event.id);
        setHasApplied(false);
        toast({ title: "Kayıt iptal edildi" });
      } else {
        await registrationService.registerForEvent(event.id);
        setHasApplied(true);
        toast({ title: "Başarılı", description: "Etkinliğe kaydınız alındı." });
      }
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await eventsService.getEventBySlug(slug as string);

        if (data) {
          setEvent(data);
        } else {
          const mock = mockEvents.find((e) => e.slug === slug);
          setEvent(mock || null);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        const mock = mockEvents.find((e) => e.slug === slug);
        setEvent(mock || null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
        </main>
        <Footer />
      </div>
    );
  }

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
              <ArrowLeftIcon className="w-4 h-4" /> Etkinliklere Dön
            </Link>

            <div className="relative h-[300px] md:h-[450px] rounded-[2.5rem] overflow-hidden mb-8 border border-white/5 shadow-2xl">
              {event.image_url || (event as any).imageUrl ? (
                <img 
                  src={event.image_url || (event as any).imageUrl} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-secondary/50 to-secondary flex items-center justify-center">
                  <Building2Icon className="w-20 h-20 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
            </div>

            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className="bg-primary/95 text-primary-foreground border-none font-bold py-1 px-4 rounded-full shadow-lg">
                  {categoryLabels[event.category] || event.category}
                </Badge>
                {event.isOnline && (
                  <Badge className="bg-background/80 backdrop-blur-md text-foreground border-white/10 py-1 px-3 rounded-full">Online</Badge>
                )}
                {event.isFree && (
                  <Badge className="bg-emerald-500/90 text-white border-none py-1 px-3 rounded-full shadow-sm">Ücretsiz</Badge>
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
              <div className="lg:col-span-2">
                <div className="rounded-xl border border-border bg-card p-6 mb-6">
                  <h2 className="font-display font-semibold text-foreground text-lg mb-4">Hakkında</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-6 mb-6">
                    <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                       Etiketler
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="bg-secondary text-muted-foreground border-border text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {!event.isOnline && event.location && (
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="p-6 border-b border-border">
                      <h2 className="font-display font-semibold text-foreground text-lg flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-primary" /> Konum
                      </h2>
                    </div>
                    <div className="h-64 bg-secondary/20">
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight={0}
                        marginWidth={0}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location + " " + event.city)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{formatDate(event.date)}</p>
                      {event.endDate && (
                        <p className="text-xs text-muted-foreground">— {formatDate(event.endDate)}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.city}</p>
                      <p className="text-xs text-muted-foreground">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2Icon className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.organizer}</p>
                    </div>
                  </div>

                  {event.deadline && (
                    <div className="flex items-start gap-3">
                      <ClockIcon className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Son Başvuru</p>
                        <p className="text-xs text-muted-foreground">{formatDate(event.deadline)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleApply}
                  disabled={applying || hasApplied}
                  className={cn(
                    "w-full font-semibold text-base py-6 shadow-lg transition-all",
                    hasApplied 
                      ? "bg-secondary text-muted-foreground cursor-default" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90 glow shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  {hasApplied ? (
                    <>Başvuru Yapıldı <CheckCircle2 className="w-4 h-4 ml-2" /></>
                  ) : applying ? (
                    <>Başvuruluyor... <Loader2 className="w-4 h-4 ml-2 animate-spin" /></>
                  ) : (
                    <>Başvur <RocketIcon className="w-4 h-4 ml-2" /></>
                  )}
                </Button>

                {event.applicationLink && !hasApplied && (
                  <a href={event.applicationLink} target="_blank" rel="noopener noreferrer" className="block text-center mt-2">
                    <p className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1">
                      <ExternalLink className="w-2.5 h-2.5" /> Dış bağlantı üzerinden başvurmayı tercih edebilirsiniz
                    </p>
                  </a>
                )}

                <Button 
                  variant="outline" 
                  className={`w-full border-border hover:bg-secondary ${isSaved ? "bg-primary/10 text-primary border-primary/30" : "text-foreground"}`}
                  onClick={handleSave}
                  disabled={saving}
                >
                  <BookmarkIcon className={`w-4 h-4 mr-2 ${isSaved ? "fill-primary" : ""}`} /> 
                  {isSaved ? "Kaydedildi" : "Kaydet"}
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
