import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  Shield,
  Briefcase,
  Mail,
  Phone,
  Database,
  AlertTriangle,
  RefreshCw,
  Server,
  MapPin,
  Building2,
  UserPlus,
  Rocket,
  Plus,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminEvents } from "@/components/admin/AdminEvents";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [founderApps, setFounderApps] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const ADMIN_EMAILS = [
    'mertmaylay054@gmail.com'
  ];

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/giris");
        return;
      }

      const email = session.user.email?.toLowerCase();
      const isSuperAdmin = email && ADMIN_EMAILS.includes(email);
      
      if (isSuperAdmin) {
        setIsAdmin(true);
        loadAllData();
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.role === 'admin') {
          setIsAdmin(true);
          loadAllData();
        } else {
          toast({
            title: "Yetkisiz Erişim",
            description: "Bu sayfa sadece sistem yöneticilerine özeldir.",
            variant: "destructive"
          });
          navigate("/");
        }
      }
      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  const loadAllData = () => {
    fetchApplications();
    fetchFounderApplications();
    fetchUsers();
  };

  const fetchApplications = async () => {
    // Try Applications (uppercase) first
    let { data: apps, error: appsError } = await supabase
      .from('Applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (appsError) {
      console.error("Error fetching Applications (upper), trying applications (lower):", appsError);
      // Fallback
      const { data: fallbackApps, error: fallbackError } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fallbackError) {
        console.error("Error fetching applications (lower):", fallbackError);
        setApplications([]);
        return;
      }
      apps = fallbackApps;
    }

    const { data: events } = await supabase.from('events').select('slug, title, organizer_id');
    const { data: profiles } = await supabase.from('profiles').select('id, full_name');

    const enrichedApps = (apps || []).map(app => {
      const event = events?.find(e => e.slug === app.event_slug);
      const organizer = event ? profiles?.find(p => p.id === event.organizer_id) : null;
      return {
        ...app,
        event_title: event?.title || app.event_slug,
        organizer_name: organizer?.full_name || "Bilinmiyor",
        is_founder_event: !!event
      };
    });

    setApplications(enrichedApps);
  };

  const fetchFounderApplications = async () => {
    const { data, error } = await supabase
      .from('founder_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setFounderApps(data || []);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setAllUsers(data || []);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    
    if (error) {
      toast({ title: "Hata", description: "Rol güncellenemedi.", variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Kullanıcı rolü güncellendi." });
      fetchUsers();
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    
    // Auth'dan silmek için edge function gerekebilir ama profile tablosundan kaldırabiliriz 
    // veya role: 'banned' yapabiliriz. Şimdilik role: 'user' yapıp kısıtlayalım veya direkt silelim.
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    
    if (error) {
      toast({ title: "Hata", description: "Kullanıcı silinemedi.", variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Kullanıcı profil kaydı silindi." });
      fetchUsers();
    }
  };

  const updateStatus = async (id: string, status: string, table: string = 'applications') => {
    const { error: statusError } = await supabase
      .from(table)
      .update({ status })
      .eq('id', id);

    if (statusError) {
      toast({
        title: "Hata",
        description: "Durum güncellenemedi: " + statusError.message,
        variant: "destructive"
      });
      return;
    }

    if (table === 'founder_applications' && status === 'approved') {
      const app = founderApps.find(a => a.id === id);
      if (app && app.user_id) {
        await supabase
          .from('profiles')
          .update({ role: 'founder' })
          .eq('id', app.user_id);
      }
    }

    toast({
      title: "Başarılı",
      description: status === 'approved' ? "Başvuru onaylandı." : "Durum güncellendi.",
    });
    
    if (table === 'applications') fetchApplications();
    else fetchFounderApplications();
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.venture_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.organizer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-none px-3 py-1"><Clock className="w-3 h-3 mr-1" /> Bekliyor</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none px-3 py-1"><CheckCircle className="w-3 h-3 mr-1" /> Onaylandı</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-none px-3 py-1"><XCircle className="w-3 h-3 mr-1" /> Reddedildi</Badge>;
      case 'evaluation':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-none px-3 py-1"><Search className="w-3 h-3 mr-1" /> İnceleniyor</Badge>;
      default:
        return <Badge variant="secondary" className="px-3 py-1">{status}</Badge>;
    }
  };

  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1 uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Site Sahibi Paneli</span>
              </div>
              <h1 className="text-3xl font-display font-bold uppercase tracking-tighter">Sistem Denetim Merkezi</h1>
              <p className="text-muted-foreground mt-1">Tüm kullanıcıları, kurucuları ve başvuruları buradan denetleyin.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-xl border-amber-500/20 text-amber-500 hover:bg-amber-500/10 h-10 px-4"
                onClick={() => {
                  const sql = "ALTER TABLE events ADD COLUMN IF NOT EXISTS category text DEFAULT 'Etkinlik'; ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer text;";
                  navigator.clipboard.writeText(sql);
                  toast({
                    title: "SQL Tamir Kodu Kopyalandı",
                    description: "Supabase Panel > SQL Editor kısmına yapıştırıp çalıştırın.",
                  });
                }}
              >
                <Database className="w-4 h-4 mr-2" />
                DB Tamir
              </Button>

              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Kullanıcı veya başvuru ara..." 
                  className="pl-10 rounded-xl bg-secondary/50 border-none h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="bg-secondary/30 p-1 rounded-2xl mb-8 border border-border/50">
              <TabsTrigger value="applications" className="rounded-xl px-6 py-2">
                <FileText className="w-4 h-4 mr-2" /> Başvuru Havuzu
              </TabsTrigger>
              <TabsTrigger value="founders" className="rounded-xl px-6 py-2">
                <UserPlus className="w-4 h-4 mr-2" /> Founder Adayları
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-xl px-6 py-2">
                <Users className="w-4 h-4 mr-2" /> Kullanıcı Denetimi
              </TabsTrigger>
              <TabsTrigger value="events" className="rounded-xl px-6 py-2">
                <Calendar className="w-4 h-4 mr-2" /> Etkinlik Yönetimi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="applications">
              <div className="grid gap-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-primary" /> 
                    Global Etkinlik Başvuruları
                    <Badge variant="outline" className="ml-2 bg-primary/5 border-primary/20">{filteredApplications.length}</Badge>
                  </h2>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <Filter className="w-3 h-3 mr-2" /> {statusFilter === "all" ? "Tümü" : statusFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass border-border rounded-xl w-48">
                      <DropdownMenuItem onClick={() => setStatusFilter("all")}>Tümü</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Bekleyenler</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("approved")}>Onaylananlar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {filteredApplications.map((app) => (
                  <Card key={app.id} className="glass border-border/50 hover:border-primary/50 transition-all rounded-[2rem] overflow-hidden group">
                    <CardContent className="p-8">
                      <div className="flex flex-col lg:flex-row justify-between gap-8">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                              <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="font-bold text-xl">{app.event_title}</h3>
                                {getStatusBadge(app.status)}
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="text-primary font-bold">Kurucu: {app.organizer_name}</span>
                                <span>&bull;</span>
                                <span>Aday: {app.full_name}</span>
                              </p>
                            </div>
                          </div>

                          <div className="bg-secondary/30 p-6 rounded-2xl border border-white/5">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Adayın Açıklaması</h4>
                            <p className="text-sm text-foreground/80 leading-relaxed">{app.description}</p>
                          </div>

                          <div className="flex flex-wrap gap-4 pt-2">
                             <span className="flex items-center gap-2 text-xs bg-background/50 px-4 py-2 rounded-full border border-border">
                               <Mail className="w-3 h-3" /> {app.email}
                             </span>
                             <span className="flex items-center gap-2 text-xs bg-secondary/50 px-4 py-2 rounded-full border border-border">
                               <Clock className="w-3 h-3" /> {new Date(app.created_at).toLocaleDateString()}
                             </span>
                          </div>
                        </div>
                        <div className="flex lg:flex-col items-center justify-center gap-3 min-w-[140px]">
                          <p className="text-[10px] text-muted-foreground text-center mb-1 uppercase tracking-widest font-bold">Denetim İşlemi</p>
                          <Button 
                            className="w-full bg-green-500 hover:bg-green-600 rounded-xl h-10 font-bold" 
                            onClick={() => updateStatus(app.id, 'approved')}
                          >
                            Denetçi Onayı
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl h-10"
                            onClick={() => updateStatus(app.id, 'rejected')}
                          >
                            Reddet
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="founders">
              <div className="grid gap-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" /> 
                    Yeni Founder Talepleri
                    <Badge variant="outline" className="ml-2 bg-primary/5 border-primary/20">{founderApps.length}</Badge>
                  </h2>
                </div>
                {founderApps.map((app) => (
                  <Card key={app.id} className="glass border-border/50 hover:border-primary/50 transition-all rounded-[2rem] overflow-hidden group">
                    <CardContent className="p-8">
                      <div className="flex flex-col lg:flex-row justify-between gap-8">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase">
                              {app.full_name?.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="font-bold text-xl uppercase tracking-tighter">
                                  {app.full_name}
                                </h3>
                                {getStatusBadge(app.status)}
                              </div>
                              <p className="text-sm text-primary font-medium">{app.venture_name}</p>
                            </div>
                          </div>
                          
                          <div className="bg-secondary/50 p-6 rounded-2xl border border-white/5 relative">
                             <div className="absolute top-0 right-4 -translate-y-1/2 bg-background px-3 py-1 rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border">
                               Vizyon & Tecrübe
                             </div>
                             <p className="text-sm leading-relaxed text-muted-foreground italic">"{app.event_description}"</p>
                          </div>
                        </div>
                        <div className="flex lg:flex-col items-center justify-center gap-3 min-w-[140px]">
                          {app.status === 'pending' || app.status === 'evaluation' ? (
                            <>
                              <Button className="w-full bg-green-500 hover:bg-green-600 rounded-xl h-12 font-bold shadow-lg shadow-green-500/10" onClick={() => updateStatus(app.id, 'approved', 'founder_applications')}>Onayla</Button>
                              <Button variant="outline" className="w-full text-red-500 border-red-500/20 hover:bg-red-500/10 rounded-xl h-12 font-bold" onClick={() => updateStatus(app.id, 'rejected', 'founder_applications')}>Reddet</Button>
                            </>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => updateStatus(app.id, 'pending', 'founder_applications')} className="text-xs opacity-50 hover:opacity-100 h-10 px-6 rounded-xl">Sıfırla</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="grid gap-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" /> 
                    Kullanıcı & Founder Denetimi
                    <Badge variant="outline" className="ml-2 bg-primary/5 border-primary/20">{allUsers.length}</Badge>
                  </h2>
                </div>
                
                <Card className="glass border-border/50 rounded-[2rem] overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-secondary/30 text-muted-foreground">
                          <tr>
                            <th className="px-6 py-4">İsim</th>
                            <th className="px-6 py-4">E-posta</th>
                            <th className="px-6 py-4">Rol</th>
                            <th className="px-6 py-4">Kayıt</th>
                            <th className="px-6 py-4 text-right">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {allUsers.filter(u => 
                            u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                          ).map((user) => (
                            <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                              <td className="px-6 py-4 font-bold">{user.full_name}</td>
                              <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                              <td className="px-6 py-4">
                                <Badge variant={user.role === 'admin' ? 'default' : user.role === 'founder' ? 'secondary' : 'outline'} className="rounded-full">
                                  {user.role || 'user'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-xs text-muted-foreground">
                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                        <RefreshCw className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="glass">
                                      <DropdownMenuItem onClick={() => updateUserRole(user.id, 'user')}>User Yap</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => updateUserRole(user.id, 'founder')}>Founder Yap</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin')}>Denetçi (Admin) Yap</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 rounded-full text-red-500 hover:bg-red-500/10"
                                    onClick={() => deleteUser(user.id)}
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="events">
              <AdminEvents />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
