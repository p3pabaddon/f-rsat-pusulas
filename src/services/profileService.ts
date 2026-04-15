import { supabase } from "@/lib/supabase";

export const profileService = {
  /**
   * Mevcut kullanıcının profilini getirir
   */
  async getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Profil getirme hatası:", error.message);
      return null;
    }
    
    return data;
  },

  /**
   * Kullanıcının admin olup olmadığını kontrol eder
   */
  async isAdmin() {
    const profile = await this.getCurrentProfile();
    return profile?.role === "admin";
  },

  /**
   * Profil bilgilerini günceller
   */
  async updateProfile(updates: { full_name?: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum açmış kullanıcı bulunamadı");

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) throw error;
  }
};
