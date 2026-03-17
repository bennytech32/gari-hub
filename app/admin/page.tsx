"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'all-cars' | 'post-car' | 'trending' | 'inquiries' | 'users' | 'spares'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [allCars, setAllCars] = useState<any[]>([]);
  const [liveTrending, setLiveTrending] = useState<any[]>([]); 
  const [allInquiries, setAllInquiries] = useState<any[]>([]); 
  const [allSpares, setAllSpares] = useState<any[]>([]);

  // FOMU MPYA YA GARI (INA VIGEZO VIPYA NA FEATURES)
  const [newCar, setNewCar] = useState({ 
    stockId: '', title: '', year: '', trans: 'Auto', km: '', fob: '', cif: '', tag: 'NEW',
    engine_cc: '', color: '', seats: '', drive_system: '', features: ''
  });
  
  const [carFile, setCarFile] = useState<File | null>(null); 
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null); 

  const [newTrendingCar, setNewTrendingCar] = useState({ title: '', price: '', img: '' });
  const [trendingFile, setTrendingFile] = useState<File | null>(null);

  const [newSpare, setNewSpare] = useState({ name: '', category: 'ECU & Diagnostics', price: '', desc: '', tag: '' });
  const [spareFile, setSpareFile] = useState<File | null>(null);

  const [stats, setStats] = useState({
    totalCars: 0, vendorCars: 0, clientCars: 0, directImports: 0, totalLeads: 0 
  });

  useEffect(() => {
    fetchAllPlatformCars();
    fetchTrendingCars();
    fetchInquiries();
    fetchSpares();
  }, []);

  const fetchAllPlatformCars = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      if (data) {
        const formatted = data.map(car => ({
          id: car.id,
          stockId: car.stock_id,
          title: `${car.make} ${car.model}`,
          price: `$${car.fob_price?.toLocaleString() || 0}`,
          status: car.tag === 'NONE' ? 'Available' : car.tag,
          img: car.location,
          type: car.stock_id?.startsWith('C2C') ? 'Client' : car.stock_id?.startsWith('GH') ? 'GariHub (Direct)' : 'Vendor'
        }));

        setAllCars(formatted);
        setStats(prev => ({
          ...prev,
          totalCars: formatted.length,
          clientCars: formatted.filter(c => c.type === 'Client').length,
          directImports: formatted.filter(c => c.type === 'GariHub (Direct)').length,
          vendorCars: formatted.filter(c => c.type === 'Vendor').length
        }));
      }
    } catch (error) {
      console.error("Fetch Cars Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingCars = async () => {
    try {
      const { data, error } = await supabase.from('trending_cars').select('*').order('created_at', { ascending: false });
      if (data && !error) setLiveTrending(data);
    } catch (error) {}
  };

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        setAllInquiries(data);
        setStats(prev => ({ ...prev, totalLeads: data.length }));
      }
    } catch (error) {}
  };

  const fetchSpares = async () => {
    try {
      const { data, error } = await supabase.from('spares').select('*').order('created_at', { ascending: false });
      if (data && !error) setAllSpares(data);
    } catch (error) {}
  };

  // =====================================
  // POST DIRECT IMPORT CAR (YENYE GALLERY NA FEATURES)
  // =====================================
  const handleAdminPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCarFile(e.target.files[0]);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setGalleryFiles(e.target.files);
    }
  };

  const submitNewCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCar.title || !carFile) return alert("Weka picha kuu na jina la gari!");
    setUploading(true);
    try {
      const fileExt = carFile.name.split('.').pop();
      const uniqueFileName = `admin-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('car-images').upload(`public/${uniqueFileName}`, carFile);
      
      let finalImageUrl = '';
      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(`public/${uniqueFileName}`);
        finalImageUrl = publicUrl;
      }

      let galleryUrls: string[] = [];
      if (galleryFiles && galleryFiles.length > 0) {
        const uploadPromises = Array.from(galleryFiles).map(async (file) => {
          const gExt = file.name.split('.').pop();
          const gName = `gal-${Math.random()}.${gExt}`;
          const { data: gData } = await supabase.storage.from('car-images').upload(`public/${gName}`, file);
          if (gData) {
             return supabase.storage.from('car-images').getPublicUrl(`public/${gName}`).data.publicUrl;
          }
          return null;
        });
        const results = await Promise.all(uploadPromises);
        galleryUrls = results.filter(url => url !== null) as string[];
      }

      const parts = newCar.title.split(' ');
      const make = parts[0] || 'Unknown';
      const model = parts.slice(1).join(' ') || 'Unknown';
      const safeMileage = newCar.km.replace(/[^0-9]/g, "") || "0"; 

      const { error: dbError } = await supabase.from('vehicles').insert([{
        stock_id: newCar.stockId || `GH-${Math.floor(Math.random() * 10000)}`,
        make: make,
        model: model,
        year: parseInt(newCar.year) || 2015,
        transmission: newCar.trans,
        mileage: safeMileage,
        fob_price: parseFloat(newCar.fob.replace(/[^0-9.-]+/g,"")) || 0,
        cif_price: parseFloat(newCar.cif.replace(/[^0-9.-]+/g,"")) || 0,
        location: finalImageUrl, 
        gallery: galleryUrls, 
        engine_cc: newCar.engine_cc, 
        color: newCar.color, 
        seats: newCar.seats, 
        drive_system: newCar.drive_system,
        features: newCar.features,
        tag: newCar.tag === '' ? 'NONE' : newCar.tag
      }]);

      if (dbError) throw new Error(dbError.message);
      
      alert("Gari limepakiwa na Picha zake zote kikamilifu!");
      setNewCar({ stockId: '', title: '', year: '', trans: 'Auto', km: '', fob: '', cif: '', tag: 'NEW', engine_cc: '', color: '', seats: '', drive_system: '', features: '' });
      setCarFile(null);
      setGalleryFiles(null);
      fetchAllPlatformCars();
      setActiveTab('all-cars');
    } catch (error: any) {
      alert(`Imefeli kupakia. Sababu: ${error?.message}`);
    } finally {
      setUploading(false);
    }
  };

  // =====================================
  // POST TRENDING CAR
  // =====================================
  const handleTrendingPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTrendingFile(e.target.files[0]);
      setNewTrendingCar({ ...newTrendingCar, img: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const submitNewTrendingCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrendingCar.title || !trendingFile) return alert("Weka jina na picha ya Trending!");
    
    setUploading(true);
    try {
      const fileExt = trendingFile.name.split('.').pop();
      const uniqueFileName = `trend-${Math.random()}.${fileExt}`;
      const { data: uploadData } = await supabase.storage.from('car-images').upload(`public/${uniqueFileName}`, trendingFile);
      
      let finalImageUrl = '';
      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(`public/${uniqueFileName}`);
        finalImageUrl = publicUrl;
      }

      await supabase.from('trending_cars').insert([{
        title: newTrendingCar.title,
        price_text: newTrendingCar.price,
        image_url: finalImageUrl
      }]);

      alert("Trending Car imeongezwa kikamilifu!");
      setNewTrendingCar({ title: '', price: '', img: '' });
      setTrendingFile(null);
      fetchTrendingCars(); 
    } catch (error: any) {
      alert(`Imefeli kutuma Trending`);
    } finally {
      setUploading(false);
    }
  };

  // =====================================
  // POST SPARE PART
  // =====================================
  const handleSparePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSpareFile(e.target.files[0]);
    }
  };

  const submitNewSpare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpare.name || !spareFile) return alert("Tafadhali weka jina na picha ya bidhaa!");
    
    setUploading(true);
    try {
      const fileExt = spareFile.name.split('.').pop();
      const uniqueFileName = `spare-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('car-images').upload(`public/${uniqueFileName}`, spareFile);
      
      let finalImageUrl = '';
      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(`public/${uniqueFileName}`);
        finalImageUrl = publicUrl;
      }

      const { error: dbError } = await supabase.from('spares').insert([{
        name: newSpare.name,
        category: newSpare.category,
        price: newSpare.price,
        description: newSpare.desc,
        tag: newSpare.tag,
        image_url: finalImageUrl
      }]);

      if (dbError) throw dbError;

      alert("Kipuri/Kifaa kimepakiwa kikamilifu!");
      setNewSpare({ name: '', category: 'ECU & Diagnostics', price: '', desc: '', tag: '' });
      setSpareFile(null);
      fetchSpares();
    } catch (error: any) {
      console.error(error);
      alert("Kuna shida kupakia kipuri.");
    } finally {
      setUploading(false);
    }
  };

  // =====================================
  // DELETERS & HELPERS
  // =====================================
  const deleteTrendingCar = async (id: string) => {
    if (!window.confirm("Futa gari hili kwenye Trending?")) return;
    try {
      await supabase.from('trending_cars').delete().eq('id', id);
      fetchTrendingCars();
    } catch (error) {}
  };

  const deleteCar = async (id: string) => {
    if (!window.confirm("WARNING: Hii itafuta gari hili kabisa kwenye mfumo wote. Endelea?")) return;
    try {
      await supabase.from('vehicles').delete().eq('id', id);
      fetchAllPlatformCars();
    } catch (error) {}
  };

  const deleteSpare = async (id: string) => {
    if (!window.confirm("Futa bidhaa hii kwenye orodha ya Vipuri?")) return;
    try {
      await supabase.from('spares').delete().eq('id', id);
      fetchSpares();
    } catch (error) {}
  };

  const extractImageFromMessage = (message: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = message.match(urlRegex);
    return matches ? matches[0] : null;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-gray-800">
      
      {/* --- SUPER ADMIN SIDEBAR --- */}
      <div className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex shadow-2xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <span className="text-2xl font-extrabold text-blue-500 tracking-tight">
            Gari<span className="text-white">Hub</span>
          </span>
          <span className="ml-2 text-[9px] bg-red-600 text-white px-2 py-0.5 rounded font-black tracking-wider shadow-[0_0_10px_rgba(220,38,38,0.5)]">
            SUPER ADMIN
          </span>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-black text-xl shadow-lg border-2 border-slate-700">👑</div>
            <div>
              <p className="font-bold text-sm">System Owner</p>
              <p className="text-[10px] text-blue-400 font-mono">ID: ADMIN-001</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Core System</div>
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-bold ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            📊 Dashboard
          </button>
          <button onClick={() => setActiveTab('all-cars')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm font-bold ${activeTab === 'all-cars' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="flex items-center gap-3">🚘 Inventory</span>
            {stats.clientCars > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 rounded">{stats.clientCars} New</span>}
          </button>
          
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-6 px-2">CRM & Sales</div>
          <button onClick={() => setActiveTab('inquiries')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm font-bold ${activeTab === 'inquiries' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-indigo-400'}`}>
            <span className="flex items-center gap-3">💬 Leads & Inquiries</span>
            <span className="bg-indigo-500 text-white text-[10px] px-2 rounded-full">{stats.totalLeads}</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-bold ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-indigo-400'}`}>
            👥 Vendor Management
          </button>

          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-6 px-2">Web Content</div>
          <button onClick={() => setActiveTab('post-car')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-bold ${activeTab === 'post-car' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-emerald-400'}`}>
            📥 Post Direct Import
          </button>
          <button onClick={() => setActiveTab('trending')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-bold ${activeTab === 'trending' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-orange-400'}`}>
            🔥 Trending Manager
          </button>
          <button onClick={() => setActiveTab('spares')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm font-bold ${activeTab === 'spares' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="flex items-center gap-3">⚙️ Spares & Tools</span>
            <span className="bg-gray-700 text-gray-300 text-[10px] px-2 rounded-full">{allSpares.length}</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <Link href="/" target="_blank" className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-lg text-slate-300 hover:text-white transition-colors text-sm font-bold border border-slate-700">
            🌍 View Live Site ↗
          </Link>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10 border-b border-gray-200">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">
            {activeTab === 'dashboard' ? 'Platform Command Center' : 
             activeTab === 'all-cars' ? 'Global Vehicle Inventory' : 
             activeTab === 'inquiries' ? 'Sales Leads & Sourcing Requests' :
             activeTab === 'users' ? 'User & Vendor Directory' :
             activeTab === 'spares' ? 'Spares & Diagnostic Tools Hub' :
             activeTab === 'post-car' ? 'Add Direct Import to Showroom' : 'Manage Trending Vehicles'}
          </h2>
          <div className="flex items-center gap-4">
             <button onClick={() => { fetchAllPlatformCars(); fetchInquiries(); fetchTrendingCars(); fetchSpares(); }} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100">
               🔄 Sync Database
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          
          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1 block">Total Vehicles</span>
                  <span className="text-3xl font-black text-gray-900">{loading ? '...' : stats.totalCars}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-indigo-500 cursor-pointer hover:bg-indigo-50 transition-colors" onClick={() => setActiveTab('inquiries')}>
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1 block">Total Leads / Meseji</span>
                  <span className="text-3xl font-black text-indigo-600">{loading ? '...' : stats.totalLeads}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-emerald-500">
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1 block">Direct Imports</span>
                  <span className="text-3xl font-black text-emerald-600">{loading ? '...' : stats.directImports}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-purple-500 cursor-pointer hover:bg-purple-50 transition-colors" onClick={() => setActiveTab('users')}>
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1 block">Vendor Cars</span>
                  <span className="text-3xl font-black text-purple-600">{loading ? '...' : stats.vendorCars}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-orange-500">
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1 block">C2C Cars (Pending)</span>
                  <span className="text-3xl font-black text-orange-600">{loading ? '...' : stats.clientCars}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="font-black text-gray-900 text-lg mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <button onClick={() => setActiveTab('inquiries')} className="p-4 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all text-left flex flex-col gap-2">
                    <span className="text-2xl">📥</span>
                    <div><p className="font-bold text-gray-900 text-sm">View New Leads</p><p className="text-[10px] text-gray-500">Wateja walioulizia magari</p></div>
                  </button>
                  <button onClick={() => setActiveTab('post-car')} className="p-4 border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left flex flex-col gap-2">
                    <span className="text-2xl">🚢</span>
                    <div><p className="font-bold text-gray-900 text-sm">Post Arrival</p><p className="text-[10px] text-gray-500">Ingiza gari mpya showroom</p></div>
                  </button>
                  <button onClick={() => setActiveTab('spares')} className="p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all text-left flex flex-col gap-2">
                    <span className="text-2xl">⚙️</span>
                    <div><p className="font-bold text-gray-900 text-sm">Add Spare Parts</p><p className="text-[10px] text-gray-500">Weka vifaa vya ECU na Vipuri</p></div>
                  </button>
                  <button onClick={() => setActiveTab('trending')} className="p-4 border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all text-left flex flex-col gap-2">
                    <span className="text-2xl">🔥</span>
                    <div><p className="font-bold text-gray-900 text-sm">Update Trending</p><p className="text-[10px] text-gray-500">Badili magari yanayotamba</p></div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. INQUIRIES & LEADS MANAGER */}
          {activeTab === 'inquiries' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-indigo-50 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-indigo-900">Meseji za Wateja, Sourcing & Trade-Ins</h3>
                  <p className="text-xs text-indigo-700 mt-1">Wasiliana na wateja hawa mara moja ili kufunga mauzo.</p>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {allInquiries.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 font-bold">Hakuna meseji mpya kutoka kwa wateja.</div>
                ) : (
                  allInquiries.map((inq: any) => {
                    const isSourcing = inq.customer_message?.includes("SOURCING REQUEST");
                    const isTradeIn = inq.customer_message?.includes("TRADE-IN REQUEST");
                    const imgUrl = extractImageFromMessage(inq.customer_message);
                    
                    return (
                      <div key={inq.id} className={`p-6 flex flex-col md:flex-row gap-6 transition-colors ${isSourcing ? 'bg-blue-50/50' : isTradeIn ? 'bg-orange-50/50 border-l-4 border-orange-500' : 'hover:bg-gray-50'}`}>
                        {(isSourcing || isTradeIn) && imgUrl && (
                          <div className="w-32 h-24 shrink-0 rounded-lg overflow-hidden border-2 shadow-sm">
                            <img src={imgUrl} alt="Customer Request" className="w-full h-full object-cover" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider text-white ${isSourcing ? 'bg-indigo-600' : isTradeIn ? 'bg-orange-500' : 'bg-emerald-600'}`}>
                              {isTradeIn ? 'Trade-In Request (Badilisha)' : isSourcing ? 'Sourcing Request (Tafuta)' : 'Direct Inquiry (Anaulizia)'}
                            </span>
                            <span className="text-xs text-gray-400 font-bold">{new Date(inq.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed bg-white p-3 rounded border border-gray-200">{inq.customer_message}</p>
                        </div>

                        <div className="flex flex-col justify-center items-end shrink-0 gap-2">
                          <a href={`https://wa.me/${inq.contact_phone?.replace(/[^0-9]/g, '')}`} target="_blank" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm w-full justify-center md:w-auto">
                            💬 WhatsApp: {inq.contact_phone}
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 3. MANAGE ALL CARS TAB */}
          {activeTab === 'all-cars' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-gray-900">Global Database Inventory</h3>
                  <p className="text-xs text-gray-500 mt-1">Control every vehicle on the platform regardless of who posted it.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-300 text-[10px] uppercase tracking-widest">
                      <th className="p-4 border-b border-slate-800">Vehicle</th>
                      <th className="p-4 border-b border-slate-800">Source / Uploader</th>
                      <th className="p-4 border-b border-slate-800">Price (FOB)</th>
                      <th className="p-4 border-b border-slate-800">Status Tag</th>
                      <th className="p-4 border-b border-slate-800 text-right">Super Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {loading ? (
                      <tr><td colSpan={5} className="p-10 text-center text-gray-400 font-bold">Inapakuliwa...</td></tr>
                    ) : allCars.length === 0 ? (
                      <tr><td colSpan={5} className="p-10 text-center text-gray-400">Hakuna Gari.</td></tr>
                    ) : (
                      allCars.map(car => (
                        <tr key={car.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors group">
                          <td className="p-4 flex items-center gap-4">
                            {car.img ? (
                              <img src={car.img} alt={car.title} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image'} className="w-16 h-12 object-cover rounded-md border border-gray-200 shadow-sm" />
                            ) : (
                              <div className="w-16 h-12 bg-gray-100 flex items-center justify-center rounded-md border border-gray-200 shadow-sm">
                                <span className="text-[9px] text-gray-400 font-bold">No Img</span>
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900">{car.title}</p>
                              <p className="text-[10px] font-mono text-gray-500 bg-gray-100 inline-block px-1 rounded mt-1">{car.stockId}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${car.type === 'GariHub (Direct)' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : car.type === 'Vendor' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                              {car.type}
                            </span>
                          </td>
                          <td className="p-4 font-black text-gray-800">{car.price}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${car.status === 'Available' ? 'bg-gray-100 text-gray-600' : car.status === 'HOT' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
                              {car.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => deleteCar(car.id)} className="text-[10px] font-bold bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 border border-red-200 rounded transition-all opacity-0 group-hover:opacity-100">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. POST DIRECT IMPORT (YENYE FEATURES, SPECS, GALLERY) */}
          {activeTab === 'post-car' && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="mb-8 border-b border-gray-100 pb-4">
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded tracking-wider uppercase mb-2 inline-block">Official Stock</span>
                <h3 className="text-2xl font-black text-gray-900">Add Vehicle to Showroom</h3>
                <p className="text-sm text-gray-500 mt-1">Ingiza gari na sifa zake zote (Features) ili zionekane vizuri kwa mteja.</p>
              </div>

              <form onSubmit={submitNewCar} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* PHOTO UPLOADS */}
                <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 pb-6">
                  <div className="flex gap-4 items-center border p-4 rounded-xl bg-gray-50">
                    <label className="flex-1 flex flex-col items-center cursor-pointer text-center">
                      <span className="text-2xl mb-1">📸</span>
                      <span className="text-blue-800 font-bold text-xs">Picha Kuu (Main)</span>
                      <input type="file" accept="image/*" onChange={handleAdminPhotoUpload} className="hidden" />
                    </label>
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden border">
                      {carFile ? <img src={URL.createObjectURL(carFile)} className="w-full h-full object-cover" /> : <span className="text-[9px] font-bold text-gray-500">Preview</span>}
                    </div>
                  </div>

                  <div className="flex gap-4 items-center border p-4 rounded-xl bg-blue-50">
                    <label className="flex-1 flex flex-col items-center cursor-pointer text-center">
                      <span className="text-2xl mb-1">🖼️</span>
                      <span className="text-blue-800 font-bold text-xs">Picha za Ndani (Gallery)</span>
                      <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                    </label>
                    <div className="text-[10px] font-bold text-gray-600 w-16 text-center">
                      {galleryFiles ? `${galleryFiles.length} Zimechaguliwa` : '0 Zimechaguliwa'}
                    </div>
                  </div>
                </div>

                {/* BASIC INFO */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Make & Model</label>
                  <input type="text" value={newCar.title} onChange={(e) => setNewCar({...newCar, title: e.target.value})} placeholder="Mf. Toyota Harrier" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 font-bold" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Stock ID</label>
                  <input type="text" value={newCar.stockId} onChange={(e) => setNewCar({...newCar, stockId: e.target.value})} placeholder="GH-XXXX" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 font-mono font-bold" />
                </div>

                {/* SPECS */}
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Mwaka (Year)</label>
                  <input type="number" value={newCar.year} onChange={(e) => setNewCar({...newCar, year: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-50" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Engine (CC)</label>
                  <input type="text" value={newCar.engine_cc} onChange={(e) => setNewCar({...newCar, engine_cc: e.target.value})} placeholder="Mf. 1490" className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-50 font-bold" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Mileage (Km)</label>
                  <input type="text" value={newCar.km} onChange={(e) => setNewCar({...newCar, km: e.target.value})} placeholder="Mf. 45000" className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-50" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Trans (Gia)</label>
                  <select value={newCar.trans} onChange={(e) => setNewCar({...newCar, trans: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-50">
                    <option>Auto</option><option>Manual</option>
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Rangi (Color)</label>
                  <input type="text" value={newCar.color} onChange={(e) => setNewCar({...newCar, color: e.target.value})} placeholder="Mf. Pearl White" className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-50" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Viti (Seats)</label>
                  <input type="text" value={newCar.seats} onChange={(e) => setNewCar({...newCar, seats: e.target.value})} placeholder="Mf. 5" className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-50" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Drive System</label>
                  <input type="text" value={newCar.drive_system} onChange={(e) => setNewCar({...newCar, drive_system: e.target.value})} placeholder="Mf. 2WD au 4WD" className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-50" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Tag (Lebo)</label>
                  <select value={newCar.tag} onChange={(e) => setNewCar({...newCar, tag: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-50 font-bold text-red-600">
                    <option value="NONE">Available</option><option value="NEW">NEW</option><option value="HOT">HOT</option><option value="SOLD">SOLD</option>
                  </select>
                </div>

                <div className="md:col-span-4 border-t border-gray-100 pt-6 mt-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Sifa za Ziada / Features (Tenganisha kwa mkato ',')</label>
                  <textarea 
                    value={newCar.features} 
                    onChange={(e) => setNewCar({...newCar, features: e.target.value})} 
                    placeholder="Mfano: Android TV, Sunroof, Leather Seats, Reverse Camera, Alloy Wheels" 
                    className="w-full border border-gray-300 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50/30 text-sm leading-relaxed" 
                    rows={3}
                  ></textarea>
                </div>

                {/* BEI */}
                <div className="md:col-span-4 border-t border-gray-100 pt-6 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">FOB Price (USD)</label>
                    <input type="text" value={newCar.fob} onChange={(e) => setNewCar({...newCar, fob: e.target.value})} placeholder="Mf. 15000" className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 font-black text-emerald-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">CIF Estimate ($)</label>
                    <input type="text" value={newCar.cif} onChange={(e) => setNewCar({...newCar, cif: e.target.value})} placeholder="Mf. 16200" className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 font-black text-emerald-700" />
                  </div>
                </div>

                <div className="md:col-span-4 flex mt-4">
                  <button type="submit" disabled={uploading} className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-black hover:bg-emerald-700 transition-all w-full shadow-md">
                    {uploading ? 'INAPAKIA DB (Tafadhali Subiri)...' : '🚀 PUBLISH CAR WITH FEATURES'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 5. TRENDING MANAGER */}
          {activeTab === 'trending' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-orange-50 rounded-2xl shadow-sm border border-orange-200 p-8 mb-8">
                <h3 className="text-2xl font-black text-orange-900 mb-2">🔥 Update Homepage Trending Cars</h3>
                <p className="text-sm text-orange-700 mb-6">Pakia magari yanayotamba (Circular sliding menu) kule kwenye Homepage.</p>
                
                <form onSubmit={submitNewTrendingCar} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow-sm">
                  <div className="md:col-span-2 flex items-center gap-4">
                    <label className="flex-1 border-2 border-dashed border-orange-200 rounded-xl p-4 flex flex-col items-center justify-center bg-orange-50 hover:bg-orange-100 cursor-pointer text-center">
                      <span className="text-2xl mb-1">📸</span>
                      <span className="text-orange-800 font-bold text-xs">Weka Picha</span>
                      <input type="file" accept="image/*" onChange={handleTrendingPhotoUpload} className="hidden" />
                    </label>
                    {newTrendingCar.img && <img src={newTrendingCar.img} className="w-20 h-20 object-cover rounded-full border-4 border-orange-200 shadow-sm" />}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Car Name</label>
                    <input type="text" value={newTrendingCar.title} onChange={(e) => setNewTrendingCar({...newTrendingCar, title: e.target.value})} placeholder="Mfano: Toyota Vanguard" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-orange-500 bg-gray-50 font-bold" required />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Marketing Price</label>
                    <input type="text" value={newTrendingCar.price} onChange={(e) => setNewTrendingCar({...newTrendingCar, price: e.target.value})} placeholder="Kuanzia $5,000 FOB" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-orange-500 bg-gray-50 font-bold text-orange-600" required />
                  </div>
                  <div className="md:col-span-2 mt-2">
                    <button type="submit" disabled={uploading} className="w-full bg-orange-500 text-white font-black py-3 rounded-lg hover:bg-orange-600 shadow-md">
                      {uploading ? 'Inatuma...' : 'Add to Trending Carousel'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Orodha ya Trending Cars */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-black text-gray-900 mb-4">Current Trending Cars (Live)</h4>
                {liveTrending.length === 0 ? (
                  <p className="text-gray-500 text-sm">Hakuna gari la Trending lililowekwa.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {liveTrending.map(car => (
                      <div key={car.id} className="border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                        <img src={car.image_url} alt={car.title} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image'} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-sm">{car.title}</p>
                          <p className="text-xs text-orange-600 font-bold mb-2">{car.price_text}</p>
                          <button onClick={() => deleteTrendingCar(car.id)} className="text-[10px] text-red-500 hover:underline font-bold">Futa Gari (Remove)</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. SPARES MANAGER */}
          {activeTab === 'spares' && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-blue-50 rounded-2xl shadow-sm border border-blue-200 p-8 mb-8">
                <h3 className="text-2xl font-black text-blue-900 mb-2">⚙️ Weka Kipuri au Kifaa Kipya</h3>
                <p className="text-sm text-blue-700 mb-6">Pakia vifaa vya ECU Diagnostics, Body Parts, au Oil ili vionekane kwenye ukurasa wa Spares.</p>
                
                <form onSubmit={submitNewSpare} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-xl shadow-sm">
                  <div className="md:col-span-3 flex items-center gap-4 border-b pb-6 mb-2">
                    <label className="flex-1 border-2 border-dashed border-blue-200 rounded-xl p-6 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 cursor-pointer text-center transition-colors">
                      <span className="text-3xl mb-2">📷</span>
                      <span className="text-blue-800 font-bold text-sm">Weka Picha ya Kipuri</span>
                      <input type="file" accept="image/*" onChange={handleSparePhotoUpload} className="hidden" />
                    </label>
                    <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 shadow-inner">
                      {spareFile ? (
                        <img src={URL.createObjectURL(spareFile)} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-400">Preview</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Jina la Kipuri/Kifaa</label>
                    <input type="text" value={newSpare.name} onChange={(e) => setNewSpare({...newSpare, name: e.target.value})} placeholder="Mfano: Launch CRP919X Scanner" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 bg-gray-50 font-bold" required />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Kundi (Category)</label>
                    <select value={newSpare.category} onChange={(e) => setNewSpare({...newSpare, category: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 bg-gray-50 font-bold text-gray-700">
                      <option>ECU & Diagnostics</option>
                      <option>Service Kits</option>
                      <option>Body Parts</option>
                      <option>Engine Parts</option>
                      <option>Brakes & Suspension</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Bei (Tsh au $)</label>
                    <input type="text" value={newSpare.price} onChange={(e) => setNewSpare({...newSpare, price: e.target.value})} placeholder="Mfano: $450" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 bg-gray-50 font-black text-blue-700" required />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Lebo (Label)</label>
                    <select value={newSpare.tag} onChange={(e) => setNewSpare({...newSpare, tag: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 bg-gray-50 font-bold">
                      <option value="">Hakuna Lebo</option>
                      <option value="HOT">HOT</option>
                      <option value="NEW">NEW</option>
                      <option value="PRO TOOL">PRO TOOL</option>
                      <option value="POPULAR">POPULAR</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Maelezo Fupi</label>
                    <textarea value={newSpare.desc} onChange={(e) => setNewSpare({...newSpare, desc: e.target.value})} placeholder="Andika kazi ya hiki kifaa au sifa zake..." className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 bg-gray-50 text-sm resize-none" rows={2}></textarea>
                  </div>

                  <div className="md:col-span-3 mt-2">
                    <button type="submit" disabled={uploading} className="w-full bg-blue-600 text-white font-black py-3.5 rounded-lg hover:bg-blue-700 shadow-md transition-colors">
                      {uploading ? 'Inapakia Mtandaoni...' : 'Post Kipuri Sasa 🚀'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Orodha ya Spares */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-black text-gray-900 mb-4 flex justify-between items-center">
                  <span>Orodha ya Vipuri Mtandaoni ({allSpares.length})</span>
                  <button onClick={fetchSpares} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200">Refresh Data</button>
                </h4>
                
                {allSpares.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-10">Hakuna kipuri kilichowekwa mpaka sasa.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allSpares.map(spare => (
                      <div key={spare.id} className="border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow group">
                        <img src={spare.image_url} alt={spare.name} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image'} className="w-20 h-20 rounded-lg object-cover shadow-sm border border-gray-100" />
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="text-[9px] text-blue-600 font-black uppercase tracking-wider mb-1">{spare.category}</p>
                          <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-2" title={spare.name}>{spare.name}</p>
                          <div className="flex justify-between items-end mt-2">
                            <p className="text-sm font-black text-gray-800">{spare.price}</p>
                            <button onClick={() => deleteSpare(spare.id)} className="text-[10px] text-red-500 bg-red-50 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 font-bold">
                              Futa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. USERS & VENDORS MANAGER (UI) */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <span className="text-6xl block mb-4">👔</span>
              <h3 className="text-2xl font-black text-gray-900">Vendor Management Module</h3>
              <p className="text-gray-500 max-w-lg mx-auto mt-2 mb-6">Hapa ndipo utaona orodha ya Showrooms zote (Kama B-Tech Motors) zilizojiunga na mfumo wako. Utaweza kufunga akaunti zao kama hawajalipa ada ya mwezi.</p>
              <button className="bg-purple-600 text-white font-bold px-6 py-2 rounded-lg shadow-sm hover:bg-purple-700">Integrate Supabase Auth Soon</button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}