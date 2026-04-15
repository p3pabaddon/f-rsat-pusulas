import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { favoriteService } from "@/services/favoriteService";
import { registrationService } from "@/services/registrationService";
import { eventsService } from "@/services/eventsService";
import { 
  User, 
  Mail, 
  Briefcase, 
  Bell, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Settings,
  ShieldX,
  Camera,
  Phone,
  Upload,
  Calendar,
  Save,
  CheckCircle,
  X,
  Plus,
  Minus,
  Bookmark
} from "lucide-react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

// Mock data for applications
const mockApplications = [
  {
    id: 1,
    startup: "Trendify AI",
    date: "2024-03-15",
    status: "evaluation", // evaluation, interview, rejected, accepted
    position: "Frontend Developer",
    logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop"
  },
  {
    id: 2,
    startup: "EcoFlow",
    date: "2024-03-10",
    status: "interview",
    position: "Sustainability Consultant",
    logo: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&h=100&fit=crop"
  },
  {
    id: 3,
    startup: "Nexus Security",
    date: "2024-02-28",
    status: "rejected",
    position: "Junior Security Analyst",
    logo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&h=100&fit=crop"
  }
];

const staticAnnouncements = [
  {
    id: 'static-1',
    title: "EcoFlow Mülakat Daveti",
    content: "EcoFlow ekibi sizinle mülakat yapmak istiyor! Mülakat detayları e-posta adresinize gönderildi.",
    date: "2 saat önce",
    type: "important",
    read: false
  },
  {
    id: 'static-2',
    title: "Bahar Dönemi Başvuruları Başladı",
    content: "2024 Bahar dönemi hızlandırma programı başvuruları artık açık. Hemen başvurun ve hayallerinizi gerçekleştirin.",
    date: "1 gün önce",
    type: "info",
    read: true
  },
  {
    id: 'static-3',
    title: "Profil Güncelleme!",
    content: "Hesabınızın güvenliği için lütfen bilgilerinizi güncel tutun.",
    date: "3 gün önce",
    type: "update",
    read: true
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'evaluation':
      return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-none"><Clock className="w-3 h-3 mr-1" /> Değerlendirmede</Badge>;
    case 'interview':
      return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-none"><Briefcase className="w-3 h-3 mr-1" /> Mülakat</Badge>;
    case 'accepted':
      return <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Kabul Edildi</Badge>;
    case 'rejected':
      return <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-none"><ShieldX className="w-3 h-3 mr-1" /> Reddedildi</Badge>;
    default:
      return <Badge variant="secondary">Bilinmiyor</Badge>;
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
  // Editable states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<'avatar' | 'cover' | null>(null);

  const fetchDynamicAnnouncements = async (userId: string) => {
    try {
      const { data: events } = await supabase.from('events').select('*');
      const { data: apps, error: appsError } = await supabase.from('Applications').select('event_slug').eq('user_id', userId);
      
      let finalApps = apps;
      if (appsError) {
        const { data: fallbackApps } = await supabase.from('applications').select('event_slug').eq('user_id', userId);
        finalApps = fallbackApps;
      }
      
      const appliedSlugs = finalApps?.map(a => a.event_slug).filter(Boolean) || [];
      const today = new Date();
      const twoDaysLater = new Date();
      twoDaysLater.setDate(today.getDate() + 2);

      const urgentAnnouncements = events
        ?.filter(e => {
          if (!e.application_deadline) return false;
          const deadline = new Date(e.application_deadline);
          return !appliedSlugs.includes(e.slug) && deadline > today && deadline <= twoDaysLater;
        })
        .map(e => ({
          id: `urgent-${e.id}`,
          title: "🚨 Başvuru Süresi Doluyor!",
          content: `"${e.title}" etkinliği için başvuru süresi 2 günden az kaldı. Fırsatı kaçırmamak için hemen başvur!`,
          date: "Yeni",
          type: "important",
          read: false
        })) || [];

      setAnnouncements([...urgentAnnouncements, ...staticAnnouncements]);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements(staticAnnouncements);
    }
  };

  const fetchProfileData = async () => {
    try {
      const [favs, regs] = await Promise.all([
        favoriteService.getUserFavorites(),
        registrationService.getUserRegistrations()
      ]);
      setSavedEvents(favs.map(f => f.events).filter(Boolean));
      setRegisteredEvents(regs.map(r => r.events).filter(Boolean));
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/giris");
      } else {
        const userData = session.user;
        setUser(userData);
        setFullName(userData.user_metadata?.full_name || "");
        setPhone(userData.user_metadata?.phone || "");
        setAvatarUrl(userData.user_metadata?.avatar_url || "");
        setCoverUrl(userData.user_metadata?.cover_url || "");
        fetchProfileData();
        fetchDynamicAnnouncements(userData.id);
        setLoading(false);
      }
    });
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Hata",
          description: "Dosya boyutu 2MB'dan küçük olmalıdır.",
          variant: "destructive"
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setCropType(type);
        setIsCropModalOpen(true);
        // Reset crop/zoom
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);

      // Reset input value to allow re-selection of the same file
      e.target.value = "";
    }
  };

  const onCropComplete = (newCroppedArea: any, newCroppedAreaPixels: any) => {
    setCroppedAreaPixels(newCroppedAreaPixels);
  };

  const applyCrop = async () => {
    try {
      if (imageToCrop && croppedAreaPixels && cropType) {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        if (cropType === 'avatar') setAvatarUrl(croppedImage);
        else setCoverUrl(croppedImage);
        setIsCropModalOpen(false);
        setImageToCrop(null);
        setCropType(null);
        toast({
          title: "Başarılı",
          description: "Fotoğraf kesildi. Kaydetmeyi unutmayın.",
        });
      }
    } catch (e: any) {
      toast({
        title: "Hata",
        description: "Fotoğraf kesilirken bir hata oluştu: " + e.message,
        variant: "destructive"
      });
    }
  };

  const removeImage = (type: 'avatar' | 'cover') => {
    if (type === 'avatar') setAvatarUrl("");
    else setCoverUrl("");
    toast({
      title: "Bilgi",
      description: `${type === 'avatar' ? 'Profil' : 'Kapak'} fotoğrafı kaldırıldı. Kaydetmeyi unutmayın.`,
    });
  };

  const updateProfile = async () => {
    setIsUpdating(true);
    
    // Check name change restriction (1 week)
    const lastChange = user?.user_metadata?.last_name_change;
    const now = new Date();
    
    if (fullName !== user?.user_metadata?.full_name && lastChange) {
      const lastDate = new Date(lastChange);
      const diffTime = now.getTime() - lastDate.getTime();
      const weekInMs = 7 * 24 * 60 * 60 * 1000;
      
      if (diffTime < weekInMs) {
        const remainingDays = Math.ceil((weekInMs - diffTime) / (1000 * 60 * 60 * 24));
        toast({
          title: "İsim Değişikliği Kısıtlı",
          description: `İsminizi tekrar değiştirmek için ${remainingDays} gün daha beklemelisiniz.`,
          variant: "destructive"
        });
        setIsUpdating(false);
        return;
      }
    }

    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        phone: phone,
        avatar_url: avatarUrl,
        cover_url: coverUrl,
        ...(fullName !== user?.user_metadata?.full_name ? { last_name_change: now.toISOString() } : {})
      }
    });

    if (error) {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu: " + error.message,
        variant: "destructive"
      });
    } else {
      setUser(data.user);
      setShowSettings(false);
      toast({
        title: "Başarılı",
        description: "Profiliniz başarıyla güncellendi.",
      });
    }
    setIsUpdating(false);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          
          {/* Profile Header */}
          <div className="relative mb-8">
            {/* Cover Photo */}
            <div className="relative h-32 md:h-48 rounded-3xl overflow-hidden border border-border group">
              {coverUrl ? (
                <img src={coverUrl} className="w-full h-full object-cover" alt="Cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-primary/20 via-primary/10 to-transparent">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                </div>
              )}
              
              {/* Cover Upload/Remove Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-8">
                  <label className="flex flex-col items-center gap-2 text-white hover:text-primary transition-colors cursor-pointer">
                    <Input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
                    <Camera className="w-8 h-8" />
                    <span className="text-sm font-medium">Değiştir</span>
                  </label>
                  {coverUrl && (
                    <button 
                      onClick={() => removeImage('cover')}
                      className="flex flex-col items-center gap-2 text-white hover:text-destructive transition-colors"
                    >
                      <X className="w-8 h-8" />
                      <span className="text-sm font-medium">Kaldır</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-6 -mt-12 md:-mt-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                {/* Avatar */}
                <div className="relative group">
                  <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-8 ring-background border-2 border-border/50">
                    <AvatarImage src={avatarUrl} className="object-cover" />
                    <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground uppercase">
                      {fullName?.charAt(0) || user?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Avatar Upload/Remove Overlay */}
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-4 border-background">
                    <div className="flex gap-4">
                      <label className="cursor-pointer text-white hover:text-primary transition-colors">
                        <Input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
                        <Camera className="w-6 h-6" />
                      </label>
                      {avatarUrl && (
                        <button 
                          onClick={() => removeImage('avatar')}
                          className="text-white hover:text-destructive transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pb-2">
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                    {fullName || 'Kullanıcı'}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user?.email}</span>
                    {phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {phone}</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mb-2 w-full md:w-auto">
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-xl border-border flex-1 md:flex-none">
                      <Settings className="w-4 h-4 mr-2" /> Ayarlar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass border-border rounded-[2rem] max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">Profil Ayarları</DialogTitle>
                      <DialogDescription>
                        Kişisel bilgilerinizi buradan güncelleyebilirsiniz.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-6 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Tam İsim</Label>
                        <Input 
                          id="name" 
                          value={fullName} 
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ad Soyad"
                          className="rounded-xl border-border"
                        />
                        <p className="text-[10px] text-muted-foreground">İsim değişikliği haftada bir kez yapılabilir.</p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Telefon Numarası</Label>
                        <Input 
                          id="phone" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+90 5xx xxx xx xx"
                          className="rounded-xl border-border"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>E-posta</Label>
                        <Input 
                          value={user?.email} 
                          disabled 
                          className="rounded-xl border-border opacity-50 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter className="flex gap-2">
                      <Button variant="ghost" onClick={() => setShowSettings(false)} className="rounded-xl">Vazgeç</Button>
                      <Button 
                        onClick={updateProfile} 
                        disabled={isUpdating}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8"
                      >
                        {isUpdating ? "Güncelleniyor..." : "Kaydet"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  onClick={updateProfile}
                  disabled={isUpdating}
                  size="sm" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 flex-1 md:flex-none shadow-lg shadow-primary/20"
                >
                  <Save className="w-4 h-4 mr-2" /> {isUpdating ? "Kaydediliyor..." : "Hızlı Kaydet"}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <div className="grid grid-cols-1 gap-8">
            <Tabs defaultValue="bookmarks" className="w-full">
              <TabsList className="w-full md:w-auto bg-secondary/50 p-1 mb-8 rounded-2xl border border-border">
                <TabsTrigger value="bookmarks" className="rounded-xl flex-1 md:flex-none">
                  <Bookmark className="w-4 h-4 mr-2" /> Kaydedilenler
                </TabsTrigger>
                <TabsTrigger value="applications" className="rounded-xl flex-1 md:flex-none">
                  <Briefcase className="w-4 h-4 mr-2" /> Başvurularım
                </TabsTrigger>
                <TabsTrigger value="registrations" className="rounded-xl flex-1 md:flex-none">
                  <Calendar className="w-4 h-4 mr-2" /> Kayıtlarım
                </TabsTrigger>
                <TabsTrigger value="announcements" className="rounded-xl flex-1 md:flex-none">
                  <Bell className="w-4 h-4 mr-2" /> Duyurular 
                  <span className="ml-1.5 flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                </TabsTrigger>
              </TabsList>

              {/* Bookmarks Tab */}
              <TabsContent value="bookmarks">
                {savedEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedEvents.map((event, index) => (
                      <EventCard key={event.id} event={event} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-[2.5rem] border border-border border-dashed">
                    <div className="bg-secondary/50 p-6 rounded-full mb-6">
                      <Bookmark className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-xl font-display font-semibold mb-2">Henüz Kaydedilen Etkinlik Yok</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                      İlginizi çeken etkinlikleri kaydederek daha sonra kolayca ulaşabilirsiniz.
                    </p>
                    <Button onClick={() => navigate("/etkinlikler")} variant="outline" className="rounded-full px-8">
                      Etkinlikleri Keşfet
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Registrations Tab */}
              <TabsContent value="registrations">
                {registeredEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {registeredEvents.map((event, index) => (
                      <EventCard key={event.id} event={event} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-[2.5rem] border border-border border-dashed">
                    <div className="bg-secondary/50 p-6 rounded-full mb-6">
                      <Calendar className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-xl font-display font-semibold mb-2">Henüz Kayıtlı Etkinlik Yok</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                      Etkinliklere kayıt olarak kontenjanınızı ayırtabilir ve güncel bilgilere ulaşabilirsiniz.
                    </p>
                    <Button onClick={() => navigate("/etkinlikler")} variant="outline" className="rounded-full px-8">
                      Etkinlikleri Keşfet
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Announcements Tab */}
              <TabsContent value="announcements">
                <Card className="glass border-border rounded-[2rem] overflow-hidden">
                    <CardHeader className="border-b border-border/50 pb-4">
                        <CardTitle className="text-xl">Platform Duyuruları</CardTitle>
                        <CardDescription>Sizin için seçilen son gelişmeler</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[500px]">
                            <div className="p-2 space-y-1">
                                {announcements.map((ann) => (
                                    <div 
                                        key={ann.id} 
                                        className={`p-4 rounded-[1.5rem] transition-all relative group mb-1 ${
                                          ann.type === 'important' && !ann.read 
                                            ? 'bg-yellow-500/10 border border-yellow-500/20' 
                                            : ann.read ? 'hover:bg-secondary/30' : 'bg-primary/5 hover:bg-primary/10'
                                        }`}
                                    >
                                        {ann.type === 'important' && !ann.read && (
                                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-500 rounded-l-full shadow-[2px_0_10px_rgba(234,179,8,0.4)]" />
                                        )}
                                        {!ann.read && ann.type !== 'important' && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full"></div>}
                                        
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <div className="flex flex-col gap-0.5">
                                              <h4 className={`font-bold text-base ${ann.type === 'important' ? 'text-yellow-500' : 'text-foreground'}`}>
                                                {ann.title}
                                              </h4>
                                              <span className="text-[10px] whitespace-nowrap opacity-60 font-medium uppercase tracking-wider">{ann.date}</span>
                                            </div>
                                            {ann.type === 'important' && !ann.read && (
                                              <Badge className="bg-yellow-500 text-black border-none text-[9px] px-2 py-0 font-bold animate-pulse">ACİL</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed pr-6 mb-3">
                                          {ann.content}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {ann.type === 'important' && <Badge className="bg-yellow-500/10 text-yellow-500 border-none text-[10px] py-0 px-2">Önemli</Badge>}
                                            {ann.type === 'update' && <Badge variant="secondary" className="text-[10px] py-0 px-2">Güncelleme</Badge>}
                                            {ann.type === 'info' && <Badge variant="outline" className="text-[10px] py-0 px-2 border-primary/20 text-primary/70">Bilgi</Badge>}
                                            <button className="text-xs text-primary font-bold ml-auto opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
                                              Detayı Gör
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {announcements.length === 0 && (
                                  <div className="py-20 text-center opacity-50">
                                    <Bell className="w-12 h-12 mx-auto mb-4" />
                                    <p>Henüz duyuru bulunmuyor.</p>
                                  </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Dialog open={isCropModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCropModalOpen(false);
          setImageToCrop(null);
          setCropType(null);
        }
      }}>
        <DialogContent className="glass border-border rounded-[2rem] max-w-2xl overflow-hidden p-0 h-[80vh] flex flex-col">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl">Fotoğrafı Düzenle</DialogTitle>
            <DialogDescription>
              İstediğiniz alanı seçin. {cropType === 'avatar' ? 'Daire içine yerleştirilecek.' : 'Geniş formatta kullanılacak.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 relative bg-black/50 mx-6 rounded-2xl overflow-hidden">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={cropType === 'avatar' ? 1 : 16 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape={cropType === 'avatar' ? 'round' : 'rect'}
                showGrid={true}
              />
            )}
          </div>
          
          <div className="p-6 space-y-4">
             <div className="flex items-center gap-4">
                <Minus className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <Plus className="w-4 h-4 text-muted-foreground" />
             </div>
             
             <DialogFooter className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsCropModalOpen(false)} className="rounded-xl">Vazgeç</Button>
                <Button onClick={applyCrop} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-12">Uygula</Button>
             </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Profile;
