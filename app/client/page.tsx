"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

const CAR_FEATURES_LIST = ['Sunroof', 'Leather Seats', '360 Camera', 'Push to Start', 'Alloy Wheels', 'Bluetooth', 'Navigation System', 'Parking Sensors'];

export default function ClientPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'sw' | 'en'>('en');
  
  const [session, setSession] = useState<any>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authData, setAuthData] = useState({ fullName: '', phone: '', email: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [clientProfile, setClientProfile] = useState<any>(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [myInquiries, setMyInquiries] = useState<any[]>([]);
  const [myCars, setMyCars] = useState<any[]>([]); 

  const [sosForm, setSosForm] = useState({ carModel: '', issue: 'General Maintenance (Service)', location: '', date: '', phone: '' });
  const [sosLoading, setSosLoading] = useState(false);

  const [sellForm, setSellForm] = useState({ make: '', model: '', year: '', price: '', mileage: '', engine_cc: '', transmission: 'Automatic', features: [] as string[], imageFiles: [] as File[], imagePreviews: [] as string[] });
  const [sellLoading, setSellLoading] = useState(false);

  const t = {
    en: {
      authTitle: "Client Portal", authLoginDesc: "Login to track your orders and services.", authRegDesc: "Create an account for a seamless premium experience.",
      fullName: "Full Name", phone: "Phone Number", email: "Email Address", pass: "Password",
      loginBtn: "Login to Account", regBtn: "Create Account", switchReg: "Don't have an account? Sign up.", switchLog: "Already have an account? Login.",
      wait: "Please wait...", logout: "Logout",
      overview: "Overview", myOrders: "My Orders", wishlist: "Saved Cars", sos: "Book Service", sellCar: "Sell / Trade-In",
      welcome: "Welcome back,", welcomeDesc: "Manage your premium automotive experience.",
      statOrders: "Active Orders", statSaved: "Saved Vehicles", statSOS: "Service Requests",
      promoTitle: "🎁 Special Client Offer!", promoDesc: "Get a FREE full computer diagnostic and 1st maintenance service on your next purchase.",
      noData: "No records found.", browseBtn: "Browse Showroom",
      reqDate: "Date", reqType: "Request", reqStatus: "Status", reqDetails: "Details",
      statusPending: "Pending Review", statusContacted: "Agent Assigned", home: "Back Home",
      sosBookTitle: "Book a Mechanic / SOS", sosBookDesc: "Request emergency or scheduled maintenance.",
      carModel: "Vehicle Make & Model", issue: "Service Type / Issue", location: "Your Location", date: "Preferred Date", bookBtn: "Submit Request 🚀",
      sellTitle: "Sell Your Car / Trade-In", sellDesc: "Upload your car details. Our admins will review and publish it on the showroom.",
      price: "Asking Price (TZS)", uploadPhotos: "Upload Photos (Max 5)", submitSell: "Submit for Review",
      statusApproved: "Approved & Live", statusWaiting: "Awaiting Admin Approval"
    },
    sw: {
      authTitle: "Akaunti ya Mteja", authLoginDesc: "Ingia kufuatilia oda na huduma zako.", authRegDesc: "Tengeneza akaunti kwa huduma bora na za haraka.",
      fullName: "Jina Kamili", phone: "Namba ya Simu", email: "Barua Pepe (Email)", pass: "Nenosiri (Password)",
      loginBtn: "Ingia Kwenye Akaunti", regBtn: "Tengeneza Akaunti", switchReg: "Huna akaunti? Jisajili hapa.", switchLog: "Unayo akaunti? Ingia hapa.",
      wait: "Tafadhali subiri...", logout: "Ondoka (Logout)",
      overview: "Muhtasari", myOrders: "Oda Yangu", wishlist: "Magari Niliyopenda", sos: "Weka Miadi / SOS", sellCar: "Uza Gari / Trade-In",
      welcome: "Karibu tena,", welcomeDesc: "Fuatilia magari unayoagiza, uliyokodisha, na miadi yako ya mafundi.",
      statOrders: "Oda Zako", statSaved: "Magari Uliyohifadhi", statSOS: "Maombi ya Fundi",
      promoTitle: "🎁 Ofa Maalum Kwako!", promoDesc: "Gari lako utakalojipatia linakuja na Ukaguzi wa Kompyuta na Service ya Kwanza BURE.",
      noData: "Huna kumbukumbu yoyote kwa sasa.", browseBtn: "Nenda Showroom",
      reqDate: "Tarehe", reqType: "Ombi", reqStatus: "Status", reqDetails: "Maelezo",
      statusPending: "Inasubiri Wakala", statusContacted: "Wakala Amepangiwa", home: "Rudi Mwanzo",
      sosBookTitle: "Ita Fundi / Weka Miadi", sosBookDesc: "Omba msaada wa dharura au miadi ya service.",
      carModel: "Aina ya Gari Lako", issue: "Aina ya Tatizo", location: "Mahali Ulipo", date: "Tarehe", bookBtn: "Tuma Maombi 🚀",
      sellTitle: "Uza Gari Lako (Trade-In)", sellDesc: "Pakia taarifa za gari lako. Admin wetu atalikagua na kuliweka hewani sokoni.",
      price: "Bei Unayouza (TZS)", uploadPhotos: "Pakia Picha za Gari", submitSell: "Tuma kwa Ukaguzi",
      statusApproved: "Lipo Hewani", statusWaiting: "Linasubiri Admin"
    }
  };
  const currT = t[lang];

  useEffect(() => { checkSession(); }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (session) await fetchClientProfile(session.user.email);
    else setLoading(false);
  };

  const fetchClientProfile = async (email: string) => {
    try {
      const { data } = await supabase.from('clients').select('*').eq('email', email).single();
      if (data) {
        setClientProfile(data);
        fetchClientData(email);
        setSosForm(prev => ({ ...prev, phone: data.phone }));
      }
    } catch (err) {} finally { setLoading(false); }
  };

  const fetchClientData = async (email: string) => {
    const { data: inq } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    if (inq) setMyInquiries(inq.filter(req => req.client_email === email || req.contact_phone === clientProfile?.phone));

    const { data: cars } = await supabase.from('vehicles').select('*').eq('vendor_id', email).order('created_at', { ascending: false });
    if (cars) setMyCars(cars);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true);
    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email: authData.email, password: authData.password });
        if (error) throw error;
        window.location.reload();
      } else {
        const { error: authErr } = await supabase.auth.signUp({ email: authData.email, password: authData.password });
        if (authErr) throw authErr;
        await supabase.from('clients').insert([{ full_name: authData.fullName, phone: authData.phone, email: authData.email }]);
        window.location.reload();
      }
    } catch (err: any) { alert(`Kosa: ${err.message}`); } finally { setAuthLoading(false); }
  };

  // HII NDIO FUNCTION ILIYOKUWA INAKOSEKANA (TUMEIONGEZA HAPA) ✅
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const submitSosRequest = async (e: React.FormEvent) => {
    e.preventDefault(); setSosLoading(true);
    try {
      const msg = `SERVICE/SOS REQUEST\nGari: ${sosForm.carModel}\nHuduma: ${sosForm.issue}\nEneo: ${sosForm.location}\nTarehe: ${sosForm.date}`;
      await supabase.from('inquiries').insert([{ client_email: clientProfile.email, contact_phone: sosForm.phone, customer_message: msg }]);
      alert("Maombi yamepokelewa kikamilifu!");
      setSosForm({ carModel: '', issue: 'General Maintenance (Service)', location: '', date: '', phone: clientProfile.phone });
      fetchClientData(clientProfile.email); setActiveTab('orders');
    } catch (err) {} finally { setSosLoading(false); }
  };

  const handleMultiImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const previewsArray = filesArray.map(file => URL.createObjectURL(file));
      setSellForm(prev => ({ ...prev, imageFiles: [...prev.imageFiles, ...filesArray], imagePreviews: [...prev.imagePreviews, ...previewsArray] }));
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSellForm(prev => ({ ...prev, imageFiles: prev.imageFiles.filter((_, i) => i !== indexToRemove), imagePreviews: prev.imagePreviews.filter((_, i) => i !== indexToRemove) }));
  };

  const toggleFeature = (feature: string) => {
    setSellForm({ ...sellForm, features: sellForm.features.includes(feature) ? sellForm.features.filter(f => f !== feature) : [...sellForm.features, feature] });
  };

  const submitSellCar = async (e: React.FormEvent) => {
    e.preventDefault(); setSellLoading(true);
    try {
      let uploadedUrls: string[] = [];
      for (const file of sellForm.imageFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
        const { data } = await supabase.storage.from('car-images').upload(`public/${fileName}`, file);
        if (data) uploadedUrls.push(supabase.storage.from('car-images').getPublicUrl(`public/${fileName}`).data.publicUrl);
      }
      
      const generatedStockId = `C2C-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const { error } = await supabase.from('vehicles').insert([{
        stock_id: generatedStockId, vendor_id: clientProfile.email, 
        make: sellForm.make, model: sellForm.model, year: sellForm.year, category: 'Used', mileage: sellForm.mileage, engine_cc: sellForm.engine_cc, transmission: sellForm.transmission, 
        location_from: 'TANZANIA', cif_price: Number(sellForm.price), fob_price: 0, 
        tag: 'USED', features: sellForm.features, location: uploadedUrls[0] || '', gallery: uploadedUrls,
        approval_status: 'PENDING'
      }]);

      if (error) throw error;
      alert(lang === 'sw' ? "Gari lako limepokelewa na linasubiri uhakiki wa Admin!" : "Vehicle submitted successfully and is awaiting review!");
      setSellForm({ make: '', model: '', year: '', price: '', mileage: '', engine_cc: '', transmission: 'Automatic', features: [], imageFiles: [], imagePreviews: [] });
      fetchClientData(clientProfile.email);
    } catch (err: any) { alert(`Kosa: ${err.message}`); } finally { setSellLoading(false); }
  };


  if (loading && !session) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><div className="animate-pulse text-blue-500 text-6xl">🚘</div></div>;

  if (!session || !clientProfile) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 relative">
        <div className="absolute top-6 right-6 flex gap-3">
          <button onClick={() => setLang('en')} className={`text-xs font-bold px-3 py-1 rounded-lg border ${lang === 'en' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700 text-slate-400'}`}>EN</button>
          <button onClick={() => setLang('sw')} className={`text-xs font-bold px-3 py-1 rounded-lg border ${lang === 'sw' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700 text-slate-400'}`}>SW</button>
        </div>
        <div className="bg-[#0F172A] border border-slate-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8 relative z-10"><h1 className="text-2xl font-black text-white">{currT.authTitle}</h1><p className="text-slate-400 text-xs mt-2">{isLoginMode ? currT.authLoginDesc : currT.authRegDesc}</p></div>
          <form onSubmit={handleAuth} className="space-y-4 relative z-10">
            {!isLoginMode && (
              <>
                <div><input type="text" required value={authData.fullName} onChange={e => setAuthData({...authData, fullName: e.target.value})} placeholder={currT.fullName} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500" /></div>
                <div><input type="text" required value={authData.phone} onChange={e => setAuthData({...authData, phone: e.target.value})} placeholder={currT.phone} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500" /></div>
              </>
            )}
            <div><input type="email" required value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} placeholder={currT.email} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500" /></div>
            <div><input type="password" required value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} placeholder={currT.pass} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500" /></div>
            <button type="submit" disabled={authLoading} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl mt-4 uppercase tracking-widest text-xs">{authLoading ? currT.wait : (isLoginMode ? currT.loginBtn : currT.regBtn)}</button>
          </form>
          <button onClick={() => setIsLoginMode(!isLoginMode)} className="w-full mt-4 text-xs text-slate-400 font-bold hover:text-white transition-colors">{isLoginMode ? currT.switchReg : currT.switchLog}</button>
        </div>
      </div>
    );
  }

  const NavItem = ({ id, icon, label }: { id: string, icon: string, label: string }) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><span className="text-lg">{icon}</span> {label}</button>
  );

  return (
    <div className="min-h-screen bg-[#0B1120] flex font-sans text-slate-200">
      <aside className="w-72 bg-[#0F172A] border-r border-slate-800 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800 text-center pt-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">👤</div>
          <h1 className="text-lg font-black text-white truncate">{clientProfile.full_name}</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{clientProfile.phone}</p>
        </div>
        <nav className="flex-1 p-5 space-y-2">
          <NavItem id="overview" icon="📊" label={currT.overview} />
          <NavItem id="orders" icon="📥" label={currT.myOrders} />
          <NavItem id="sell" icon="💵" label={currT.sellCar} />
          <NavItem id="sos" icon="🛠️" label={currT.sos} />
        </nav>
        <div className="p-5 border-t border-slate-800 space-y-3">
          <div className="flex gap-2 justify-center mb-4">
            <button onClick={() => setLang('en')} className={`text-xs font-bold px-4 py-1.5 rounded-lg border ${lang === 'en' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700 text-slate-400'}`}>EN</button>
            <button onClick={() => setLang('sw')} className={`text-xs font-bold px-4 py-1.5 rounded-lg border ${lang === 'sw' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700 text-slate-400'}`}>SW</button>
          </div>
          <Link href="/" className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs uppercase transition-colors">🏠 {currT.home}</Link>
          {/* KITUFE CHA LOGOUT KINATUMIA FUNCTION TULIYOIONGEZA HAPO JUU */}
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-bold text-xs uppercase transition-colors">🚪 {currT.logout}</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-br from-[#0B1120] to-[#0d131f]">
        
        {/* MOBILE HEADER YENYE LOGOUT KWA WATU WA SIMU */}
        <header className="md:hidden bg-[#0F172A] border-b border-slate-800 p-4 flex justify-between items-center z-10 shrink-0">
          <h2 className="text-lg font-black text-white uppercase tracking-widest">GariHub Client</h2>
          <button onClick={handleLogout} className="text-xs text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-lg">Logout</button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-5xl">
              <div><h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{currT.welcome} <span className="text-blue-500">{clientProfile.full_name.split(' ')[0]}!</span></h2><p className="text-slate-400 mt-2 text-sm">{currT.welcomeDesc}</p></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden"><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">{currT.statOrders}</p><h3 className="text-4xl font-black text-white relative z-10">{myInquiries.length}</h3></div>
                <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden"><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">{currT.sellCar} (Live)</p><h3 className="text-4xl font-black text-white relative z-10">{myCars.filter(c => c.approval_status === 'APPROVED').length}</h3></div>
                <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden"><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">{currT.sellCar} (Pending)</p><h3 className="text-4xl font-black text-amber-400 relative z-10">{myCars.filter(c => c.approval_status === 'PENDING').length}</h3></div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="max-w-5xl">
              <h2 className="text-2xl font-black text-white tracking-tight mb-6">{currT.myOrders}</h2>
              <div className="bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                {myInquiries.length === 0 ? (
                  <div className="p-16 text-center"><span className="text-5xl opacity-50 block mb-4">📥</span><p className="text-slate-400 text-sm mb-6">{currT.noData}</p></div>
                ) : (
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-[#0B1120] text-[10px] uppercase text-slate-500 border-b border-slate-800"><tr><th className="px-6 py-5 font-black">{currT.reqDate}</th><th className="px-6 py-5 font-black">{currT.reqDetails}</th><th className="px-6 py-5 font-black text-right">{currT.reqStatus}</th></tr></thead>
                    <tbody>
                      {myInquiries.map((req, idx) => (
                        <tr key={idx} className="border-b border-slate-800"><td className="px-6 py-5">{new Date(req.created_at).toLocaleDateString()}</td><td className="px-6 py-5"><p className="font-bold text-white text-sm max-w-sm truncate">{req.customer_message}</p></td><td className="px-6 py-5 text-right"><span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase">⏳ {currT.statusPending}</span></td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB: UZA GARI LAKO (SELL CAR) */}
          {activeTab === 'sell' && (
            <div className="max-w-6xl space-y-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight mb-2">{currT.sellTitle}</h2>
                <p className="text-slate-400 text-sm">{currT.sellDesc}</p>
              </div>

              {/* FOMU YA KUPANDISHA GARI */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                <form onSubmit={submitSellCar} className="space-y-6">
                  {/* Image Uploader */}
                  <div>
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">{currT.uploadPhotos}</h4>
                    <div className="flex flex-wrap gap-3 mb-2">
                      {sellForm.imagePreviews.map((preview, index) => (
                        <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden"><img src={preview} className="w-full h-full object-cover" /><button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs">✕</button></div>
                      ))}
                      <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center hover:bg-slate-800"><input type="file" id="sellImageUpload" multiple accept="image/*" onChange={handleMultiImageSelect} className="hidden" /><label htmlFor="sellImageUpload" className="cursor-pointer text-slate-400 text-2xl">➕</label></div>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{currT.make}</label><input type="text" required value={sellForm.make} onChange={e => setSellForm({...sellForm, make: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="Mfano: Toyota" /></div>
                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{currT.carModel}</label><input type="text" required value={sellForm.model} onChange={e => setSellForm({...sellForm, model: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="Mfano: Premio" /></div>
                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{currT.year}</label><input type="number" required value={sellForm.year} onChange={e => setSellForm({...sellForm, year: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="2014" /></div>
                    <div><label className="block text-[10px] font-bold text-emerald-400 uppercase mb-1">{currT.price}</label><input type="number" required value={sellForm.price} onChange={e => setSellForm({...sellForm, price: e.target.value})} className="w-full bg-[#0B1120] border border-emerald-500/50 text-white rounded-lg px-3 py-2.5 text-sm font-black" placeholder="12000000" /></div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{currT.engine}</label><input type="text" required value={sellForm.engine_cc} onChange={e => setSellForm({...sellForm, engine_cc: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="1500cc" /></div>
                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{currT.mileage}</label><input type="number" required value={sellForm.mileage} onChange={e => setSellForm({...sellForm, mileage: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm" placeholder="95000" /></div>
                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{currT.trans}</label><select value={sellForm.transmission} onChange={e => setSellForm({...sellForm, transmission: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm"><option>Automatic</option><option>Manual</option></select></div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Premium Features</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {CAR_FEATURES_LIST.map(feature => (
                        <label key={feature} className="flex items-center gap-2 cursor-pointer bg-[#0B1120] p-2 rounded-lg border border-slate-700"><input type="checkbox" checked={sellForm.features.includes(feature)} onChange={() => toggleFeature(feature)} className="w-3 h-3 accent-blue-600" /><span className="text-[10px] text-slate-300 font-bold">{feature}</span></label>
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={sellLoading || sellForm.imageFiles.length === 0} className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-3.5 rounded-xl uppercase tracking-widest text-xs shadow-lg shadow-blue-600/30 disabled:opacity-50 w-full sm:w-auto">
                    {sellLoading ? currT.wait : currT.submitSell}
                  </button>
                </form>
              </div>

              {/* ORODHA YA MAGARI ALIYOPANDISHA (MY CARS) */}
              <div className="mt-10">
                <h3 className="text-xl font-black text-white tracking-tight mb-4">My Listed Vehicles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {myCars.length === 0 ? <p className="text-slate-500 text-sm">No vehicles listed yet.</p> : myCars.map(car => (
                    <div key={car.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                      <img src={car.location || 'https://via.placeholder.com/400x300'} className="w-full h-40 object-cover" />
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2"><h3 className="font-black text-white">{car.make} {car.model}</h3><span className="text-emerald-400 font-black text-xs">TZS {car.cif_price.toLocaleString()}</span></div>
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${car.approval_status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                          {car.approval_status === 'APPROVED' ? currT.statusApproved : currT.statusWaiting}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sos' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-black text-white tracking-tight mb-2">{currT.sosBookTitle}</h2>
              <p className="text-slate-400 text-sm mb-8">{currT.sosBookDesc}</p>
              
              <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                <form onSubmit={submitSosRequest} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{currT.carModel}</label><input type="text" required value={sosForm.carModel} onChange={(e) => setSosForm({...sosForm, carModel: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3.5 outline-none focus:border-emerald-500" /></div>
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{currT.issue}</label><select value={sosForm.issue} onChange={(e) => setSosForm({...sosForm, issue: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3.5 outline-none focus:border-emerald-500"><option>General Maintenance (Service)</option><option>Dharura / Emergency Call</option><option>Pre-Purchase Inspection</option><option>Computer Diagnostics (OBD2)</option></select></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{currT.location}</label><input type="text" required value={sosForm.location} onChange={(e) => setSosForm({...sosForm, location: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3.5 outline-none focus:border-emerald-500" /></div>
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{currT.date}</label><input type="text" required value={sosForm.date} onChange={(e) => setSosForm({...sosForm, date: e.target.value})} placeholder="Leo / Today" className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl px-4 py-3.5 outline-none focus:border-emerald-500" /></div>
                  </div>
                  <button type="submit" disabled={sosLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl mt-2 uppercase tracking-widest text-xs transition-colors">{sosLoading ? currT.wait : currT.bookBtn}</button>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}