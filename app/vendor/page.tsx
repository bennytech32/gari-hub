"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

// Features List
const CAR_FEATURES_LIST = ['Sunroof', 'Leather Seats', '360 Camera', 'Push to Start', 'Alloy Wheels', 'Bluetooth', 'Navigation System', 'Parking Sensors'];

export default function VendorPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'sw' | 'en'>('sw'); // Default Swahili for Vendors
  
  // AUTH STATES
  const [session, setSession] = useState<any>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authData, setAuthData] = useState({ email: '', password: '', companyName: '', phone: '' });
  const [authLoading, setAuthLoading] = useState(false);

  // VENDOR PROFILE
  const [vendorProfile, setVendorProfile] = useState<any>(null);

  // DASHBOARD STATES
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [spares, setSpares] = useState<any[]>([]);

  // MODAL STATES & FORMS
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [showAddRentalModal, setShowAddRentalModal] = useState(false);
  const [showAddSpareModal, setShowAddSpareModal] = useState(false);

  const [carForm, setCarForm] = useState({ make: '', model: '', year: '', category: 'SUV', mileage: '', engine_cc: '', transmission: 'Automatic', fuel: 'Petrol', color: '', seats: '', drive_system: '2WD', stock_location: 'OVERSEAS', price: '', tag: 'NEW', features: [] as string[], imageFiles: [] as File[], imagePreviews: [] as string[] });
  const [rentalForm, setRentalForm] = useState({ make: '', model: '', year: '', category: 'SUV', price_per_day: '', transmission: 'Automatic', fuel: 'Petrol', features: [] as string[], imageFiles: [] as File[], imagePreviews: [] as string[] });
  const [spareForm, setSpareForm] = useState({ part_name: '', category: 'Engine Parts', car_compatibility: '', price: '', stock_quantity: '', condition: 'Brand New', imageFiles: [] as File[], imagePreviews: [] as string[] });

  // DICTIONARY (LUGHA MBILI KWA VENDORS)
  const t = {
    en: {
      authTitle: "Vendor Portal", authLoginDesc: "Login to your dealership workspace.", authRegDesc: "Become a verified seller and reach more buyers.",
      compName: "Dealership / Company Name", phone: "Phone Number", email: "Email Address", pass: "Password",
      loginBtn: "Login to Workspace", regBtn: "Create Vendor Account", switchReg: "No account? Register here.", switchLog: "Have an account? Login here.",
      wait: "Please wait...",
      myCars: "My Vehicles", myRentals: "My Rentals", mySpares: "My Spares", logout: "Logout",
      addCar: "Add New Vehicle", addRental: "Add Rental Car", addSpare: "Add Spare Part",
      noCars: "You haven't listed any vehicles.", noRentals: "No rentals listed.", noSpares: "No spares listed.",
      expTitle: "Listing Expired", expDesc: "Listed for 14 days without sale. Hidden from buyers.", renewBtn: "🔄 Confirm & Renew Listing",
      uploadTitle: "Upload Photos (Select Multiple)", coverNote: "First image is the cover photo.", addPhoto: "Add Photo",
      origin: "Stock Origin", overseas: "Overseas (Import)", local: "Local Stock (Tanzania)",
      specs: "Vehicle Specifications", make: "Make", model: "Model", year: "Year", category: "Category",
      engine: "Engine CC", mileage: "Mileage (km)", trans: "Transmission", fuel: "Fuel",
      color: "Color", seats: "Seats", drive: "Drive System",
      fobPrice: "FOB Price (USD $)", cashPrice: "Cash Price (TZS)", features: "Vehicle Features",
      cancel: "Cancel", saveCar: "Save Vehicle", saveRent: "Save Rental", saveSpare: "Save Spare Part",
      pricePerDay: "Price Per Day (TZS)", partName: "Part Name", compat: "Car Compatibility", stockQty: "Stock Quantity"
    },
    sw: {
      authTitle: "Ofisi ya Wauzaji", authLoginDesc: "Ingia kwenye ofisi yako ya uwakala.", authRegDesc: "Kuwa Wakala/Muuzaji ufikie wateja wengi zaidi.",
      compName: "Jina la Kampuni/Biashara", phone: "Namba ya Simu", email: "Barua Pepe (Email)", pass: "Nenosiri (Password)",
      loginBtn: "Ingia Ofisini", regBtn: "Tengeneza Akaunti", switchReg: "Huna akaunti? Jisajili hapa.", switchLog: "Unayo akaunti? Ingia hapa.",
      wait: "Tafadhali subiri...",
      myCars: "Magari Yangu", myRentals: "Magari ya Kukodisha", mySpares: "Vipuri Vyangu", logout: "Ondoka (Logout)",
      addCar: "Weka Gari Jipya", addRental: "Weka Gari la Kukodisha", addSpare: "Weka Kipuri",
      noCars: "Hujaweka gari lolote sokoni.", noRentals: "Hujaweka gari la kukodisha.", noSpares: "Hujaweka vipuri vyovyote.",
      expTitle: "Muda Umeisha", expDesc: "Gari limekaa siku 14 bila kuuzwa. Halionekani kwa wateja.", renewBtn: "🔄 Thibitisha Lipo & Lirudishe",
      uploadTitle: "Pakia Picha (Chagua Nyingi)", coverNote: "Picha ya kwanza itakuwa Cover.", addPhoto: "Weka Picha",
      origin: "Gari Lipo Wapi?", overseas: "Nje (Japan/UK)", local: "Tanzania (Mkononi)",
      specs: "Taarifa za Gari", make: "Aina (Make)", model: "Toleo (Model)", year: "Mwaka", category: "Kundi",
      engine: "Engine CC", mileage: "Mileage (Km)", trans: "Transmission", fuel: "Mafuta",
      color: "Rangi", seats: "Viti", drive: "Mfumo (Drive)",
      fobPrice: "Bei ya Nje (FOB kwa $)", cashPrice: "Bei ya Cash (TZS)", features: "Sifa za Ziada (Features)",
      cancel: "Ghairi", saveCar: "Hifadhi Gari", saveRent: "Hifadhi Gari la Kukodisha", saveSpare: "Hifadhi Kipuri",
      pricePerDay: "Bei Kwa Siku (TZS)", partName: "Jina la Kipuri", compat: "Inafaa Gari Gani?", stockQty: "Idadi (Stock)"
    }
  };
  const currT = t[lang];

  useEffect(() => { checkSession(); }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (session) await fetchVendorProfile(session.user.email);
    else setLoading(false);
  };

  const fetchVendorProfile = async (email: string) => {
    try {
      const { data, error } = await supabase.from('vendors').select('*').eq('email', email).single();
      if (data) {
        setVendorProfile(data);
        fetchVendorData(data.vendor_code);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchVendorData = async (vendorCode: string) => {
    const { data: cars } = await supabase.from('vehicles').select('*').eq('vendor_id', vendorCode).order('created_at', { ascending: false });
    const { data: rent } = await supabase.from('rentals').select('*').eq('vendor_id', vendorCode).order('created_at', { ascending: false });
    const { data: parts } = await supabase.from('spares').select('*').eq('vendor_id', vendorCode).order('created_at', { ascending: false });
    if (cars) setInventory(cars); if (rent) setRentals(rent); if (parts) setSpares(parts);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true);
    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email: authData.email, password: authData.password });
        if (error) throw error;
        window.location.reload();
      } else {
        const vendorCode = `VND-${Math.floor(1000 + Math.random() * 9000)}`;
        const { error: authErr } = await supabase.auth.signUp({ email: authData.email, password: authData.password });
        if (authErr) throw authErr;
        const { error: dbErr } = await supabase.from('vendors').insert([{ vendor_code: vendorCode, company_name: authData.companyName, phone: authData.phone, email: authData.email }]);
        if (dbErr) throw dbErr;
        alert(`Imekamilika! Vendor ID yako ni: ${vendorCode}`);
        window.location.reload();
      }
    } catch (err: any) { alert(`Kosa: ${err.message}`); } finally { setAuthLoading(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.reload(); };

  // 14-DAY RULE
  const checkExpiry = (lastRenewedDate: string) => {
    const now = new Date(); const renewedDate = new Date(lastRenewedDate);
    const diffDays = Math.floor((now.getTime() - renewedDate.getTime()) / (1000 * 3600 * 24));
    return diffDays >= 14;
  };

  const handleRenewListing = async (carId: string) => {
    if (!window.confirm(lang === 'sw' ? "Je, gari hili bado lipo sokoni?" : "Confirm this vehicle is still available?")) return;
    try {
      await supabase.from('vehicles').update({ last_renewed: new Date().toISOString(), tag: 'NEW' }).eq('id', carId);
      alert(lang === 'sw' ? "Gari limerudi hewani!" : "Vehicle renewed successfully!");
      fetchVendorData(vendorProfile.vendor_code);
    } catch (err: any) { alert(err.message); }
  };

  // UPLOAD & FORM HANDLERS
  const handleMultiImageSelect = (e: React.ChangeEvent<HTMLInputElement>, formType: string) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files); const previewsArray = filesArray.map(file => URL.createObjectURL(file));
      if (formType === 'showroom') setCarForm(prev => ({ ...prev, imageFiles: [...prev.imageFiles, ...filesArray], imagePreviews: [...prev.imagePreviews, ...previewsArray] }));
      else if (formType === 'rental') setRentalForm(prev => ({ ...prev, imageFiles: [...prev.imageFiles, ...filesArray], imagePreviews: [...prev.imagePreviews, ...previewsArray] }));
      else if (formType === 'spare') setSpareForm(prev => ({ ...prev, imageFiles: [...prev.imageFiles, ...filesArray], imagePreviews: [...prev.imagePreviews, ...previewsArray] }));
    }
  };

  const removeImage = (indexToRemove: number, formType: string) => {
    if (formType === 'showroom') setCarForm(prev => ({ ...prev, imageFiles: prev.imageFiles.filter((_, i) => i !== indexToRemove), imagePreviews: prev.imagePreviews.filter((_, i) => i !== indexToRemove) }));
    else if (formType === 'rental') setRentalForm(prev => ({ ...prev, imageFiles: prev.imageFiles.filter((_, i) => i !== indexToRemove), imagePreviews: prev.imagePreviews.filter((_, i) => i !== indexToRemove) }));
    else if (formType === 'spare') setSpareForm(prev => ({ ...prev, imageFiles: prev.imageFiles.filter((_, i) => i !== indexToRemove), imagePreviews: prev.imagePreviews.filter((_, i) => i !== indexToRemove) }));
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

  const handleSaveShowroomCar = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const generatedStockId = `GH-${Math.floor(1000 + Math.random() * 9000)}`;
      const imageUrls = await uploadImagesToSupabase(carForm.imageFiles);
      const { error } = await supabase.from('vehicles').insert([{
        stock_id: generatedStockId, vendor_id: vendorProfile.vendor_code,
        make: carForm.make, model: carForm.model, year: carForm.year, category: carForm.category, mileage: carForm.mileage, engine_cc: carForm.engine_cc, transmission: carForm.transmission, fuel: carForm.fuel, color: carForm.color, seats: carForm.seats, drive_system: carForm.drive_system,
        location_from: carForm.stock_location, fob_price: carForm.stock_location === 'OVERSEAS' ? Number(carForm.price) : 0, cif_price: carForm.stock_location === 'TANZANIA' ? Number(carForm.price) : 0, tag: 'NEW', features: carForm.features, location: imageUrls[0] || '', gallery: imageUrls,
        last_renewed: new Date().toISOString()
      }]);
      if (error) throw error;
      setShowAddCarModal(false); fetchVendorData(vendorProfile.vendor_code);
      setCarForm({ make: '', model: '', year: '', category: 'SUV', mileage: '', engine_cc: '', transmission: 'Automatic', fuel: 'Petrol', color: '', seats: '', drive_system: '2WD', stock_location: 'OVERSEAS', price: '', tag: 'NEW', features: [], imageFiles: [], imagePreviews: [] });
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleSaveRentalCar = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const generatedStockId = `RENT-${Math.floor(1000 + Math.random() * 9000)}`;
      const imageUrls = await uploadImagesToSupabase(rentalForm.imageFiles);
      const { error } = await supabase.from('rentals').insert([{ stock_id: generatedStockId, vendor_id: vendorProfile.vendor_code, make: rentalForm.make, model: rentalForm.model, year: rentalForm.year, category: rentalForm.category, price_per_day: Number(rentalForm.price_per_day), transmission: rentalForm.transmission, fuel: rentalForm.fuel, features: rentalForm.features, main_image: imageUrls[0] || '', gallery: imageUrls }]);
      if (error) throw error;
      setShowAddRentalModal(false); fetchVendorData(vendorProfile.vendor_code);
      setRentalForm({ make: '', model: '', year: '', category: 'SUV', price_per_day: '', transmission: 'Automatic', fuel: 'Petrol', features: [], imageFiles: [], imagePreviews: [] });
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleSaveSpare = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const imageUrls = await uploadImagesToSupabase(spareForm.imageFiles);
      const { error } = await supabase.from('spares').insert([{ vendor_id: vendorProfile.vendor_code, part_name: spareForm.part_name, category: spareForm.category, car_compatibility: spareForm.car_compatibility, price: Number(spareForm.price), stock_quantity: Number(spareForm.stock_quantity), condition: spareForm.condition, main_image: imageUrls[0] || '', gallery: imageUrls }]);
      if (error) throw error;
      setShowAddSpareModal(false); fetchVendorData(vendorProfile.vendor_code);
      setSpareForm({ part_name: '', category: 'Engine Parts', car_compatibility: '', price: '', stock_quantity: '', condition: 'Brand New', imageFiles: [], imagePreviews: [] });
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  // MULTI IMAGE UI COMPONENT
  const MultiImageUploader = ({ formState, formType }: { formState: any, formType: any }) => (
    <div>
      <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">{currT.uploadTitle}</h4>
      <div className="flex flex-wrap gap-4 mb-2">
        {formState.imagePreviews.map((preview: string, index: number) => (
          <div key={index} className="relative w-20 h-20 rounded-xl border border-slate-700 overflow-hidden group">
            <img src={preview} className="w-full h-full object-cover" />
            <button type="button" onClick={() => removeImage(index, formType)} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 text-xs rounded-full flex items-center justify-center">✕</button>
          </div>
        ))}
        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center bg-slate-800 hover:bg-slate-700 transition-colors">
          <input type="file" id={`upload-${formType}`} multiple accept="image/*" onChange={(e) => handleMultiImageSelect(e, formType)} className="hidden" />
          <label htmlFor={`upload-${formType}`} className="cursor-pointer text-center text-slate-400 hover:text-white"><span className="text-xl block">➕</span></label>
        </div>
      </div>
      <p className="text-[9px] text-slate-500">{currT.coverNote}</p>
    </div>
  );

  // -------------------------------------------------------------
  // UI: AUTH SCREEN (KAMA HANA SESSION)
  // -------------------------------------------------------------
  if (loading && !session) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-white">Loading...</div>;

  if (!session || !vendorProfile) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 relative">
        <div className="absolute top-6 right-6 flex gap-3">
          <button onClick={() => setLang('en')} className={`text-xs font-bold px-3 py-1 rounded-lg border ${lang === 'en' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700 text-slate-400'}`}>EN</button>
          <button onClick={() => setLang('sw')} className={`text-xs font-bold px-3 py-1 rounded-lg border ${lang === 'sw' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700 text-slate-400'}`}>SW</button>
        </div>
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white">Gari<span className="text-blue-500">Hub</span> <span className="text-emerald-400">Vendors</span></h1>
            <p className="text-slate-400 text-sm mt-2">{isLoginMode ? currT.authLoginDesc : currT.authRegDesc}</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLoginMode && (
              <>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{currT.compName}</label><input type="text" required value={authData.companyName} onChange={e => setAuthData({...authData, companyName: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500" /></div>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{currT.phone}</label><input type="text" required value={authData.phone} onChange={e => setAuthData({...authData, phone: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500" /></div>
              </>
            )}
            <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{currT.email}</label><input type="email" required value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500" /></div>
            <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{currT.pass}</label><input type="password" required value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500" /></div>
            <button type="submit" disabled={authLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg mt-4 uppercase tracking-widest text-xs transition-colors">
              {authLoading ? currT.wait : (isLoginMode ? currT.loginBtn : currT.regBtn)}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-xs text-blue-400 font-bold hover:text-blue-300">
              {isLoginMode ? currT.switchReg : currT.switchLog}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // UI: DASHBOARD YA VENDOR PAMOJA NA FOMU KAMILI
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0B1120] flex font-sans text-slate-200">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0F172A] border-r border-slate-800 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-lg font-black text-white truncate">{vendorProfile.company_name}</h1>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">ID: {vendorProfile.vendor_code}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>🚘 {currT.myCars}</button>
          <button onClick={() => setActiveTab('rentals')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'rentals' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>🔑 {currT.myRentals}</button>
          <button onClick={() => setActiveTab('spares')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'spares' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>⚙️ {currT.mySpares}</button>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex gap-2 justify-center">
            <button onClick={() => setLang('en')} className={`text-xs font-bold px-3 py-1 rounded border ${lang === 'en' ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-800 text-slate-500'}`}>EN</button>
            <button onClick={() => setLang('sw')} className={`text-xs font-bold px-3 py-1 rounded border ${lang === 'sw' ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-800 text-slate-500'}`}>SW</button>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-bold text-xs uppercase">{currT.logout}</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-[#0F172A] border-b border-slate-800 p-6 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-black text-white uppercase tracking-widest">{activeTab === 'inventory' ? currT.myCars : activeTab === 'rentals' ? currT.myRentals : currT.mySpares}</h2>
          {activeTab === 'inventory' && <button onClick={() => setShowAddCarModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-black text-[10px] sm:text-xs uppercase flex items-center gap-2">➕ {currT.addCar}</button>}
          {activeTab === 'rentals' && <button onClick={() => setShowAddRentalModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl font-black text-[10px] sm:text-xs uppercase flex items-center gap-2">➕ {currT.addRental}</button>}
          {activeTab === 'spares' && <button onClick={() => setShowAddSpareModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-black text-[10px] sm:text-xs uppercase flex items-center gap-2">➕ {currT.addSpare}</button>}
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          
          {/* CARS INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {inventory.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-[#0F172A] rounded-3xl border border-slate-800"><span className="text-4xl opacity-50 block mb-3">🚘</span><p className="text-slate-400 text-sm mb-4">{currT.noCars}</p></div>
              ) : (
                inventory.map(car => {
                  const isExpired = checkExpiry(car.last_renewed || car.created_at);
                  return (
                    <div key={car.id} className={`bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-lg ${isExpired ? 'border-red-500/50 relative' : ''}`}>
                      {isExpired && (
                         <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 text-center">
                           <span className="text-3xl mb-2">⏳</span>
                           <h3 className="text-red-400 font-black text-sm mb-1 uppercase tracking-widest">{currT.expTitle}</h3>
                           <p className="text-[10px] text-slate-300 mb-4 px-2">{currT.expDesc}</p>
                           <button onClick={() => handleRenewListing(car.id)} className="bg-blue-600 text-white font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-lg shadow-lg">{currT.renewBtn}</button>
                         </div>
                      )}
                      <img src={car.location || 'https://via.placeholder.com/400x300'} className="w-full h-40 object-cover" />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-black text-white text-sm truncate">{car.make} {car.model}</h3>
                          <span className="text-blue-400 font-black text-xs">{car.location_from === 'TANZANIA' ? `TZS ${car.cif_price.toLocaleString()}` : `$${car.fob_price.toLocaleString()}`}</span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Ref: {car.stock_id} • {car.year}</p>
                        <div className="flex justify-between items-center text-[10px] font-bold border-t border-slate-800 pt-3">
                          <span className={`px-2 py-1 rounded ${car.tag === 'SOLD OUT' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-400'}`}>{car.tag}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* RENTALS INVENTORY */}
          {activeTab === 'rentals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
               {rentals.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-[#0F172A] rounded-3xl border border-slate-800"><span className="text-4xl opacity-50 block mb-3">🔑</span><p className="text-slate-400 text-sm mb-4">{currT.noRentals}</p></div>
              ) : (
                rentals.map(car => (
                  <div key={car.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                    <img src={car.main_image || 'https://via.placeholder.com/400x300'} className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <h3 className="font-black text-white text-sm truncate mb-1">{car.make} {car.model}</h3>
                      <p className="text-amber-400 font-black text-xs mb-3">TZS {car.price_per_day.toLocaleString()} / Day</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SPARES INVENTORY */}
          {activeTab === 'spares' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
               {spares.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-[#0F172A] rounded-3xl border border-slate-800"><span className="text-4xl opacity-50 block mb-3">⚙️</span><p className="text-slate-400 text-sm mb-4">{currT.noSpares}</p></div>
              ) : (
                spares.map(part => (
                  <div key={part.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                    <img src={part.main_image || 'https://via.placeholder.com/400x300'} className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <h3 className="font-black text-white text-sm truncate mb-1">{part.part_name}</h3>
                      <p className="text-emerald-400 font-black text-xs mb-3">TZS {part.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* ========================================= */}
      {/* MODAL: ADD SHOWROOM CAR (FULL FORM BILINGUAL) */}
      {/* ========================================= */}
      {showAddCarModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#0d131f]">
              <h2 className="text-lg font-black text-white">{currT.addCar}</h2>
              <button onClick={() => setShowAddCarModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="showroom-form" onSubmit={handleSaveShowroomCar} className="space-y-6">
                
                <MultiImageUploader formState={carForm} formType="showroom" />

                <div>
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">{currT.origin}</h4>
                  <div className="flex gap-4">
                    <label className={`flex-1 p-3 border rounded-xl cursor-pointer ${carForm.stock_location === 'OVERSEAS' ? 'bg-blue-600/10 border-blue-500 text-white' : 'border-slate-700 text-slate-400'}`}><input type="radio" value="OVERSEAS" checked={carForm.stock_location === 'OVERSEAS'} onChange={() => setCarForm({...carForm, stock_location: 'OVERSEAS'})} className="hidden" /><span className="font-bold text-xs">🚢 {currT.overseas}</span></label>
                    <label className={`flex-1 p-3 border rounded-xl cursor-pointer ${carForm.stock_location === 'TANZANIA' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'border-slate-700 text-slate-400'}`}><input type="radio" value="TANZANIA" checked={carForm.stock_location === 'TANZANIA'} onChange={() => setCarForm({...carForm, stock_location: 'TANZANIA'})} className="hidden" /><span className="font-bold text-xs">🇹🇿 {currT.local}</span></label>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">{currT.specs}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.make}</label><input type="text" required value={carForm.make} onChange={e => setCarForm({...carForm, make: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="Toyota" /></div>
                    <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.model}</label><input type="text" required value={carForm.model} onChange={e => setCarForm({...carForm, model: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="Prado" /></div>
                    <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.year}</label><input type="number" required value={carForm.year} onChange={e => setCarForm({...carForm, year: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="2018" /></div>
                    <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.category}</label><select value={carForm.category} onChange={e => setCarForm({...carForm, category: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm"><option>SUV</option><option>Sedan</option><option>Hatchback</option><option>Pickup</option><option>Van</option></select></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.engine}</label><input type="text" required value={carForm.engine_cc} onChange={e => setCarForm({...carForm, engine_cc: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="2500cc" /></div>
                    <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.mileage}</label><input type="text" required value={carForm.mileage} onChange={e => setCarForm({...carForm, mileage: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="65000" /></div>
                    <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.trans}</label><select value={carForm.transmission} onChange={e => setCarForm({...carForm, transmission: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm"><option>Automatic</option><option>Manual</option></select></div>
                    <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.fuel}</label><select value={carForm.fuel} onChange={e => setCarForm({...carForm, fuel: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm"><option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.color}</label><input type="text" required value={carForm.color} onChange={e => setCarForm({...carForm, color: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="Black" /></div>
                    <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.seats}</label><input type="number" required value={carForm.seats} onChange={e => setCarForm({...carForm, seats: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="5" /></div>
                    <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.drive}</label><select value={carForm.drive_system} onChange={e => setCarForm({...carForm, drive_system: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm"><option>2WD</option><option>4WD</option><option>AWD</option></select></div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-[10px] font-bold text-emerald-400 mb-1 uppercase">{carForm.stock_location === 'OVERSEAS' ? currT.fobPrice : currT.cashPrice}</label>
                    <input type="number" required value={carForm.price} onChange={e => setCarForm({...carForm, price: e.target.value})} className="w-full bg-[#0B1120] border border-emerald-500/50 text-white rounded-lg px-4 py-3 text-lg font-black" placeholder="15000" />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">{currT.features}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {CAR_FEATURES_LIST.map(feature => (
                      <label key={feature} className="flex items-center gap-2 cursor-pointer bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                        <input type="checkbox" checked={carForm.features.includes(feature)} onChange={() => toggleFeature(feature, 'showroom')} className="w-3 h-3 accent-blue-600" />
                        <span className="text-[10px] text-slate-300 font-bold">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 bg-[#0d131f] flex justify-end gap-3">
              <button onClick={() => setShowAddCarModal(false)} className="px-5 py-2 rounded-lg font-bold text-xs text-slate-400 hover:bg-slate-800">{currT.cancel}</button>
              <button form="showroom-form" type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-black text-xs uppercase shadow-lg disabled:opacity-50">{loading ? currT.wait : currT.saveCar}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD RENTAL CAR */}
      {showAddRentalModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#0d131f]"><h2 className="text-lg font-black text-white">{currT.addRental}</h2><button onClick={() => setShowAddRentalModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button></div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="rental-form" onSubmit={handleSaveRentalCar} className="space-y-6">
                <MultiImageUploader formState={rentalForm} formType="rental" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.make}</label><input type="text" required value={rentalForm.make} onChange={e => setRentalForm({...rentalForm, make: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="Toyota" /></div>
                  <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.model}</label><input type="text" required value={rentalForm.model} onChange={e => setRentalForm({...rentalForm, model: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="Alphard" /></div>
                  <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.year}</label><input type="number" required value={rentalForm.year} onChange={e => setRentalForm({...rentalForm, year: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="2020" /></div>
                  <div><label className="block text-[9px] font-bold text-amber-500 mb-1 uppercase">{currT.pricePerDay}</label><input type="number" required value={rentalForm.price_per_day} onChange={e => setRentalForm({...rentalForm, price_per_day: e.target.value})} className="w-full bg-[#0B1120] border border-amber-500/50 text-white rounded-lg px-3 py-2.5 text-sm font-black" placeholder="150000" /></div>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 bg-[#0d131f] flex justify-end gap-3">
              <button onClick={() => setShowAddRentalModal(false)} className="px-5 py-2 rounded-lg font-bold text-xs text-slate-400">{currT.cancel}</button>
              <button form="rental-form" type="submit" disabled={loading} className="px-6 py-2 bg-amber-600 text-white rounded-lg font-black text-xs uppercase shadow-lg disabled:opacity-50">{loading ? currT.wait : currT.saveRent}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SPARE PART */}
      {showAddSpareModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#0d131f]"><h2 className="text-lg font-black text-white">{currT.addSpare}</h2><button onClick={() => setShowAddSpareModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button></div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="spare-form" onSubmit={handleSaveSpare} className="space-y-6">
                <MultiImageUploader formState={spareForm} formType="spare" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.partName}</label><input type="text" required value={spareForm.part_name} onChange={e => setSpareForm({...spareForm, part_name: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="Brake Pads" /></div>
                  <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.compat}</label><input type="text" required value={spareForm.car_compatibility} onChange={e => setSpareForm({...spareForm, car_compatibility: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="Toyota Universal" /></div>
                  <div><label className="block text-[9px] font-bold text-emerald-500 mb-1 uppercase">{currT.cashPrice}</label><input type="number" required value={spareForm.price} onChange={e => setSpareForm({...spareForm, price: e.target.value})} className="w-full bg-[#0B1120] border border-emerald-500/50 text-white rounded-lg px-3 py-2.5 text-sm font-black" placeholder="85000" /></div>
                  <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">{currT.stockQty}</label><input type="number" required value={spareForm.stock_quantity} onChange={e => setSpareForm({...spareForm, stock_quantity: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="10" /></div>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 bg-[#0d131f] flex justify-end gap-3">
              <button onClick={() => setShowAddSpareModal(false)} className="px-5 py-2 rounded-lg font-bold text-xs text-slate-400">{currT.cancel}</button>
              <button form="spare-form" type="submit" disabled={loading} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-black text-xs uppercase shadow-lg disabled:opacity-50">{loading ? currT.wait : currT.saveSpare}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}