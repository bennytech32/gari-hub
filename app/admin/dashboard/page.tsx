"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

// Features List
const CAR_FEATURES_LIST = ['Sunroof', 'Leather Seats', '360 Camera', 'Push to Start', 'Alloy Wheels', 'Bluetooth', 'Navigation System', 'Parking Sensors'];

export default function CompleteAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // DATA STATES
  const [inventory, setInventory] = useState<any[]>([]); // Approved vehicles
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]); // Pending vehicles
  const [rentals, setRentals] = useState<any[]>([]);
  const [spares, setSpares] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // SEARCH STATE
  const [searchQuery, setSearchQuery] = useState('');

  // MODAL STATES
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [showAddRentalModal, setShowAddRentalModal] = useState(false);
  const [showAddSpareModal, setShowAddSpareModal] = useState(false);
  const [showAddMechanicModal, setShowAddMechanicModal] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);

  // FORMS
  const [carForm, setCarForm] = useState({ make: '', model: '', year: '', category: 'SUV', mileage: '', engine_cc: '', transmission: 'Automatic', fuel: 'Petrol', color: '', seats: '', drive_system: '2WD', stock_location: 'OVERSEAS', price: '', tag: 'NEW', features: [] as string[], imageFiles: [] as File[], imagePreviews: [] as string[] });
  const [rentalForm, setRentalForm] = useState({ make: '', model: '', year: '', category: 'SUV', price_per_day: '', transmission: 'Automatic', fuel: 'Petrol', features: [] as string[], imageFiles: [] as File[], imagePreviews: [] as string[] });
  const [spareForm, setSpareForm] = useState({ part_name: '', category: 'Engine Parts', car_compatibility: '', price: '', stock_quantity: '', condition: 'Brand New', imageFiles: [] as File[], imagePreviews: [] as string[] });
  const [mechanicForm, setMechanicForm] = useState({ full_name: '', phone_number: '', specialty: 'General Mechanic', location: '', experience_years: '', status: 'Available', imageFiles: [] as File[], imagePreviews: [] as string[] });

  // FETCH ALL DATA
  const fetchInventory = async () => {
    const { data: cars } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    const { data: rent } = await supabase.from('rentals').select('*').order('created_at', { ascending: false });
    const { data: parts } = await supabase.from('spares').select('*').order('created_at', { ascending: false });
    const { data: clientsData } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    const { data: mechs } = await supabase.from('mechanics').select('*').order('created_at', { ascending: false });
    const { data: inqs } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    
    if (cars) {
      setInventory(cars.filter(car => car.approval_status !== 'PENDING'));
      setPendingApprovals(cars.filter(car => car.approval_status === 'PENDING'));
    }
    if (rent) setRentals(rent);
    if (parts) setSpares(parts);
    if (clientsData) setClients(clientsData);
    if (mechs) setMechanics(mechs);
    if (inqs) setInquiries(inqs);
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/admin/login'); };

  // APPROVE CAR FUNCTION (Master Admin Action)
  const handleApproveCar = async (id: string) => {
    if (!window.confirm("Je, unaruhusu gari hili lionekane kwenye Showroom?")) return;
    try {
      const { error } = await supabase.from('vehicles').update({ approval_status: 'APPROVED' }).eq('id', id);
      if (error) throw error;
      alert("Gari limekubaliwa (Approved) na sasa lipo hewani!");
      fetchInventory();
    } catch (err: any) { alert(`Kosa: ${err.message}`); }
  };

  const handleDeleteCar = async (id: string, table: string = 'vehicles') => {
    if (!window.confirm(`⚠️ ONYO: Una uhakika unataka KUFUTA item hii kabisa kwenye mfumo?`)) return;
    try {
      await supabase.from(table).delete().eq('id', id);
      alert("Imefutwa kikamilifu!"); fetchInventory();
    } catch (err: any) { alert(`Kosa: ${err.message}`); }
  };

  // MULTI-IMAGE HANDLERS
  const handleMultiImageSelect = (e: React.ChangeEvent<HTMLInputElement>, formType: string) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const previewsArray = filesArray.map(file => URL.createObjectURL(file));

      if (formType === 'showroom') setCarForm(prev => ({ ...prev, imageFiles: [...prev.imageFiles, ...filesArray], imagePreviews: [...prev.imagePreviews, ...previewsArray] }));
      else if (formType === 'rental') setRentalForm(prev => ({ ...prev, imageFiles: [...prev.imageFiles, ...filesArray], imagePreviews: [...prev.imagePreviews, ...previewsArray] }));
      else if (formType === 'spare') setSpareForm(prev => ({ ...prev, imageFiles: [...prev.imageFiles, ...filesArray], imagePreviews: [...prev.imagePreviews, ...previewsArray] }));
      else if (formType === 'mechanic') setMechanicForm(prev => ({ ...prev, imageFiles: [...prev.imageFiles, ...filesArray], imagePreviews: [...prev.imagePreviews, ...previewsArray] }));
    }
  };

  const removeImage = (indexToRemove: number, formType: string) => {
    if (formType === 'showroom') setCarForm(prev => ({ ...prev, imageFiles: prev.imageFiles.filter((_, i) => i !== indexToRemove), imagePreviews: prev.imagePreviews.filter((_, i) => i !== indexToRemove) }));
    else if (formType === 'rental') setRentalForm(prev => ({ ...prev, imageFiles: prev.imageFiles.filter((_, i) => i !== indexToRemove), imagePreviews: prev.imagePreviews.filter((_, i) => i !== indexToRemove) }));
    else if (formType === 'spare') setSpareForm(prev => ({ ...prev, imageFiles: prev.imageFiles.filter((_, i) => i !== indexToRemove), imagePreviews: prev.imagePreviews.filter((_, i) => i !== indexToRemove) }));
    else if (formType === 'mechanic') setMechanicForm(prev => ({ ...prev, imageFiles: prev.imageFiles.filter((_, i) => i !== indexToRemove), imagePreviews: prev.imagePreviews.filter((_, i) => i !== indexToRemove) }));
  };

  const toggleFeature = (feature: string, formType: 'showroom' | 'rental') => {
    if (formType === 'showroom') setCarForm({ ...carForm, features: carForm.features.includes(feature) ? carForm.features.filter(f => f !== feature) : [...carForm.features, feature] });
    else setRentalForm({ ...rentalForm, features: rentalForm.features.includes(feature) ? rentalForm.features.filter(f => f !== feature) : [...rentalForm.features, feature] });
  };

  const uploadImagesToSupabase = async (files: File[]) => {
    let uploadedUrls: string[] = [];
    for (const file of files) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
      const { data } = await supabase.storage.from('car-images').upload(`public/${fileName}`, file);
      if (data) uploadedUrls.push(supabase.storage.from('car-images').getPublicUrl(`public/${fileName}`).data.publicUrl);
    }
    return uploadedUrls;
  };

  // ACTIONS ZA KIEDITH
  const openAddCarModal = () => {
    setEditingCarId(null);
    setCarForm({ make: '', model: '', year: '', category: 'SUV', mileage: '', engine_cc: '', transmission: 'Automatic', fuel: 'Petrol', color: '', seats: '', drive_system: '2WD', stock_location: 'OVERSEAS', price: '', tag: 'NEW', features: [], imageFiles: [], imagePreviews: [] });
    setShowAddCarModal(true);
  };

  const handleEditClick = (car: any) => {
    setEditingCarId(car.id);
    let safeFeatures: string[] = [];
    if (Array.isArray(car.features)) safeFeatures = car.features;
    else if (typeof car.features === 'string' && car.features.trim() !== '') {
      try { safeFeatures = JSON.parse(car.features); } catch (e) { safeFeatures = car.features.replace(/[{}]/g, '').split(',').map((f: string) => f.trim()).filter(Boolean); }
    }
    
    setCarForm({
      make: car.make || '', model: car.model || '', year: car.year || '', category: car.category || 'SUV', mileage: car.mileage || '', engine_cc: car.engine_cc || '', transmission: car.transmission || 'Automatic', fuel: car.fuel || 'Petrol', color: car.color || '', seats: car.seats || '', drive_system: car.drive_system || '2WD',
      stock_location: car.location_from || 'OVERSEAS', price: car.location_from === 'OVERSEAS' ? car.fob_price : car.cif_price, tag: car.tag || 'NEW', features: safeFeatures, imageFiles: [], imagePreviews: car.gallery || [car.location]
    });
    setShowAddCarModal(true);
  };

  // SAVE HANDLERS
  const handleSaveShowroomCar = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const existingUrls = carForm.imagePreviews.filter(url => url.startsWith('http'));
      const newlyUploadedUrls = await uploadImagesToSupabase(carForm.imageFiles);
      const finalGallery = [...existingUrls, ...newlyUploadedUrls];
      const mainImage = finalGallery.length > 0 ? finalGallery[0] : '';

      const carData = {
        make: carForm.make, model: carForm.model, year: carForm.year, category: carForm.category, mileage: carForm.mileage, engine_cc: carForm.engine_cc, transmission: carForm.transmission, fuel: carForm.fuel, color: carForm.color, seats: carForm.seats, drive_system: carForm.drive_system,
        location_from: carForm.stock_location, fob_price: carForm.stock_location === 'OVERSEAS' ? Number(carForm.price) : 0, cif_price: carForm.stock_location === 'TANZANIA' ? Number(carForm.price) : 0, tag: carForm.tag, features: carForm.features, location: mainImage, gallery: finalGallery
      };

      if (editingCarId) {
        await supabase.from('vehicles').update(carData).eq('id', editingCarId);
        alert("Taarifa zimehaririwa kikamilifu!");
      } else {
        const generatedStockId = `GH-${Math.floor(1000 + Math.random() * 9000)}`;
        await supabase.from('vehicles').insert([{ ...carData, stock_id: generatedStockId, vendor_id: 'MASTER-ADMIN', approval_status: 'APPROVED', last_renewed: new Date().toISOString() }]);
        alert(`Gari Jipya limesajiliwa! Stock ID: ${generatedStockId}`);
      }
      setShowAddCarModal(false); fetchInventory();
    } catch (err: any) { alert(`Kosa: ${err.message}`); } finally { setLoading(false); }
  };

  const handleSaveRentalCar = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const generatedStockId = `RENT-${Math.floor(1000 + Math.random() * 9000)}`;
      const imageUrls = await uploadImagesToSupabase(rentalForm.imageFiles);
      await supabase.from('rentals').insert([{ stock_id: generatedStockId, vendor_id: 'MASTER-ADMIN', make: rentalForm.make, model: rentalForm.model, year: rentalForm.year, category: rentalForm.category, price_per_day: Number(rentalForm.price_per_day), transmission: rentalForm.transmission, fuel: rentalForm.fuel, features: rentalForm.features, main_image: imageUrls[0] || '', gallery: imageUrls }]);
      alert("Gari la Kukodisha limesajiliwa!"); setShowAddRentalModal(false); fetchInventory();
      setRentalForm({ make: '', model: '', year: '', category: 'SUV', price_per_day: '', transmission: 'Automatic', fuel: 'Petrol', features: [], imageFiles: [], imagePreviews: [] });
    } catch (err: any) { alert(`Kosa: ${err.message}`); } finally { setLoading(false); }
  };

  const handleSaveSpare = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const imageUrls = await uploadImagesToSupabase(spareForm.imageFiles);
      await supabase.from('spares').insert([{ vendor_id: 'MASTER-ADMIN', part_name: spareForm.part_name, category: spareForm.category, car_compatibility: spareForm.car_compatibility, price: Number(spareForm.price), stock_quantity: Number(spareForm.stock_quantity), condition: spareForm.condition, main_image: imageUrls[0] || '', gallery: imageUrls }]);
      alert("Kipuri kimesajiliwa!"); setShowAddSpareModal(false); fetchInventory();
      setSpareForm({ part_name: '', category: 'Engine Parts', car_compatibility: '', price: '', stock_quantity: '', condition: 'Brand New', imageFiles: [], imagePreviews: [] });
    } catch (err: any) { alert(`Kosa: ${err.message}`); } finally { setLoading(false); }
  };

  const handleSaveMechanic = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const imageUrls = await uploadImagesToSupabase(mechanicForm.imageFiles);
      await supabase.from('mechanics').insert([{ full_name: mechanicForm.full_name, phone_number: mechanicForm.phone_number, specialty: mechanicForm.specialty, location: mechanicForm.location, experience_years: mechanicForm.experience_years, status: mechanicForm.status, profile_image: imageUrls[0] || '' }]);
      alert("Fundi Amesajiliwa Kikamilifu!"); setShowAddMechanicModal(false); fetchInventory();
      setMechanicForm({ full_name: '', phone_number: '', specialty: 'General Mechanic', location: '', experience_years: '', status: 'Available', imageFiles: [], imagePreviews: [] });
    } catch (err: any) { alert(`Kosa: ${err.message}`); } finally { setLoading(false); }
  };

  const NavItem = ({ id, icon, label, badge }: { id: string, icon: string, label: string, badge?: number }) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${activeTab === id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <div className="flex items-center space-x-3"><span className="text-xl">{icon}</span><span className="font-bold text-sm tracking-wide">{label}</span></div>
      {badge ? <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span> : null}
    </button>
  );

  const MultiImageUploader = ({ formState, formType }: { formState: any, formType: any }) => (
    <div>
      <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Upload Photos (Select Multiple)</h4>
      <div className="flex flex-wrap gap-4 mb-4">
        {formState.imagePreviews.map((preview: string, index: number) => (
          <div key={index} className="relative w-24 h-24 rounded-xl border border-slate-700 overflow-hidden group">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            <button type="button" onClick={() => removeImage(index, formType)} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
          </div>
        ))}
        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center bg-[#0B1120] hover:bg-slate-800 transition-colors">
          <input type="file" id={`imageUpload-${formType}`} multiple accept="image/*" onChange={(e) => handleMultiImageSelect(e, formType)} className="hidden" />
          <label htmlFor={`imageUpload-${formType}`} className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-white"><span className="text-2xl mb-1">➕</span><span className="text-[9px] font-bold uppercase">Add Photo</span></label>
        </div>
      </div>
    </div>
  );

  const renderVendorBadge = (vendorId: string | null) => {
    if (!vendorId || vendorId === 'MASTER-ADMIN') {
      return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-max"><span className="text-xs">👑</span> GariHub (Master)</span>;
    }
    return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-max"><span className="text-xs">🏪</span> {vendorId}</span>;
  };

  const filteredInventory = inventory.filter(car => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return ((car.stock_id && car.stock_id.toLowerCase().includes(query)) || (car.make && car.make.toLowerCase().includes(query)) || (car.model && car.model.toLowerCase().includes(query)));
  });

  return (
    <div className="min-h-screen bg-[#0B1120] flex font-sans text-slate-200">
      
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="w-72 bg-[#0F172A] border-r border-slate-800 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800"><div className="flex items-center space-x-3"><div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg"><span className="text-xl text-white">⚙️</span></div><div><h1 className="text-xl font-black text-white tracking-tight">Gari<span className="text-blue-500">Hub</span></h1><p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Master Admin</p></div></div></div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-4 mb-3 mt-2">Main Menu</p>
          <NavItem id="overview" icon="📊" label="Dashboard Overview" />
          <NavItem id="showroom" icon="🚘" label="Showroom & Inventory" />
          <NavItem id="approvals" icon="⏳" label="Client Approvals" badge={pendingApprovals.length > 0 ? pendingApprovals.length : undefined} />
          <NavItem id="rentals" icon="🔑" label="Car Rentals & Hire" />
          <NavItem id="spares" icon="⚙️" label="Spares & Tools Shop" />
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-4 mb-3 mt-6">Operations & Clients</p>
          <NavItem id="inquiries" icon="💬" label="Client Inquiries" badge={inquiries.length > 0 ? inquiries.length : undefined} />
          <NavItem id="sos" icon="🛠️" label="SOS Mechanics & Rescue" />
          <NavItem id="users" icon="👥" label="Registered Users" />
        </nav>
        <div className="p-4 border-t border-slate-800"><button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all font-bold text-sm"><span>🚪</span><span>Secure Logout</span></button></div>
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0B1120]">
        <header className="bg-[#0F172A] border-b border-slate-800 p-6 flex justify-between items-center z-10 shrink-0">
          <div><h2 className="text-2xl font-black text-white capitalize">{activeTab.replace('-', ' ')}</h2><p className="text-xs text-slate-400 mt-1">Manage your platform data and operations.</p></div>
          <div className="flex space-x-4">
            {activeTab === 'showroom' && <button onClick={openAddCarModal} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase flex items-center space-x-2"><span>➕</span><span>Add Showroom Car</span></button>}
            {activeTab === 'rentals' && <button onClick={() => setShowAddRentalModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase flex items-center space-x-2"><span>➕</span><span>Add Rental Car</span></button>}
            {activeTab === 'spares' && <button onClick={() => setShowAddSpareModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase flex items-center space-x-2"><span>➕</span><span>Add Spare Part</span></button>}
            {activeTab === 'sos' && <button onClick={() => setShowAddMechanicModal(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase flex items-center space-x-2"><span>➕</span><span>Register Mechanic</span></button>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6"><p className="text-slate-400 text-xs font-black uppercase mb-2">Showroom Cars</p><h3 className="text-4xl font-black text-white">{inventory.length}</h3></div>
                <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6"><p className="text-slate-400 text-xs font-black uppercase mb-2">Registered Clients</p><h3 className="text-4xl font-black text-blue-400">{clients.length}</h3></div>
                <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6"><p className="text-slate-400 text-xs font-black uppercase mb-2">Pending Approvals</p><h3 className="text-4xl font-black text-amber-400">{pendingApprovals.length}</h3></div>
                <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6"><p className="text-slate-400 text-xs font-black uppercase mb-2">Spares & Tools</p><h3 className="text-4xl font-black text-emerald-400">{spares.length}</h3></div>
              </div>
            </div>
          )}

          {/* TAB: SHOWROOM */}
          {activeTab === 'showroom' && (
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden min-h-[400px]">
              <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center bg-[#0d131f] gap-4">
                <h3 className="font-bold text-white">Showroom (Live Vehicles)</h3>
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">🔍</span>
                  <input type="text" placeholder="Tafuta gari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#0B1120] border border-slate-700 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                  <thead className="bg-[#0B1120] text-xs uppercase border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-bold tracking-widest text-slate-500">Gari & Taarifa</th>
                      <th className="px-6 py-4 font-bold tracking-widest text-slate-500">Miliki (Vendor)</th>
                      <th className="px-6 py-4 font-bold tracking-widest text-slate-500">Bei (Price)</th>
                      <th className="px-6 py-4 font-bold tracking-widest text-slate-500">Status</th>
                      <th className="px-6 py-4 font-bold tracking-widest text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map(car => {
                      const now = new Date();
                      const renewedDate = new Date(car.last_renewed || car.created_at);
                      const isExpired = Math.floor((now.getTime() - renewedDate.getTime()) / (1000 * 3600 * 24)) >= 14;

                      return (
                      <tr key={car.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-4">
                          <img src={car.location || 'https://via.placeholder.com/150'} className={`w-16 h-12 rounded-lg object-cover border ${isExpired ? 'border-red-500 grayscale' : 'border-slate-700'}`} alt="car" />
                          <div>
                            <p className="font-black text-white text-base">{car.make} {car.model}</p>
                            <p className="text-[10px] font-bold text-blue-400 mt-1">{car.stock_id} • {car.year}</p>
                            {isExpired && <p className="text-[9px] text-red-500 font-bold uppercase mt-1 animate-pulse">⏳ Muda Umeisha (14+)</p>}
                          </div>
                        </td>
                        <td className="px-6 py-4">{renderVendorBadge(car.vendor_id)}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-white text-sm">TZS {car.cif_price > 0 ? car.cif_price.toLocaleString() : car.fob_price.toLocaleString()}</p>
                          <p className="text-[10px] font-bold uppercase text-slate-500 mt-1">{car.location_from}</p>
                        </td>
                        <td className="px-6 py-4"><span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest ${car.tag === 'SOLD OUT' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>{car.tag}</span></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditClick(car)} className="bg-slate-800 hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 border border-slate-700 hover:border-blue-500/50 px-3 py-2 rounded-lg text-xs font-bold transition-all">✏️ Edit</button>
                            <button onClick={() => handleDeleteCar(car.id)} className="bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 px-3 py-2 rounded-lg text-xs font-bold transition-all">🗑️ Delete</button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: APPROVALS */}
          {activeTab === 'approvals' && (
            <div className="bg-[#0F172A] border border-amber-500/30 rounded-2xl overflow-hidden min-h-[400px] shadow-lg shadow-amber-500/10">
              <div className="px-6 py-5 border-b border-slate-800 bg-[#0d131f] flex justify-between items-center">
                <h3 className="font-bold text-amber-400 flex items-center gap-2">⏳ Magari Yanayosubiri Idhini (Client Sales)</h3>
              </div>
              {pendingApprovals.length === 0 ? (
                <div className="p-16 flex flex-col items-center justify-center text-center"><span className="text-5xl mb-4 opacity-50">✅</span><p className="text-slate-500 text-sm">Hakuna gari lolote linalosubiri idhini kwa sasa.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-[#0B1120] text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-5 font-black">Gari Aliloweka</th>
                        <th className="px-6 py-5 font-black">Mteja (Barua Pepe)</th>
                        <th className="px-6 py-5 font-black">Bei Anayouza</th>
                        <th className="px-6 py-5 font-black text-right">Maamuzi (Action)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApprovals.map(car => (
                        <tr key={car.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-4">
                            <img src={car.location || 'https://via.placeholder.com/150'} className="w-16 h-12 rounded-lg object-cover border border-slate-700" />
                            <div>
                              <p className="font-black text-white text-base">{car.make} {car.model}</p>
                              <p className="text-[10px] font-bold text-slate-500 mt-1">Mwaka: {car.year} • Km: {car.mileage}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-blue-400">{car.vendor_id}</td>
                          <td className="px-6 py-4"><p className="font-black text-emerald-400 text-sm">TZS {car.cif_price.toLocaleString()}</p></td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleApproveCar(car.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg">✅ Kubali (Approve)</button>
                              <button onClick={() => handleDeleteCar(car.id)} className="bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 px-3 py-2 rounded-lg text-xs font-black transition-all">❌ Kataa</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: RENTALS */}
          {activeTab === 'rentals' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rentals.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-[#0F172A] rounded-3xl border border-slate-800"><span className="text-5xl opacity-50 block mb-4">🔑</span><p className="text-slate-400 text-sm mb-6">No rental cars yet.</p><button onClick={() => setShowAddRentalModal(true)} className="bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl uppercase text-xs">Add Rental Car</button></div>
              ) : (
                rentals.map(car => (
                  <div key={car.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative">
                    <div className="absolute top-3 left-3">{renderVendorBadge(car.vendor_id)}</div>
                    <img src={car.main_image || 'https://via.placeholder.com/400x300'} className="w-full h-48 object-cover" />
                    <div className="p-5">
                      <h3 className="font-black text-white text-lg mb-1">{car.make} {car.model}</h3>
                      <p className="text-amber-400 font-black text-sm mb-4">TZS {car.price_per_day.toLocaleString()} / Day</p>
                      <button onClick={() => handleDeleteCar(car.id, 'rentals')} className="w-full bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 py-2 rounded-lg font-bold text-xs transition-colors">🗑️ Delete Rental</button>
                    </div>
                  </div>
                ))
              )}
             </div>
          )}

          {/* TAB: SPARES */}
          {activeTab === 'spares' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {spares.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-[#0F172A] rounded-3xl border border-slate-800"><span className="text-5xl opacity-50 block mb-4">⚙️</span><p className="text-slate-400 text-sm mb-6">No spare parts yet.</p><button onClick={() => setShowAddSpareModal(true)} className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl uppercase text-xs">Add Spare Part</button></div>
              ) : (
                spares.map(part => (
                  <div key={part.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative">
                    <div className="absolute top-3 left-3">{renderVendorBadge(part.vendor_id)}</div>
                    <img src={part.main_image || 'https://via.placeholder.com/400x300'} className="w-full h-48 object-cover" />
                    <div className="p-5">
                      <h3 className="font-black text-white text-lg mb-1 truncate" title={part.part_name}>{part.part_name}</h3>
                      <p className="text-emerald-400 font-black text-sm mb-4">TZS {part.price.toLocaleString()}</p>
                      <button onClick={() => handleDeleteCar(part.id, 'spares')} className="w-full bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 py-2 rounded-lg font-bold text-xs transition-colors">🗑️ Delete Spare</button>
                    </div>
                  </div>
                ))
              )}
             </div>
          )}

          {/* TAB: USERS (CLIENTS) */}
          {activeTab === 'users' && (
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden min-h-[400px]">
              <div className="px-6 py-5 border-b border-slate-800 bg-[#0d131f] flex justify-between items-center">
                <h3 className="font-bold text-white">Registered Clients</h3>
                <span className="bg-blue-600/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Total: {clients.length}</span>
              </div>
              
              {clients.length === 0 ? (
                <div className="p-16 flex flex-col items-center justify-center text-center"><span className="text-5xl mb-4 opacity-50">👥</span><p className="text-slate-500 text-sm mb-6">Hakuna mteja aliyesajiliwa kwenye mfumo bado.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-[#0B1120] text-[10px] uppercase border-b border-slate-800 tracking-widest text-slate-500">
                      <tr><th className="px-6 py-5 font-black">Jina Kamili</th><th className="px-6 py-5 font-black">Barua Pepe (Email)</th><th className="px-6 py-5 font-black">Namba ya Simu</th><th className="px-6 py-5 font-black text-right">Tarehe ya Kujiunga</th></tr>
                    </thead>
                    <tbody>
                      {clients.map(client => (
                        <tr key={client.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg">{client.full_name?.charAt(0).toUpperCase() || '👤'}</div>
                            <span className="font-black text-white text-sm">{client.full_name}</span>
                          </td>
                          <td className="px-6 py-4 font-bold">{client.email}</td>
                          <td className="px-6 py-4 font-bold text-slate-300">{client.phone}</td>
                          <td className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{new Date(client.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden min-h-[400px]">
              <div className="px-6 py-5 border-b border-slate-800 bg-[#0d131f] flex justify-between items-center">
                <h3 className="font-bold text-white">Client Inquiries & Orders</h3>
                <span className="bg-blue-600/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Total: {inquiries.length}</span>
              </div>
              
              {inquiries.length === 0 ? (
                <div className="p-16 flex flex-col items-center justify-center text-center"><span className="text-5xl mb-4 opacity-50">💬</span><p className="text-slate-500 text-sm mb-6">Hakuna maombi kutoka kwa wateja bado.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-[#0B1120] text-[10px] uppercase border-b border-slate-800 tracking-widest text-slate-500">
                      <tr><th className="px-6 py-5 font-black">Tarehe</th><th className="px-6 py-5 font-black">Mawasiliano</th><th className="px-6 py-5 font-black">Maelezo ya Ujumbe</th><th className="px-6 py-5 font-black text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                      {inquiries.map(inq => (
                        <tr key={inq.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{new Date(inq.created_at).toLocaleDateString('en-GB')}</td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-white text-sm">{inq.client_email || 'Unknown Client'}</p>
                            <p className="text-[10px] font-bold text-emerald-400 mt-1">{inq.contact_phone}</p>
                          </td>
                          <td className="px-6 py-4"><p className="text-sm font-medium text-slate-300 max-w-md truncate">{inq.customer_message}</p></td>
                          <td className="px-6 py-4 text-right">
                            <a href={`https://wa.me/${inq.contact_phone.replace(/\+/g, '')}?text=Habari,%20tunajibu%20ombi%20lako%20kupitia%20GariHub:`} target="_blank" rel="noreferrer" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-black transition-all inline-block">Jibu WhatsApp</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: SOS MECHANICS */}
          {activeTab === 'sos' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mechanics.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-[#0F172A] rounded-3xl border border-slate-800"><span className="text-5xl opacity-50 block mb-4">🛠️</span><p className="text-slate-400 text-sm mb-6">Hujaweka fundi yoyote.</p><button onClick={() => setShowAddMechanicModal(true)} className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase">Register Mechanic</button></div>
              ) : (
                mechanics.map(mech => (
                  <div key={mech.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                    <img src={mech.profile_image || 'https://via.placeholder.com/400x300'} className="w-full h-48 object-cover" />
                    <div className="p-5">
                      <h3 className="font-black text-white text-lg mb-1">{mech.full_name}</h3>
                      <p className="text-purple-400 font-black text-xs mb-1">{mech.specialty}</p>
                      <p className="text-slate-500 text-[10px] font-bold mb-4 uppercase">{mech.location} • {mech.phone_number}</p>
                      <button onClick={() => handleDeleteCar(mech.id, 'mechanics')} className="w-full bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 py-2 rounded-lg font-bold text-xs transition-colors">🗑️ Remove Mechanic</button>
                    </div>
                  </div>
                ))
              )}
             </div>
          )}
        </div>
      </main>

      {/* ========================================== */}
      {/* MODALS ZOTE NNE (4) - FOMU KAMILI HAZIJAKATWA */}
      {/* ========================================== */}

      {/* 1. MODAL: ADD SHOWROOM CAR */}
      {showAddCarModal && (
        <div className="fixed inset-0 bg-[#0B1120]/90 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-[#0d131f]">
              <div><h2 className="text-xl font-black text-white">{editingCarId ? 'Edit Vehicle Info' : 'Register Showroom Vehicle'}</h2></div>
              <button onClick={() => setShowAddCarModal(false)} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300">✕</button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form id="showroom-form" onSubmit={handleSaveShowroomCar} className="space-y-8">
                
                <MultiImageUploader formState={carForm} formType="showroom" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Stock Origin</h4>
                    <div className="flex space-x-4">
                      <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer ${carForm.stock_location === 'OVERSEAS' ? 'bg-blue-600/10 border-blue-500 text-white' : 'border-slate-700 text-slate-400'}`}><input type="radio" value="OVERSEAS" checked={carForm.stock_location === 'OVERSEAS'} onChange={() => setCarForm({...carForm, stock_location: 'OVERSEAS'})} className="hidden" /><span className="font-bold text-sm">🚢 Overseas</span></label>
                      <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer ${carForm.stock_location === 'TANZANIA' ? 'bg-amber-500/10 border-amber-500 text-white' : 'border-slate-700 text-slate-400'}`}><input type="radio" value="TANZANIA" checked={carForm.stock_location === 'TANZANIA'} onChange={() => setCarForm({...carForm, stock_location: 'TANZANIA'})} className="hidden" /><span className="font-bold text-sm">🇹🇿 Tanzania</span></label>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Vehicle Tags & Status</h4>
                    <select value={carForm.tag} onChange={e => setCarForm({...carForm, tag: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-4 focus:border-blue-500 font-bold">
                      <option value="NEW">✨ NEW (Gari Jipya)</option>
                      <option value="HOT">🔥 HOT DEAL (Inauza Sana)</option>
                      <option value="UNDER OFFER">⏳ UNDER OFFER (Linaongelewa)</option>
                      <option value="SOLD OUT">❌ SOLD OUT (Limeuzwa)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Vehicle Specs</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Make</label><input type="text" required value={carForm.make} onChange={e => setCarForm({...carForm, make: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="Toyota" /></div>
                    <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Model</label><input type="text" required value={carForm.model} onChange={e => setCarForm({...carForm, model: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="Prado" /></div>
                    <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Year</label><input type="number" required value={carForm.year} onChange={e => setCarForm({...carForm, year: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="2018" /></div>
                    <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Category</label><select value={carForm.category} onChange={e => setCarForm({...carForm, category: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3"><option>SUV</option><option>Sedan</option><option>Hatchback</option><option>Pickup</option><option>Van</option></select></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Engine CC</label><input type="text" required value={carForm.engine_cc} onChange={e => setCarForm({...carForm, engine_cc: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="2500cc" /></div>
                    <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Mileage (Km)</label><input type="text" required value={carForm.mileage} onChange={e => setCarForm({...carForm, mileage: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="65000" /></div>
                    <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Transmission</label><select value={carForm.transmission} onChange={e => setCarForm({...carForm, transmission: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3"><option>Automatic</option><option>Manual</option></select></div>
                    <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Fuel Type</label><select value={carForm.fuel} onChange={e => setCarForm({...carForm, fuel: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3"><option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Rangi (Color)</label><input type="text" required value={carForm.color} onChange={e => setCarForm({...carForm, color: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="Nyeusi (Black)" /></div>
                    <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Viti (Seats)</label><input type="number" required value={carForm.seats} onChange={e => setCarForm({...carForm, seats: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="5" /></div>
                    <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Drive System</label><select value={carForm.drive_system} onChange={e => setCarForm({...carForm, drive_system: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3"><option>2WD</option><option>4WD</option><option>AWD</option></select></div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-[10px] font-bold text-blue-500 mb-2 uppercase">{carForm.stock_location === 'OVERSEAS' ? 'FOB Price (USD $)' : 'Cash Price (TZS)'}</label>
                    <input type="number" required value={carForm.price} onChange={e => setCarForm({...carForm, price: e.target.value})} className="w-full bg-[#0B1120] border border-blue-500 text-white rounded-xl px-4 py-3" placeholder="E.g. 15000" />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Vehicle Features</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {CAR_FEATURES_LIST.map(feature => (
                      <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={carForm.features.includes(feature)} onChange={() => toggleFeature(feature, 'showroom')} className="w-4 h-4 accent-blue-600 bg-slate-800 rounded" />
                        <span className="text-xs text-slate-300">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            <div className="px-8 py-5 border-t border-slate-800 bg-[#0d131f] flex justify-end space-x-4">
              <button onClick={() => setShowAddCarModal(false)} className="px-6 py-3 rounded-xl font-bold text-xs text-slate-400 hover:bg-slate-800">Cancel</button>
              <button form="showroom-form" type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-blue-600/30 disabled:opacity-50">{loading ? 'Processing...' : (editingCarId ? 'Update Vehicle' : 'Save Vehicle')}</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL: ADD RENTAL CAR */}
      {showAddRentalModal && (
        <div className="fixed inset-0 bg-[#0B1120]/90 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-[#0d131f]">
              <div><h2 className="text-xl font-black text-white">Add Rental Vehicle</h2></div>
              <button onClick={() => setShowAddRentalModal(false)} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300">✕</button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form id="rental-form" onSubmit={handleSaveRentalCar} className="space-y-8">
                <MultiImageUploader formState={rentalForm} formType="rental" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Make</label><input type="text" required value={rentalForm.make} onChange={e => setRentalForm({...rentalForm, make: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="Toyota" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Model</label><input type="text" required value={rentalForm.model} onChange={e => setRentalForm({...rentalForm, model: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="Alphard" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Year</label><input type="number" required value={rentalForm.year} onChange={e => setRentalForm({...rentalForm, year: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="2020" /></div>
                  <div><label className="block text-[10px] font-bold text-amber-500 mb-2 uppercase">Price Per Day (TZS)</label><input type="number" required value={rentalForm.price_per_day} onChange={e => setRentalForm({...rentalForm, price_per_day: e.target.value})} className="w-full bg-[#0B1120] border border-amber-500 text-white rounded-xl px-4 py-3" placeholder="150000" /></div>
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Rental Features</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {CAR_FEATURES_LIST.map(feature => (
                      <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={rentalForm.features.includes(feature)} onChange={() => toggleFeature(feature, 'rental')} className="w-4 h-4 accent-amber-500 bg-slate-800 rounded" />
                        <span className="text-xs text-slate-300">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            <div className="px-8 py-5 border-t border-slate-800 bg-[#0d131f] flex justify-end space-x-4">
              <button onClick={() => setShowAddRentalModal(false)} className="px-6 py-3 rounded-xl font-bold text-xs text-slate-400 hover:bg-slate-800">Cancel</button>
              <button form="rental-form" type="submit" disabled={loading} className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-amber-600/30 disabled:opacity-50">{loading ? 'Saving Data...' : 'Save Rental Car'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL: ADD SPARE PART */}
      {showAddSpareModal && (
        <div className="fixed inset-0 bg-[#0B1120]/90 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-[#0d131f]">
              <div><h2 className="text-xl font-black text-white">Add Spare Part / Tool</h2></div>
              <button onClick={() => setShowAddSpareModal(false)} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300">✕</button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form id="spare-form" onSubmit={handleSaveSpare} className="space-y-8">
                <MultiImageUploader formState={spareForm} formType="spare" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Part Name</label><input type="text" required value={spareForm.part_name} onChange={e => setSpareForm({...spareForm, part_name: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="OBD2 Scanner" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Car Compatibility</label><input type="text" required value={spareForm.car_compatibility} onChange={e => setSpareForm({...spareForm, car_compatibility: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="Universal" /></div>
                  <div><label className="block text-[10px] font-bold text-emerald-500 mb-2 uppercase">Price (TZS)</label><input type="number" required value={spareForm.price} onChange={e => setSpareForm({...spareForm, price: e.target.value})} className="w-full bg-[#0B1120] border border-emerald-500 text-white rounded-xl px-4 py-3" placeholder="85000" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Stock Quantity</label><input type="number" required value={spareForm.stock_quantity} onChange={e => setSpareForm({...spareForm, stock_quantity: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="10" /></div>
                </div>
              </form>
            </div>
            <div className="px-8 py-5 border-t border-slate-800 bg-[#0d131f] flex justify-end space-x-4">
              <button onClick={() => setShowAddSpareModal(false)} className="px-6 py-3 rounded-xl font-bold text-xs text-slate-400 hover:bg-slate-800">Cancel</button>
              <button form="spare-form" type="submit" disabled={loading} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-emerald-600/30 disabled:opacity-50">{loading ? 'Saving...' : 'Save Spare Part'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: REGISTER MECHANIC */}
      {showAddMechanicModal && (
        <div className="fixed inset-0 bg-[#0B1120]/90 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-[#0d131f]">
              <div><h2 className="text-xl font-black text-white">Register SOS Mechanic</h2></div>
              <button onClick={() => setShowAddMechanicModal(false)} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300">✕</button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form id="mechanic-form" onSubmit={handleSaveMechanic} className="space-y-8">
                <MultiImageUploader formState={mechanicForm} formType="mechanic" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Full Name</label><input type="text" required value={mechanicForm.full_name} onChange={e => setMechanicForm({...mechanicForm, full_name: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="Fundi Juma" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Phone Number</label><input type="text" required value={mechanicForm.phone_number} onChange={e => setMechanicForm({...mechanicForm, phone_number: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="0700 000 000" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Specialty</label><select value={mechanicForm.specialty} onChange={e => setMechanicForm({...mechanicForm, specialty: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3"><option>General Mechanic</option><option>Auto Electrician</option></select></div>
                  <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Location Base</label><input type="text" required value={mechanicForm.location} onChange={e => setMechanicForm({...mechanicForm, location: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3" placeholder="Kijitonyama, Dar es Salaam" /></div>
                </div>
              </form>
            </div>
            <div className="px-8 py-5 border-t border-slate-800 bg-[#0d131f] flex justify-end space-x-4">
              <button onClick={() => setShowAddMechanicModal(false)} className="px-6 py-3 rounded-xl font-bold text-xs text-slate-400 hover:bg-slate-800">Cancel</button>
              <button form="mechanic-form" type="submit" disabled={loading} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-purple-600/30 disabled:opacity-50">{loading ? 'Saving...' : 'Register Mechanic'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}