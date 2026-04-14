import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Rocket, Mail, User, Building2, Phone, Link as LinkIcon, MessageSquare } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { mockEvents } from "@/data/mockEvents";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const Apply = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const event = mockEvents.find((e) => e.slug === slug);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({
        title: "Başvuru Alındı!",
        description: `${event.title} için başvurunuz başarıyla iletildi.`,
      });
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-16 flex flex-col items-center justify-center container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full glass p-10 rounded-[2.5rem] border border-border text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-4 text-foreground">Başvurunuz Başarılı!</h1>
            <p className="text-muted-foreground mb-8">
              {event.title} için başvurunuz sistemimize kaydedildi. Organizatör ekibi sizinle en kısa sürede iletişime geçecektir.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate("/")} 
                className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold"
              >
                Giriş Sayfasına Dön
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/etkinlikler")} 
                className="w-full h-12 rounded-xl font-bold"
              >
                Diğer Fırsatları Keşfet
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to={`/etkinlik/${slug}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Geri Dön
            </Link>

            <div className="mb-8">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2 uppercase tracking-wider">
                <Rocket className="w-4 h-4" />
                <span>Başvuru Formu</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                {event.title}
              </h1>
              <p className="text-muted-foreground mt-2">
                Fikrinizi hayata geçirmek için ilk adımı atın.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="glass p-6 md:p-10 rounded-[2.5rem] border border-border space-y-6 shadow-xl shadow-primary/5">
                {/* Section: Founder */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold font-display flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" /> Kurucu Bilgileri
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Ad Soyad</Label>
                      <Input id="fullName" placeholder="Örn: Ahmet Yılmaz" required className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta</Label>
                      <Input id="email" type="email" placeholder="ahmet@example.com" required className="bg-background/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" type="tel" placeholder="+90 5xx xxx xx xx" required className="bg-background/50" />
                  </div>
                </div>

                <div className="h-px bg-border my-6" />

                {/* Section: Venture */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold font-display flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" /> Girişim Detayları
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="ventureName">Girişim Adı</Label>
                    <Input id="ventureName" placeholder="Örn: SolarFlow" required className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Web Sitesi / LinkedIn</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input id="website" placeholder="https://..." className="pl-10 bg-background/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Girişim Özeti</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Girişiminiz hangi problemi çözüyor? (Maks. 500 kelime)" 
                      className="min-h-[120px] bg-background/50" 
                      required 
                    />
                  </div>
                </div>

                <div className="h-px bg-border my-6" />

                {/* Section: Motivation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold font-display flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" /> Motivasyon
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="motivation">Neden Bu Programa Katılmak İstiyorsunuz?</Label>
                    <Textarea 
                      id="motivation" 
                      placeholder="Beklentileriniz neler?" 
                      className="min-h-[100px] bg-background/50" 
                      required 
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <motion.span 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
                        />
                        Gönderiliyor...
                      </span>
                    ) : "Başvuruyu Tamamla"}
                  </Button>
                  <p className="text-center text-[10px] text-muted-foreground mt-4 px-4 leading-normal">
                    "Başvuruyu Tamamla" butonuna basarak Kullanım Koşulları'nı ve Gizlilik Bildirimi'ni kabul etmiş olursunuz.
                  </p>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Apply;
