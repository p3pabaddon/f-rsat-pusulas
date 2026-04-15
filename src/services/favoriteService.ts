import { supabase } from "@/lib/supabase";

export const favoriteService = {
  /**
   * Favorilere ekle/çıkar (Toggle)
   */
  async toggleFavorite(eventId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Favoriler için giriş yapmalısınız.");

    const isFav = await this.isFavorite(eventId);

    if (isFav) {
      const { error } = await supabase
        .from("event_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("event_id", eventId);
      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase
        .from("event_favorites")
        .insert({
          user_id: user.id,
          event_id: eventId
        });
      if (error) throw error;
      return true;
    }
  },

  /**
   * Favori durumunu kontrol eder
   */
  async isFavorite(eventId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("event_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_id", eventId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  },

  /**
   * Kullanıcının tüm favorilerini getirir
   */
  async getUserFavorites() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("event_favorites")
      .select("*, events(*)")
      .eq("user_id", user.id);

    if (error) throw error;
    return data;
  }
};
