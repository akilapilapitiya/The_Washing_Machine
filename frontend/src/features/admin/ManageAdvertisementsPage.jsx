import React, { useState, useEffect, useContext } from "react";
import { useAuth } from "../../contexts/AuthContext";
import advertisementService from "../../services/advertisement.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit2, X, Calendar, User, Phone } from "lucide-react";
import { toast } from "sonner";

const ManageAdvertisementsPage = () => {
  const { user } = useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    client_contact: "",
    expiry_date: "",
    image: null,
  });

  const fetchAds = async () => {
    try {
      const response = await advertisementService.getAdminAds(user.token);
      setAds(response.data);
    } catch (error) {
      toast.error("Failed to fetch advertisements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("client_name", formData.client_name);
    data.append("client_contact", formData.client_contact);
    if (formData.expiry_date) data.append("expiry_date", formData.expiry_date);
    if (formData.image) data.append("image", formData.image);

    try {
      if (editingAd) {
        await advertisementService.updateAd(editingAd.id, data, user.token);
        toast.success("Advertisement updated successfully");
      } else {
        await advertisementService.createAd(data, user.token);
        toast.success("Advertisement created successfully");
      }
      setIsModalOpen(false);
      setEditingAd(null);
      setFormData({ title: "", client_name: "", client_contact: "", expiry_date: "", image: null });
      fetchAds();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save advertisement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this advertisement?")) {
      try {
        await advertisementService.deleteAd(id, user.token);
        toast.success("Advertisement deleted");
        fetchAds();
      } catch (error) {
        toast.error("Failed to delete advertisement");
      }
    }
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      client_name: ad.client_name || "",
      client_contact: ad.client_contact || "",
      expiry_date: ad.expiry_date ? ad.expiry_date.split("T")[0] : "",
      image: null,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Advertisements</h1>
        <Button onClick={() => { setEditingAd(null); setIsModalOpen(true); }} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" /> Add New Ad
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <Card key={ad.id} className="overflow-hidden border-zinc-800 bg-zinc-900 text-white">
              <div className="h-48 overflow-hidden bg-zinc-800">
                <img 
                  src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${ad.image_url}`} 
                  alt={ad.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-2">{ad.title}</h3>
                <div className="space-y-1 text-sm text-zinc-400">
                  <p className="flex items-center"><User className="w-3 h-3 mr-2" /> {ad.client_name || "N/A"}</p>
                  <p className="flex items-center"><Phone className="w-3 h-3 mr-2" /> {ad.client_contact || "N/A"}</p>
                  <p className="flex items-center"><Calendar className="w-3 h-3 mr-2" /> Expires: {ad.expiry_date ? new Date(ad.expiry_date).toLocaleDateString() : "Never"}</p>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(ad)} className="border-zinc-700 hover:bg-zinc-800">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(ad.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg bg-zinc-900 text-white border-zinc-800">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>{editingAd ? "Edit Advertisement" : "Add New Advertisement"}</CardTitle>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required className="bg-zinc-800 border-zinc-700" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client Name</Label>
                    <Input id="client_name" name="client_name" value={formData.client_name} onChange={handleInputChange} className="bg-zinc-800 border-zinc-700" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_contact">Contact Number</Label>
                    <Input id="client_contact" name="client_contact" value={formData.client_contact} onChange={handleInputChange} className="bg-zinc-800 border-zinc-700" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input id="expiry_date" name="expiry_date" type="date" value={formData.expiry_date} onChange={handleInputChange} className="bg-zinc-800 border-zinc-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image File</Label>
                  <Input id="image" type="file" onChange={handleFileChange} required={!editingAd} className="bg-zinc-800 border-zinc-700" />
                </div>
                <div className="pt-4">
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700"> {editingAd ? "Update Ad" : "Save Ad"} </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageAdvertisementsPage;
