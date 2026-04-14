import { mockEvents } from "@/data/mockEvents";
import { EventCard } from "@/components/EventCard";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface FeaturedEventsProps {
  title: string;
  subtitle?: string;
  filter?: (e: typeof mockEvents[0]) => boolean;
  limit?: number;
}

export function FeaturedEvents({ title, subtitle, filter, limit = 4 }: FeaturedEventsProps) {
  const events = filter ? mockEvents.filter(filter).slice(0, limit) : mockEvents.slice(0, limit);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
              {title}
            </h2>
            {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
          </div>
          <Link to="/etkinlikler">
            <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
              Tümünü Gör <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
