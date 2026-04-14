import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Target, Eye, Rocket, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
              <Rocket className="w-3 h-3" />
              <span>Geleceği Birlikte İnşa Ediyoruz</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">
              Girişimcilik Yolculuğunuzda <br />
              <span className="text-primary italic">Güçlü Bir Rehber</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              StartupRadar, Türkiye'deki girişimcilerin potansiyellerini açığa çıkarmaları için ihtiyaç duydukları yarışma, hibe ve hızlandırma fırsatlarını modernize eden bir platformdur.
            </p>
          </motion.div>

          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-8 mb-24">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="p-10 rounded-3xl bg-secondary/30 border border-border flex flex-col items-center text-center backdrop-blur-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm border border-primary/5">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4 font-display">Misyonumuz</h2>
              <p className="text-muted-foreground leading-relaxed">
                Girişimcilerin en kıymetli hazinesi olan zamanı optimize etmek. Dağınık haldeki tüm startup yarışmalarını, ödüllü programları ve hibe duyurularını tek bir noktada toplayarak, girişimcilerin odağını sadece projelerine vermesini sağlamak.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="p-10 rounded-3xl bg-secondary/30 border border-border flex flex-col items-center text-center backdrop-blur-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm border border-primary/5">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4 font-display">Vizyonumuz</h2>
              <p className="text-muted-foreground leading-relaxed">
                Türkiye'nin en etkileşimli girişimcilik fırsatları üssü olmak. Startup'ların sadece yarışma bulduğu değil, aynı zamanda büyüme yolculuklarında ihtiyaç duydukları her türlü stratejik desteğe ve ağa en hızlı şekilde ulaştığı lider ekosistem haline gelmek.
              </p>
            </motion.div>
          </div>

          {/* Story/Vision Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-24 rounded-[3rem] overflow-hidden bg-slate-950 text-white p-12 md:p-20 relative border border-white/5"
          >
            <div className="max-w-3xl relative z-10">
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold mb-8 tracking-widest uppercase">
                Hikayemiz
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 font-display leading-tight">
                Her şey bir <span className="text-primary italic">"Keşke bilseydik"</span> <br /> cümlesiyle başladı.
              </h2>
              <div className="space-y-6 text-slate-400 text-lg leading-relaxed">
                <p>
                  Biz de sizin geçtiğiniz yollardan geçtik. Çok iyi fikirlerin, sadece doğru yarışmaya veya hibe programına yetişemediği için rafa kalktığına şahit olduk. Ekosistemin karmaşıklığı içinde boğulmak yerine, odağımızı tek bir amaca verdik.
                </p>
                <p>
                  StartupRadar'ı, hiçbir girişimcinin "fırsatları kaçırdık" dememesi için kurduk. Biz, sizin için tüm gürültüyü filtreleyen ve sadece gerçekten değer katacak kapıları gösteren dijital pusulanızız.
                </p>
              </div>
              
              <div className="mt-12 flex items-center gap-4 border-t border-white/10 pt-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-primary/20">
                  SR
                </div>
                <div>
                  <p className="font-bold text-white text-lg">StartupRadar Kurucu Ekibi</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold italic">Girişimci Dostu Teknoloji • 2026</p>
                </div>
              </div>
            </div>
            
            {/* Abstract Background Decoration */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 right-20 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none animate-pulse" />
          </motion.div>

          {/* Core Values / Why Us */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Şeffaflık",
                desc: "Fırsatların tüm detaylarını, avantajlarını ve risklerini sizin için şeffafça sunuyoruz."
              },
              {
                title: "Hız",
                desc: "Ekosistemdeki her yeniliği anında platformumuza taşıyarak size zaman kazandırıyoruz."
              },
              {
                title: "Kalite",
                desc: "Sadece gerçekten startup değerlemesine ve büyümesine katkı sağlayacak programları listeliyoruz."
              }
            ].map((v, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-secondary/10 border border-border group hover:bg-secondary/20 transition-all"
              >
                <h3 className="text-xl font-bold mb-3 font-display text-primary">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
