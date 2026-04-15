import { supabase } from "@/lib/supabase";
import { StartupEvent } from "@/data/mockEvents";

export const eventsService = {
  /**
   * Tüm etkinlikleri getirir (Filtreleme desteği ile)
   */
  async getAllEvents(filters?: {
    category_id?: string;
    city?: string;
    is_free?: boolean;
    is_online?: boolean;
    search?: string;
  }) {
    let query = supabase
      .from("events")
      .select(`
        *,
        categories (
          id,
          label,
          icon
        )
      `)
      .order("date", { ascending: true });

    if (filters?.category_id && filters.category_id !== "all") {
      query = query.eq("category_id", filters.category_id);
    }

    if (filters?.city && filters.city !== "all") {
      if (filters.city === "Online") {
        query = query.eq("is_online", true);
      } else {
        query = query.eq("city", filters.city);
      }
    }

    if (filters?.is_free !== undefined) {
      query = query.eq("is_free", filters.is_free);
    }

    if (filters?.is_online !== undefined) {
      query = query.eq("is_online", filters.is_online);
    }

    if (filters?.search) {
      query = query.ilike("title", `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Transform data to match StartupEvent interface if needed
    return data as any[]; 
  },

  /**
   * Öne çıkan etkinlikleri getirir
   */
  async getFeaturedEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_featured", true)
      .limit(6);

    if (error) throw error;
    return data;
  },

  /**
   * En son eklenen etkinlikleri getirir
   */
  async getLatestEvents(limit: number = 4) {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Slug ile tek bir etkinlik getirir
   */
  async getEventBySlug(slug: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*, categories(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createEvent(eventData: any) {
    return await supabase.from("events").insert([eventData]);
  },

  async deleteEvent(id: string) {
    return await supabase.from("events").delete().eq("id", id);
  }
};
