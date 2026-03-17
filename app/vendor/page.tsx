"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase'; // Imeunganishwa na Database yetu halisi

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'add' | 'inquiries'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Takwimu (Baadaye tutazivuta kwa hesabu kutoka Database)
  const [stats, setStats] = useState({
    totalCars: 0,
    totalViews: 3450,
    wishlisted: 128,
    newInquiries: 5
  });

  // Data halisi kutoka Database
  const [myInventory, setMyInventory] = useState<any[]>([]);

  // Fomu ya Gari Jipya
  const [newCar, setNewCar] = useState({ stockId: '', title: '', year: '', trans: 'Auto', km: '', fob: '', cif: '', img: '', tag: 'NEW' });
  const [carFile, setCarFile] = useState<File | null>(null);

  // ==========================================
  // 1. VUTA MAGARI KUTOKA SUPABASE (FETCH DATA)
  // ==========================================
  useEffect(() => {
    fetchMyInventory();
  }, []);

  const fetchMyInventory = async () => {
    setLoading(true);
    try {
      // Tunavuta magari yote kutoka kwenye table ya 'vehicles'
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Tunabadili muundo wa data ili uendane na UI yetu
        const formattedCars = data.map(car => ({
          id: car.id,
          stockId: car.stock_id,
          title: `${car.make} ${car.model}`,
          year: car.year,
          price: `$${car.fob_price}`,
          views: Math.floor(Math.random() * 500) + 50, // Mfano wa views
          likes: Math.floor(Math.random() * 20),       // Mfano wa likes
          status: car.tag === 'NONE' ? 'Available' : car.tag,
          img: car.location // Tunatumia column ya location kuhifadhi picha kwa sasa
        }));

        setMyInventory(formattedCars);
        setStats(prev => ({ ...prev, totalCars: formattedCars.length }));
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 2. WEKA PICHA KWENYE FOMU (PREVIEW)
  // ==========================================
  const handleAdminPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCarFile(file);
      setNewCar({ ...newCar, img: URL.createObjectURL(file) });
    }
  };

  // ==========================================
  // 3. TUMA GARI JIPYA SUPABASE (INSERT DATA)
  // ==========================================
  const submitNewCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCar.title || !carFile) return alert("Tafadhali weka jina la gari na picha!");
    
    setUploading(true);
    try {
      // A) Pakia picha kwenye Supabase Storage (car-images)
      const fileExt = carFile.name.split('.').pop();
      const uniqueFileName = `${Math.random()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(`public/${uniqueFileName}`, carFile);

      let finalImageUrl = newCar.img; 
      
      if (!uploadError && uploadData) {
        // Vuta Link ya moja kwa moja ya picha (Public URL)
        const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(`public/${uniqueFileName}`);
        finalImageUrl = publicUrl;
      }

      // B) Ingiza taarifa za gari kwenye Database (vehicles table)
      const parts = newCar.title.split(' ');
      const make = parts[0];
      const model = parts.slice(1).join(' ');

      const { data: insertedCar, error: dbError } = await supabase.from('vehicles').insert([
        {
          stock_id: newCar.stockId || `GH-${Math.floor(Math.random() * 10000)}`,
          make: make || 'Unknown',
          model: model || 'Unknown',
          year: parseInt(newCar.year) || 2015,
          transmission: newCar.trans,
          mileage: newCar.km,
          fob_price: parseFloat(newCar.fob.replace(/[^0-9.-]+/g,"")) || 0,
          cif_price: parseFloat(newCar.cif.replace(/[^0-9.-]+/g,"")) || 0,
          location: finalImageUrl, 
          tag: newCar.tag === 'Available' ? 'NONE' : newCar.tag
        }
      ]).select();

      if (dbError) throw dbError;

      alert("Gari limepakiwa kikamilifu kwenye Kanzidata (Database)!");
      
      // Safisha fomu na vuta upya magari kuonyesha gari jipya
      setNewCar({ stockId: '', title: '', year: '', trans: 'Auto', km: '', fob: '', cif: '', img: '', tag: 'NEW' });
      setCarFile(null);
      setActiveTab('inventory'); // Mrudishe kwenye orodha
      fetchMyInventory();

    } catch (error) {
      console.error("Error saving car:", error);
      alert("Kuna tatizo limejitokeza. Hakikisha umeweka Database vizuri.");
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // 4. FUTA GARI KUTOKA SUPABASE (DELETE DATA)
  // ==========================================
  const deleteCar = async (id: string) => {
    if (!window.confirm("Una uhakika unataka kufuta gari hili kabisa kwenye mfumo?")) return;
    
    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;
      
      // Ondoa kwenye UI baada ya kufuta Database
      setMyInventory(myInventory.filter(car => car.id !== id));
      setStats(prev => ({ ...prev, totalCars: prev.totalCars - 1 }));
    } catch (error) {
      console.error("Kosa wakati wa kufuta:", error);
    }
  };

  // MOCK DATA: Ujumbe kutoka kwa wateja (Inquiries)
  const inquiries = [
    { id: 1, car: "Mercedes C200", customer: "John Doe", phone: "+255 712 345 678", date: "2 Hours ago", status: "New" },
    { id: 2, car: "Subaru Forester", customer: "Asha Juma", phone: "+255 754 111 222", date: "1 Day ago", status: "Contacted" }
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- SIDEBAR (Left Navigation) --- */}
      <div className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <span className="text-2xl font-extrabold text-blue-500 tracking-tight">
            Gari<span className="text-white">Hub</span>
          </span>
          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">DEALER</span>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-lg">BM</div>
            <div>
              <p className="font-bold text-sm">B-Tech Motors</p>
              <p className="text-xs text-gray-400">Kariakoo, Dar</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('inventory')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'inventory' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            🚘 My Inventory
          </button>
          <button 
            onClick={() => setActiveTab('add')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'add' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            ➕ Post New Car
          </button>
          <button 
            onClick={() => setActiveTab('inquiries')} 
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeTab === 'inquiries' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">💬 Inquiries</div>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{stats.newInquiries}</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors">
            🌍 View Live Website
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors mt-2">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
          <h2 className="text-xl font-bold text-gray-800 capitalize">
            {activeTab === 'dashboard' ? 'Vendor Dashboard' : activeTab === 'inventory' ? 'Manage Inventory' : activeTab === 'add' ? 'Post a New Vehicle' : 'Customer Inquiries'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors">
              🔔
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* 1. DASHBOARD OVERVIEW TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                  <span className="text-gray-500 text-sm font-bold mb-2">Total Active Cars</span>
                  <span className="text-3xl font-black text-gray-900">{loading ? '...' : stats.totalCars}</span>
                  <span className="text-xs text-green-500 font-bold mt-2">Live on Website</span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                  <span className="text-gray-500 text-sm font-bold mb-2">Total Profile Views</span>
                  <span className="text-3xl font-black text-blue-600">{stats.totalViews.toLocaleString()}</span>
                  <span className="text-xs text-green-500 font-bold mt-2">↑ 15% vs last month</span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                  <span className="text-gray-500 text-sm font-bold mb-2">Saved to Wishlist (❤️)</span>
                  <span className="text-3xl font-black text-red-500">{stats.wishlisted}</span>
                  <span className="text-xs text-gray-400 mt-2">High potential buyers</span>
                </div>
                <div className="bg-blue-600 p-6 rounded-xl shadow-md text-white flex flex-col justify-center items-center cursor-pointer hover:bg-blue-700 transition-colors" onClick={() => setActiveTab('inquiries')}>
                  <span className="text-4xl font-black mb-1">{stats.newInquiries}</span>
                  <span className="text-sm font-bold text-blue-100">New Inquiries</span>
                  <span className="text-xs bg-white text-blue-600 px-2 py-1 rounded mt-2 font-bold">View Messages ➔</span>
                </div>
              </div>

              {/* Quick Actions & Recent */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900 text-lg">Recently Added Cars</h3>
                    <button onClick={() => setActiveTab('inventory')} className="text-sm text-blue-600 font-bold hover:underline">View All</button>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-10 text-gray-400">Inavuta data kutoka Supabase...</div>
                  ) : myInventory.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">Hujapakia gari lolote.</div>
                  ) : (
                    <div className="space-y-4">
                      {myInventory.slice(0,3).map(car => (
                        <div key={car.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <img src={car.img} alt={car.title} className="w-16 h-12 object-cover rounded border border-gray-200" />
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{car.title}</p>
                              <p className="text-xs text-gray-500">{car.stockId} • {car.price}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-blue-600">{car.views} Views</p>
                            <p className="text-xs text-gray-400">❤️ {car.likes} Saves</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-md p-6 text-white flex flex-col justify-center relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="font-extrabold text-xl mb-2">Boost Your Sales 🚀</h3>
                    <p className="text-gray-300 text-sm mb-6">Get your cars on the Homepage by upgrading to Premium Dealer Status.</p>
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all">
                      Upgrade Account
                    </button>
                  </div>
                  <div className="absolute -bottom-10 -right-10 text-9xl opacity-10">🚘</div>
                </div>
              </div>
            </div>
          )}

          {/* 2. INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <input type="text" placeholder="🔍 Search by Make, Model or Stock ID..." className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-sm" />
                <button onClick={() => setActiveTab('add')} className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-black transition-colors">
                  ➕ Add New Car
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 border-b">Vehicle</th>
                      <th className="p-4 border-b">Stock ID</th>
                      <th className="p-4 border-b">Price (FOB)</th>
                      <th className="p-4 border-b">Status</th>
                      <th className="p-4 border-b text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {loading ? (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-400">Inavuta Data...</td></tr>
                    ) : myInventory.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-400">Hakuna magari kwenye Kanzidata yako.</td></tr>
                    ) : (
                      myInventory.map(car => (
                        <tr key={car.id} className="border-b border-gray-50 hover:bg-blue-50 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img src={car.img} alt={car.title} className="w-12 h-10 object-cover rounded border border-gray-200" />
                            <div>
                              <p className="font-bold text-gray-900">{car.title}</p>
                              <p className="text-xs text-gray-500">Year: {car.year}</p>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-gray-600 text-xs">{car.stockId}</td>
                          <td className="p-4 font-bold text-gray-800">{car.price}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${car.status === 'Available' || car.status === 'NONE' ? 'bg-green-100 text-green-700' : car.status === 'HOT' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'}`}>
                              {car.status === 'NONE' ? 'Available' : car.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button className="text-xs font-bold text-gray-500 hover:text-blue-600 px-2 py-1 border border-gray-200 rounded">Edit</button>
                            <button onClick={() => deleteCar(car.id)} className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 border border-red-100 rounded">Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. ADD NEW CAR TAB */}
          {activeTab === 'add' && (
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-2xl font-extrabold text-gray-900 mb-6 border-b pb-4">Vehicle Details</h3>
              <form onSubmit={submitNewCar} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Photo Upload Area */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Upload Vehicle Photo</label>
                  <label className="border-2 border-dashed border-blue-200 rounded-xl p-10 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer relative overflow-hidden">
                    {newCar.img ? (
                      <img src={newCar.img} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    ) : (
                      <>
                        <span className="text-4xl mb-2">📸</span>
                        <p className="text-blue-800 font-bold text-sm">Click to upload image</p>
                        <p className="text-xs text-blue-500 mt-1">JPG, PNG (max. 5MB)</p>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleAdminPhotoUpload} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Make & Model</label>
                  <input type="text" value={newCar.title} onChange={(e) => setNewCar({...newCar, title: e.target.value})} placeholder="e.g. Toyota Land Cruiser" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 bg-gray-50" required />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Stock Reference ID</label>
                  <input type="text" value={newCar.stockId} onChange={(e) => setNewCar({...newCar, stockId: e.target.value})} placeholder="e.g. GH-1001" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 bg-gray-50 font-mono" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Year of Manufacture</label>
                  <input type="number" value={newCar.year} onChange={(e) => setNewCar({...newCar, year: e.target.value})} placeholder="2018" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 bg-gray-50" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mileage (Km)</label>
                  <input type="text" value={newCar.km} onChange={(e) => setNewCar({...newCar, km: e.target.value})} placeholder="e.g. 45,000 km" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 bg-gray-50" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Transmission</label>
                  <select value={newCar.trans} onChange={(e) => setNewCar({...newCar, trans: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 bg-gray-50">
                    <option>Automatic</option><option>Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Sales Label (Tag)</label>
                  <select value={newCar.tag} onChange={(e) => setNewCar({...newCar, tag: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 bg-gray-50">
                    <option value="NONE">Available</option><option value="NEW">NEW</option><option value="HOT">HOT</option><option value="SOLD">SOLD</option>
                  </select>
                </div>

                <div className="md:col-span-2 border-t pt-6 mt-2">
                  <h4 className="font-bold text-gray-900 mb-4">Pricing Information</h4>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">FOB Price (USD $)</label>
                  <input type="text" value={newCar.fob} onChange={(e) => setNewCar({...newCar, fob: e.target.value})} placeholder="e.g. 15000" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 bg-gray-50" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Estimated CIF Dar ($)</label>
                  <input type="text" value={newCar.cif} onChange={(e) => setNewCar({...newCar, cif: e.target.value})} placeholder="e.g. 17500" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 bg-gray-50" />
                </div>

                <div className="md:col-span-2 flex gap-4 mt-6">
                  <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md w-full md:w-auto">
                    {uploading ? 'Inapakia (Uploading)...' : '🚀 Publish Vehicle'}
                  </button>
                  <button type="button" onClick={() => setActiveTab('inventory')} className="bg-white text-gray-700 border border-gray-300 px-8 py-4 rounded-lg font-bold hover:bg-gray-50 transition-colors w-full md:w-auto">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 4. INQUIRIES TAB */}
          {activeTab === 'inquiries' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-blue-50">
                <h3 className="font-extrabold text-blue-900">Customer Messages & Leads</h3>
                <p className="text-sm text-blue-700">Follow up with potential buyers quickly to close sales.</p>
              </div>
              <div className="divide-y divide-gray-100">
                {inquiries.map(inq => (
                  <div key={inq.id} className="p-6 hover:bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">{inq.customer}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inq.status === 'New' ? 'bg-red-100 text-red-600' : inq.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {inq.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Inquiring about: <span className="font-bold text-blue-600 cursor-pointer hover:underline">{inq.car}</span></p>
                      <p className="text-xs text-gray-400 mt-1">🕒 Received: {inq.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <a href={`tel:${inq.phone}`} className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
                        📞 Call: {inq.phone}
                      </a>
                      <button className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                        Mark as Contacted
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}