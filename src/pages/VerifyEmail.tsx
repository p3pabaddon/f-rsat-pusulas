import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, ArrowRight, RefreshCcw, CheckCircle2, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  
  const email = location.state?.email || "deneme@mail.com";

  useEffect(() => {
    if (!location.state?.email) {
      toast({
        title: "Bilgi",
        description: "Doğrulama sayfası için e-posta adresi bulunamadı.",
      });
    }

    // Check for session periodically or use auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setVerified(true);
        toast({
          title: "Doğrulama Başarılı",
          description: "Hesabınız aktifleştirildi!",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [location, toast]);

  const handleResend = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      toast({
        title: "E-posta Gönderildi",
        description: "Yeni doğrulama bağlantısı e-postanıza gönderildi.",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Bağlantı gönderilemedi.",
        variant: "destructive"
      });
    } finally {
      setResending(false);
    }
  };

  const openEmailProvider = () => {
    const domain = email.split('@')[1];
    if (domain === 'gmail.com') window.open('https://mail.google.com', '_blank');
    else if (domain === 'outlook.com' || domain === 'hotmail.com') window.open('https://outlook.live.com', '_blank');
    else window.open(`mailto:${email}`, '_self');
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="pt-32 pb-16 flex flex-col items-center justify-center container mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full glass p-10 rounded-[2.5rem] border border-border"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-4 text-foreground">Hesabınız Hazır!</h1>
            <p className="text-muted-foreground mb-8">
              E-posta adresiniz başarıyla doğrulandı. Artık platformun tüm özelliklerini kullanmaya başlayabilirsiniz.
            </p>
            <Button 
              onClick={() => navigate("/")} 
              className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold"
            >
              Hemen Başla <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-32 pb-16 flex flex-col items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full glass p-8 md:p-10 rounded-[2.5rem] border border-border text-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-4 font-display">Doğrulama Mailini Onaylayın</h1>
          <p className="text-muted-foreground text-sm mb-8">
            <span className="text-foreground font-medium">{email}</span> adresine bir doğrulama bağlantısı gönderdik. Lütfen e-postanızı kontrol edin ve gelen kutusundaki bağlantıya tıklayın.
          </p>

          <Button 
            onClick={openEmailProvider}
            className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            E-postanıza Gidin <ExternalLink className="w-4 h-4" />
          </Button>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground mb-4">
              E-posta gelmedi mi? Gereksiz (Spam) klasörünü kontrol edin veya tekrar gönderilmesini isteyin.
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleResend}
              disabled={resending}
              className="text-primary hover:bg-primary/5 font-semibold"
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${resending ? 'animate-spin' : ''}`} /> {resending ? 'Gönderiliyor...' : 'Doğrulama Mailini Tekrar Gönder'}
            </Button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
