import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, ShieldCheck, Globe, Code2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Kayıt Başarılı",
        description: "Lütfen e-posta adresinize gönderilen doğrulama kodunu kontrol edin.",
      });
      
      navigate("/dogrula", { state: { email: formData.email } });
    } catch (error: any) {
      toast({
        title: "Kayıt Hatası",
        description: error.message || "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Kayıt Hatası",
        description: error.message || `${provider} ile bağlanılamadı.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-16 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Ana Sayfaya Dön
            </Link>
            <h1 className="text-3xl font-display font-bold text-foreground">Hesap Oluştur</h1>
            <p className="text-muted-foreground mt-2">Yeni nesil startup platformuna katılın.</p>
          </div>

          <div className="glass p-8 md:p-10 rounded-[2.5rem] border border-border shadow-2xl shadow-primary/5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Ad Soyad</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="fullName" 
                    placeholder="Adınız Soyadınız" 
                    className="pl-10 bg-background/50" 
                    value={formData.fullName}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="ornek@mail.com" 
                    className="pl-10 bg-background/50" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    className="pl-10 pr-10 bg-background/50" 
                    value={formData.password}
                    onChange={handleChange}
                    required 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="terms" required />
                <label
                  htmlFor="terms"
                  className="text-xs text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <Link to="#" className="text-primary hover:underline">Kullanım Koşulları</Link>'nı ve <Link to="#" className="text-primary hover:underline">Gizlilik Politikası</Link>'nı kabul ediyorum.
                </label>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-bold mt-4"
              >
                {loading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Veya şunlarla devam et</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-12 rounded-xl border-border"
                onClick={() => handleSocialLogin('google')}
              >
                <Globe className="w-4 h-4 mr-2" /> Google
              </Button>
              <Button 
                variant="outline" 
                className="h-12 rounded-xl border-border"
                onClick={() => handleSocialLogin('github')}
              >
                <Code2 className="w-4 h-4 mr-2" /> GitHub
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-muted-foreground grayscale opacity-70">
              <ShieldCheck className="w-3 h-3" />
              <span>Verileriniz uçtan uca şifrelenmektedir.</span>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Zaten hesabınız var mı? <Link to="/giris" className="text-primary font-bold hover:underline">Giriş Yap</Link>
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
