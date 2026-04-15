import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Image as ImageIcon,
  Send,
  Trash2,
  Edit,
  Tag,
  Upload,
  X,
  Check,
  Building2
} from "lucide-react";
import Cropper from 'react-easy-crop';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const FounderDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isFounder, setIsFounder] = useState(false);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [incomingApplications, setIncomingApplications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'applications'>('events');
  
  // Cropper states
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const ADMIN_EMAILS = [
    'mertmaylay054@gmail.com'
  ];

  const FOUNDER_EMAILS = [
    'fatihtiger054@gmail.com'
  ];

  const categories = [
    { id: "etkinlik", label: "Etkinlik" },
    { id: "yatirimci", label: "Yatırımcı" },
    { id: "hizlandirici", label: "Hızlandırıcı" },
    { id: "yarisma", label: "Yarışma" }
  ];

  const [formData, setFormData] = useState({
    organizer: "",
    title: "",
    description: "",
    date: "",
    location: "",
    image_url: "",
    image_position: "center",
    category: "etkinlik",
  });

  // Bugünün tarihini YYYY-MM-DD formatında al (min date için)
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/giris");
        return;
      }

      const email = session.user.email?.toLowerCase();
      if (email && (ADMIN_EMAILS.includes(email) || FOUNDER_EMAILS.includes(email))) {
        setIsFounder(true);
        fetchMyEvents(session.user.id);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'founder' || profile?.role === 'admin') {
        setIsFounder(true);
        fetchMyEvents(session.user.id);
      } else {
        toast({
          title: "Yetkisiz Erişim",
          description: "Founder paneline sadece yetkili kullanıcılar erişebilir.",
          variant: "destructive"
        });
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchMyEvents = async (userId: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', userId)
      .order('created_at', { ascending: false });

    if (!error) setMyEvents(data || []);
    fetchApplications(userId);
  };

  const fetchApplications = async (userId: string) => {
    try {
      // Get founder's events
      const { data: myEvents, error: eventsError } = await supabase
        .from('events')
        .select('id, slug, title')
        .eq('organizer_id', userId);

      if (eventsError) throw eventsError;
      
      const eventIds = myEvents?.map(e => e.id) || [];
      const eventSlugs = myEvents?.map(e => e.slug) || [];

      if (eventIds.length === 0 && eventSlugs.length === 0) {
        setIncomingApplications([]);
        return;
      }

      // We use Applications (uppercase) as requested
      const { data, error } = await supabase
        .from('Applications')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .or(`event_id.in.(${eventIds.join(',')}),event_slug.in.(${eventSlugs.join(',')})`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching Applications:", error);
        // Fallback to lowercase if uppercase fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('applications')
          .select(`
            *,
            profiles:user_id (full_name, email)
          `)
          .or(`event_id.in.(${eventIds.join(',')}),event_slug.in.(${eventSlugs.join(',')})`)
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;
        
        const appsWithTitles = fallbackData?.map(app => ({
          ...app,
          event_title: myEvents?.find(e => e.id === app.event_id || e.slug === app.event_slug)?.title || 'Bilinmeyen Etkinlik'
        })) || [];
        
        setIncomingApplications(appsWithTitles);
      } else {
        const appsWithTitles = data?.map(app => ({
          ...app,
          event_title: myEvents?.find(e => e.id === app.event_id || e.slug === app.event_slug)?.title || 'Bilinmeyen Etkinlik'
        })) || [];
        
        setIncomingApplications(appsWithTitles);
      }
    } catch (err: any) {
      console.error("Critical error fetching applications:", err);
      setIncomingApplications([]);
    }
  };

  const updateApplicationStatus = async (appId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', appId);

      if (error) throw error;

      toast({
        title: "Durum Güncellendi",
        description: `Başvuru ${status === 'accepted' ? 'onaylandı' : 'reddedildi'}.`
      });

      // Refresh applications
      const { data: { user } } = await supabase.auth.getUser();
      if (user) fetchApplications(user.id);

    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImage(reader.result as string);
        setShowCropper(true);
      });
      reader.readAsDataURL(e.target.files[0]);
      
      // Reset input value to allow re-selection of the same file
      e.target.value = "";
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const uploadCroppedImage = async () => {
    if (!image || !croppedAreaPixels) return;
    setUploading(true);

    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels) as Blob;
      const fileName = `event-${Date.now()}.jpg`;
      const filePath = `${fileName}`; // Doğrudan bucket içine atalım

      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(filePath, croppedBlob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl, image_position: 'center' });
      setShowCropper(false);
      setImage(null);
      toast({ title: "Başarılı", description: "Görsel yüklendi ve kırpıldı." });
    } catch (error: any) {
      toast({ title: "Hata", description: "Görsel yüklenemedi: " + error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      const slug = formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update({
            ...formData,
            slug,
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
        
        toast({
          title: "Başarılı",
          description: "Etkinlik başarıyla güncellendi.",
        });
      } else {
        const { error } = await supabase
          .from('events')
          .insert([{
            ...formData,
            slug,
            organizer_id: user.id,
            status: 'active'
          }]);

        if (error) {
          if (error.message.includes("category")) {
            throw new Error("Sistem hatası: 'category' sütunu veritabanında bulunamadı. Lütfen yöneticiye bildirin.");
          }
          throw error;
        }

        toast({
          title: "Başarılı",
          description: "Etkinliğiniz yayına alındı.",
        });
      }

      setShowAddForm(false);
      setEditingEvent(null);
      setFormData({
        organizer: "",
        title: "",
        description: "",
        date: "",
        location: "",
        image_url: "",
        image_position: "center",
        category: "Meetup",
      });
      fetchMyEvents(user.id);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: any) => {
    if (!confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return;
    
    setLoading(true);
    console.log("Deleting event with ID:", id);
    
    try {
      // Use .select() to see what was actually deleted
      const { data, error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }

      console.log("Deleted data:", data);

      if (!data || data.length === 0) {
        toast({
          title: "Uyarı",
          description: "Silinecek etkinlik bulunamadı veya yetkiniz yok.",
          variant: "destructive",
        });
        // We still filter local state just in case it's a UI desync
      } else {
        toast({ 
          title: "Silindi", 
          description: "Etkinlik başarıyla kaldırıldı.",
        });
      }

      // Update local state immediately with a loose or string-based check
      setMyEvents(prev => prev.filter(event => String(event.id) !== String(id)));
      
    } catch (error: any) {
      console.error("Delete handler error:", error);
      toast({
        title: "Hata",
        description: "Etkinlik silinirken bir sorun oluştu: " + (error.message || "Bilinmeyen hata"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (event: any) => {
    setEditingEvent(event);
    setFormData({
      organizer: event.organizer || "",
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      image_url: event.image_url || "",
      image_position: event.image_position || "center",
      category: event.category || "Meetup",
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isFounder) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1 uppercase tracking-wider">
                <LayoutDashboard className="w-4 h-4" />
                <span>Founder Paneli</span>
              </div>
              <h1 className="text-4xl font-display font-bold uppercase tracking-tighter">Kurucu Kontrol Merkezi</h1>
              <p className="text-muted-foreground mt-1">Etkinliklerinizi yönetin ve başvuruları değerlendirin.</p>
            </div>
            
            <Button 
              onClick={() => {
                if (showAddForm) {
                  setEditingEvent(null);
                  setFormData({
                    organizer: "",
                    title: "",
                    description: "",
                    date: "",
                    location: "",
                    image_url: "",
                    image_position: "center",
                    category: "Meetup",
                  });
                }
                setShowAddForm(!showAddForm);
              }}
              className="rounded-2xl h-12 px-6 bg-primary text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/20 transition-all"
            >
              {showAddForm ? "Vazgeç" : "Etkinlik Paylaş"}
              {!showAddForm && <Plus className="w-5 h-5 ml-2" />}
            </Button>
          </div>

          <div className="flex gap-4 mb-8">
            <Button 
                variant={activeTab === 'events' ? 'default' : 'outline'}
                onClick={() => setActiveTab('events')}
                className="rounded-xl"
            >
                Etkinliklerim ({myEvents.length})
            </Button>
            <Button 
                variant={activeTab === 'applications' ? 'default' : 'outline'}
                onClick={() => setActiveTab('applications')}
                className="rounded-xl relative"
            >
                Gelen Başvurular ({incomingApplications.length})
                {incomingApplications.some(a => a.status === 'evaluation') && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background"></span>
                )}
            </Button>
          </div>

          {activeTab === 'applications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 mb-20"
            >
              <div className="grid grid-cols-1 gap-4">
                {incomingApplications.map((app) => (
                  <Card key={app.id} className="glass border-border/50 rounded-3xl overflow-hidden hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {app.profiles?.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{app.profiles?.full_name || 'İsimsiz Kullanıcı'}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> {app.event_title}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                          {app.status === 'evaluation' ? (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => updateApplicationStatus(app.id, 'accepted')}
                                className="bg-green-500 hover:bg-green-600 text-white rounded-xl flex-1 md:flex-none"
                              >
                                <Check className="w-4 h-4 mr-1" /> Onayla
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => updateApplicationStatus(app.id, 'rejected')}
                                className="border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-xl flex-1 md:flex-none"
                              >
                                <X className="w-4 h-4 mr-1" /> Reddet
                              </Button>
                            </>
                          ) : (
                            <Badge className={cn(
                              "px-4 py-1.5 rounded-full border-none",
                              app.status === 'accepted' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            )}>
                              {app.status === 'accepted' ? 'Onaylandı' : 'Reddedildi'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {incomingApplications.length === 0 && (
                   <div className="text-center py-20 bg-secondary/5 rounded-3xl border-2 border-dashed border-border/50 opacity-50">
                     <p>Henüz bir başvuru almadınız.</p>
                   </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'events' && (
            <>
            {showAddForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Alanı */}
                <div className="lg:col-span-8">
                  <Card className="glass border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl h-full">
                <CardHeader className="bg-primary/5 p-8 border-b border-border/50">
                  <CardTitle className="text-2xl">{editingEvent ? "Etkinliği Güncelle" : "Etkinlik Detayları"}</CardTitle>
                  <CardDescription>Hedef kitlenizi heyecanlandıracak bilgileri girin.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold ml-1">Etkinlik Başlığı</Label>
                        <div className="relative group">
                          <LayoutDashboard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                          <Input 
                            placeholder="Örn: AI & Future Founders Meetup"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                            className="h-14 pl-12 rounded-[1.25rem] bg-secondary/10 border-white/5 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold ml-1">Şirket / Organizatör</Label>
                        <div className="relative group">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                          <Input 
                            placeholder="Örn: Startup Merkezi"
                            value={formData.organizer}
                            onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                            required
                            className="h-14 pl-12 rounded-[1.25rem] bg-secondary/10 border-white/5 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all font-medium"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold ml-1">Etkinlik Kategorisi</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="h-14 rounded-[1.25rem] bg-secondary/10 border-white/5 pl-12 focus:ring-primary/40 focus:border-primary/50 backdrop-blur-md transition-all hover:bg-secondary/20">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary z-10" />
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0F1117] border-white/10 text-foreground rounded-xl backdrop-blur-xl">
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id} className="focus:bg-primary/20 focus:text-primary transition-colors cursor-pointer">
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold ml-1">Kısa Açıklama</Label>
                      <Textarea 
                        placeholder="İnsanlar neden bu etkinliğe katılmalı? (Maks 300 karakter)"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                        maxLength={300}
                        className="rounded-2xl bg-secondary/20 border-border min-h-[120px] p-4 focus:ring-primary/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold ml-1">Etkinlik Tarihi</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-14 pl-12 rounded-[1.25rem] bg-secondary/10 border-white/5 text-left font-normal hover:bg-secondary/20 backdrop-blur-md transition-all",
                                !formData.date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary z-10" />
                              {formData.date ? (
                                format(new Date(formData.date), "PPP", { locale: tr })
                              ) : (
                                <span>Tarih seçin</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#0F1117] border-white/10 rounded-xl shadow-2xl backdrop-blur-2xl" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={formData.date ? new Date(formData.date) : undefined}
                              onSelect={(date) => setFormData({ ...formData, date: date ? format(date, "yyyy-MM-dd") : "" })}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                              locale={tr}
                              className="p-3"
                            />
                          </PopoverContent>
                        </Popover>
                        <p className="text-[10px] text-muted-foreground/60 ml-2 italic">Minimum seçim: Bugün</p>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold ml-1">Lokasyon / Link</Label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                          <Input 
                            placeholder="Örn: Ankara Bilkent"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            required
                            className="h-12 pl-12 rounded-2xl bg-secondary/20 border-border focus:ring-primary/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold ml-1">Kapak Görseli</Label>
                        <div className="flex gap-4">
                          <div className="relative flex-1">
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                            <Input 
                              placeholder="Görsel seçin veya URL girin"
                              value={formData.image_url}
                              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                              className="h-12 pl-12 rounded-2xl bg-secondary/20 border-border focus:ring-primary/20"
                            />
                          </div>
                          <div className="relative">
                            <input 
                              type="file" 
                              id="image-upload" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                            <Button 
                              type="button"
                              onClick={() => document.getElementById('image-upload')?.click()}
                              className="h-12 rounded-2xl bg-secondary/20 border-border border text-foreground hover:bg-secondary/30"
                              disabled={uploading}
                            >
                              {uploading ? "..." : <Upload className="w-5 h-5" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {formData.image_url && (
                        <div className="pt-2 animate-in fade-in duration-1000">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-primary/60 uppercase tracking-tighter bg-primary/5 p-2 rounded-xl border border-primary/10">
                            <ImageIcon className="w-3 h-3" />
                            İpucu: Sağdaki önizlemede fotoğrafı sürükleyerek açıyı ayarlayabilirsiniz.
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full h-14 rounded-2xl bg-primary text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                        disabled={loading}
                      >
                        {loading ? "Sistem Kaydediyor..." : (editingEvent ? "Değişiklikleri Kaydet" : "Etkinliği Canlıya Al")}
                        {!loading && <Send className="w-5 h-5 ml-2" />}
                      </Button>
                    </div>
                  </form>
                </CardContent>
                  </Card>
                </div>

                {/* Önizleme Alanı */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="sticky top-40">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                       <LayoutDashboard className="w-5 h-5 text-primary" />
                       Canlı Önizleme
                    </h3>
                    <Card className="glass border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl group transition-all duration-500 max-w-[350px] mx-auto">
                      <div className="relative h-48 cursor-move overflow-hidden group/img">
                        <motion.img 
                          key={formData.image_url}
                          src={formData.image_url || "https://images.unsplash.com/photo-1540575861501-7ad058637b5d?w=800"} 
                          alt="Önizleme"
                          className="w-full h-full object-cover pointer-events-none"
                          style={{ objectPosition: formData.image_position }}
                        />
                        {/* Drag Sensörü (Görünmez ama sürüklenebilir alan) */}
                        <motion.div 
                          drag
                          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                          dragElastic={0.6}
                          onDrag={(_, info) => {
                            // Mevcut pozisyonu al ve metin tabanlı değerleri sayıya çevir
                            let currentPos = formData.image_position || '50% 50%';
                            
                            // 'center', 'top', 'bottom' gibi eski değerleri sayıya çevirelim
                            if (currentPos === 'center') currentPos = '50% 50%';
                            if (currentPos === 'top') currentPos = '50% 0%';
                            if (currentPos === 'bottom') currentPos = '50% 100%';

                            const parts = currentPos.split(' ');
                            const currX = parseInt(parts[0]) || 50;
                            const currY = parseInt(parts[1] || parts[0]) || 50;
                            
                            // Hassasiyet ayarı: info.delta piksel cinsindendir
                            const newX = Math.max(0, Math.min(100, currX - (info.delta.x / 4)));
                            const newY = Math.max(0, Math.min(100, currY - (info.delta.y / 4)));
                            
                            setFormData({ ...formData, image_position: `${Math.round(newX)}% ${Math.round(newY)}%` });
                          }}
                          className="absolute inset-0 z-20"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60 pointer-events-none"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none">
                           <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest flex items-center gap-2">
                             <Plus className="w-3 h-3 rotate-45" /> Sürükleyerek Ayarla
                           </div>
                        </div>
                        <Badge className="absolute top-4 left-4 bg-primary/95 text-primary-foreground border-none font-bold py-0.5 px-3 rounded-full text-xs">
                          {categories.find(c => c.id === formData.category)?.label || "Kategori"}
                        </Badge>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-3 line-clamp-1">{formData.title || "Etkinlik Başlığı"}</h3>
                        <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <Building2 className="w-3 h-3" />
                          {formData.organizer || "Fırsat Pusulası"}
                        </p>
                        <div className="space-y-2 mb-4 text-xs font-medium">
                          <div className="flex items-center gap-2 text-muted-foreground bg-secondary/10 p-1.5 rounded-lg">
                            <CalendarIcon className="w-3.5 h-3.5 text-primary" /> 
                            {formData.date ? new Date(formData.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Tarih Seçilmedi"}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground bg-secondary/10 p-1.5 rounded-lg">
                            <MapPin className="w-3.5 h-3.5 text-primary" /> 
                            {formData.location || "Lokasyon Belirtilmedi"}
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 italic">
                          {formData.description || "Açıklama alanı..."}
                        </p>
                      </CardContent>
                    </Card>
                    <p className="text-xs text-center text-muted-foreground mt-4 italic opacity-60">
                      * Kartınız ekosistemde tam olarak bu şekilde görünecektir.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            )}

          {/* Cropper Modal */}
          {showCropper && image && (
            <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
              <div className="relative w-full max-w-2xl bg-secondary/20 rounded-3xl overflow-hidden border border-white/10 shadow-3xl flex flex-col" style={{ height: '70vh' }}>
                <div className="p-6 flex justify-between items-center border-b border-white/5">
                  <h3 className="text-xl font-bold">Görselin Açısını Ayarlayın</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowCropper(false)}>
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                
                <div className="relative flex-1 grayscale-[0.5]">
                  <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={16 / 9}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold opacity-60 uppercase tracking-widest flex justify-between">
                      Zoom Seviyesi <span>{Math.round(zoom * 100)}%</span>
                    </Label>
                    <Slider
                      value={[zoom]}
                      min={1}
                      max={3}
                      step={0.1}
                      onValueChange={(value) => setZoom(value[0])}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setShowCropper(false)}
                      variant="outline"
                      className="flex-1 h-14 rounded-2xl border-white/10"
                    >
                      İptal
                    </Button>
                    <Button 
                      onClick={uploadCroppedImage}
                      className="flex-1 h-14 rounded-2xl bg-primary font-bold shadow-xl shadow-primary/20"
                      disabled={uploading}
                    >
                      {uploading ? "Kaydediliyor..." : "Bu Açıyı Kaydet"}
                      {!uploading && <Check className="w-5 h-5 ml-2" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-10">
            <h2 className="text-2xl font-bold font-display flex items-center gap-3 uppercase tracking-tighter">
              <div className="w-2 h-8 bg-primary rounded-full"></div>
              Yönettiğiniz Etkinlikler
            </h2>
            
            {myEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myEvents.map((event) => (
                  <Card key={event.id} className="glass border-border/50 rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <div className="relative h-56">
                      <img 
                        src={event.image_url || "https://images.unsplash.com/photo-1540575861501-7ad058637b5d?w=800"} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        style={{ objectPosition: event.image_position || 'center' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60"></div>
                      <Badge className="absolute top-6 left-6 bg-primary/95 text-primary-foreground border-none font-bold py-1 px-4 rounded-full shadow-lg">
                        {categories.find(c => c.id === event.category)?.label || event.category || "Etkinlik"}
                      </Badge>
                    </div>
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold mb-1 line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h3>
                      <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mb-4 flex items-center gap-1.5 opacity-80">
                        <Building2 className="w-3 h-3" />
                        {event.organizer || "Fırsat Pusulası"}
                      </p>
                      <div className="space-y-3 mb-8 text-sm font-medium">
                        <div className="flex items-center gap-3 text-muted-foreground bg-secondary/10 p-2 rounded-xl">
                          <CalendarIcon className="w-4 h-4 text-primary" /> {new Date(event.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground bg-secondary/10 p-2 rounded-xl">
                          <MapPin className="w-4 h-4 text-primary" /> {event.location}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => startEditing(event)}
                          className="flex-1 h-12 rounded-xl border-border hover:bg-primary/5"
                        >
                          Düzenle
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => deleteEvent(event.id)} 
                          className="w-12 h-12 rounded-xl border-border text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-secondary/5 rounded-[4rem] border-2 border-dashed border-border/50">
                <CalendarIcon className="w-16 h-16 mx-auto mb-6 opacity-10" />
                <h3 className="text-xl font-bold opacity-40">Henüz bir etkinlik paylaşmadınız</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Yeni bir etkinlik ekleyerek ekosisteme katkıda bulunmaya başlayın.</p>
              </div>
            )}
          </div>
          </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FounderDashboard;
