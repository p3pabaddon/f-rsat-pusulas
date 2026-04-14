import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
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
  Minus
} from "lucide-react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import { Button } from "@/components/ui/button";
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

// Mock data for announcements
const mockAnnouncements = [
  {
    id: 1,
    title: "EcoFlow Mülakat Daveti",
    content: "EcoFlow ekibi sizinle mülakat yapmak istiyor! Mülakat detayları e-posta adresinize gönderildi.",
    date: "2 saat önce",
    type: "important",
    read: false
  },
  {
    id: 2,
    title: "Bahar Dönemi Başvuruları Başladı",
    content: "2024 Bahar dönemi hızlandırma programı başvuruları artık açık. Hemen başvurun ve hayallerinizi gerçekleştirin.",
    date: "1 gün önce",
    type: "info",
    read: true
  },
  {
    id: 3,
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
      }
      setLoading(false);
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
            <Tabs defaultValue="applications" className="w-full">
              <TabsList className="w-full md:w-auto bg-secondary/50 p-1 mb-8 rounded-2xl border border-border">
                <TabsTrigger value="applications" className="rounded-xl flex-1 md:flex-none">
                  <Briefcase className="w-4 h-4 mr-2" /> Başvurularım
                </TabsTrigger>
                <TabsTrigger value="announcements" className="rounded-xl flex-1 md:flex-none">
                  <Bell className="w-4 h-4 mr-2" /> Duyurular 
                  <span className="ml-1.5 flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                </TabsTrigger>
              </TabsList>

              {/* Applications Tab */}
              <TabsContent value="applications">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                  {mockApplications.map((app) => (
                    <motion.div
                      key={app.id}
                      whileHover={{ y: -2 }}
                    >
                      <Card className="glass border-border hover:shadow-lg transition-all duration-300 rounded-[2rem] overflow-hidden group">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl border border-border overflow-hidden bg-background p-1">
                                <img src={app.logo} alt={app.startup} className="w-full h-full object-cover rounded-xl" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{app.startup}</h3>
                                <p className="text-sm text-muted-foreground">{app.position}</p>
                              </div>
                            </div>
                            
                            <div className="hidden md:flex flex-col items-end gap-2 text-right">
                              {getStatusBadge(app.status)}
                              <p className="text-[10px] text-muted-foreground font-mono flex items-center mt-1 uppercase tracking-tight">
                                <Clock className="w-3 h-3 mr-1" /> {app.date}
                              </p>
                            </div>
                            
                            <div className="md:hidden">
                                {getStatusBadge(app.status)}
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {[1,2,3].map(i => (
                                    <Avatar key={i} className="w-6 h-6 border-2 border-background">
                                        <AvatarImage src={`https://i.pravatar.cc/100?img=${i+10}`} />
                                    </Avatar>
                                ))}
                                <div className="w-6 h-6 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[8px] font-bold">+2</div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5 rounded-xl">
                              Detayları Gör <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  
                  {mockApplications.length === 0 && (
                    <div className="py-20 text-center col-span-full opacity-50">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p>Henüz bir başvurunuz bulunmuyor.</p>
                        <Button className="mt-4" variant="outline">Startupları Keşfet</Button>
                    </div>
                  )}
                </div>
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
                                {mockAnnouncements.map((ann) => (
                                    <div 
                                        key={ann.id} 
                                        className={`p-4 rounded-[1.5rem] transition-colors relative group ${ann.read ? 'hover:bg-secondary/30' : 'bg-primary/5 hover:bg-primary/10'}`}
                                    >
                                        {!ann.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full"></div>}
                                        <div className="flex justify-between items-start gap-4 mb-1">
                                            <h4 className={`font-bold ${!ann.read ? 'text-foreground' : 'text-muted-foreground'}`}>{ann.title}</h4>
                                            <span className="text-[10px] whitespace-nowrap opacity-60 font-medium">{ann.date}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 pr-6">{ann.content}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            {ann.type === 'important' && <Badge className="bg-destructive/10 text-destructive border-none text-[10px] py-0">Önemli</Badge>}
                                            {ann.type === 'update' && <Badge variant="secondary" className="text-[10px] py-0">Güncelleme</Badge>}
                                            <button className="text-xs text-primary font-bold ml-auto opacity-0 group-hover:opacity-100 transition-opacity">Okundu İşaretle</button>
                                        </div>
                                    </div>
                                ))}
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
