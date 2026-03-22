"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function RentalsPage() {
  const [lang, setLang] = useState<'sw' | 'en'>('en');
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // BOOKING MODAL STATES
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [bookingData, setBookingData] = useState({ name: '', phone: '', startDate: '', endDate: '', destination: '', message: '' });
  const [bookingLoading, setBookingLoading] = useState(false);

  // SEARCH & FILTER STATES
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const { data, error } = await supabase.from('rentals').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setRentals(data);
    } catch (err) {
      console.error("Error fetching rentals:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault(); setBookingLoading(true);
    try {
      const messagePayload = `🚗 CAR RENTAL BOOKING 🚗\nGari: ${selectedRental.make} ${selectedRental.model} (${selectedRental.year})\nKuanzia: ${bookingData.startDate} Hadi: ${bookingData.endDate}\nEneo/Safari: ${bookingData.destination}\nUjumbe: ${bookingData.message}`;
      await supabase.from('inquiries').insert([{ contact_phone: bookingData.phone, customer_message: messagePayload }]);
      
      alert(lang === 'sw' ? "Maombi yako ya kukodisha yamepokelewa! Tutawasiliana nawe." : "Booking request received! We will contact you shortly.");
      setShowBookingModal(false); setBookingData({ name: '', phone: '', startDate: '', endDate: '', destination: '', message: '' });
    } catch (err) {
      alert("Kuna kosa limetokea, jaribu tena.");
    } finally {
      setBookingLoading(false);
    }
  };

  const openBooking = (car: any) => {
    setSelectedRental(car);
    setShowBookingModal(true);
  };

  const t = {
    en: {
      home: "Home", inventory: "Our Inventory", rentMenu: "Car Rental", sparesMenu: "Parts & Tools", tradeMenu: "Trade-In",
      heroTitle: "Premium Car Rentals", heroDesc: "Choose from our exclusive fleet of well-maintained vehicles for weddings, corporate trips, or safaris.",
      searchPlaceholder: "Search by make or model...", filterAll: "All Categories", filterSUV: "SUVs & 4x4", filterSedan: "Sedans", filterVan: "Vans & Buses",
      pricePerDay: "/ Day", bookBtn: "Book Now", detailsBtn: "View Details",
      noData: "No rental cars available at the moment.",
      modTitle: "Book Rental Vehicle", modName: "Full Name", modPhone: "Phone Number", modStart: "Start Date", modEnd: "Return Date", modDest: "Destination / Event", modMsg: "Additional Requirements", modSubmit: "Confirm Booking 🚀",
      footerDesc: "Your trusted partner for importing cars, buying genuine spares, and premium rentals.",
      quickLinks: "Quick Links", ourServices: "Our Services", contactFooter: "Contact Us", clientPortal: "Client Portal"
    },
    sw: {
      home: "Mwanzo", inventory: "Magari Yetu", rentMenu: "Magari ya Kukodisha", sparesMenu: "Vipuri & Vifaa", tradeMenu: "Trade-In",
      heroTitle: "Kodisha Magari ya Kifahari", heroDesc: "Chagua gari bora na safi kwa ajili ya harusi, mikutano, safari za mkoani au matumizi ya kila siku.",
      searchPlaceholder: "Tafuta aina au jina la gari...", filterAll: "Aina Zote", filterSUV: "Gari Kubwa (SUV)", filterSedan: "Gari Fupi (Sedan)", filterVan: "Noah & Coaster",
      pricePerDay: "/ Siku", bookBtn: "Kodisha Sasa", detailsBtn: "Maelezo",
      noData: "Hakuna gari la kukodisha kwa sasa.",
      modTitle: "Weka Miadi ya Kukodisha", modName: "Jina Kamili", modPhone: "Namba ya Simu", modStart: "Tarehe ya Kuchukua", modEnd: "Tarehe ya Kurudisha", modDest: "Eneo / Safari", modMsg: "Maelezo ya Ziada", modSubmit: "Tuma Maombi 🚀",
      footerDesc: "Mshirika wako namba moja kwa kuagiza magari, vipuri original, na kukodisha magari ya hadhi.",
      quickLinks: "Viungo Muhimu", ourServices: "Huduma Zetu", contactFooter: "Wasiliana Nasi", clientPortal: "Client Portal"
    }
  };
  const currentT = t[lang];

  // FILTERS
  const filteredRentals = rentals.filter(car => {
    const matchesSearch = (car.make?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || (car.model?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || car.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-0 font-sans text-slate-800 relative overflow-x-hidden selection:bg-amber-500 selection:text-white">
      
      {/* ---------------- BOOKING MODAL ---------------- */}
      {showBookingModal && selectedRental && (
        <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md transition-all">
           <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transform scale-100 max-h-[95vh] overflow-y-auto custom-scrollbar ring-1 ring-slate-200">
             <div className="p-5 bg-gradient-to-r from-amber-500 to-orange-600 flex justify-between items-center text-white sticky top-0 z-10">
               <h3 className="font-extrabold text-lg flex items-center gap-2">🔑 {currentT.modTitle}</h3>
               <button onClick={() => setShowBookingModal(false)} className="text-white hover:text-amber-200 font-black text-2xl leading-none">&times;</button>
             </div>
             <div className="p-6">
               <div className="flex gap-4 mb-6 bg-amber-50/50 p-3 rounded-2xl border border-amber-100 items-center">
                 <img src={selectedRental.main_image || 'https://via.placeholder.com/150'} className="w-24 h-16 object-cover rounded-xl shadow-sm" alt="rental" />
                 <div>
                   <p className="font-black text-slate-800 text-sm">{selectedRental.make} {selectedRental.model}</p>
                   <p className="text-xs text-amber-600 font-black mt-1">TZS {selectedRental.price_per_day?.toLocaleString()} {currentT.pricePerDay}</p>
                 </div>
               </div>
               <form onSubmit={submitBooking} className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <input type="text" required value={bookingData.name} onChange={(e) => setBookingData({...bookingData, name: e.target.value})} placeholder={currentT.modName} className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white outline-none transition-all" />
                   <input type="text" required value={bookingData.phone} onChange={(e) => setBookingData({...bookingData, phone: e.target.value})} placeholder={currentT.modPhone} className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white outline-none transition-all font-bold" />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1">{currentT.modStart}</label>
                     <input type="date" required value={bookingData.startDate} onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})} className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white outline-none transition-all text-slate-700" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1">{currentT.modEnd}</label>
                     <input type="date" required value={bookingData.endDate} onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})} className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white outline-none transition-all text-slate-700" />
                   </div>
                 </div>
                 <input type="text" required value={bookingData.destination} onChange={(e) => setBookingData({...bookingData, destination: e.target.value})} placeholder={currentT.modDest} className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white outline-none transition-all" />
                 <textarea value={bookingData.message} onChange={(e) => setBookingData({...bookingData, message: e.target.value})} placeholder={currentT.modMsg} className="w-full border border-gray-200 p-3.5 rounded-xl bg-gray-50 text-sm resize-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white outline-none transition-all" rows={3}></textarea>
                 
                 <button type="submit" disabled={bookingLoading} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-4 rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 transition-all text-xs tracking-widest uppercase mt-2">{bookingLoading ? 'Sending...' : currentT.modSubmit}</button>
               </form>
             </div>
           </div>
        </div>
      )}

      {/* ---------------- GLOBAL TOP BAR (SLIM) ---------------- */}
      <div className="bg-slate-900 text-slate-300 text-[10px] sm:text-xs py-2 px-4 sm:px-6 lg:px-8 flex justify-between items-center z-50 relative border-b border-slate-800 font-medium">
        <div className="flex gap-4"><span className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">📧 info@garihub.co.tz</span><span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">📞 +255 700 000 000</span></div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang('en')} className={`font-black transition-colors ${lang === 'en' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>EN</button>
          <span className="text-slate-600">|</span>
          <button onClick={() => setLang('sw')} className={`font-black transition-colors ${lang === 'sw' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>SW</button>
        </div>
      </div>

      {/* ---------------- NAVIGATION BAR (PREMIUM GLASSMORPHISM) ---------------- */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 w-full z-40 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 sm:h-20 items-center">
            <div className="flex-shrink-0 flex items-center group">
              <Link href="/" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter group-hover:scale-105 transition-transform">
                Gari<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Hub</span>
              </Link>
            </div>
            <div className="hidden lg:flex space-x-6 items-center">
              <Link href="/" className="text-slate-500 hover:text-blue-600 px-1 py-2 font-bold text-xs xl:text-sm tracking-wide uppercase transition-colors">{currentT.home}</Link>
              <Link href="/#magari" className="text-slate-500 hover:text-blue-600 px-1 py-2 font-bold text-xs xl:text-sm tracking-wide uppercase transition-colors">{currentT.inventory}</Link>
              <Link href="/rentals" className="text-slate-900 border-b-2 border-amber-500 px-1 py-2 font-black transition-colors text-xs xl:text-sm tracking-wide uppercase">{currentT.rentMenu}</Link>
              <Link href="/spares" className="text-slate-500 hover:text-blue-600 px-1 py-2 font-bold transition-colors text-xs xl:text-sm tracking-wide uppercase">{currentT.sparesMenu}</Link>
            </div>
            <div className="flex items-center gap-3 sm:gap-5">
              <Link href="/client" className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black hover:from-amber-500 hover:to-orange-500 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all text-[10px] sm:text-xs uppercase tracking-widest ring-1 ring-slate-900/5">
                {currentT.clientPortal}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ---------------- RENTALS HERO SECTION ---------------- */}
      <div className="relative bg-[#0B1120] overflow-hidden border-b border-slate-800 pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-amber-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-10"></div>
        <div className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1549314486-7a718c312781?auto=format&fit=crop&w=2000&q=80" alt="Premium Rentals" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/80 to-transparent"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-[10px] uppercase tracking-widest mb-6 backdrop-blur-md">🔑 GariHub Rentals</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tighter mb-4 drop-shadow-lg">{currentT.heroTitle}</h1>
          <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">{currentT.heroDesc}</p>
        </div>
      </div>

      {/* ---------------- SEARCH & FILTERS BAR (FLOATING) ---------------- */}
      <div className="relative w-full max-w-[95%] sm:max-w-4xl mx-auto px-4 -mt-8 z-30 mb-12">
        <div className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-xl shadow-amber-900/5 p-4 border border-amber-100 ring-1 ring-white/50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">🔍</span>
            <input type="text" placeholder={currentT.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all" />
          </div>
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {['All', 'SUV', 'Sedan', 'Van'].map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} className={`whitespace-nowrap px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${categoryFilter === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-gray-50 text-slate-600 border border-gray-200 hover:border-slate-400'}`}>
                {cat === 'All' ? currentT.filterAll : cat === 'SUV' ? currentT.filterSUV : cat === 'Sedan' ? currentT.filterSedan : currentT.filterVan}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- RENTALS GRID SECTION ---------------- */}
      <div className="max-w-[95%] sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-pulse text-amber-500 text-6xl">🔑</div></div>
        ) : filteredRentals.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <span className="text-5xl block mb-4 opacity-30">🚙</span>
            <h3 className="text-slate-800 font-black text-lg">{currentT.noData}</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredRentals.map(car => (
              <div key={car.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col group hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-300 hover:-translate-y-1">
                
                <div className="relative h-56 sm:h-64 overflow-hidden rounded-t-3xl bg-gray-100">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-md uppercase tracking-widest border border-amber-400/50">VIP Rental</span>
                  </div>
                  <img src={car.main_image || 'https://via.placeholder.com/600x400'} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80"></div>
                  
                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
                    <div>
                      <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest drop-shadow-md">Daily Rate</p>
                      <h3 className="text-2xl font-black text-white drop-shadow-lg">TZS {car.price_per_day?.toLocaleString()} <span className="text-sm font-medium text-slate-300 normal-case">{currentT.pricePerDay}</span></h3>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors">{car.make} {car.model}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Model Year: {car.year}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl flex items-center gap-2">
                      <span className="text-slate-400 text-sm">⚙️</span><span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{car.transmission}</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl flex items-center gap-2">
                      <span className="text-slate-400 text-sm">⛽</span><span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{car.fuel}</span>
                    </div>
                  </div>

                  {car.features && car.features.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-1.5">
                      {car.features.slice(0, 3).map((feat: string, idx: number) => (
                        <span key={idx} className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-black px-2 py-1 rounded uppercase tracking-wider">{feat}</span>
                      ))}
                      {car.features.length > 3 && <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-1 rounded">+{car.features.length - 3} MORE</span>}
                    </div>
                  )}

                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <button onClick={() => openBooking(car)} className="col-span-2 bg-slate-900 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-md hover:bg-amber-500 hover:shadow-amber-500/30 transition-all flex justify-center items-center gap-2">
                      🔑 {currentT.bookBtn}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------------- PREMIUM FOOTER ---------------- */}
      <footer className="bg-[#0B1120] text-slate-400 pt-16 pb-8 border-t-[6px] border-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <Link href="/" className="text-3xl font-black text-white tracking-tighter mb-4 inline-block">Gari<span className="text-amber-500">Hub</span></Link>
              <p className="text-slate-500 text-xs leading-relaxed mb-6 max-w-xs font-medium">{currentT.footerDesc}</p>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center hover:bg-amber-500 hover:border-amber-400 text-sm text-white transition-all cursor-pointer shadow-sm hover:shadow-amber-500/20">IG</div>
                <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center hover:bg-amber-500 hover:border-amber-400 text-sm text-white transition-all cursor-pointer shadow-sm hover:shadow-amber-500/20">FB</div>
              </div>
            </div>
            <div>
              <h4 className="text-white text-[10px] sm:text-xs font-black uppercase tracking-widest mb-5">{currentT.quickLinks}</h4>
              <ul className="space-y-3 text-[10px] sm:text-xs font-bold text-slate-500">
                <li><Link href="/#magari" className="hover:text-blue-400 transition-colors">{currentT.inventory}</Link></li>
                <li><Link href="/rentals" className="text-amber-400 transition-colors">{currentT.rentMenu}</Link></li>
                <li><Link href="/spares" className="hover:text-blue-400 transition-colors">{currentT.sparesMenu}</Link></li>
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
                <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-amber-500 text-sm">📍</div><span>Dar es Salaam, Tanzania</span></li>
                <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-amber-500 text-sm">📞</div><span>+255 700 000 000</span></li>
                <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-amber-500 text-sm">📧</div><span>info@garihub.co.tz</span></li>
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