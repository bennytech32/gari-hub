"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase'; // Imeunganishwa na Database

export default function ClientPortal() {
  // Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Dashboard States
  const [activeTab, setActiveTab] = useState<'tracking' | 'wishlist' | 'payments' | 'sell'>('tracking');
  const [loading, setLoading] = useState(false);

  // Data States
  const [savedCars, setSavedCars] = useState<any[]>([]);
  
  // Fomu ya Mteja kuuza gari lake (One-time seller)
  const [sellCar, setSellCar] = useState({ title: '', year: '', price: '', phone: '' });
  const [sellFile, setSellFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const clientName = "John Doe";

  const trackedOrders = [
    { 
      id: "ORD-99281", 
      car: "Toyota Crown Athlete 2015", 
      img: "https://images.unsplash.com/photo-1550427739-cecebea3014a?auto=format&fit=crop&w=150&q=80",
      step: 3, 
      eta: "28 March 2026",
      vessel: "Hoegh Osaka V.112",
      balance: "Paid in Full (Escrow)"
    }
  ];

  // Vuta magari halisi kwenye Wishlist
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      // Kwa ajili ya Demo, tunavuta magari machache kutoka kwenye DB kujifanya ni Wishlist
      const { data, error } = await supabase.from('vehicles').select('*').limit(3);
      if (data) {
        const formatted = data.map(car => ({
          id: car.id,
          title: `${car.make} ${car.model}`,
          price: `$${car.fob_price}`,
          img: car.location,
          status: car.tag === 'NONE' ? 'Available' : car.tag
        }));
        setSavedCars(formatted);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  // Mteja kupost gari lake la mara moja
  const handleSellPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSellFile(e.target.files[0]);
    }
  };

  const submitOneTimeCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellCar.title || !sellFile) return alert("Tafadhali weka jina la gari na picha!");
    
    setUploading(true);
    try {
      // 1. Upload Picha
      const fileExt = sellFile.name.split('.').pop();
      const uniqueFileName = `c2c-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('car-images').upload(`public/${uniqueFileName}`, sellFile);
      
      let finalImageUrl = '';
      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(`public/${uniqueFileName}`);
        finalImageUrl = publicUrl;
      }

      // 2. Ingiza kwenye Database (Tunaipa Ref ID inayoanza na C2C kuonyesha ni mteja binafsi)
      const parts = sellCar.title.split(' ');
      const make = parts[0] || 'Unknown';
      const model = parts.slice(1).join(' ') || 'Unknown';

      const { error: dbError } = await supabase.from('vehicles').insert([{
        stock_id: `C2C-${Math.floor(Math.random() * 10000)}`,
        make: make,
        model: model,
        year: parseInt(sellCar.year) || 2010,
        fob_price: parseFloat(sellCar.price.replace(/[^0-9.-]+/g,"")) || 0,
        location: finalImageUrl, 
        tag: 'NEW' // Mteja akipost inakuwa NEW automatically
      }]);

      if (dbError) throw dbError;

      alert("Hongera! Gari lako limepokelewa na litatokea kwenye Showroom baada ya ukaguzi.");
      setSellCar({ title: '', year: '', price: '', phone: '' });
      setSellFile(null);
      setActiveTab('tracking');

    } catch (error) {
      console.error(error);
      alert("Kuna shida mtandaoni, tafadhali jaribu tena.");
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // 1. AUTHENTICATION SCREEN (LOGIN / REGISTER)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
        <div className="md:w-1/2 bg-gray-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <Link href="/" className="text-4xl font-extrabold text-blue-500 tracking-tight">
              Gari<span className="text-white">Hub</span>
            </Link>
            <div className="mt-4 inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              CLIENT PORTAL
            </div>
            
            <div className="mt-16 max-w-md">
              <h1 className="text-4xl font-black leading-tight mb-6">Njia Salama ya Kuagiza Gari Lako.</h1>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl shrink-0">🛡️</div>
                  <div>
                    <h3 className="font-bold text-lg">100% Malipo Salama</h3>
                    <p className="text-sm text-gray-400">Pesa zako zinalindwa kupitia mfumo wetu wa Escrow hadi gari likufikie.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl shrink-0">🚢</div>
                  <div>
                    <h3 className="font-bold text-lg">Fuatilia Meli Yako (Live Tracking)</h3>
                    <p className="text-sm text-gray-400">Jua gari lako lipo wapi wakati wote kuanzia Japan hadi Bandari ya Dar es Salaam.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl shrink-0">💰</div>
                  <div>
                    <h3 className="font-bold text-lg">Uza Gari Lako Fasta</h3>
                    <p className="text-sm text-gray-400">Unataka kuuza gari lako la sasa? Lipost hapa liwafikie maelfu ya wanunuzi.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="relative z-10 mt-16 text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Gari Hub. All rights reserved.
          </div>
          
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-green-500 rounded-full opacity-10 blur-3xl"></div>
        </div>

        <div className="md:w-1/2 bg-white p-8 md:p-16 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              {authMode === 'login' ? 'Karibu Tena!' : 'Tengeneza Akaunti'}
            </h2>
            <p className="text-gray-500 mb-8">
              {authMode === 'login' ? 'Ingiza taarifa zako kufikia akaunti yako.' : 'Jisajili ili kuanza kuagiza na kufuatilia magari yako.'}
            </p>

            <form onSubmit={handleAuth} className="space-y-5">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Majina Kamili</label>
                  <input type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="John Doe" />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Barua Pepe (Email)</label>
                <input type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="mteja@email.com" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-bold text-gray-700">Neno Siri (Password)</label>
                  {authMode === 'login' && <a href="#" className="text-xs text-blue-600 font-bold hover:underline">Umesahau?</a>}
                </div>
                <input type="password" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg shadow-md hover:bg-blue-700 transition-colors mt-4">
                {authMode === 'login' ? 'Ingia Kwenye Akaunti (Login)' : 'Kamilisha Usajili (Register)'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
              {authMode === 'login' ? 'Huna akaunti?' : 'Tayari una akaunti?'}
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="ml-2 text-blue-600 font-bold hover:underline">
                {authMode === 'login' ? 'Jisajili hapa' : 'Ingia hapa'}
              </button>
            </div>
            
            <div className="mt-12 text-center">
               <Link href="/" className="text-gray-400 hover:text-gray-800 text-xs font-bold transition-colors">
                 ← Rudi Mwanzo (Back to Homepage)
               </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. CLIENT DASHBOARD SCREEN (LOGGED IN)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">
              Gari<span className="text-gray-900">Hub</span>
            </Link>
            <span className="hidden sm:block bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              Client Portal
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-gray-500 hover:text-gray-800 relative">
              🔔 <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">{clientName}</p>
                <p className="text-xs text-gray-500">Verified Buyer</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                JD
              </div>
              <button onClick={() => setIsAuthenticated(false)} className="ml-2 text-xs text-red-500 font-bold hover:underline">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Menu */}
        <aside className="lg:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 px-3">Menu Yangu</h3>
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('tracking')} 
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'tracking' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className="flex items-center gap-3">🚢 Track My Cars</span>
                {trackedOrders.length > 0 && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">{trackedOrders.length}</span>}
              </button>
              <button 
                onClick={() => setActiveTab('wishlist')} 
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'wishlist' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className="flex items-center gap-3">❤️ Saved Cars</span>
                <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{savedCars.length}</span>
              </button>
              <button 
                onClick={() => setActiveTab('payments')} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'payments' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                💵 Invoices & Escrow
              </button>
              
              {/* KITUFE KIPYA: UZA GARI LAKO */}
              <button 
                onClick={() => setActiveTab('sell')} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mt-2 ${activeTab === 'sell' ? 'bg-green-50 text-green-700 font-bold border border-green-200' : 'text-gray-600 hover:bg-green-50 border border-transparent'}`}
              >
                💰 Uza Gari Lako
              </button>

              <Link href="/#magari" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors mt-4 border-t border-gray-100 pt-4">
                🛒 Endelea Kununua
              </Link>
            </nav>
            
            {/* Help Box */}
            <div className="mt-8 bg-gray-900 rounded-lg p-4 text-white text-center">
              <span className="text-2xl block mb-2">🎧</span>
              <h4 className="font-bold text-sm mb-1">Unahitaji Msaada?</h4>
              <p className="text-xs text-gray-400 mb-3">Wasiliana na wakala wako moja kwa moja.</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded transition-colors">
                Chat on WhatsApp
              </button>
            </div>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="lg:w-3/4">
          
          {/* TAB 1: ORDER TRACKING */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Ufuatiliaji wa Magari Yako (Tracking)</h2>
                <p className="text-gray-500 text-sm">Fuatilia hatua kwa hatua gari lako mpaka linakufikia mkononi.</p>
              </div>
              {/* Orodha ya Tracked Orders inaendelea... */}
              {trackedOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50">
                      <div className="flex items-center gap-4">
                        <img src={order.img} alt={order.car} className="w-20 h-14 object-cover rounded border border-gray-200 shadow-sm" />
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">{order.car}</h3>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">Order ID: {order.id}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Estimated Arrival (ETA)</p>
                        <p className="text-lg font-black text-blue-600">{order.eta}</p>
                      </div>
                    </div>
                    
                    <div className="p-6 md:p-10">
                      <div className="relative">
                        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-gray-100 md:-ml-0.5 z-0 hidden md:block"></div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center relative z-10">
                          
                          <div className="flex flex-row md:flex-col items-center gap-4 md:gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm bg-green-500 text-white">✓</div>
                            <div className="text-left md:text-center">
                              <p className="text-sm font-bold text-gray-900">Purchased</p>
                              <p className="text-[10px] text-gray-500 hidden md:block">Japan Auction</p>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col items-center gap-4 md:gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm bg-green-500 text-white">✓</div>
                            <div className="text-left md:text-center">
                              <p className="text-sm font-bold text-gray-900">At Port</p>
                              <p className="text-[10px] text-gray-500 hidden md:block">Yokohama, JP</p>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col items-center gap-4 md:gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm bg-blue-600 text-white animate-pulse">3</div>
                            <div className="text-left md:text-center">
                              <p className="text-sm font-bold text-blue-700">On Ship</p>
                              <p className="text-[10px] text-blue-500 font-bold hidden md:block">{order.vessel}</p>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col items-center gap-4 md:gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm bg-gray-200 text-gray-400">4</div>
                            <div className="text-left md:text-center">
                              <p className="text-sm font-bold text-gray-400">Clearing</p>
                              <p className="text-[10px] text-gray-500 hidden md:block">Dar Port (TRA)</p>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col items-center gap-4 md:gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm bg-gray-200 text-gray-400">5</div>
                            <div className="text-left md:text-center">
                              <p className="text-sm font-bold text-gray-400">Delivered</p>
                              <p className="text-[10px] text-gray-500 hidden md:block">Handover</p>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* TAB 2: WISHLIST (Data Kutoka Supabase) */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Magari Yangu Niliyohifadhi (Wishlist)</h2>
                <p className="text-gray-500 text-sm">Orodha ya magari uliyoyawekea alama ya moyo (❤️).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedCars.length === 0 ? (
                  <p className="text-gray-500">Hujasave gari lolote bado.</p>
                ) : (
                  savedCars.map(car => (
                    <div key={car.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">
                      <img src={car.img} alt={car.title} className="w-1/3 object-cover" />
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-gray-900 text-sm">{car.title}</h3>
                            <button className="text-red-500 hover:scale-110 transition-transform">❤️</button>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${car.status === 'HOT' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{car.status}</span>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="font-black text-blue-600">{car.price}</span>
                          <button className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-black transition-colors">Inquire</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS / ESCROW */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Ankara na Malipo (Invoices & Escrow)</h2>
                <p className="text-gray-500 text-sm">Historia ya malipo yako yanayolindwa chini ya mfumo wa Escrow.</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 border-b">Invoice No.</th>
                      <th className="p-4 border-b">Description</th>
                      <th className="p-4 border-b">Amount</th>
                      <th className="p-4 border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-gray-50">
                      <td className="p-4 font-mono font-bold text-gray-700">INV-2026-001</td>
                      <td className="p-4">Toyota Crown (Vehicle Purchase)</td>
                      <td className="p-4 font-bold text-gray-900">$6,200.00</td>
                      <td className="p-4">
                        <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded text-xs font-bold">Paid (In Escrow)</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SELL A CAR (ONE-TIME SELLER) */}
          {activeTab === 'sell' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Uza Gari Lako Fasta</h2>
                <p className="text-gray-500 text-sm">Ingiza taarifa za gari lako. Baada ya ukaguzi mfupi, litaonekana kwenye Showroom yetu kuonwa na maelfu ya wanunuzi.</p>
              </div>

              <form onSubmit={submitOneTimeCar} className="space-y-5 max-w-2xl">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Picha ya Gari (Nje na Ndani)</label>
                  <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    {sellFile ? (
                      <span className="text-green-600 font-bold">{sellFile.name} (Tayari)</span>
                    ) : (
                      <>
                        <span className="text-3xl mb-2">📷</span>
                        <span className="text-blue-600 font-bold text-sm">Bonyeza kuweka picha</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleSellPhotoUpload} className="hidden" />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Jina la Gari (Mfano: Toyota IST)</label>
                    <input type="text" value={sellCar.title} onChange={(e) => setSellCar({...sellCar, title: e.target.value})} required className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Mwaka wa Kutengenezwa</label>
                    <input type="number" value={sellCar.year} onChange={(e) => setSellCar({...sellCar, year: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Bei Unayouza (Tsh au $)</label>
                    <input type="text" value={sellCar.price} onChange={(e) => setSellCar({...sellCar, price: e.target.value})} required placeholder="Mf. 12,000,000" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Namba ya Simu</label>
                    <input type="text" value={sellCar.phone} onChange={(e) => setSellCar({...sellCar, phone: e.target.value})} required placeholder="07XX XXX XXX" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="pt-4 border-t mt-6">
                  <button type="submit" disabled={uploading} className="w-full sm:w-auto bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-green-700 transition-colors">
                    {uploading ? 'Inapakia mtandaoni...' : 'Post Gari Langu Sasa 🚀'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}