import { supabase } from "@/lib/supabase";

export const registrationService = {
  /**
   * Bir etkinliğe kayıt olur
   */
  async registerForEvent(eventId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Kayıt için giriş yapmalısınız.");

    const { data, error } = await supabase
      .from("event_registrations")
      .insert({
        user_id: user.id,
        event_id: eventId,
        status: 'registered'
      });

    if (error) throw error;
    return data;
  },

  /**
   * Kaydı iptal eder
   */
  async cancelRegistration(eventId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum açmalısınız.");

    const { error } = await supabase
      .from("event_registrations")
      .delete()
      .eq("user_id", user.id)
      .eq("event_id", eventId);

    if (error) throw error;
  },

  /**
   * Kullanıcının bir etkinliğe kayıtlı olup olmadığını kontrol eder
   */
  async isRegistered(eventId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_id", eventId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  },

  /**
   * Kullanıcının tüm kayıtlarını getirir
   */
  async getUserRegistrations() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("event_registrations")
      .select("*, events(*)")
      .eq("user_id", user.id);

    if (error) throw error;
    return data;
  }
};
