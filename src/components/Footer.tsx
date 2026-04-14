import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                Startup<span className="text-primary">Radar</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              Türkiye'deki startup ekosisteminin merkezi keşif platformu. Etkinlikler, yatırımcılar, hızlandırıcılar ve yarışmalar tek bir yerde.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Keşfet</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/etkinlikler" className="text-muted-foreground hover:text-primary transition-colors">Etkinlikler</Link></li>
              <li><Link to="/etkinlikler?category=yatirimci" className="text-muted-foreground hover:text-primary transition-colors">Yatırımcılar</Link></li>
              <li><Link to="/etkinlikler?category=hizlandirici" className="text-muted-foreground hover:text-primary transition-colors">Hızlandırıcılar</Link></li>
              <li><Link to="/etkinlikler?category=yarisma" className="text-muted-foreground hover:text-primary transition-colors">Yarışmalar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/hakkinda" className="text-muted-foreground hover:text-primary transition-colors">Hakkında</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">İletişim</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Gizlilik Politikası</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          © 2026 StartupRadar Türkiye. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
