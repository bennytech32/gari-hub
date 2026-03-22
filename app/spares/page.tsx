"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function SparesPage() {
  const [lang, setLang] = useState<'sw' | 'en'>('en');
  const [currency, setCurrency] = useState<'USD' | 'TZS' | 'KES' | 'UGX'>('TZS');
  const [port, setPort] = useState<'Dar es Salaam' | 'Mombasa' | 'Maputo'>('Dar es Salaam');

  const [spares, setSpares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ORDER MODAL STATES
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedSpare, setSelectedSpare] = useState<any>(null);
  const [orderData, setOrderData] = useState({ name: '', phone: '', location: '', quantity: '1', message: '' });
  const [orderLoading, setOrderLoading] = useState(false);

  // SEARCH & FILTER STATES
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchSpares();
  }, []);

  const fetchSpares = async () => {
    try {
      const { data, error } = await supabase.from('spares').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setSpares(data);
    } catch (err) {
      console.error("Error fetching spares:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault(); setOrderLoading(true);
    try {
      const messagePayload = `⚙️ SPARE PART ORDER ⚙️\nKipuri: ${selectedSpare.part_name}\nIdadi: ${orderData.quantity}\nBei (Kimoja): TZS ${selectedSpare.price?.toLocaleString()}\nEneo la Kufikisha (Delivery): ${orderData.location}\nUjumbe wa Mteja: ${orderData.message}`;
      await supabase.from('inquiries').insert([{ contact_phone: orderData.phone, customer_message: messagePayload }]);
      
      alert(lang === 'sw' ? "Oda yako imepokelewa kikamilifu! Wakala wetu atakupigia muda huu." : "Your order has been received! Our agent will contact you shortly.");
      setShowOrderModal(false); setOrderData({ name: '', phone: '', location: '', quantity: '1', message: '' });
    } catch (err) {
      alert("Kuna kosa limetokea, jaribu tena.");
    } finally {
      setOrderLoading(false);
    }
  };

  const openOrder = (part: any) => {
    setSelectedSpare(part);
    setShowOrderModal(true);
  };

  const t = {
    en: {
      home: "Home", inventory: "Our Inventory", rentMenu: "Car Rental", sparesMenu: "Parts & Tools", tradeMenu: "Trade-In",
      heroTitle: "Genuine Spares & Tools", heroDesc: "Find high-quality OEM spare parts, ECU diagnostic scanners, and professional mechanic tools for your vehicle.",
      searchPlaceholder: "Search for a part or tool name...", filterAll: "All Parts", filterEngine: "Engine & Mechanical", filterBody: "Body Parts", filterTools: "Diagnostic Tools",
      orderBtn: "Order Now", detailsBtn: "View Details", inStock: "In Stock", outOfStock: "Out of Stock",
      noData: "No spare parts available in this category.",
      modTitle: "Order Spare Part", modName: "Full Name", modPhone: "Phone Number", modLoc: "Delivery Location", modQty: "Quantity Needed", modMsg: "Additional Notes", modSubmit: "Place Order 🚀",
      footerDesc: "Your trusted partner for importing cars, buying genuine spares, and premium rentals.",
      quickLinks: "Quick Links", ourServices: "Our Services", contactFooter: "Contact Us", clientPortal: "Client Portal"
    },
    sw: {
      home: "Mwanzo", inventory: "Magari Yetu", rentMenu: "Magari ya Kukodisha", sparesMenu: "Vipuri & Vifaa", tradeMenu: "Trade-In",
      heroTitle: "Vipuri Original & Vifaa", heroDesc: "Pata vipuri halisi (OEM), mashine za kusoma hitilafu (Diagnostic Scanners), na vifaa vya kisasa kwa ajili ya gari lako.",
      searchPlaceholder: "Tafuta jina la kipuri au kifaa...", filterAll: "Vipuri Vyote", filterEngine: "Engine & Mitambo", filterBody: "Body & Taa", filterTools: "Vifaa vya Ufundi (OBD2)",
      orderBtn: "Nunua Sasa", detailsBtn: "Maelezo", inStock: "Kipo Stokini", outOfStock: "Kimeisha",
      noData: "Hakuna vipuri kwenye kipengele hiki kwa sasa.",
      modTitle: "Agiza Kipuri Hiki", modName: "Jina Kamili", modPhone: "Namba ya Simu", modLoc: "Eneo Lako (Delivery)", modQty: "Idadi Unayohitaji", modMsg: "Maelezo ya Ziada", modSubmit: "Tuma Oda Yangu 🚀",
      footerDesc: "Mshirika wako namba moja kwa kuagiza magari, vipuri original, na kukodisha magari ya hadhi.",
      quickLinks: "Viungo Muhimu", ourServices: "Huduma Zetu", contactFooter: "Wasiliana Nasi", clientPortal: "Client Portal"
    }
  };
  const currentT = t[lang];

  // FILTERS
  const filteredSpares = spares.filter(part => {
    const matchesSearch = (part.part_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || (part.car_compatibility?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || part.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-0 font-sans text-slate-800 relative overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* ---------------- ORDER MODAL ---------------- */}
      {showOrderModal && selectedSpare && (
        <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md transition-all">
           <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transform scale-100 max-h-[95vh] overflow-y-auto custom-scrollbar ring-1 ring-slate-200">
             <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 flex justify-between items-center text-white sticky top-0 z-10">
               <h3 className="font-extrabold text-lg flex items-center gap-2">⚙️ {currentT.modTitle}</h3>
               <button onClick={() => setShowOrderModal(false)} className="text-white hover:text-emerald-200 font-black text-2xl leading-none">&times;</button>
             </div>
             <div className="p-6">
               <div className="flex gap-4 mb-6 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 items-center">
                 <img src={selectedSpare.main_image || 'https://via.placeholder.com/150'} className="w-24 h-16 object-cover rounded-xl shadow-sm" alt="spare part" />
                 <div>
                   <p className="font-black text-slate-800 text-sm">{selectedSpare.part_name}</p>
                   <p className="text-xs text-emerald-600 font-black mt-1">TZS {selectedSpare.price?.toLocaleString()}</p>
                 </div>
               </div>
               <form onSubmit={submitOrder} className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <input type="text" required value={orderData.name} onChange={(e) => setOrderData({...orderData, name: e.target.value})} placeholder={currentT.modName} className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all" />
                   <input type="text" required value={orderData.phone} onChange={(e) => setOrderData({...orderData, phone: e.target.value})} placeholder={currentT.modPhone} className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold" />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1">{currentT.modLoc}</label>
                     <input type="text" required value={orderData.location} onChange={(e) => setOrderData({...orderData, location: e.target.value})} placeholder="Mfano: Kariakoo, Dar" className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-700" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1">{currentT.modQty}</label>
                     <input type="number" min="1" max={selectedSpare.stock_quantity} required value={orderData.quantity} onChange={(e) => setOrderData({...orderData, quantity: e.target.value})} className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-700 font-bold" />
                   </div>
                 </div>
                 <textarea value={orderData.message} onChange={(e) => setOrderData({...orderData, message: e.target.value})} placeholder={currentT.modMsg} className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 text-sm resize-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all" rows={3}></textarea>
                 
                 <button type="submit" disabled={orderLoading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all text-xs tracking-widest uppercase mt-2">{orderLoading ? 'Sending...' : currentT.modSubmit}</button>
               </form>
             </div>
           </div>
        </div>
      )}

      {/* ---------------- GLOBAL TOP BAR (SLIM) ---------------- */}
      <div className="bg-slate-900 text-slate-300 text-[10px] sm:text-xs py-2 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center z-50 relative gap-2 sm:gap-0 border-b border-slate-800 font-medium">
        <div className="flex gap-4"><span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">📧 info@garihub.co.tz</span><span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">📞 +255 700 000 000</span></div>
        <div className="flex items-center gap-2 bg-slate-800/80 rounded-full px-3 py-1 flex-wrap justify-center w-full sm:w-auto border border-slate-700/50">
          <div className="flex items-center gap-1 pr-2 border-r border-slate-600"><span className="text-slate-500">⚓</span><select value={port} onChange={(e) => setPort(e.target.value as any)} className="bg-transparent text-blue-400 font-bold outline-none cursor-pointer"><option value="Dar es Salaam" className="bg-slate-800">Dar</option><option value="Mombasa" className="bg-slate-800">Mombasa</option></select></div>
          <div className="flex items-center gap-1 px-2 border-r border-slate-600"><span className="text-slate-500">💵</span><select value={currency} onChange={(e) => setCurrency(e.target.value as any)} className="bg-transparent text-emerald-400 font-bold outline-none cursor-pointer"><option value="USD" className="bg-slate-800">USD</option><option value="TZS" className="bg-slate-800">TZS</option></select></div>
          <div className="flex items-center gap-2 pl-2">
            <button onClick={() => setLang('en')} className={`font-black transition-colors ${lang === 'en' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>EN</button>
            <span className="text-slate-600">|</span>
            <button onClick={() => setLang('sw')} className={`font-black transition-colors ${lang === 'sw' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>SW</button>
          </div>
        </div>
      </div>

      {/* ---------------- NAVIGATION BAR (PREMIUM GLASSMORPHISM) ---------------- */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 w-full z-40 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 sm:h-20 items-center">
            <div className="flex-shrink-0 flex items-center group">
              <Link href="/" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter group-hover:scale-105 transition-transform">
                Gari<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Hub</span>
              </Link>
            </div>
            <div className="hidden lg:flex space-x-6 items-center">
              <Link href="/" className="text-slate-500 hover:text-blue-600 px-1 py-2 font-bold text-xs xl:text-sm tracking-wide uppercase transition-colors">{currentT.home}</Link>
              <Link href="/#magari" className="text-slate-500 hover:text-blue-600 px-1 py-2 font-bold text-xs xl:text-sm tracking-wide uppercase transition-colors">{currentT.inventory}</Link>
              <Link href="/rentals" className="text-slate-500 hover:text-red-500 px-1 py-2 font-bold text-xs xl:text-sm tracking-wide uppercase transition-colors">{currentT.rentMenu}</Link>
              <Link href="/spares" className="text-slate-900 border-b-2 border-emerald-500 px-1 py-2 font-black transition-colors text-xs xl:text-sm tracking-wide uppercase">{currentT.sparesMenu}</Link>
            </div>
            <div className="flex items-center gap-3 sm:gap-5">
              <Link href="/client" className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all text-[10px] sm:text-xs uppercase tracking-widest ring-1 ring-slate-900/5">
                {currentT.clientPortal}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ---------------- SPARES HERO SECTION ---------------- */}
      <div className="relative bg-[#0B1120] overflow-hidden border-b border-slate-800 pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-10"></div>
        <div className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1600705663737-0130635b7194?auto=format&fit=crop&w=2000&q=80" alt="Premium Spares" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/80 to-transparent"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-[10px] uppercase tracking-widest mb-6 backdrop-blur-md">⚙️ GariHub Auto Parts</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tighter mb-4 drop-shadow-lg">{currentT.heroTitle}</h1>
          <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">{currentT.heroDesc}</p>
        </div>
      </div>

      {/* ---------------- SEARCH & FILTERS BAR (FLOATING) ---------------- */}
      <div className="relative w-full max-w-[95%] sm:max-w-4xl mx-auto px-4 -mt-8 z-30 mb-12">
        <div className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-xl shadow-emerald-900/5 p-4 border border-emerald-100 ring-1 ring-white/50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">🔍</span>
            <input type="text" placeholder={currentT.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
          </div>
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {['All', 'Engine Parts', 'Body Parts', 'Tools'].map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} className={`whitespace-nowrap px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${categoryFilter === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-gray-50 text-slate-600 border border-gray-200 hover:border-slate-400'}`}>
                {cat === 'All' ? currentT.filterAll : cat === 'Engine Parts' ? currentT.filterEngine : cat === 'Body Parts' ? currentT.filterBody : currentT.filterTools}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- SPARES GRID SECTION ---------------- */}
      <div className="max-w-[95%] sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-pulse text-emerald-500 text-6xl">⚙️</div></div>
        ) : filteredSpares.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <span className="text-5xl block mb-4 opacity-30">📦</span>
            <h3 className="text-slate-800 font-black text-lg">{currentT.noData}</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredSpares.map(part => (
              <div key={part.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col group hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300 hover:-translate-y-1">
                
                <div className="relative h-48 overflow-hidden rounded-t-2xl bg-gray-100 p-4 flex items-center justify-center">
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                    <span className={`text-white text-[9px] font-black px-2.5 py-1 rounded-md shadow-md uppercase tracking-widest ${part.condition === 'Brand New' ? 'bg-blue-600' : 'bg-orange-500'}`}>
                      {part.condition}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                     {part.stock_quantity > 0 ? (
                       <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">{currentT.inStock}: {part.stock_quantity}</span>
                     ) : (
                       <span className="bg-red-100 text-red-700 border border-red-200 text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">{currentT.outOfStock}</span>
                     )}
                  </div>
                  <img src={part.main_image || 'https://via.placeholder.com/400'} alt={part.part_name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-lg" />
                </div>

                <div className="p-5 flex flex-col flex-grow border-t border-gray-50">
                  <div className="mb-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{part.category}</p>
                    <h2 className="text-sm font-black text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-2" title={part.part_name}>{part.part_name}</h2>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 p-2 rounded-xl flex items-center gap-2 mb-4">
                    <span className="text-slate-400 text-sm">🚘</span>
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider truncate" title={part.car_compatibility}>{part.car_compatibility}</span>
                  </div>

                  <div className="mt-auto flex justify-between items-end mb-4">
                    <span className="text-slate-500 text-[9px] uppercase font-black tracking-widest">Price</span>
                    <span className="font-black text-lg text-emerald-600 leading-none">TZS {part.price?.toLocaleString()}</span>
                  </div>

                  <button onClick={() => openOrder(part)} disabled={part.stock_quantity <= 0} className={`w-full font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2 ${part.stock_quantity > 0 ? 'bg-slate-900 text-white shadow-md hover:bg-emerald-600 hover:shadow-emerald-500/30' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                    🛒 {part.stock_quantity > 0 ? currentT.orderBtn : currentT.outOfStock}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------------- PREMIUM FOOTER ---------------- */}
      <footer className="bg-[#0B1120] text-slate-400 pt-16 pb-8 border-t-[6px] border-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <Link href="/" className="text-3xl font-black text-white tracking-tighter mb-4 inline-block">Gari<span className="text-emerald-500">Hub</span></Link>
              <p className="text-slate-500 text-xs leading-relaxed mb-6 max-w-xs font-medium">{currentT.footerDesc}</p>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-400 text-sm text-white transition-all cursor-pointer shadow-sm hover:shadow-emerald-500/20">IG</div>
                <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-400 text-sm text-white transition-all cursor-pointer shadow-sm hover:shadow-emerald-500/20">FB</div>
              </div>
            </div>
            <div>
              <h4 className="text-white text-[10px] sm:text-xs font-black uppercase tracking-widest mb-5">{currentT.quickLinks}</h4>
              <ul className="space-y-3 text-[10px] sm:text-xs font-bold text-slate-500">
                <li><Link href="/#magari" className="hover:text-blue-400 transition-colors">{currentT.inventory}</Link></li>
                <li><Link href="/rentals" className="hover:text-red-400 transition-colors">{currentT.rentMenu}</Link></li>
                <li><Link href="/spares" className="text-emerald-400 transition-colors">{currentT.sparesMenu}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-[10px] sm:text-xs font-black uppercase tracking-widest mb-5">{currentT.ourServices}</h4>
              <ul className="space-y-3 text-[10px] sm:text-xs font-bold text-slate-500">
                <li><Link href="/" className="hover:text-blue-400 transition-colors">Vehicle Importation</Link></li>
                <li><Link href="/client" className="hover:text-emerald-400 transition-colors">{currentT.clientPortal}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-[10px] sm:text-xs font-black uppercase tracking-widest mb-5">{currentT.contactFooter}</h4>
              <ul className="space-y-4 text-[10px] sm:text-xs font-bold text-slate-500 flex flex-col items-center md:items-start">
                <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-500 text-sm">📍</div><span>Dar es Salaam, Tanzania</span></li>
                <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-500 text-sm">📞</div><span>+255 700 000 000</span></li>
                <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-500 text-sm">📧</div><span>info@garihub.co.tz</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800/50 pt-6 flex flex-col md:flex-row justify-between items-center text-[9px] sm:text-[10px] font-bold text-slate-600 gap-3">
            <p>&copy; {new Date().getFullYear()} Gari Hub. All rights reserved.</p>
            <div className="flex gap-5"><Link href="/" className="hover:text-slate-400 transition-colors">Terms of Service</Link><Link href="/" className="hover:text-slate-400 transition-colors">Privacy Policy</Link></div>
          </div>
        </div>
      </footer>

    </main>
  );
}