import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowRight, Bookmark, Building2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { favoriteService } from "@/services/favoriteService";
import { registrationService } from "@/services/registrationService";

const categoryColors: Record<string, string> = {
  etkinlik: "bg-primary/15 text-primary border-primary/30",
  yatirimci: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  hizlandirici: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  yarisma: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface EventCardProps {
  event: any;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      if (user && event.id) {
        const [fav, reg] = await Promise.all([
          favoriteService.isFavorite(event.id),
          registrationService.isRegistered(event.id)
        ]);
        setIsSaved(fav);
        setIsRegistered(reg);
      }
    };
    checkStatus();
  }, [user, event.id]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({ title: "Giriş yapmalısınız", variant: "destructive" });
      navigate("/giris");
      return;
    }

    try {
      const newState = await favoriteService.toggleFavorite(event.id);
      setIsSaved(newState);
      toast({
        title: newState ? "Favorilere eklendi" : "Favorilerden çıkarıldı",
        description: newState ? "Bu etkinliği profilinizde bulabilirsiniz." : "Etkinlik listenizden kaldırıldı."
      });
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    }
  };

  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/giris");
      return;
    }

    setLoading(true);
    try {
      if (isRegistered) {
        await registrationService.cancelRegistration(event.id);
        setIsRegistered(false);
        toast({ title: "Kayıt iptal edildi" });
      } else {
        await registrationService.registerForEvent(event.id);
        setIsRegistered(true);
        toast({ title: "Kaydınız alındı!", description: "Etkinliğe başarıyla kayıt oldunuz." });
      }
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/etkinlik/${event.slug}`}
        className="group block rounded-[2.5rem] border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden"
      >
        <div className="relative h-56 overflow-hidden">
          <img 
            src={event.image_url || "/placeholder.jpg"} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60"></div>
          
          <Badge
            className={`absolute top-4 left-4 text-[10px] font-bold py-1 px-3 border-none bg-primary/95 text-primary-foreground rounded-full shadow-lg ${categoryColors[event.category_id] || ""}`}
          >
            {event.categories?.label || event.category_id}
          </Badge>

          <button
            onClick={handleToggleSave}
            className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${
              isSaved 
                ? "bg-primary text-primary-foreground scale-110" 
                : "bg-background/40 text-white hover:bg-background/60"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="p-7">
          <h3 className="font-display font-bold text-primary text-xl mb-3 group-hover:underline decoration-primary/30 underline-offset-4 line-clamp-2">
            {event.title}
          </h3>

          <div className="flex flex-col gap-3 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="truncate">{event.city}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <button
              onClick={handleRegister}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isRegistered 
                  ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isRegistered ? <><CheckCircle className="w-4 h-4" /> Kayıtlı</> : "Hemen Kayıt Ol"}
            </button>
            <div className="flex items-center gap-1.5 text-primary text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">
              Detay <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
