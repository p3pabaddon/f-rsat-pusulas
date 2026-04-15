import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Zap, LogOut, User, Plus, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const navLinks = [
  { to: "/", label: "Ana Sayfa" },
  { to: "/etkinlikler", label: "Etkinlikler" },
  { to: "/hakkinda", label: "Hakkında" },
];

export function Navbar() {
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Admin e-postaları
  const ADMIN_EMAILS = [
    'mertmaylay054@gmail.com'
  ];

  // Founder e-postaları
  const FOUNDER_EMAILS = [
    'fatihtiger054@gmail.com'
  ];

  const fetchUserData = async (currentUser: any) => {
    if (!currentUser) return;

    // 1. Rol Belirleme
    const email = currentUser.email?.toLowerCase();
    let detectedRole = 'user';

    if (email && ADMIN_EMAILS.includes(email)) {
      detectedRole = 'admin';
    } else if (email && FOUNDER_EMAILS.includes(email)) {
      detectedRole = 'founder';
    }

    // 2. Profil Verilerini Çekme
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', currentUser.id)
      .single();
    
    if (profile) {
      // Eğer kullanıcı admin listesinde değilse ama veritabanında role='admin' veya 'founder' ise yetkiyi ver
      if (detectedRole !== 'admin') {
        if (profile.role === 'admin') detectedRole = 'admin';
        else if (profile.role === 'founder') detectedRole = 'founder';
      }
      setUserName(profile.full_name);
    } else {
      setUserName(currentUser.email?.split('@')[0]);
    }

    setUserRole(detectedRole);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        fetchUserData(session.user);
      } else {
        setUser(null);
        setUserRole(null);
        setUserName(null);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        fetchUserData(session.user);
      } else {
        setUser(null);
        setUserRole(null);
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: "Çıkış yapıldı", description: "Oturumunuz başarıyla kapatıldı." });
      navigate("/");
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  const isAdmin = userRole === 'admin';
  const isFounder = userRole === 'founder' || isAdmin;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground uppercase tracking-tight">
            Fırsat<span className="text-primary">Pusulası</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {isFounder ? (
                  <Link to="/founder-dashboard">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 px-4 py-2 text-xs md:text-sm font-bold flex items-center gap-2 rounded-full">
                      <LayoutDashboard className="w-4 h-4" /> Etkinlik Yönet
                    </Button>
                  </Link>
              ) : (
                <Link to="/founder-basvuru">
                  <Button variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500 px-4 py-2 text-xs md:text-sm font-bold flex items-center gap-2 rounded-full">
                    Founder Başvurusu
                  </Button>
                </Link>
              )}

              <Link to={isAdmin ? "/admin" : "/profil"}>
                <Button variant="ghost" className="flex items-center gap-2 rounded-full px-4 group">
                  <User className={`w-5 h-5 ${isAdmin ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  <span className="text-sm font-medium max-w-[150px] truncate">
                    {isAdmin ? "Yönetim Paneli" : (userName || user.email)}
                  </span>
                </Button>
              </Link>
              
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors rounded-full">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/giris">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Giriş Yap
                </Button>
              </Link>
              <Link to="/kayit">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-full px-6">
                  Kayıt Ol
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    location.pathname === link.to
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-border flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-3">
                      <User className="w-5 h-5 text-primary" />
                      <span className="font-semibold">{userName}</span>
                    </div>
                    {isFounder && (
                      <Link to="/founder-dashboard" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full justify-start gap-2" variant="outline">
                          <LayoutDashboard className="w-4 h-4" /> Etkinlik Yönet
                        </Button>
                      </Link>
                    )}
                    <Link to={isAdmin ? "/admin" : "/profil"} onClick={() => setMobileOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                        <User className="w-4 h-4" /> {isAdmin ? "Yönetim Paneli" : "Profilim"}
                      </Button>
                    </Link>
                    <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10">
                      <LogOut className="w-4 h-4" /> Çıkış Yap
                    </Button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/giris" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full">Giriş Yap</Button>
                    </Link>
                    <Link to="/kayit" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full">Kayıt Ol</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
