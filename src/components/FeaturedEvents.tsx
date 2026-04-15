import { useState, useEffect } from "react";
import { mockEvents } from "@/data/mockEvents";
import { EventCard } from "@/components/EventCard";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { eventsService } from "@/services/eventsService";

interface FeaturedEventsProps {
  title: string;
  subtitle?: string;
  filter?: (e: any) => boolean;
  limit?: number;
  type?: "featured" | "latest";
}

export function FeaturedEvents({ 
  title, 
  subtitle, 
  filter, 
  limit = 4,
  type = "featured" 
}: FeaturedEventsProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        let data;
        if (type === "latest") {
          data = await eventsService.getLatestEvents(limit);
        } else {
          data = await eventsService.getFeaturedEvents();
        }
        
        let finalEvents = data || [];

        if (filter) {
          finalEvents = finalEvents.filter(filter);
        }

        setEvents(finalEvents.slice(0, limit));
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]); // Don't fall back to mock data if we want to remove them
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filter, limit, type]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  if (events.length === 0) return null;

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
