"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [lang, setLang] = useState<'sw' | 'en'>('en');
  const [currency, setCurrency] = useState<'USD' | 'TZS' | 'KES' | 'UGX'>('TZS');
  const [port, setPort] = useState<'Dar es Salaam' | 'Mombasa' | 'Maputo'>('Dar es Salaam');

  // INQUIRY MODAL STATES 
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [inquiryData, setInquiryData] = useState({ name: '', phone: '', message: '' });
  const [sendingInquiry, setSendingInquiry] = useState(false);

  // PHOTO SOURCING STATES
  const [sourcingFile, setSourcingFile] = useState<File | null>(null);
  const [sourcingPreview, setSourcingPreview] = useState<string | null>(null);
  const [showSourcingModal, setShowSourcingModal] = useState(false);
  const [sourcingData, setSourcingData] = useState({ name: '', phone: '' });
  const [sendingSourcing, setSendingSourcing] = useState(false);

  // SERVICE & INSPECTION STATES
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceData, setServiceData] = useState({ name: '', phone: '', carModel: '', serviceType: 'Dharura / Call Mechanic (Emergency)', date: '', location: '' });
  const [sendingService, setSendingService] = useState(false);

  // TRADE-IN / TOP UP MODAL STATES (Imenosti nafasi ya Calculator)
  const [showTradeInModal, setShowTradeInModal] = useState(false);
  const [tradeInData, setTradeInData] = useState({ name: '', phone: '', myCar: '', targetCar: '', offerType: 'Top-up (Gari + Pesa)' });
  const [sendingTradeIn, setSendingTradeIn] = useState(false);

  // DATA STATES
  const [allFetchedCars, setAllFetchedCars] = useState<any[]>([]);
  const [showroomCars, setShowroomCars] = useState<any[]>([]); 
  const [activeFilter, setActiveFilter] = useState<string>('ALL'); 

  // SEARCH FORM STATES
  const [searchFilters, setSearchFilters] = useState({ make: 'All Makes', model: 'Any Model', minYear: 'Min', maxYear: 'Max', body: 'All Types', budget: 'No Limit' });

  useEffect(() => {
    fetchLiveCars();
  }, []);

  const fetchLiveCars = async () => {
    try {
      const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        const now = new Date();
        const dbCars = data.map(car => {
          const carDate = new Date(car.created_at);
          const diffDays = Math.floor((now.getTime() - carDate.getTime()) / (1000 * 3600 * 24));
          const isLocal = car.location_from?.toLowerCase().includes('tanzania') || car.stock_id?.startsWith('LOC') || car.tag === 'LOCAL';
          
          return {
            id: car.id, stockId: car.stock_id, make: car.make, model: car.model, title: `${car.make} ${car.model}`,
            year: car.year?.toString() || '2015', trans: car.transmission, km: car.mileage, 
            engine_cc: car.engine_cc, color: car.color, seats: car.seats, drive_system: car.drive_system, features: car.features || [], 
            fob: isLocal ? `TZS ${car.cif_price?.toLocaleString() || 0}` : `$${car.fob_price?.toLocaleString() || 0}`,
            cif: `$${car.cif_price?.toLocaleString() || 0}`, rawPrice: isLocal ? car.cif_price : car.fob_price, 
            img: car.location, tag: car.tag === 'NONE' ? '' : car.tag, liked: false, isExpired: diffDays > 14, isLocal: isLocal
          };
        }).filter(car => !car.isExpired || car.tag === 'SOLD OUT' || car.tag === 'SOLD');
        setAllFetchedCars(dbCars); setShowroomCars(dbCars); 
      }
    } catch (err) { console.log("Inatumia Local Data."); }
  };

  const handleAdvancedSearch = () => {
    let filtered = [...allFetchedCars];
    if (searchFilters.make !== 'All Makes') filtered = filtered.filter(car => car.make?.toLowerCase() === searchFilters.make.toLowerCase());
    if (searchFilters.model !== 'Any Model') filtered = filtered.filter(car => car.model?.toLowerCase().includes(searchFilters.model.toLowerCase()));
    if (searchFilters.minYear !== 'Min') filtered = filtered.filter(car => parseInt(car.year) >= parseInt(searchFilters.minYear));
    if (searchFilters.maxYear !== 'Max') filtered = filtered.filter(car => parseInt(car.year) <= parseInt(searchFilters.maxYear));
    if (searchFilters.body !== 'All Types') {
      const suvs = ['forester', 'prado', 'x-trail', 'cx-5', 'vanguard', 'harrier', 'rav4', 'cruiser', 'kluger', 'escapade'];
      const sedans = ['crown', 'c200', '3 series', 'premio', 'allion', 'belta', 'camry', 'corolla', 'passat'];
      const hatchbacks = ['ist', 'fit', 'impreza', 'vitz', 'note', 'demio', 'aqua', 'swift', 'march'];
      const pickups = ['hilux', 'ranger', 'navara', 'd-max', 'hardbody', 'amarok'];
      const vans = ['hiace', 'alphard', 'noah', 'voxy', 'caravan', 'vellfire', 'sienta'];
      let matchArray: string[] = [];
      if (searchFilters.body === 'SUV') matchArray = suvs; if (searchFilters.body === 'Sedan') matchArray = sedans; if (searchFilters.body === 'Hatchback') matchArray = hatchbacks; if (searchFilters.body === 'Pickup') matchArray = pickups; if (searchFilters.body === 'Van') matchArray = vans;
      if (matchArray.length > 0) filtered = filtered.filter(car => { const titleLower = car.title.toLowerCase(); return matchArray.some(keyword => titleLower.includes(keyword)); });
    }
    if (searchFilters.budget !== 'No Limit') {
      const maxBudget = parseInt(searchFilters.budget.replace(/[^0-9]/g, ''));
      filtered = filtered.filter(car => { const carPrice = car.rawPrice; return carPrice <= maxBudget; });
    }
    setShowroomCars(filtered); setActiveFilter('SEARCH RESULTS'); 
  };

  const handleFilter = (type: 'ALL' | 'MAKE' | 'BODY' | 'STOCK', value: string) => {
    setActiveFilter(value);
    setSearchFilters({ make: 'All Makes', model: 'Any Model', minYear: 'Min', maxYear: 'Max', body: 'All Types', budget: 'No Limit' });
    if (type === 'ALL') { setShowroomCars(allFetchedCars); } 
    else if (type === 'MAKE') { const filtered = allFetchedCars.filter(car => car.make?.toLowerCase() === value.toLowerCase()); setShowroomCars(filtered); } 
    else if (type === 'BODY') {
      const suvs = ['forester', 'prado', 'x-trail', 'cx-5', 'vanguard', 'harrier', 'rav4', 'cruiser', 'kluger'];
      const sedans = ['crown', 'c200', '3 series', 'premio', 'allion', 'belta', 'camry'];
      const hatchbacks = ['ist', 'fit', 'impreza', 'vitz', 'note', 'demio'];
      let matchArray: string[] = [];
      if (value === 'SUV') matchArray = suvs; if (value === 'Sedan') matchArray = sedans; if (value === 'Hatchback') matchArray = hatchbacks;
      const filtered = allFetchedCars.filter(car => { const titleLower = car.title.toLowerCase(); return matchArray.some(keyword => titleLower.includes(keyword)); });
      setShowroomCars(filtered);
    }
    else if (type === 'STOCK') {
      const filtered = allFetchedCars.filter(car => value === 'TANZANIA' ? car.isLocal : !car.isLocal);
      setShowroomCars(filtered);
    }
  };

  const countStock = (stockType: string) => allFetchedCars.filter(car => stockType === 'TANZANIA' ? car.isLocal : !car.isLocal).length;
  const getSafeImage = (imgUrl: string) => { if (!imgUrl || imgUrl.trim() === '') return 'https://placehold.co/800x600/e2e8f0/64748b?text=Gari+Hub'; return imgUrl; };

  // FORM SUBMISSIONS
  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault(); setSendingInquiry(true);
    try {
      const messagePayload = `Jina: ${inquiryData.name}\nUjumbe: ${inquiryData.message}\nGari: ${selectedCar?.title} (${selectedCar?.stockId})`;
      await supabase.from('inquiries').insert([{ vehicle_id: selectedCar?.id, contact_phone: inquiryData.phone, customer_message: messagePayload }]);
      alert(lang === 'sw' ? "Ujumbe wako umetumwa kikamilifu!" : "Inquiry sent successfully! Our team will contact you.");
      setShowInquiryModal(false); setInquiryData({ name: '', phone: '', message: '' });
    } catch (err) {} finally { setSendingInquiry(false); }
  };

  const openInquiry = (car: any) => { 
    setSelectedCar(car); 
    setInquiryData({ ...inquiryData, message: lang === 'sw' ? 'Nimependa hili gari, naomba kujua utaratibu wa kulilipia.' : 'I am interested in this car, please provide the payment procedure.' });
    setShowInquiryModal(true); 
  };

  const handlePhotoUploadSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; setSourcingFile(file); setSourcingPreview(URL.createObjectURL(file)); setShowSourcingModal(true); }
  };

  const submitSourcingRequest = async (e: React.FormEvent) => {
    e.preventDefault(); if (!sourcingFile) return; setSendingSourcing(true);
    try {
      const fileExt = sourcingFile.name.split('.').pop(); const uniqueFileName = `sourcing-${Math.random()}.${fileExt}`;
      const { data: uploadData } = await supabase.storage.from('car-images').upload(`public/${uniqueFileName}`, sourcingFile);
      let imageUrl = uploadData ? supabase.storage.from('car-images').getPublicUrl(`public/${uniqueFileName}`).data.publicUrl : '';
      const messagePayload = `SOURCING REQUEST\nJina: ${sourcingData.name}\nAnatafuta Gari Hili (Picha): ${imageUrl}`;
      await supabase.from('inquiries').insert([{ contact_phone: sourcingData.phone, customer_message: messagePayload }]);
      alert(lang === 'sw' ? "Picha imetumwa kikamilifu! Wakala wetu atakupa quotation." : "Photo sent successfully! Our agent will provide a quote.");
      setShowSourcingModal(false); setSourcingFile(null); setSourcingPreview(null); setSourcingData({ name: '', phone: '' });
    } catch (err) {} finally { setSendingSourcing(false); }
  };

  const submitServiceBooking = async (e: React.FormEvent) => {
    e.preventDefault(); setSendingService(true);
    try {
      const messagePayload = `SERVICE/EMERGENCY BOOKING\nJina: ${serviceData.name}\nGari Lake: ${serviceData.carModel}\nHuduma Anayotaka: ${serviceData.serviceType}\nMahali Alipo (Location): ${serviceData.location}\nSiku: ${serviceData.date}`;
      await supabase.from('inquiries').insert([{ contact_phone: serviceData.phone, customer_message: messagePayload }]);
      alert(lang === 'sw' ? "Ombi lako limepokelewa. Fundi wetu atakupigia muda huu!" : "Booking received! Our mechanic will contact you shortly.");
      setShowServiceModal(false); setServiceData({ name: '', phone: '', carModel: '', serviceType: 'Dharura / Call Mechanic (Emergency)', date: '', location: '' });
    } catch (err) {} finally { setSendingService(false); }
  };

  // MPYA: SUBMIT TRADE-IN (Jukwaa la Nje)
  const submitGeneralTradeIn = async (e: React.FormEvent) => {
    e.preventDefault(); setSendingTradeIn(true);
    try {
      const messagePayload = `🔥 GENERAL TRADE-IN REQUEST 🔥\nJina: ${tradeInData.name}\nGari Analotoa: ${tradeInData.myCar}\nGari Analotaka: ${tradeInData.targetCar}\nAina ya Ofa: ${tradeInData.offerType}`;
      await supabase.from('inquiries').insert([{ contact_phone: tradeInData.phone, customer_message: messagePayload }]);
      alert(lang === 'sw' ? "Ombi la Trade-In limepokelewa! Tutawasiliana nawe." : "Trade-In request received! We will contact you shortly.");
      setShowTradeInModal(false); setTradeInData({ name: '', phone: '', myCar: '', targetCar: '', offerType: 'Top-up (Gari + Pesa)' });
    } catch (err) {} finally { setSendingTradeIn(false); }
  };

  const toggleLike = (id: string | number) => { setShowroomCars(showroomCars.map(car => car.id === id ? { ...car, liked: !car.liked } : car)); };

  const t = {
    sw: {
      home: "Mwanzo", inventory: "Magari Yetu", sparesMenu: "Vipuri & Vifaa", tradeMenu: "Trade-In & Top Up", contact: "Wasiliana Nasi", servicesMenu: "Service & Kaguzi", rentMenu: "Car Rental",
      heroTitle1: "Agiza Gari Ndoto Yako Kutoka", heroTitle2: "Japani, Ulaya, China na Duniani Kote",
      heroDesc: "Gari Hub inakupa mfumo wa wazi, salama, na wa haraka kuagiza magari kutoka masoko ya dunia nzima mpaka mlangoni kwako.",
      btnSearch: "Tafuta Gari Sasa",
      uploadTitle: "Una Picha ya Gari Unalotaka?", uploadDesc: "Pakia picha ya gari uliloona mtandaoni au barabarani. Tutalitafuta duniani kote na kukupa quotation!",
      uploadBtn: "Pakia Picha", searchMake: "Aina (Make)", searchModel: "Toleo (Model)", searchBody: "Umbo (Body)", searchBudget: "Bajeti", searchBtn: "Tafuta Magari",
      shopByType: "Tafuta Kwa Umbo", shopByMake: "Tafuta Kwa Aina", shopByStock: "Tafuta Kwa Eneo (Stock)",
      stockTz: "Tanzania Stock", stockOverseas: "Japan / Overseas",
      typeSUV: "SUV / Gari Kubwa", typeSedan: "Sedan / Gari Fupi", typeHatch: "Hatchback / IST", 
      featTitle: "Showroom: Magari Yaliyowasili", showingText: "Inaonyesha magari aina ya", clearFilter: "Futa Chujio (Clear)",
      noCars: "Hakuna Gari Linalolingana na Utafutaji Hako.", showAllCars: "Onyesha Magari Yote",
      soldOut: "GARI LIMEUZWA", inTz: "IN TANZANIA", localPrice: "Bei (Cash):", viewBtn: "Tazama", inquireBtn: "Ulizia",
      
      modSourcingTitle: "Tumepata Picha Yako!", modName: "Jina Lako", modPhone: "WhatsApp Namba", modSourcingBtn: "Tuma Picha 🚀",
      modInquiryTitle: "Ulizia Hili Gari", modMessage: "Ujumbe Wako", modInquiryBtn: "Tuma Ujumbe 🚀",
      modServTitle: "Ita Fundi / Weka Miadi", modServDesc: "Weka miadi na mafundi wetu au ita fundi wa dharura (Emergency) kuja ulipo kufanya matengenezo.", modServType: "Aina ya Huduma / Tatizo", modServCar: "Gari Lako / Linalokaguliwa", modServLocation: "Mahali Ulipo / Location", modServDate: "Tarehe", modServBtn: "Tuma Maombi 🚀",
      
      // Trade In Translations
      tradeTitle: "Trade-In & Top Up", tradeDesc: "Badilisha gari lako la zamani upewe jipya, au ongeza pesa (Top-up) upate gari la ndoto yako kwa urahisi.", tradeInputMyCar: "Gari Ulilonalo Sasa", tradeInputTargetCar: "Gari Unalotaka", tradeSubmit: "Tuma Maombi ya Trade-In 🚀",
      
      srvSubtitle: "Gari Hub Ecosystem", srvTitle: "Huduma Zetu Zaidi ya Kuuza Magari", srvDesc: "Tunatoa huduma kamili kuhakikisha gari lako linanunuliwa salama, linadumu, na liko barabarani muda wote.",
      card1Title: "Kaguzi & Fundi (SOS)", card1Desc: "Ita fundi wa dharura popote ulipo (Emergency/Maintenance) au tukukagulie gari kabla ya kununua.", card1Btn: "Ita Fundi / Kaguzi ➔",
      card2Title: "Vipuri Original & Tools", card2Desc: "Tunauza na kuagiza Vipuri Original na Vifaa vya kusoma hitilafu za magari (ECU Scanners) viwandani.", card2Btn: "Ingia Dukani ➔",
      card3Title: "Reviews & Ushauri", card3Desc: "Linganisha magari kabla ya kununua. Soma makala za kiufundi, na jifunze jinsi ya kusoma Auction Sheet.", card3Btn: "Soma Makala ➔",
      card4Title: "Trade-In & Top Up", card4Desc: "Rahisisha ununuzi. Leta gari lako la zamani uongeze pesa upate jipya moja kwa moja kutoka Showroom.", card4Btn: "Fanya Trade-In ➔",
      card5Title: "Premium Car Rental", card5Desc: "Tunakodisha magari ya kifahari na ya kawaida kwa matumizi ya harusi, mikutano, au mizunguko binafsi.", card5Btn: "Kodisha Sasa ➔",
      
      howSubtitle: "Mchakato Wetu wa Uwazi", howTitle: "Jinsi Inavyofanya Kazi", howDesc: "Kuanzia kuagiza gari la ndoto yako, kukodisha, hadi kupata fundi. Tumerahisisha kila hatua iwe wazi na salama.",
      hw1Title: "1. Chagua Huduma", hw1Desc: "Tafuta gari kwenye Showroom, tupe oda, weka miadi ya fundi au chagua gari la kukodisha.",
      hw2Title: "2. Nukuu & Miadi", hw2Desc: "Pata mchanganuo kamili wa kodi na usafiri, au thibitisha miadi na fundi wetu atakayekufuata.",
      hw3Title: "3. Malipo Salama", hw3Desc: "Fanya malipo salama kupitia benki. Fuatilia meli yako live au lipia huduma ya ufundi.",
      hw4Title: "4. Furahia Huduma", hw4Desc: "Pokea gari lako likiwa limesajiliwa, anza safari yako ya kukodisha, au endelea na safari baada ya matengenezo.",

      footerSecure: "100% Secure Payments", footerShipping: "Global Shipping", footerVerified: "Verified Condition",
      footerDesc: "Jukwaa la kimataifa la kuagiza magari yenye ubora, kupata vipuri, na kufanya service moja kwa moja mpaka mlangoni kwako.",
      quickLinks: "Viungo Muhimu", ourServices: "Huduma Zetu", contactFooter: "Wasiliana Nasi",
      clientPortal: "Client Portal"
    },
    en: {
      home: "Home", inventory: "Our Inventory", sparesMenu: "Parts & Tools", tradeMenu: "Trade-In / Top-Up", contact: "Contact Us", servicesMenu: "Services & Inspection", rentMenu: "Car Rental",
      heroTitle1: "Import Your Dream Car From", heroTitle2: "Japan, Europe, China & Worldwide",
      heroDesc: "Gari Hub provides a transparent, secure, and fast system to import premium cars from global markets right to your doorstep.",
      btnSearch: "Search Cars Now",
      uploadTitle: "Have a Photo of a Car?", uploadDesc: "Upload a picture of any car you saw online or on the street. We will source it globally and give you a quote!",
      uploadBtn: "Upload Photo", searchMake: "Make", searchModel: "Model", searchBody: "Body Type", searchBudget: "Budget", searchBtn: "Search Cars",
      shopByType: "Shop By Body Type", shopByMake: "Shop By Make", shopByStock: "Shop By Location",
      stockTz: "Tanzania Stock", stockOverseas: "Japan / Overseas",
      typeSUV: "SUV / Off-Road", typeSedan: "Sedan", typeHatch: "Hatchback", 
      featTitle: "Premium Showroom", showingText: "Showing results for", clearFilter: "Clear Filter",
      noCars: "No vehicles match your search criteria.", showAllCars: "Show All Vehicles",
      soldOut: "SOLD OUT", inTz: "IN TANZANIA", localPrice: "Price (Cash):", viewBtn: "View Details", inquireBtn: "Inquire Now",
      
      modSourcingTitle: "We got your photo!", modName: "Your Full Name", modPhone: "WhatsApp Number", modSourcingBtn: "Send Photo Request 🚀",
      modInquiryTitle: "Inquire About This Car", modMessage: "Your Message", modInquiryBtn: "Send Inquiry 🚀",
      modServTitle: "Book Mechanic / Inspection", modServDesc: "Book an appointment or call an emergency mechanic to your location for maintenance and diagnostics.", modServType: "Service Type / Issue", modServCar: "Your Car Make & Model", modServLocation: "Your Location / Area", modServDate: "Preferred Date", modServBtn: "Send Request 🚀",
      
      // Trade In Translations
      tradeTitle: "Trade-In & Swap", tradeDesc: "Swap your current vehicle for a new one, or top up cash to upgrade to your dream car seamlessly.", tradeInputMyCar: "Your Current Car", tradeInputTargetCar: "Target Car / Budget", tradeSubmit: "Submit Trade-In Request 🚀",

      srvSubtitle: "Gari Hub Ecosystem", srvTitle: "More Than Just Car Sales", srvDesc: "End-to-end services ensuring your vehicle is bought safely, maintained properly, and stays on the road.",
      card1Title: "Inspection & Mechanics", card1Desc: "Call an emergency mechanic to your location or get a full pre-purchase car inspection using OBD2 Scanners.", card1Btn: "Book Mechanic ➔",
      card2Title: "Genuine Spares & Tools", card2Desc: "We sell and import genuine OEM parts and ECU diagnostic scanners directly from manufacturers.", card2Btn: "Visit Shop ➔",
      card3Title: "Reviews & Insights", card3Desc: "Compare cars before buying. Read technical articles and learn how to interpret Auction Sheets.", card3Btn: "Read Articles ➔",
      card4Title: "Trade-In & Top Up", card4Desc: "Upgrade easily. Bring your current car, add a top-up, and drive away with a premium vehicle from our showroom.", card4Btn: "Trade-In Now ➔",
      card5Title: "Premium Car Rental", card5Desc: "Rent luxury and standard vehicles for weddings, corporate events, safaris, or personal daily use.", card5Btn: "Rent a Car ➔",
      
      howSubtitle: "Our Transparent Process", howTitle: "How It Works", howDesc: "From importing your dream car, renting a luxury ride, to calling a mechanic. We've simplified every step.",
      hw1Title: "1. Choose Your Service", hw1Desc: "Browse our showroom, request a custom import, call a mechanic, or select a premium vehicle to rent.",
      hw2Title: "2. Quotes & Bookings", hw2Desc: "Get a clear breakdown of taxes (TRA) & freight, or confirm the dispatch of your mechanic.",
      hw3Title: "3. Secure Payments", hw3Desc: "Pay securely via bank. Track your import vessel live or comfortably pay for your mechanical service.",
      hw4Title: "4. Drive & Enjoy", hw4Desc: "Receive your fully cleared car, pick up your rental keys, or get back on the road safely.",

      footerSecure: "100% Secure Payments", footerShipping: "Global Shipping", footerVerified: "Verified Condition",
      footerDesc: "An international platform to import premium vehicles, purchase genuine spare parts, and book professional services right to your doorstep.",
      quickLinks: "Quick Links", ourServices: "Our Services", contactFooter: "Contact Us",
      clientPortal: "Client Portal"
    }
  };

  const currentT = t[lang];

  return (
    <main className="min-h-screen bg-gray-50 pb-0 font-sans text-gray-800 relative overflow-x-hidden">
      
      {/* MODALS SECTION */}
      {showSourcingModal && sourcingPreview && (
        <div className="fixed inset-0 bg-slate-900/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
           <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
             <div className="p-4 bg-gradient-to-r from-blue-700 to-indigo-800 flex justify-between items-center text-white sticky top-0 z-10"><h3 className="font-extrabold text-base">{currentT.modSourcingTitle}</h3><button onClick={() => setShowSourcingModal(false)} className="text-white hover:text-red-200 font-black text-xl leading-none">&times;</button></div>
             <div className="p-5">
               <img src={sourcingPreview} className="w-24 h-24 object-cover rounded-xl shadow-sm border-2 border-blue-50 mx-auto mb-4" />
               <form onSubmit={submitSourcingRequest} className="space-y-3">
                 <input type="text" required value={sourcingData.name} onChange={(e) => setSourcingData({...sourcingData, name: e.target.value})} placeholder={currentT.modName} className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 text-sm focus:border-blue-500 focus:bg-white outline-none" />
                 <input type="text" required value={sourcingData.phone} onChange={(e) => setSourcingData({...sourcingData, phone: e.target.value})} placeholder={currentT.modPhone} className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 text-sm focus:border-blue-500 focus:bg-white outline-none" />
                 <button type="submit" disabled={sendingSourcing} className="w-full bg-blue-600 text-white font-black py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all text-xs">{sendingSourcing ? 'Sending...' : currentT.modSourcingBtn}</button>
               </form>
             </div>
           </div>
        </div>
      )}

      {showInquiryModal && selectedCar && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
             <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10"><h3 className="font-bold text-gray-900 text-base">{currentT.modInquiryTitle}</h3><button onClick={() => setShowInquiryModal(false)} className="text-gray-400 hover:text-red-500 font-black text-xl leading-none">&times;</button></div>
             <div className="p-5">
               <div className="flex gap-3 mb-4 bg-blue-50/50 p-2 rounded-xl border border-blue-100 items-center"><img src={getSafeImage(selectedCar.img)} className="w-16 h-12 object-cover rounded-lg shadow-sm" /><div><p className="font-bold text-gray-900 text-xs">{selectedCar.title}</p><p className="text-[10px] text-blue-600 font-bold">{selectedCar.isLocal ? selectedCar.fob : selectedCar.cif}</p></div></div>
               <form onSubmit={submitInquiry} className="space-y-3">
                 <input type="text" required value={inquiryData.name} onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})} placeholder={currentT.modName} className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 text-sm focus:border-blue-500 outline-none" />
                 <input type="text" required value={inquiryData.phone} onChange={(e) => setInquiryData({...inquiryData, phone: e.target.value})} placeholder={currentT.modPhone} className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 text-sm focus:border-blue-500 outline-none" />
                 <textarea required value={inquiryData.message} onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})} placeholder={currentT.modMessage} className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 text-sm resize-none focus:border-blue-500 outline-none" rows={3}></textarea>
                 <button type="submit" disabled={sendingInquiry} className="w-full bg-slate-900 text-white font-black py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all text-xs">{sendingInquiry ? 'Sending...' : currentT.modInquiryBtn}</button>
               </form>
             </div>
           </div>
        </div>
      )}

      {/* SERVICE & FUNDI BOOKING MODAL */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-800 flex justify-between items-center text-white sticky top-0 z-10">
              <h3 className="font-extrabold flex items-center gap-2 text-base"><span className="text-lg">🛠️</span> {currentT.modServTitle}</h3>
              <button onClick={() => setShowServiceModal(false)} className="text-white hover:text-emerald-200 font-black text-xl leading-none">&times;</button>
            </div>
            <div className="p-5">
              <p className="text-xs text-gray-600 mb-4 bg-emerald-50 p-2 rounded-lg border border-emerald-100">{currentT.modServDesc}</p>
              <form onSubmit={submitServiceBooking} className="space-y-3">
                <div>
                  <select value={serviceData.serviceType} onChange={(e) => setServiceData({...serviceData, serviceType: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-1 focus:ring-emerald-500 bg-gray-50 text-sm font-bold text-emerald-800 outline-none">
                    <option>{lang === 'sw' ? 'Dharura / Call Mechanic (Emergency)' : 'Emergency Mechanic Call'}</option>
                    <option>{lang === 'sw' ? 'Pre-Purchase Inspection' : 'Pre-Purchase Inspection'}</option>
                    <option>{lang === 'sw' ? 'Computer Diagnostics (OBD2)' : 'Computer Diagnostics (OBD2)'}</option>
                    <option>{lang === 'sw' ? 'General Maintenance (Service)' : 'General Maintenance (Service)'}</option>
                  </select>
                </div>
                <input type="text" required value={serviceData.location} onChange={(e) => setServiceData({...serviceData, location: e.target.value})} placeholder={lang === 'sw' ? "Mfano: Tegeta, Dar es Salaam" : "E.g. Masaki, Dar es Salaam"} className="w-full border border-gray-200 p-2.5 rounded-lg outline-none focus:border-emerald-500 bg-gray-50 text-sm" />
                <input type="text" required value={serviceData.carModel} onChange={(e) => setServiceData({...serviceData, carModel: e.target.value})} placeholder="E.g. Toyota Crown 2012" className="w-full border border-gray-200 p-2.5 rounded-lg outline-none focus:border-emerald-500 bg-gray-50 text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" required value={serviceData.name} onChange={(e) => setServiceData({...serviceData, name: e.target.value})} placeholder={currentT.modName} className="w-full border border-gray-200 p-2.5 rounded-lg outline-none focus:border-emerald-500 bg-gray-50 text-sm" />
                  <input type="text" value={serviceData.date} onChange={(e) => setServiceData({...serviceData, date: e.target.value})} placeholder="Leo / Today" className="w-full border border-gray-200 p-2.5 rounded-lg outline-none focus:border-emerald-500 bg-gray-50 text-sm" />
                </div>
                <input type="text" required value={serviceData.phone} onChange={(e) => setServiceData({...serviceData, phone: e.target.value})} placeholder="07XX XXX XXX" className="w-full border border-gray-200 p-2.5 rounded-lg outline-none focus:border-emerald-500 bg-gray-50 text-sm font-bold" />
                <button type="submit" disabled={sendingService} className="w-full bg-emerald-600 text-white font-black py-3 rounded-lg shadow-md hover:bg-emerald-700 transition-all text-xs mt-2">{sendingService ? 'Sending...' : currentT.modServBtn}</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NEW: TRADE-IN & TOP-UP MODAL (REPLACING CALCULATOR) */}
      {showTradeInModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[120] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-100">
            <div className="p-4 bg-gradient-to-r from-purple-700 to-purple-900 flex justify-between items-center text-white"><h3 className="font-extrabold text-base flex items-center gap-2"><span className="text-lg">🔄</span> {currentT.tradeTitle}</h3><button onClick={() => setShowTradeInModal(false)} className="text-white hover:text-purple-200 font-black text-xl leading-none">&times;</button></div>
            <div className="p-5">
              <p className="text-xs text-gray-600 mb-4 bg-purple-50 p-2 rounded-lg border border-purple-100">{currentT.tradeDesc}</p>
              <form onSubmit={submitGeneralTradeIn} className="space-y-3">
                <input type="text" required value={tradeInData.name} onChange={(e) => setTradeInData({...tradeInData, name: e.target.value})} placeholder={currentT.modName} className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 text-sm focus:border-purple-500 outline-none" />
                <input type="text" required value={tradeInData.phone} onChange={(e) => setTradeInData({...tradeInData, phone: e.target.value})} placeholder={currentT.modPhone} className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 text-sm focus:border-purple-500 outline-none" />
                <input type="text" required value={tradeInData.myCar} onChange={(e) => setTradeInData({...tradeInData, myCar: e.target.value})} placeholder={currentT.tradeInputMyCar} className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 text-sm focus:border-purple-500 outline-none" />
                <input type="text" required value={tradeInData.targetCar} onChange={(e) => setTradeInData({...tradeInData, targetCar: e.target.value})} placeholder={currentT.tradeInputTargetCar} className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 text-sm focus:border-purple-500 outline-none" />
                <select value={tradeInData.offerType} onChange={(e) => setTradeInData({...tradeInData, offerType: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 text-sm font-bold focus:border-purple-500 outline-none">
                  <option value="Top-up (Gari + Pesa)">{lang === 'sw' ? 'Top-Up (Gari Langu + Pesa)' : 'Top-Up (My Car + Cash)'}</option>
                  <option value="Exchange (Kubadilishana Tu)">{lang === 'sw' ? 'Kubadilishana Tu (Exchange)' : 'Exchange (Swap only)'}</option>
                </select>
                <button type="submit" disabled={sendingTradeIn} className="w-full bg-purple-600 text-white font-black py-3 rounded-lg shadow-md hover:bg-purple-700 transition-all text-xs mt-2">{sendingTradeIn ? 'Sending...' : currentT.tradeSubmit}</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL TOP BAR */}
      <div className="bg-slate-900 text-white text-[10px] sm:text-xs py-1.5 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center z-50 relative gap-2 sm:gap-0 border-b border-slate-800">
        <div className="flex gap-4 font-medium"><span className="flex items-center gap-1">📧 info@garihub.co.tz</span><span className="flex items-center gap-1">📞 +255 700 000 000</span></div>
        <div className="flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1 flex-wrap justify-center shadow-inner w-full sm:w-auto">
          <div className="flex items-center gap-1 pr-2 border-r border-slate-600"><span className="text-slate-400">⚓</span><select value={port} onChange={(e) => setPort(e.target.value as any)} className="bg-transparent text-blue-400 font-bold outline-none cursor-pointer"><option value="Dar es Salaam" className="bg-slate-800">Dar</option><option value="Mombasa" className="bg-slate-800">Mombasa</option></select></div>
          <div className="flex items-center gap-1 px-2 border-r border-slate-600"><span className="text-slate-400">💵</span><select value={currency} onChange={(e) => setCurrency(e.target.value as any)} className="bg-transparent text-emerald-400 font-bold outline-none cursor-pointer"><option value="USD" className="bg-slate-800">USD</option><option value="TZS" className="bg-slate-800">TZS</option></select></div>
          <div className="flex items-center gap-2 pl-2">
            <button onClick={() => setLang('en')} className={`font-bold transition-colors ${lang === 'en' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>EN</button>
            <span className="text-slate-600">|</span>
            <button onClick={() => setLang('sw')} className={`font-bold transition-colors ${lang === 'sw' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>SW</button>
          </div>
        </div>
      </div>

      {/* NAVIGATION BAR - ADMIN TO CLIENT MODIFIED */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm w-full z-40 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 sm:h-20 items-center">
            <div className="flex-shrink-0 flex items-center"><Link href="/" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">Gari<span className="text-blue-600">Hub</span></Link></div>
            <div className="hidden lg:flex space-x-4 xl:space-x-5 items-center">
              <Link href="/" className="text-slate-900 border-b-2 border-blue-600 px-1 py-2 font-bold text-xs xl:text-sm">{currentT.home}</Link>
              <Link href="#magari" className="text-slate-600 hover:text-blue-600 px-1 py-2 font-semibold transition-colors text-xs xl:text-sm">{currentT.inventory}</Link>
              <Link href="/rentals" className="text-slate-600 hover:text-red-600 px-1 py-2 font-semibold transition-colors text-xs xl:text-sm">{currentT.rentMenu}</Link>
              <Link href="/spares" className="text-slate-600 hover:text-blue-600 px-1 py-2 font-semibold transition-colors text-xs xl:text-sm">{currentT.sparesMenu}</Link>
              <button onClick={() => setShowTradeInModal(true)} className="text-slate-600 hover:text-purple-600 px-1 py-2 font-semibold transition-colors text-xs xl:text-sm">{currentT.tradeMenu}</button>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="hidden md:flex text-slate-600 hover:text-red-500 font-bold text-xs sm:text-sm items-center gap-1.5 transition-colors">❤️ <span className="hidden xl:inline">Wishlist ({allFetchedCars.filter(c => c.liked).length})</span></button>
              <div className="flex items-center md:border-l md:pl-4 border-gray-200">
                <Link href="/client" className="bg-blue-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold hover:bg-slate-900 transition-all shadow-md text-[10px] sm:text-sm">{currentT.clientPortal}</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative bg-slate-900 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 z-0">
           <img src="/hero-bg.jpg" alt="Premium Dealership" onError={(e) => e.currentTarget.style.display = 'none'} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/50 backdrop-blur-[1px]"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center relative z-10">
          <div className="relative pb-10 sm:pb-12 md:pb-16 lg:w-3/5 lg:pb-20 xl:pb-20 pt-8 lg:pt-12 px-4 sm:px-6 lg:px-8">
            <main className="mt-2 mx-auto max-w-7xl sm:mt-6 md:mt-8 lg:mt-8">
              <div className="text-center lg:text-left">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest mb-3">🏆 Premium Dealership</div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl tracking-tight font-black text-white leading-tight">
                  <span className="block xl:inline">{currentT.heroTitle1}</span>{' '}
                  <span className="block text-blue-500 xl:inline mt-1 sm:mt-2">{currentT.heroTitle2}</span>
                </h1>
                <p className="mt-3 text-xs sm:text-sm md:text-base text-slate-300 sm:max-w-xl sm:mx-auto lg:mx-0 leading-relaxed">
                  {currentT.heroDesc}
                </p>
                <div className="mt-6 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-3">
                  <div className="rounded-lg sm:rounded-xl shadow-lg w-full sm:w-auto">
                    <a href="#magari" className="w-full flex items-center justify-center px-6 py-3 sm:py-3.5 border border-transparent text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl text-white bg-blue-600 hover:bg-blue-500 transition-all">
                      {currentT.btnSearch}
                    </a>
                  </div>
                  <div className="rounded-lg sm:rounded-xl shadow-lg w-full sm:w-auto">
                    <button onClick={() => setShowTradeInModal(true)} className="w-full flex items-center justify-center px-6 py-3 sm:py-3.5 border border-slate-600 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl text-white bg-slate-800/60 backdrop-blur-md hover:bg-slate-700 transition-all">
                      {currentT.tradeMenu}
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
          <div className="w-full lg:w-2/5 px-4 sm:px-6 pb-10 pt-4 flex justify-center lg:justify-end hidden sm:flex">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 text-center hover:bg-white/10 transition-all duration-500 flex flex-col items-center justify-center shadow-2xl w-full max-w-sm transform lg:rotate-2 hover:rotate-0">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg mb-4 text-white"><span className="text-3xl">📸</span></div>
              <h3 className="text-lg sm:text-xl font-black text-white mb-2 tracking-tight">{currentT.uploadTitle}</h3>
              <p className="text-blue-100/80 mb-5 text-[10px] sm:text-xs leading-relaxed">{currentT.uploadDesc}</p>
              <label className="relative overflow-hidden w-full bg-white text-slate-900 px-4 py-3 rounded-xl font-black hover:bg-gray-100 transition-all shadow-lg cursor-pointer flex justify-center items-center gap-2 text-xs">
                <span className="text-lg">☁️</span> <span>{currentT.uploadBtn}</span>
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handlePhotoUploadSelect} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* COMPACT ADVANCED QUICK SEARCH (Imefinywa ifit kwenye simu vizuri) */}
      <div className="relative w-full max-w-[96%] sm:max-w-[90%] mx-auto px-2 sm:px-4 -mt-5 sm:-mt-8 z-30">
        <div className="bg-white rounded-2xl shadow-xl p-3 md:p-4 border border-gray-100">
          <form className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 items-end">
            <div className="col-span-1"><label className="block text-[9px] font-black text-slate-500 mb-1 uppercase">{currentT.searchMake}</label><select value={searchFilters.make} onChange={(e) => setSearchFilters({...searchFilters, make: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 sm:p-2.5 text-[10px] sm:text-xs font-bold text-slate-700 bg-gray-50 outline-none"><option>All Makes</option><option>Toyota</option><option>Subaru</option><option>Mercedes</option></select></div>
            <div className="col-span-1"><label className="block text-[9px] font-black text-slate-500 mb-1 uppercase">{currentT.searchModel}</label><select value={searchFilters.model} onChange={(e) => setSearchFilters({...searchFilters, model: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 sm:p-2.5 text-[10px] sm:text-xs font-bold text-slate-700 bg-gray-50 outline-none"><option>Any Model</option><option>Forester</option><option>Crown</option><option>Harrier</option></select></div>
            <div className="col-span-2 sm:col-span-1 flex gap-2"><div className="w-1/2"><label className="block text-[9px] font-black text-slate-500 mb-1 uppercase">Min Year</label><select value={searchFilters.minYear} onChange={(e) => setSearchFilters({...searchFilters, minYear: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 sm:p-2.5 text-[10px] sm:text-xs font-bold text-slate-700 bg-gray-50"><option>Min</option><option>2010</option><option>2015</option></select></div><div className="w-1/2"><label className="block text-[9px] font-black text-slate-500 mb-1 uppercase">Max Year</label><select value={searchFilters.maxYear} onChange={(e) => setSearchFilters({...searchFilters, maxYear: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 sm:p-2.5 text-[10px] sm:text-xs font-bold text-slate-700 bg-gray-50"><option>Max</option><option>2020</option><option>2025</option></select></div></div>
            <div className="col-span-1"><label className="block text-[9px] font-black text-slate-500 mb-1 uppercase">{currentT.searchBody}</label><select value={searchFilters.body} onChange={(e) => setSearchFilters({...searchFilters, body: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 sm:p-2.5 text-[10px] sm:text-xs font-bold text-slate-700 bg-gray-50"><option>All Types</option><option>SUV</option><option>Sedan</option></select></div>
            <div className="col-span-1"><label className="block text-[9px] font-black text-slate-500 mb-1 uppercase">{currentT.searchBudget}</label><select value={searchFilters.budget} onChange={(e) => setSearchFilters({...searchFilters, budget: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 sm:p-2.5 text-[10px] sm:text-xs font-bold text-slate-700 bg-gray-50"><option>No Limit</option><option>$15,000</option></select></div>
            <div className="col-span-2 sm:col-span-3 lg:col-span-1"><button type="button" onClick={handleAdvancedSearch} className="w-full bg-slate-900 text-white p-2 sm:p-2.5 rounded-lg font-black hover:bg-blue-600 transition-colors text-xs flex justify-center items-center gap-1.5">🔍 {currentT.searchBtn}</button></div>
          </form>
        </div>
      </div>

      {/* MAIN CONTENT AREA: PREMIUM SHOWROOM (COMPACT CARDS & SHOP BY) */}
      <div id="magari" className="w-full max-w-[100%] md:max-w-[95%] mx-auto px-3 sm:px-6 mt-8 sm:mt-12 mb-12">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          
          {/* COMPACT SIDEBAR (SHOP BY) */}
          <div className="w-full lg:w-1/5 order-1">
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 lg:sticky lg:top-24 flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-visible custom-scrollbar">
              
              <div className="min-w-[120px] lg:min-w-0">
                <h2 className="text-[9px] sm:text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{currentT.shopByStock}</h2>
                <div className="flex flex-col gap-1.5">
                  <div onClick={() => handleFilter('STOCK', 'TANZANIA')} className={`py-1.5 px-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${activeFilter === 'TANZANIA' ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-100 hover:border-emerald-300'}`}>
                    <div className="flex items-center gap-1.5"><span className="text-sm">🇹🇿</span><span className={`font-bold text-[9px] sm:text-[10px] ${activeFilter === 'TANZANIA' ? 'text-emerald-700' : 'text-slate-600'}`}>Local</span></div>
                  </div>
                  <div onClick={() => handleFilter('STOCK', 'OVERSEAS')} className={`py-1.5 px-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${activeFilter === 'OVERSEAS' ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-100 hover:border-blue-300'}`}>
                    <div className="flex items-center gap-1.5"><span className="text-sm">🚢</span><span className={`font-bold text-[9px] sm:text-[10px] ${activeFilter === 'OVERSEAS' ? 'text-blue-700' : 'text-slate-600'}`}>Import</span></div>
                  </div>
                </div>
              </div>

              <div className="min-w-[140px] lg:min-w-0">
                <h2 className="text-[9px] sm:text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest lg:mt-4 lg:border-t border-gray-100 lg:pt-3">{currentT.shopByType}</h2>
                <div className="flex flex-col gap-1.5">
                  {['SUV', 'Sedan', 'Hatchback'].map(type => (
                     <div key={type} onClick={() => handleFilter('BODY', type)} className={`py-1.5 px-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${activeFilter === type ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-gray-100 text-slate-600'}`}>
                       <span className="text-xs">{type === 'SUV' ? '🚙' : type === 'Sedan' ? '🚗' : '🚕'}</span><span className="font-bold text-[9px] sm:text-[10px]">{type}</span>
                     </div>
                  ))}
                </div>
              </div>

              <div className="min-w-[120px] lg:min-w-0">
                <h2 className="text-[9px] sm:text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest lg:mt-4 lg:border-t border-gray-100 lg:pt-3">{currentT.shopByMake}</h2>
                <div className="flex flex-col gap-1.5">
                  {['Toyota', 'Subaru', 'Mercedes'].map(make => (
                    <div key={make} onClick={() => handleFilter('MAKE', make)} className={`py-1.5 px-2 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all ${activeFilter === make ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-100 text-slate-600'}`}>
                      <span className="font-bold text-[9px] sm:text-[10px]">{make}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* GRID YA MAGARI (COMPACT CARDS) */}
          <div className="w-full lg:w-4/5 order-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-4 border-b border-gray-200 pb-3 gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{currentT.featTitle}</h2>
                <p className="mt-0.5 text-[10px] sm:text-xs font-medium text-slate-500">{activeFilter !== 'ALL' ? `${currentT.showingText} "${activeFilter}"` : 'Browse our collection.'}</p>
              </div>
              {activeFilter !== 'ALL' && (<button onClick={() => handleFilter('ALL', 'ALL')} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg w-max">{currentT.clearFilter}</button>)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {showroomCars.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                  <span className="text-4xl block mb-3 opacity-40">🚙</span><h3 className="text-slate-900 font-bold text-sm mb-2">{currentT.noCars}</h3>
                  <button onClick={() => handleFilter('ALL', 'ALL')} className="mt-2 bg-slate-900 text-white font-bold px-6 py-2 rounded-lg text-xs">{currentT.showAllCars}</button>
                </div>
              ) : (
                showroomCars.map((car) => (
                  <div key={car.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col relative group transition-all duration-300 hover:shadow-lg ${car.tag === 'SOLD OUT' ? 'opacity-80 grayscale-[20%]' : ''}`}>
                    
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                      {car.tag && (<span className={`text-white text-[8px] font-black px-2 py-0.5 rounded shadow-sm uppercase ${car.tag === 'HOT' ? 'bg-orange-500' : car.tag === 'UNDER OFFER' ? 'bg-purple-600' : car.tag === 'SOLD OUT' ? 'bg-slate-800' : 'bg-blue-600'}`}>{car.tag === 'SOLD OUT' ? currentT.soldOut : car.tag}</span>)}
                      {car.isLocal && (<span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-sm uppercase">🇹🇿 Local</span>)}
                    </div>
                    <button onClick={() => toggleLike(car.id)} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full z-10 shadow-sm"><span className="text-xs leading-none">{car.liked ? '❤️' : '🤍'}</span></button>

                    <Link href={`/vehicles/${car.id}`} className="relative h-32 sm:h-36 overflow-hidden bg-gray-100 block rounded-t-xl">
                      <img src={getSafeImage(car.img)} alt={car.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>

                    <div className="p-3 flex-grow flex flex-col">
                      <p className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">Ref: {car.stockId}</p>
                      <Link href={`/vehicles/${car.id}`}><h3 className="text-xs sm:text-sm font-black text-slate-900 truncate mb-2">{car.title}</h3></Link>

                      <div className="grid grid-cols-3 gap-1 mb-2 bg-slate-50 p-1.5 rounded-lg border border-gray-100">
                        <div className="text-center"><p className="text-[7px] text-slate-400 uppercase">{currentT.year}</p><p className="font-bold text-slate-700 text-[9px]">{car.year}</p></div>
                        <div className="text-center border-l border-r border-gray-200"><p className="text-[7px] text-slate-400 uppercase">{currentT.engine}</p><p className="font-bold text-slate-700 text-[9px] truncate">{car.engine_cc || '-'}</p></div>
                        <div className="text-center"><p className="text-[7px] text-slate-400 uppercase">{currentT.trans}</p><p className="font-bold text-slate-700 text-[9px] truncate">{car.trans === 'Automatic' ? 'Auto' : 'Man'}</p></div>
                      </div>

                      <div className="mt-auto bg-slate-50 rounded-lg p-2 border border-gray-100 mb-2.5">
                        <div className="flex justify-between items-end">
                          <span className="text-slate-500 text-[8px] uppercase font-bold">{car.isLocal ? currentT.localPrice : 'FOB:'}</span>
                          <span className={`font-black text-sm sm:text-base leading-none ${car.isLocal ? 'text-emerald-600' : 'text-slate-900'}`}>{car.fob}</span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        {car.tag === 'SOLD OUT' ? (
                          <button disabled className="w-full py-1.5 bg-slate-200 text-slate-500 text-[9px] font-black rounded-lg uppercase">{currentT.soldOut}</button>
                        ) : (
                          <div className="flex gap-1.5">
                            <Link href={`/vehicles/${car.id}`} className="flex-1 text-center py-1.5 bg-white border border-slate-300 text-slate-700 text-[9px] font-black rounded-lg hover:bg-slate-50 uppercase">{currentT.viewBtn}</Link>
                            <button onClick={() => openInquiry(car)} className="flex-1 py-1.5 bg-blue-600 text-white text-[9px] font-black rounded-lg hover:bg-blue-700 shadow-sm uppercase">{currentT.inquireBtn}</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SERVICES HUB YENYE PARALLAX SCROLLING BACKGROUND */}
      <div id="services-hub" className="relative py-16 sm:py-20 border-t border-gray-800 overflow-hidden bg-fixed bg-center bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=80')" }}>
        <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-[3px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 sm:mb-12">
            <span className="bg-white/10 border border-white/20 text-blue-300 text-[9px] sm:text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-3 inline-block shadow-sm">{currentT.srvSubtitle}</span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{currentT.srvTitle}</h2>
            <p className="mt-3 text-slate-300 max-w-xl mx-auto text-xs sm:text-sm px-4">{currentT.srvDesc}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
            <div onClick={() => setShowServiceModal(true)} className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex flex-col h-full transform sm:hover:-translate-y-1">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center text-lg mb-4">🛠️</div>
              <h3 className="font-black text-sm text-white mb-2">{currentT.card1Title}</h3>
              <p className="text-slate-300 text-[10px] sm:text-xs mb-4 flex-grow">{currentT.card1Desc}</p>
              <div className="mt-auto"><span className="text-emerald-400 font-bold text-[9px] uppercase tracking-widest">{currentT.card1Btn}</span></div>
            </div>
            <Link href="/spares" className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all flex flex-col h-full transform sm:hover:-translate-y-1">
              <div className="w-10 h-10 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl flex items-center justify-center text-lg mb-4">⚙️</div>
              <h3 className="font-black text-sm text-white mb-2">{currentT.card2Title}</h3>
              <p className="text-slate-300 text-[10px] sm:text-xs mb-4 flex-grow">{currentT.card2Desc}</p>
              <div className="mt-auto"><span className="text-blue-400 font-bold text-[9px] uppercase tracking-widest">{currentT.card2Btn}</span></div>
            </Link>
            <Link href="/rentals" className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all flex flex-col h-full transform sm:hover:-translate-y-1">
              <div className="w-10 h-10 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl flex items-center justify-center text-lg mb-4">🔑</div>
              <h3 className="font-black text-sm text-white mb-2">{currentT.card5Title}</h3>
              <p className="text-slate-300 text-[10px] sm:text-xs mb-4 flex-grow">{currentT.card5Desc}</p>
              <div className="mt-auto"><span className="text-red-400 font-bold text-[9px] uppercase tracking-widest">{currentT.card5Btn}</span></div>
            </Link>
            <Link href="#reviews" className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all flex flex-col h-full transform sm:hover:-translate-y-1">
              <div className="w-10 h-10 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl flex items-center justify-center text-lg mb-4">📝</div>
              <h3 className="font-black text-sm text-white mb-2">{currentT.card3Title}</h3>
              <p className="text-slate-300 text-[10px] sm:text-xs mb-4 flex-grow">{currentT.card3Desc}</p>
              <div className="mt-auto"><span className="text-orange-400 font-bold text-[9px] uppercase tracking-widest">{currentT.card3Btn}</span></div>
            </Link>
            {/* NEW: TRADE-IN MODAL TRIGGER */}
            <button onClick={() => setShowTradeInModal(true)} className="text-left bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all flex flex-col h-full transform sm:hover:-translate-y-1">
              <div className="w-10 h-10 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl flex items-center justify-center text-lg mb-4">🔄</div>
              <h3 className="font-black text-sm text-white mb-2">{currentT.card4Title}</h3>
              <p className="text-slate-300 text-[10px] sm:text-xs mb-4 flex-grow">{currentT.card4Desc}</p>
              <div className="mt-auto"><span className="text-purple-400 font-bold text-[9px] uppercase tracking-widest">{currentT.card4Btn}</span></div>
            </button>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="bg-slate-50 py-16 border-t border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10">
            <span className="bg-white border border-gray-200 text-slate-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">{currentT.howSubtitle}</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{currentT.howTitle}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-100 text-blue-600 flex items-center justify-center text-xl font-black shadow-md mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">1</div>
              <h3 className="font-black text-sm text-slate-900 mb-2">{currentT.hw1Title}</h3>
              <p className="text-slate-500 text-[10px] sm:text-xs leading-relaxed max-w-[200px]">{currentT.hw1Desc}</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-100 text-blue-600 flex items-center justify-center text-xl font-black shadow-md mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">2</div>
              <h3 className="font-black text-sm text-slate-900 mb-2">{currentT.hw2Title}</h3>
              <p className="text-slate-500 text-[10px] sm:text-xs leading-relaxed max-w-[200px]">{currentT.hw2Desc}</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-black shadow-md mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">3</div>
              <h3 className="font-black text-sm text-slate-900 mb-2">{currentT.hw3Title}</h3>
              <p className="text-slate-500 text-[10px] sm:text-xs leading-relaxed max-w-[200px]">{currentT.hw3Desc}</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-slate-200 text-white flex items-center justify-center text-xl font-black shadow-md mb-4 group-hover:bg-blue-600 transition-all">4</div>
              <h3 className="font-black text-sm text-slate-900 mb-2">{currentT.hw4Title}</h3>
              <p className="text-slate-500 text-[10px] sm:text-xs leading-relaxed max-w-[200px]">{currentT.hw4Desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PREMIUM FOOTER */}
      <footer id="contact" className="bg-slate-900 text-slate-300 pt-12 pb-6 border-t-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <Link href="/" className="text-2xl font-black text-white tracking-tighter mb-3 inline-block">Gari<span className="text-blue-500">Hub</span></Link>
              <p className="text-slate-400 text-[10px] sm:text-xs leading-relaxed mb-4 max-w-xs">{currentT.footerDesc}</p>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 text-xs text-white">IG</div>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 text-xs text-white">FB</div>
              </div>
            </div>
            <div>
              <h4 className="text-white text-[10px] sm:text-xs font-black uppercase tracking-widest mb-4">{currentT.quickLinks}</h4>
              <ul className="space-y-2 text-[10px] sm:text-xs font-medium">
                <li><Link href="/#magari" className="hover:text-blue-400">Our Inventory</Link></li>
                <li><Link href="/rentals" className="hover:text-red-400">Car Rental</Link></li>
                <li><Link href="/spares" className="hover:text-blue-400">Spares & Tools</Link></li>
                <li><button onClick={() => setShowTradeInModal(true)} className="hover:text-purple-400">Trade-In</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-[10px] sm:text-xs font-black uppercase tracking-widest mb-4">{currentT.ourServices}</h4>
              <ul className="space-y-2 text-[10px] sm:text-xs font-medium">
                <li><Link href="/" className="hover:text-blue-400">Vehicle Importation</Link></li>
                <li><button onClick={() => setShowServiceModal(true)} className="hover:text-blue-400">Pre-Purchase Inspection</button></li>
                <li><Link href="/client" className="hover:text-emerald-400">Client Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-[10px] sm:text-xs font-black uppercase tracking-widest mb-4">{currentT.contactFooter}</h4>
              <ul className="space-y-3 text-[10px] sm:text-xs font-medium flex flex-col items-center md:items-start">
                <li className="flex items-start gap-2"><span className="text-blue-500">📍</span><span>Dar es Salaam, Tanzania</span></li>
                <li className="flex items-center gap-2"><span className="text-blue-500">📞</span><span>+255 700 000 000</span></li>
                <li className="flex items-center gap-2"><span className="text-blue-500">📧</span><span>info@garihub.co.tz</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-5 flex flex-col md:flex-row justify-between items-center text-[9px] sm:text-[10px] font-medium text-slate-500 gap-3">
            <p>&copy; {new Date().getFullYear()} Gari Hub. All rights reserved.</p>
            <div className="flex gap-4"><Link href="/" className="hover:text-white">Terms</Link><Link href="/" className="hover:text-white">Privacy</Link></div>
          </div>
        </div>
      </footer>

    </main>
  );
}