import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowRight, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { StartupEvent } from "@/data/mockEvents";

const categoryLabels: Record<string, string> = {
  etkinlik: "Etkinlik",
  yatirimci: "Yatırımcı",
  hizlandirici: "Hızlandırıcı",
  yarisma: "Yarışma",
};

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
  event: StartupEvent;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/etkinlik/${event.slug}`}
        className="group block rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 overflow-hidden"
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <Badge
              variant="outline"
              className={`text-xs font-medium ${categoryColors[event.category]}`}
            >
              {categoryLabels[event.category]}
            </Badge>
            <div className="flex items-center gap-2">
              {event.isOnline && (
                <Badge variant="outline" className="text-xs bg-secondary text-muted-foreground border-border">
                  Online
                </Badge>
              )}
              {event.isFree && (
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                  Ücretsiz
                </Badge>
              )}
            </div>
          </div>

          <h3 className="font-display font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {event.title}
          </h3>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {event.description}
          </p>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary/70" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary/70" />
              <span>{event.city}</span>
            </div>
            {event.deadline && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary/70" />
                <span>Son başvuru: {formatDate(event.deadline)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{event.organizer}</span>
            <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Detaylar <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
