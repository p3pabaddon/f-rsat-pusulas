import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Zap, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const navLinks = [
  { to: "/", label: "Ana Sayfa" },
  { to: "/etkinlikler", label: "Etkinlikler" },
  { to: "/hakkinda", label: "Hakkında" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            Startup<span className="text-primary">Radar</span>
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
            <div className="flex items-center gap-2">
              <Link to="/profil">
                <Button size="sm" variant="ghost" className="text-muted-foreground">
                  <User className="w-4 h-4 mr-2" /> {user.user_metadata?.full_name || 'Profil'}
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={handleLogout} className="border-border hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="w-4 h-4 mr-2" /> Çıkış
              </Button>
            </div>
          ) : (
            <>
              <Link to="/giris">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Giriş Yap
                </Button>
              </Link>
              <Link to="/kayit">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  Kayıt Ol
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
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
            className="md:hidden glass border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/profil" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full flex justify-start text-muted-foreground">
                      <User className="w-4 h-4 mr-2" /> Profil
                    </Button>
                  </Link>
                  <Button onClick={handleLogout} variant="outline" size="sm" className="w-full mt-2 border-border text-destructive shadow-none">
                    <LogOut className="w-4 h-4 mr-2" /> Çıkış Yap
                  </Button>
                </>
              ) : (
                <div className="flex gap-2 mt-2">
                  <Link to="/giris" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                      Giriş Yap
                    </Button>
                  </Link>
                  <Link to="/kayit" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full bg-primary text-primary-foreground font-semibold">
                      Kayıt Ol
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
