import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  Send,
  ArrowRight,
  Info,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const FounderApply = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    venture_name: "",
    location: "",
    event_description: "",
    phone: "",
    email: "",
    duration_days: "",
    duration_hours: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Giriş Gerekli",
          description: "Founder başvurusu yapmak için önce giriş yapmalısınız.",
          variant: "destructive"
        });
        navigate("/giris");
      } else {
        setUser(session.user);
        setFormData(prev => ({ ...prev, email: session.user.email || "" }));
      }
    };
    checkAuth();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('founder_applications')
        .insert([
          {
            user_id: user.id,
            venture_name: formData.venture_name,
            location: formData.location,
            event_description: formData.event_description,
            phone: formData.phone,
            email: formData.email,
            duration_details: `${formData.duration_days} Gün, ${formData.duration_hours} Saat`,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Başvuru Alındı",
        description: "Founder başvurunuz yöneticiye iletildi. Onaylanınca bilgilendirileceksiniz.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Başvuru sırasında bir sorun oluştu: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4">
        <div className="container max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass border-border shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-border p-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4">
                  <Briefcase className="w-6 h-6" />
                </div>
                <CardTitle className="text-3xl font-display font-bold">Founder Başvurusu</CardTitle>
                <CardDescription>
                  Etkinliklerinizi platformumuzda yayınlamak için founder yetkisi alın.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="venture_name">Şirket / Organizasyon Adı</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="venture_name"
                          placeholder="Örn: TechHub" 
                          className="pl-10 rounded-xl bg-background/50 border-border"
                          required
                          value={formData.venture_name}
                          onChange={(e) => setFormData({...formData, venture_name: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Şehir / Lokasyon</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="location"
                          placeholder="Örn: İstanbul" 
                          className="pl-10 rounded-xl bg-background/50 border-border"
                          required
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_description">Planladığınız Etkinlik / Girişim Nedir?</Label>
                    <Textarea 
                      id="event_description"
                      placeholder="Kısaca açıklayınız..." 
                      className="min-h-[120px] rounded-2xl bg-background/50 border-border"
                      required
                      value={formData.event_description}
                      onChange={(e) => setFormData({...formData, event_description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">İletişim E-postası</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="email"
                          type="email"
                          className="pl-10 rounded-xl bg-background/50 border-border"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon Numarası</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="phone"
                          type="tel"
                          placeholder="05xx..."
                          className="pl-10 rounded-xl bg-background/50 border-border"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Clock className="w-4 h-4" /> Etkinlik Süre Bilgisi
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="days">Tahmini Gün</Label>
                        <Input 
                          id="days"
                          type="number"
                          placeholder="Örn: 3"
                          className="rounded-xl bg-background/50 border-border"
                          required
                          value={formData.duration_days}
                          onChange={(e) => setFormData({...formData, duration_days: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hours">Günlük Tahmini Saat</Label>
                        <Input 
                          id="hours"
                          type="number"
                          placeholder="Örn: 4"
                          className="rounded-xl bg-background/50 border-border"
                          required
                          value={formData.duration_hours}
                          onChange={(e) => setFormData({...formData, duration_hours: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-2xl flex items-start gap-3 border border-primary/10">
                    <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Başvurunuz onaylandığında hesabınıza <strong>Founder Paneli</strong> eklenecek ve ana sayfada etkinlik paylaşabileceksiniz.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-all hover:scale-[1.02]"
                    disabled={loading}
                  >
                    {loading ? "Gönderiliyor..." : "Başvuruyu Tamamla"}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FounderApply;
