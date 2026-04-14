import { Link } from "react-router-dom";
import { Calendar, TrendingUp, Rocket, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  {
    id: "etkinlik",
    label: "Etkinlikler",
    description: "Hackathon, meetup, demo day ve daha fazlası",
    icon: Calendar,
    color: "from-primary/20 to-primary/5 border-primary/20 hover:border-primary/50",
  },
  {
    id: "yatirimci",
    label: "Yatırımcılar",
    description: "VC, melek yatırımcı ve hibe programları",
    icon: TrendingUp,
    color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/50",
  },
  {
    id: "hizlandirici",
    label: "Hızlandırıcılar",
    description: "Accelerator ve incubator programları",
    icon: Rocket,
    color: "from-blue-500/20 to-blue-500/5 border-blue-500/20 hover:border-blue-500/50",
  },
  {
    id: "yarisma",
    label: "Yarışmalar",
    description: "Startup yarışmaları ve ödül programları",
    icon: Trophy,
    color: "from-rose-500/20 to-rose-500/5 border-rose-500/20 hover:border-rose-500/50",
  },
];

export function CategorySection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Kategorilere Göz At
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            İlgi alanına göre fırsatları keşfet
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/etkinlikler?category=${cat.id}`}
                className={`block p-6 rounded-xl border bg-gradient-to-br transition-all duration-300 ${cat.color}`}
              >
                <cat.icon className="w-8 h-8 mb-4 text-foreground" />
                <h3 className="font-display font-semibold text-foreground text-lg mb-1">
                  {cat.label}
                </h3>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
