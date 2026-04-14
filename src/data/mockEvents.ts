export interface StartupEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  time: string;
  city: string;
  location: string;
  category: "etkinlik" | "yatirimci" | "hizlandirici" | "yarisma";
  organizer: string;
  tags: string[];
  applicationLink: string;
  deadline?: string;
  isFeatured: boolean;
  isOnline: boolean;
  isFree: boolean;
  imageUrl?: string;
}

export const categories = [
  { id: "etkinlik", label: "Etkinlikler", icon: "Calendar" },
  { id: "yatirimci", label: "Yatırımcılar", icon: "TrendingUp" },
  { id: "hizlandirici", label: "Hızlandırma Programları", icon: "Rocket" },
  { id: "yarisma", label: "Yarışmalar", icon: "Trophy" },
] as const;

export const cities = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Konya",
  "Eskişehir",
  "Gaziantep",
  "Online",
];

export const mockEvents: StartupEvent[] = [
  {
    id: "1",
    slug: "startup-istanbul-2026",
    title: "Startup Istanbul 2026",
    description:
      "Türkiye'nin en büyük girişimcilik zirvesi. 50'den fazla ülkeden 2000+ girişimci, yatırımcı ve mentor bir araya geliyor. Demo Day, networking etkinlikleri ve panel oturumları ile dolu bir deneyim sizi bekliyor.",
    date: "2026-06-15",
    endDate: "2026-06-17",
    time: "09:00",
    city: "İstanbul",
    location: "Haliç Kongre Merkezi",
    category: "etkinlik",
    organizer: "Startup Istanbul Foundation",
    tags: ["zirve", "networking", "demo-day", "uluslararası"],
    applicationLink: "https://example.com",
    deadline: "2026-05-30",
    isFeatured: true,
    isOnline: false,
    isFree: false,
  },
  {
    id: "2",
    slug: "techstars-turkiye-2026",
    title: "Techstars Türkiye Hızlandırma Programı",
    description:
      "Techstars'ın Türkiye ayağı olarak erken aşama girişimlere mentorluk, yatırım ve küresel ağ erişimi sağlıyoruz. 3 aylık yoğun program.",
    date: "2026-07-01",
    endDate: "2026-09-30",
    time: "10:00",
    city: "İstanbul",
    location: "Kolektif House, Levent",
    category: "hizlandirici",
    organizer: "Techstars",
    tags: ["hızlandırıcı", "mentorluk", "yatırım"],
    applicationLink: "https://example.com",
    deadline: "2026-06-15",
    isFeatured: true,
    isOnline: false,
    isFree: true,
  },
  {
    id: "3",
    slug: "angel-effect-girisimci-bulusmasi",
    title: "Angel Effect Girişimci Buluşması",
    description:
      "Türkiye'nin önde gelen melek yatırımcı ağı Angel Effect ile girişimcilerin buluşma noktası. Pitch yapma fırsatı ve birebir yatırımcı görüşmeleri.",
    date: "2026-05-20",
    time: "18:30",
    city: "Ankara",
    location: "ODTÜ Teknokent",
    category: "yatirimci",
    organizer: "Angel Effect",
    tags: ["melek-yatırım", "pitch", "networking"],
    applicationLink: "https://example.com",
    deadline: "2026-05-10",
    isFeatured: true,
    isOnline: false,
    isFree: true,
  },
  {
    id: "4",
    slug: "hack-the-future-hackathon",
    title: "Hack the Future - AI Hackathon",
    description:
      "Yapay zeka odaklı 48 saatlik hackathon. Toplam 500.000₺ ödül havuzu ile Türkiye'nin en büyük AI hackathon'u.",
    date: "2026-05-10",
    endDate: "2026-05-12",
    time: "09:00",
    city: "Online",
    location: "Online Platform",
    category: "yarisma",
    organizer: "TechHub Türkiye",
    tags: ["hackathon", "yapay-zeka", "ödül"],
    applicationLink: "https://example.com",
    deadline: "2026-05-01",
    isFeatured: false,
    isOnline: true,
    isFree: true,
  },
  {
    id: "5",
    slug: "izmir-startup-meetup",
    title: "İzmir Startup Meetup #24",
    description:
      "İzmir'in aylık girişimcilik buluşması. Bu ay konumuz: Fintech girişimlerde büyüme stratejileri.",
    date: "2026-05-25",
    time: "19:00",
    city: "İzmir",
    location: "Workinton, Alsancak",
    category: "etkinlik",
    organizer: "İzmir Startup Community",
    tags: ["meetup", "fintech", "networking"],
    applicationLink: "https://example.com",
    isFeatured: false,
    isOnline: false,
    isFree: true,
  },
  {
    id: "6",
    slug: "tubitak-bigg-2026",
    title: "TÜBİTAK BİGG 2026 Başvuruları",
    description:
      "TÜBİTAK Bireysel Genç Girişimci programı ile 450.000₺'ye kadar hibe desteği alın. Teknoloji tabanlı iş fikirlerinizi hayata geçirin.",
    date: "2026-08-01",
    time: "00:00",
    city: "Ankara",
    location: "Online Başvuru",
    category: "yatirimci",
    organizer: "TÜBİTAK",
    tags: ["hibe", "devlet-desteği", "ar-ge"],
    applicationLink: "https://example.com",
    deadline: "2026-07-15",
    isFeatured: true,
    isOnline: true,
    isFree: true,
  },
  {
    id: "7",
    slug: "girisim-fabrikasi-bootcamp",
    title: "Girişim Fabrikası Bootcamp",
    description:
      "5 günlük yoğun girişimcilik bootcamp'i. İş modeli oluşturma, MVP geliştirme ve pitch eğitimi.",
    date: "2026-06-01",
    endDate: "2026-06-05",
    time: "09:00",
    city: "Bursa",
    location: "BTSO Teknoloji Merkezi",
    category: "hizlandirici",
    organizer: "Girişim Fabrikası",
    tags: ["bootcamp", "MVP", "eğitim"],
    applicationLink: "https://example.com",
    deadline: "2026-05-20",
    isFeatured: false,
    isOnline: false,
    isFree: false,
  },
  {
    id: "8",
    slug: "sosyal-girisimcilik-yarismasi",
    title: "Sosyal Girişimcilik Yarışması 2026",
    description:
      "Sosyal etki yaratan girişimlere özel yarışma. Toplam 300.000₺ ödül ve mentorluk desteği.",
    date: "2026-09-15",
    time: "10:00",
    city: "İstanbul",
    location: "Boğaziçi Üniversitesi",
    category: "yarisma",
    organizer: "Ashoka Türkiye",
    tags: ["sosyal-girişim", "yarışma", "ödül"],
    applicationLink: "https://example.com",
    deadline: "2026-08-01",
    isFeatured: false,
    isOnline: false,
    isFree: true,
  },
];
