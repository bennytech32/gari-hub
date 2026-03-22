"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

export default function VehicleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  
  // THEME & LANGUAGE STATES
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<'en' | 'sw'>('en');

  // INQUIRY STATES
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryData, setInquiryData] = useState({ name: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);

  // TRADE-IN STATES (MPYA)
  const [showTradeIn, setShowTradeIn] = useState(false);
  const [tradeInData, setTradeInData] = useState({ name: '', phone: '', myCar: '', offerType: 'Top-up (Gari + Pesa)', message: '' });
  const [tradeInLoading, setTradeInLoading] = useState(false);

  useEffect(() => {
    if (params.id) fetchCarDetails(params.id as string);
  }, [params.id]);

  const fetchCarDetails = async (id: string) => {
    try {
      const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        setCar(data);
        setActiveImage(data.location || 'https://via.placeholder.com/800x600');
      }
    } catch (err) { console.error("Error fetching car details", err); } 
    finally { setLoading(false); }
  };

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault(); setSending(true);
    try {
      const msg = `Jina: ${inquiryData.name}\nUjumbe: ${inquiryData.message}\nGari: ${car?.make} ${car?.model} (${car?.stock_id})`;
      await supabase.from('inquiries').insert([{ vehicle_id: car?.id, contact_phone: inquiryData.phone, customer_message: msg }]);
      alert(t[lang].successMsg);
      setShowInquiry(false); setInquiryData({ name: '', phone: '', message: '' });
    } catch (err) { alert(t[lang].errorMsg); } 
    finally { setSending(false); }
  };

  // SUBMIT TRADE IN FUNCTION (MPYA)
  const submitTradeIn = async (e: React.FormEvent) => {
    e.preventDefault(); setTradeInLoading(true);
    try {
      const msg = `🔥 TRADE-IN / TOP-UP REQUEST 🔥\nJina: ${tradeInData.name}\nAnataka Gari: ${car?.make} ${car?.model} (${car?.stock_id})\nAnatoa Gari Lake: ${tradeInData.myCar}\nAina ya Ofa: ${tradeInData.offerType}\nMaelezo Ziada: ${tradeInData.message}`;
      await supabase.from('inquiries').insert([{ vehicle_id: car?.id, contact_phone: tradeInData.phone, customer_message: msg }]);
      alert(lang === 'sw' ? 'Ombi lako la Trade-In limetumwa! Tutawasiliana nawe kukuambia thamani ya gari lako.' : 'Trade-In proposal sent! We will contact you with a valuation.');
      setShowTradeIn(false); setTradeInData({ name: '', phone: '', myCar: '', offerType: 'Top-up (Gari + Pesa)', message: '' });
    } catch (err) { alert(t[lang].errorMsg); } 
    finally { setTradeInLoading(false); }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(amount);
  };

  // DICTIONARY (LUGHA MBILI)
  const t = {
    en: {
      back: "Back to Showroom", inquire: "Inquire Now", whatsapp: "WhatsApp Chat",
      specs: "Vehicle Specifications", features: "Premium Features",
      priceCash: "Drive-Away Price (Cash)", priceFob: "Overseas Price (FOB)",
      estFreight: "Est. Shipping (Freight):", estCif: "Est. CIF (Port):",
      noTax: "⚠️ Price excludes Freight & TRA Customs Taxes.",
      allPaid: "✅ Vehicle is local, all taxes & duties paid.",
      year: "Year", engine: "Engine", trans: "Trans", fuel: "Fuel", drive: "Drive", color: "Color", seats: "Seats", mileage: "Mileage",
      safePay: "100% Secure Payment", safePayDesc: "Via Official Bank Channels",
      inspect: "Technical Inspection", inspectDesc: "Quality Verified",
      soldOut: "SOLD OUT", new: "NEW", hot: "HOT DEAL", underOffer: "UNDER OFFER",
      modTitle: "Inquire About This Car", modName: "Full Name", modPhone: "WhatsApp Number", modMsg: "Your Message...", modBtn: "Send Request 🚀",
      successMsg: "Inquiry sent successfully! Our agent will contact you shortly.", errorMsg: "An error occurred, please try again.", sending: "Sending...",
      promoTitle: "Free Inspection & 1st Service", promoDesc: "Every car purchased from GariHub comes with complimentary full computer diagnostics and your first maintenance service on us.",
      footerDesc: "Your trusted premium automotive partner. Import, buy, rent, or service your car with zero stress.",
      quickLinks: "Quick Links", ourServices: "Our Services", contactFooter: "Contact Us",
      // TRADE IN TRANSLATIONS
      tradeInBtn: "Trade-In / Top Up", tradeInTitle: "Trade-In Proposal", 
      myCarLabel: "Your Current Car (Make, Model, Year)", offerTypeLabel: "Proposal Type", 
      offerExchange: "Exchange (Swap only)", offerTopUp: "Top-Up (My Car + Cash)", 
      tradeInMsg: "Additional details about your car's condition..."
    },
    sw: {
      back: "Rudi Showroom", inquire: "Ulizia Gari Hili", whatsapp: "Chat WhatsApp",
      specs: "Ufundi & Ufafanuzi", features: "Sifa za Ziada",
      priceCash: "Bei ya Gari Mkononi (Cash)", priceFob: "Bei ya Nje (FOB Price)",
      estFreight: "Kadirio la Meli (Freight):", estCif: "Kadirio la CIF (Bandarini):",
      noTax: "⚠️ Bei haijumuishi Usafiri (Freight) wala Kodi za TRA.",
      allPaid: "✅ Gari lipo mkononi, limeshalipiwa ushuru wote.",
      year: "Mwaka", engine: "Engine CC", trans: "Trans", fuel: "Nishati", drive: "Mfumo", color: "Rangi", seats: "Viti", mileage: "Mileage",
      safePay: "Malipo Salama 100%", safePayDesc: "Kupitia Benki Rasmi",
      inspect: "Ukaguzi wa Kiufundi", inspectDesc: "Limethibitishwa Ubora",
      soldOut: "LIMEUZWA", new: "JIPYA", hot: "MOTO", underOffer: "LINAONGELEWA",
      modTitle: "Ulizia Gari Hili", modName: "Jina Lako Kamili", modPhone: "Namba ya Simu (WhatsApp)", modMsg: "Ujumbe wako...", modBtn: "Tuma Maombi 🚀",
      successMsg: "Ujumbe umetumwa kikamilifu! Wakala wetu atakutafuta.", errorMsg: "Kuna tatizo, jaribu tena.", sending: "Inatuma...",
      promoTitle: "Ukaguzi & Service ya 1 Bure!", promoDesc: "Kila gari unalonunua GariHub linakuja na ofa ya kufanyiwa ukaguzi kamili wa kompyuta na Service ya kwanza bure kabisa.",
      footerDesc: "Mshirika wako namba moja wa magari. Agiza, nunua, kodisha, au fanya service kwa uhakika na usalama.",
      quickLinks: "Viungo Muhimu", ourServices: "Huduma Zetu", contactFooter: "Wasiliana Nasi",
      // TRADE IN TRANSLATIONS
      tradeInBtn: "Trade-In / Fanya Top-Up", tradeInTitle: "Ombi la Trade-In (Kubadilishana)", 
      myCarLabel: "Gari Lako Ulilonalo (Aina, Toleo, Mwaka)", offerTypeLabel: "Unataka kufanya nini?", 
      offerExchange: "Kubadilishana Tu (Swap)", offerTopUp: "Top-Up (Gari Langu + Pesa)", 
      tradeInMsg: "Maelezo ya ziada kuhusu hali ya gari lako..."
    }
  };

  const currT = t[lang];

  if (loading) return ( <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center transition-colors"><div className="animate-pulse text-center"><span className="text-6xl mb-4 block">🚘</span><p className="text-blue-600 font-black tracking-widest uppercase">Loading...</p></div></div> );
  if (!car) return ( <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-slate-900 dark:text-white transition-colors"><h1 className="text-4xl font-black mb-4">404 - Vehicle Not Found</h1><Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest">Back Home</Link></div> );

  // DATA PARSING (SAFE PARSER BADO IPO ILI KUZUIA ERRORS)
  const isLocal = car.location_from === 'TANZANIA';
  const gallery = Array.isArray(car.gallery) && car.gallery.length > 0 ? car.gallery : [car.location];
  let safeFeatures: string[] = [];
  if (Array.isArray(car.features)) safeFeatures = car.features;
  else if (typeof car.features === 'string' && car.features.trim() !== '') {
    try { safeFeatures = JSON.parse(car.features); } 
    catch (e) { safeFeatures = car.features.replace(/[{}]/g, '').split(',').map((f: string) => f.trim()).filter(Boolean); }
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <main className="min-h-screen bg-gray-50 dark:bg-[#0B1120] font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300 flex flex-col">
        
        {/* 1. NAVBAR */}
        <nav className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 w-full z-40 sticky top-0 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <Link href="/" className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Gari<span className="text-blue-600">Hub</span></Link>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={() => setLang(lang === 'en' ? 'sw' : 'en')} className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 uppercase">{lang === 'en' ? 'SW' : 'EN'}</button>
                <span className="text-gray-300 dark:text-slate-600">|</span>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="px-2 py-1 text-sm">{theme === 'dark' ? '☀️' : '🌙'}</button>
              </div>
              <Link href="/" className="hidden sm:block text-xs font-bold text-slate-600 dark:text-slate-400 border border-gray-300 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                ← {currT.back}
              </Link>
            </div>
          </div>
        </nav>

        {/* 2. INQUIRY MODAL */}
        {showInquiry && (
          <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-colors">
               <div className="p-5 bg-gray-50 dark:bg-[#0d131f] border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
                 <h3 className="font-black text-slate-900 dark:text-white text-lg">{currT.modTitle}</h3>
                 <button onClick={() => setShowInquiry(false)} className="text-slate-400 hover:text-red-500 font-black text-2xl">&times;</button>
               </div>
               <div className="p-6">
                 <div className="flex gap-4 mb-6 bg-blue-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-blue-100 dark:border-slate-700 items-center">
                   <img src={car.location} className="w-20 h-14 object-cover rounded-xl shadow-sm" />
                   <div>
                     <p className="font-bold text-slate-900 dark:text-white text-sm">{car.make} {car.model}</p>
                     <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">{isLocal ? formatCurrency(car.cif_price, 'TZS') : formatCurrency(car.fob_price, 'USD')}</p>
                   </div>
                 </div>
                 <form onSubmit={submitInquiry} className="space-y-4">
                   <input type="text" required value={inquiryData.name} onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})} placeholder={currT.modName} className="w-full border-2 border-gray-100 dark:border-slate-700 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0B1120] text-slate-900 dark:text-white focus:border-blue-500 outline-none" />
                   <input type="text" required value={inquiryData.phone} onChange={(e) => setInquiryData({...inquiryData, phone: e.target.value})} placeholder={currT.modPhone} className="w-full border-2 border-gray-100 dark:border-slate-700 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0B1120] text-slate-900 dark:text-white focus:border-blue-500 outline-none" />
                   <textarea required value={inquiryData.message} onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})} placeholder={currT.modMsg} className="w-full border-2 border-gray-100 dark:border-slate-700 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0B1120] text-slate-900 dark:text-white resize-none focus:border-blue-500 outline-none" rows={3}></textarea>
                   <button type="submit" disabled={sending} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs">{sending ? currT.sending : currT.modBtn}</button>
                 </form>
               </div>
             </div>
          </div>
        )}

        {/* 2.5 TRADE-IN MODAL (MPYA KWA AJILI YA KUBADILISHANA) */}
        {showTradeIn && (
          <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-colors">
               <div className="p-5 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800/30 flex justify-between items-center">
                 <h3 className="font-black text-purple-700 dark:text-purple-400 text-lg flex items-center gap-2">🔄 {currT.tradeInTitle}</h3>
                 <button onClick={() => setShowTradeIn(false)} className="text-slate-400 hover:text-red-500 font-black text-2xl">&times;</button>
               </div>
               <div className="p-6">
                 <div className="flex gap-4 mb-6 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-gray-200 dark:border-slate-700 items-center">
                   <img src={car.location} className="w-20 h-14 object-cover rounded-xl shadow-sm" />
                   <div>
                     <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Gari Unalotaka</p>
                     <p className="font-bold text-slate-900 dark:text-white text-sm">{car.make} {car.model}</p>
                     <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">{isLocal ? formatCurrency(car.cif_price, 'TZS') : formatCurrency(car.fob_price, 'USD')}</p>
                   </div>
                 </div>
                 <form onSubmit={submitTradeIn} className="space-y-4">
                   <input type="text" required value={tradeInData.name} onChange={(e) => setTradeInData({...tradeInData, name: e.target.value})} placeholder={currT.modName} className="w-full border-2 border-gray-100 dark:border-slate-700 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0B1120] text-slate-900 dark:text-white focus:border-purple-500 outline-none" />
                   <input type="text" required value={tradeInData.phone} onChange={(e) => setTradeInData({...tradeInData, phone: e.target.value})} placeholder={currT.modPhone} className="w-full border-2 border-gray-100 dark:border-slate-700 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0B1120] text-slate-900 dark:text-white focus:border-purple-500 outline-none" />
                   
                   <div>
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{currT.myCarLabel}</label>
                     <input type="text" required value={tradeInData.myCar} onChange={(e) => setTradeInData({...tradeInData, myCar: e.target.value})} placeholder="Mfano: Toyota IST 2008" className="w-full border-2 border-gray-100 dark:border-slate-700 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0B1120] text-slate-900 dark:text-white focus:border-purple-500 outline-none" />
                   </div>

                   <div>
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{currT.offerTypeLabel}</label>
                     <select value={tradeInData.offerType} onChange={(e) => setTradeInData({...tradeInData, offerType: e.target.value})} className="w-full border-2 border-gray-100 dark:border-slate-700 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0B1120] text-slate-900 dark:text-white focus:border-purple-500 outline-none font-bold">
                       <option value="Top-up (Gari + Pesa)">{currT.offerTopUp}</option>
                       <option value="Exchange (Kubadilishana Tu)">{currT.offerExchange}</option>
                     </select>
                   </div>

                   <textarea required value={tradeInData.message} onChange={(e) => setTradeInData({...tradeInData, message: e.target.value})} placeholder={currT.tradeInMsg} className="w-full border-2 border-gray-100 dark:border-slate-700 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0B1120] text-slate-900 dark:text-white resize-none focus:border-purple-500 outline-none" rows={2}></textarea>
                   
                   <button type="submit" disabled={tradeInLoading} className="w-full bg-purple-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-purple-700 transition-all uppercase tracking-widest text-xs">{tradeInLoading ? currT.sending : currT.modBtn}</button>
                 </form>
               </div>
             </div>
          </div>
        )}

        {/* 3. MAIN CONTENT AREA (KADI ZILIZOPANGIWA VIZURI - ONE PAGE FIT) */}
        <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-6 pb-10">
          
          {/* HEADER ROW */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Ref: {car.stock_id}</p>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {car.year} {car.make} <span className="text-blue-600 dark:text-blue-500">{car.model}</span>
              </h1>
            </div>
            
            {/* TAGS */}
            <div className="flex items-center gap-2">
              {isLocal && <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-widest">🇹🇿 Local Stock</span>}
              {!isLocal && <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-widest">🚢 Overseas</span>}
              {car.tag && car.tag !== 'NONE' && (
                <span className={`text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-widest 
                  ${car.tag === 'HOT' ? 'bg-orange-500 animate-pulse' : car.tag === 'UNDER OFFER' ? 'bg-purple-600' : car.tag === 'SOLD OUT' ? 'bg-red-600' : car.tag === 'NEW' ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  {car.tag === 'SOLD OUT' ? currT.soldOut : car.tag === 'HOT' ? currT.hot : car.tag === 'NEW' ? currT.new : car.tag === 'UNDER OFFER' ? currT.underOffer : car.tag}
                </span>
              )}
            </div>
          </div>

          {/* TWO COLUMN COMPACT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* LEFT: IMAGES & PROMO (Col Span 7) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-slate-800 rounded-2xl p-2 sm:p-3 shadow-sm transition-colors">
                <div className="relative w-full h-[250px] sm:h-[350px] md:h-[400px] rounded-xl overflow-hidden bg-gray-100 dark:bg-[#0B1120] mb-3 group">
                  <img src={activeImage} alt={car.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {car.tag === 'SOLD OUT' && ( <div className="absolute inset-0 bg-white/50 dark:bg-red-900/40 backdrop-blur-[2px] flex items-center justify-center"><span className="text-red-600 dark:text-red-100 font-black text-4xl border-4 border-red-500 p-4 rounded-xl transform -rotate-12 bg-white/90 dark:bg-red-900/80">{currT.soldOut}</span></div> )}
                </div>
                {/* Thumbnails */}
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                  {gallery.map((img: string, idx: number) => (
                    <button key={idx} onClick={() => setActiveImage(img)} className={`flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-blue-600 opacity-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* OFA YA BURE (PROMO BANNER) */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 md:p-6 text-white flex flex-col sm:flex-row items-center justify-between shadow-xl mt-4">
                 <div className="mb-4 sm:mb-0 text-center sm:text-left">
                   <h3 className="text-lg md:text-xl font-black mb-1.5 flex items-center justify-center sm:justify-start gap-2">🎁 {currT.promoTitle}</h3>
                   <p className="text-blue-100 text-[11px] md:text-xs max-w-md leading-relaxed">{currT.promoDesc}</p>
                 </div>
                 <div className="flex gap-3">
                    <span className="bg-white/20 border border-white/30 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-sm shadow-sm flex items-center gap-1.5">🆓 Inspection</span>
                    <span className="bg-white/20 border border-white/30 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-sm shadow-sm flex items-center gap-1.5">🛠️ 1st Service</span>
                 </div>
              </div>

            </div>

            {/* RIGHT: PRICE, SPECS & ACTIONS (Col Span 5 - COMPACT) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* PRICE CARD */}
              <div className={`rounded-2xl p-5 border shadow-sm transition-colors ${isLocal ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/30' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-500/30'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                  {isLocal ? currT.priceCash : currT.priceFob}
                </p>
                <h2 className={`text-4xl font-black tracking-tight ${isLocal ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-700 dark:text-blue-400'}`}>
                  {isLocal ? formatCurrency(car.cif_price, 'TZS') : formatCurrency(car.fob_price, 'USD')}
                </h2>
                
                {!isLocal && (
                  <div className="mt-3 pt-3 border-t border-blue-200/50 dark:border-blue-800/50 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400"><span>{currT.estFreight}</span><span>~$1,200</span></div>
                    <div className="flex justify-between text-xs font-black text-slate-900 dark:text-white"><span>{currT.estCif}</span><span>{formatCurrency(car.fob_price + 1200, 'USD')}</span></div>
                    <p className="text-[9px] text-amber-600 dark:text-amber-500 font-bold mt-2">{currT.noTax}</p>
                  </div>
                )}
                {isLocal && <p className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold mt-2">{currT.allPaid}</p>}
              </div>

              {/* COMPACT SPECS GRID WITH ICONS */}
              <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3 pb-2 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">📑 {currT.specs}</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center bg-gray-50 dark:bg-[#0B1120] p-2 rounded-lg border border-gray-100 dark:border-slate-800">
                    <span className="text-lg mb-1">📅</span><p className="text-[8px] text-slate-500 uppercase">{currT.year}</p><p className="font-bold text-slate-900 dark:text-white text-xs">{car.year}</p>
                  </div>
                  <div className="flex flex-col items-center bg-gray-50 dark:bg-[#0B1120] p-2 rounded-lg border border-gray-100 dark:border-slate-800">
                    <span className="text-lg mb-1">🛣️</span><p className="text-[8px] text-slate-500 uppercase">{currT.mileage}</p><p className="font-bold text-slate-900 dark:text-white text-xs">{car.mileage ? `${car.mileage} km` : '-'}</p>
                  </div>
                  <div className="flex flex-col items-center bg-gray-50 dark:bg-[#0B1120] p-2 rounded-lg border border-gray-100 dark:border-slate-800">
                    <span className="text-lg mb-1">🏎️</span><p className="text-[8px] text-slate-500 uppercase">{currT.engine}</p><p className="font-bold text-slate-900 dark:text-white text-xs">{car.engine_cc || '-'}</p>
                  </div>
                  <div className="flex flex-col items-center bg-gray-50 dark:bg-[#0B1120] p-2 rounded-lg border border-gray-100 dark:border-slate-800">
                    <span className="text-lg mb-1">⛽</span><p className="text-[8px] text-slate-500 uppercase">{currT.fuel}</p><p className="font-bold text-slate-900 dark:text-white text-xs">{car.fuel || '-'}</p>
                  </div>
                  <div className="flex flex-col items-center bg-gray-50 dark:bg-[#0B1120] p-2 rounded-lg border border-gray-100 dark:border-slate-800">
                    <span className="text-lg mb-1">⚙️</span><p className="text-[8px] text-slate-500 uppercase">{currT.trans}</p><p className="font-bold text-slate-900 dark:text-white text-xs">{car.transmission === 'Automatic' ? 'Auto' : car.transmission || '-'}</p>
                  </div>
                  <div className="flex flex-col items-center bg-gray-50 dark:bg-[#0B1120] p-2 rounded-lg border border-gray-100 dark:border-slate-800">
                    <span className="text-lg mb-1">🪑</span><p className="text-[8px] text-slate-500 uppercase">{currT.seats}</p><p className="font-bold text-slate-900 dark:text-white text-xs">{car.seats || '-'}</p>
                  </div>
                </div>
              </div>

              {/* FEATURES PILLS WITH NICE ICONS */}
              {safeFeatures.length > 0 && (
                <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3 pb-2 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">✨ {currT.features}</h3>
                  <div className="flex flex-wrap gap-2">
                    {safeFeatures.map((feature: string, idx: number) => (
                      <span key={idx} className="bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-gray-200 dark:border-slate-700 shadow-sm">
                        <span className="text-emerald-500 text-[10px]">✨</span> {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS (INQUIRE, WHATSAPP, TRADE-IN) */}
              <div className="flex flex-col gap-3 mt-auto">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setInquiryData({ ...inquiryData, message: `${currT.inquire}: ${car.make} ${car.model} (Ref: ${car.stock_id}).`}); setShowInquiry(true); }} disabled={car.tag === 'SOLD OUT'} className={`py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all flex items-center justify-center gap-2 ${car.tag === 'SOLD OUT' ? 'bg-gray-300 dark:bg-slate-800 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'}`}>
                    📧 {car.tag === 'SOLD OUT' ? currT.soldOut : currT.inquire}
                  </button>
                  <a href={`https://wa.me/255700000000?text=Habari,%20nimependa%20gari%20hili%20kwenye%20GariHub:%20${car.make}%20${car.model}%20(Ref:%20${car.stock_id})`} target="_blank" rel="noreferrer" className={`py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all flex items-center justify-center gap-2 border-2 ${car.tag === 'SOLD OUT' ? 'border-gray-300 dark:border-slate-800 text-gray-400 cursor-not-allowed pointer-events-none' : 'border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}>
                    💬 {currT.whatsapp}
                  </a>
                </div>
                
                {/* TRADE IN BUTTON (MPYA) */}
                <button onClick={() => setShowTradeIn(true)} disabled={car.tag === 'SOLD OUT'} className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all flex items-center justify-center gap-2 border-2 ${car.tag === 'SOLD OUT' ? 'border-gray-300 dark:border-slate-800 text-gray-400 cursor-not-allowed' : 'border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}>
                  🔄 {currT.tradeInBtn}
                </button>
              </div>

              {/* TRUST BADGES (Mini) */}
              <div className="flex justify-between border-t border-gray-200 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-2 text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase"><span className="text-sm">🛡️</span> {currT.safePay}</div>
                <div className="flex items-center gap-2 text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase"><span className="text-sm">🔍</span> {currT.inspect}</div>
              </div>

            </div>
          </div>
        </div>

        {/* 4. PREMIUM FOOTER */}
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-4 border-blue-600 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12 text-center md:text-left">
              
              <div className="col-span-1 lg:col-span-1 md:pr-4 flex flex-col items-center md:items-start">
                <Link href="/" className="text-3xl font-black text-white tracking-tighter mb-4 sm:mb-6 inline-block">Gari<span className="text-blue-500">Hub</span></Link>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-xs">{currT.footerDesc}</p>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 cursor-pointer transition-colors text-white">IG</div>
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 cursor-pointer transition-colors text-white">FB</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white text-xs sm:text-sm font-black uppercase tracking-widest mb-4">{currT.quickLinks}</h4>
                <ul className="space-y-3 text-xs sm:text-sm font-medium">
                  <li><Link href="/" className="hover:text-blue-400 transition-colors">Showroom</Link></li>
                  <li><Link href="/rentals" className="hover:text-blue-400 transition-colors">Rentals</Link></li>
                  <li><Link href="/spares" className="hover:text-blue-400 transition-colors">Spares & Parts</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white text-xs sm:text-sm font-black uppercase tracking-widest mb-4">{currT.ourServices}</h4>
                <ul className="space-y-3 text-xs sm:text-sm font-medium">
                  <li><Link href="/" className="hover:text-blue-400 transition-colors">Vehicle Importation</Link></li>
                  <li><Link href="/" className="hover:text-blue-400 transition-colors">Pre-Purchase Inspection</Link></li>
                  <li><Link href="/" className="hover:text-blue-400 transition-colors">Mechanic SOS</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white text-xs sm:text-sm font-black uppercase tracking-widest mb-4">{currT.contactFooter}</h4>
                <ul className="space-y-4 text-xs sm:text-sm font-medium flex flex-col items-center md:items-start">
                  <li className="flex items-start gap-3"><span className="text-blue-500 text-lg">📍</span><span>Dar es Salaam, Tanzania</span></li>
                  <li className="flex items-center gap-3"><span className="text-blue-500 text-lg">📞</span><span>+255 700 000 000</span></li>
                  <li className="flex items-center gap-3"><span className="text-blue-500 text-lg">📧</span><span>info@garihub.co.tz</span></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] sm:text-xs font-medium text-slate-500 gap-4">
              <p>&copy; {new Date().getFullYear()} Gari Hub. All rights reserved.</p>
              <div className="flex gap-4 sm:gap-6"><Link href="/" className="hover:text-white transition-colors">Terms of Service</Link><Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link></div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}