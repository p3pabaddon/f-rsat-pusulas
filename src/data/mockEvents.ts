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
  image_url?: string;
}

export const categories = [
  { id: "etkinlik", label: "Etkinlikler", icon: "Calendar" },
  { id: "yatirimci", label: "Yatırımcılar", icon: "TrendingUp" },
  { id: "hizlandirici", label: "Hızlandırıcılar", icon: "Rocket" },
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

export const mockEvents: StartupEvent[] = [];
