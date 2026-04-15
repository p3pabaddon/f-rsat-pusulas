import { useState, useEffect } from "react";
import { eventsService } from "@/services/eventsService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Edit, Calendar, MapPin, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    city: "",
    location: "",
    category_id: "etkinlik",
    image_url: "",
    organizer: "",
    is_online: false,
    is_free: true,
    is_featured: false
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await eventsService.getAllEvents();
      setEvents(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Basic slug generation
      const slug = formData.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
      
      const { error } = await eventsService.createEvent({
        ...formData,
        slug
      } as any);

      if (error) throw error;

      toast({ title: "Başarılı", description: "Etkinlik oluşturuldu." });
      setShowAddForm(false);
      fetchEvents();
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return;
    try {
      const { error } = await eventsService.deleteEvent(id);
      if (error) throw error;
      toast({ title: "Silindi" });
      fetchEvents();
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> 
          Etkinlik Yönetimi
          <Badge variant="outline" className="ml-2 bg-primary/5 border-primary/20">{events.length}</Badge>
        </h2>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="rounded-xl">
          {showAddForm ? "İptal" : <><Plus className="w-4 h-4 mr-2" /> Yeni Etkinlik</>}
        </Button>
      </div>

      {showAddForm && (
        <Card className="glass border-primary/20 rounded-[2rem] overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Etkinlik Başlığı</label>
                <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tarih</label>
                <Input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Şehir</label>
                <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <select 
                  className="w-full bg-secondary border-none rounded-md px-3 py-2"
                  value={formData.category_id}
                  onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="etkinlik">Etkinlik</option>
                  <option value="yatirimci">Yatırımcı Programı</option>
                  <option value="hizlandirici">Hızlandırıcı</option>
                  <option value="yarisma">Yarışma</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Açıklama</label>
                <Textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Görsel URL</label>
                <Input value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Organizatör</label>
                <Input value={formData.organizer} onChange={e => setFormData({ ...formData, organizer: e.target.value })} />
              </div>
              <div className="flex gap-4 items-center pt-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.is_online} onChange={e => setFormData({ ...formData, is_online: e.target.checked })} />
                  Online
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.is_free} onChange={e => setFormData({ ...formData, is_free: e.target.checked })} />
                  Ücretsiz
                </label>
                <label className="flex items-center gap-2 text-sm text-primary font-bold">
                  <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} />
                  Öne Çıkar
                </label>
              </div>
              <div className="md:col-span-2 pt-4">
                <Button type="submit" className="w-full rounded-xl h-12">Yayınla</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="glass border-border/50 hover:border-primary/50 transition-all rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">{event.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.city}</span>
                    <Badge variant="outline" className="text-[10px]">{event.category_id}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)} className="h-8 w-8 p-0 rounded-full text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
