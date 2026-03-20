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

  // SERVICE & INSPECTION & EMERGENCY BOOKING STATES
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceData, setServiceData] = useState({ name: '', phone: '', carModel: '', serviceType: 'Dharura / Call Mechanic (Emergency)', date: '', location: '' });
  const [sendingService, setSendingService] = useState(false);

  // CALCULATOR MODAL STATE
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [fobPrice, setFobPrice] = useState<number | ''>('');

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
            fob: isLocal ? `TZS ${car.fob_price?.toLocaleString() || 0}` : `$${car.fob_price?.toLocaleString() || 0}`,
            cif: `$${car.cif_price?.toLocaleString() || 0}`, 
            img: car.location, tag: car.tag === 'NONE' ? '' : car.tag, liked: false, isExpired: diffDays > 14,
            isLocal: isLocal
          };
        }).filter(car => !car.isExpired || car.tag === 'SOLD');
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
      filtered = filtered.filter(car => { const carPrice = parseInt(car.fob.replace(/[^0-9]/g, '')); return carPrice <= maxBudget; });
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

  const toggleLike = (id: string | number) => { setShowroomCars(showroomCars.map(car => car.id === id ? { ...car, liked: !car.liked } : car)); };

  const exchangeRate = 2600; const estimatedFreightUSD = 1200; const freightTZS = estimatedFreightUSD * exchangeRate;
  const fobTZS = typeof fobPrice === 'number' ? fobPrice * exchangeRate : 0;
  const cifTZS = fobTZS + freightTZS; const estimatedTaxTZS = cifTZS * 0.45; const totalCostTZS = cifTZS + estimatedTaxTZS;

  const t = {
    sw: {
      home: "Mwanzo", inventory: "Magari Yetu", sparesMenu: "Vipuri & Vifaa", calcMenu: "Kikokotozi", contact: "Wasiliana Nasi", servicesMenu: "Service & Kaguzi", rentMenu: "Car Rental",
      heroTitle1: "Agiza Gari Ndoto Yako Kutoka", heroTitle2: "Japani, Ulaya, China na Duniani Kote",
      heroDesc: "Gari Hub inakupa mfumo wa wazi, salama, na wa haraka kuagiza magari kutoka masoko ya dunia nzima mpaka mlangoni kwako.",
      btnSearch: "Tafuta Gari Sasa",
      uploadTitle: "Una Picha ya Gari Unalotaka?", uploadDesc: "Pakia picha ya gari uliloona mtandaoni au barabarani. Tutalitafuta duniani kote na kukupa quotation!",
      uploadBtn: "Pakia Picha", searchMake: "Aina (Make)", searchModel: "Toleo (Model)", searchBody: "Umbo (Body)", searchBudget: "Bajeti", searchBtn: "Tafuta Magari",
      shopByType: "Tafuta Kwa Umbo", shopByMake: "Tafuta Kwa Aina", shopByStock: "Tafuta Kwa Eneo (Stock)",
      stockTz: "Tanzania Stock", stockOverseas: "Japan / Overseas Stock",
      typeSUV: "SUV / Gari Kubwa", typeSedan: "Sedan / Gari Fupi", typeHatch: "Hatchback / IST", 
      featTitle: "Showroom: Magari Yaliyowasili", showingText: "Inaonyesha magari aina ya", clearFilter: "Futa Chujio (Clear)",
      noCars: "Hakuna Gari Linalolingana na Utafutaji Hako.", showAllCars: "Onyesha Magari Yote",
      soldOut: "GARI LIMEUZWA", inTz: "IN TANZANIA", localPrice: "Bei (Cash):", viewBtn: "Tazama", inquireBtn: "Ulizia",
      
      modSourcingTitle: "Tumepata Picha Yako!", modName: "Jina Lako", modPhone: "WhatsApp Namba", modSourcingBtn: "Tuma Picha 🚀",
      modInquiryTitle: "Ulizia Hili Gari", modMessage: "Ujumbe Wako", modInquiryBtn: "Tuma Ujumbe 🚀",
      modServTitle: "Ita Fundi / Weka Miadi", modServDesc: "Weka miadi na mafundi wetu au ita fundi wa dharura (Emergency) kuja ulipo kufanya matengenezo.", modServType: "Aina ya Huduma / Tatizo", modServCar: "Gari Lako / Linalokaguliwa", modServLocation: "Mahali Ulipo / Location", modServDate: "Tarehe", modServBtn: "Tuma Maombi 🚀",
      
      srvSubtitle: "Gari Hub Ecosystem", srvTitle: "Huduma Zetu Zaidi ya Kuuza Magari", srvDesc: "Tunatoa huduma kamili kuhakikisha gari lako linanunuliwa salama, linadumu, na liko barabarani muda wote.",
      card1Title: "Kaguzi & Fundi (SOS)", card1Desc: "Ita fundi wa dharura popote ulipo (Emergency/Maintenance) au tukukagulie gari kabla ya kununua.", card1Btn: "Ita Fundi / Kaguzi ➔",
      card2Title: "Vipuri Original & Tools", card2Desc: "Tunauza na kuagiza Vipuri Original na Vifaa vya kusoma hitilafu za magari (ECU Scanners) viwandani.", card2Btn: "Ingia Dukani ➔",
      card3Title: "Reviews & Ushauri", card3Desc: "Linganisha magari kabla ya kununua. Soma makala za kiufundi, na jifunze jinsi ya kusoma Auction Sheet.", card3Btn: "Soma Makala ➔",
      card4Title: "Kikokotozi cha Ushuru", card4Desc: "Pata makadirio ya haraka ya FOB, Usafiri na Kodi za TRA ili ujue bei halisi ya gari (On-Road).", card4Btn: "Kadiria Sasa ➔",
      card5Title: "Premium Car Rental", card5Desc: "Tunakodisha magari ya kifahari na ya kawaida kwa matumizi ya harusi, mikutano, au mizunguko binafsi.", card5Btn: "Kodisha Sasa ➔",
      
      howSubtitle: "Mchakato Wetu wa Uwazi", howTitle: "Jinsi Inavyofanya Kazi", howDesc: "Kuanzia kuagiza gari la ndoto yako, kukodisha, hadi kupata fundi. Tumerahisisha kila hatua iwe wazi na salama.",
      hw1Title: "1. Chagua Huduma", hw1Desc: "Tafuta gari kwenye Showroom, tupe oda, weka miadi ya fundi au chagua gari la kukodisha.",
      hw2Title: "2. Nukuu & Miadi", hw2Desc: "Pata mchanganuo kamili wa kodi na usafiri, au thibitisha miadi na fundi wetu atakayekufuata.",
      hw3Title: "3. Malipo Salama", hw3Desc: "Fanya malipo salama kupitia benki. Fuatilia meli yako live au lipia huduma ya ufundi.",
      hw4Title: "4. Furahia Huduma", hw4Desc: "Pokea gari lako likiwa limesajiliwa, anza safari yako ya kukodisha, au endelea na safari baada ya matengenezo.",

      calcTitle: "Kadiria Gharama Mapema", calcDesc: "Tumia kikokotozi chetu kujua makadirio ya gharama zote hadi gari kufika mlangoni kwako.", calcInput: "Weka Bei ya Gari Nje (FOB kwa USD $)", calcResult: "Mchanganuo wa Makadirio", calcTotal: "Jumla Kuu (Makadirio):",
      footerSecure: "100% Secure Payments", footerShipping: "Global Shipping", footerVerified: "Verified Condition",
      footerDesc: "Jukwaa la kimataifa la kuagiza magari yenye ubora, kupata vipuri, na kufanya service moja kwa moja mpaka mlangoni kwako.",
      quickLinks: "Viungo Muhimu", ourServices: "Huduma Zetu", contactFooter: "Wasiliana Nasi"
    },
    en: {
      home: "Home", inventory: "Our Inventory", sparesMenu: "Parts & Tools", calcMenu: "Calculator", contact: "Contact Us", servicesMenu: "Services & Inspection", rentMenu: "Car Rental",
      heroTitle1: "Import Your Dream Car From", heroTitle2: "Japan, Europe, China & Worldwide",
      heroDesc: "Gari Hub provides a transparent, secure, and fast system to import premium cars from global markets right to your doorstep.",
      btnSearch: "Search Cars Now",
      uploadTitle: "Have a Photo of a Car?", uploadDesc: "Upload a picture of any car you saw online or on the street. We will source it globally and give you a quote!",
      uploadBtn: "Upload Photo", searchMake: "Make", searchModel: "Model", searchBody: "Body Type", searchBudget: "Budget", searchBtn: "Search Cars",
      shopByType: "Shop By Body Type", shopByMake: "Shop By Make", shopByStock: "Shop By Location",
      stockTz: "Tanzania Stock", stockOverseas: "Japan / Overseas Stock",
      typeSUV: "SUV / Off-Road", typeSedan: "Sedan", typeHatch: "Hatchback", 
      featTitle: "Premium Showroom", showingText: "Showing results for", clearFilter: "Clear Filter",
      noCars: "No vehicles match your search criteria.", showAllCars: "Show All Vehicles",
      soldOut: "SOLD OUT", inTz: "IN TANZANIA", localPrice: "Price (Cash):", viewBtn: "View Details", inquireBtn: "Inquire Now",
      
      modSourcingTitle: "We got your photo!", modName: "Your Full Name", modPhone: "WhatsApp Number", modSourcingBtn: "Send Photo Request 🚀",
      modInquiryTitle: "Inquire About This Car", modMessage: "Your Message", modInquiryBtn: "Send Inquiry 🚀",
      modServTitle: "Book Mechanic / Inspection", modServDesc: "Book an appointment or call an emergency mechanic to your location for maintenance and diagnostics.", modServType: "Service Type / Issue", modServCar: "Your Car Make & Model", modServLocation: "Your Location / Area", modServDate: "Preferred Date", modServBtn: "Send Request 🚀",
      
      srvSubtitle: "Gari Hub Ecosystem", srvTitle: "More Than Just Car Sales", srvDesc: "End-to-end services ensuring your vehicle is bought safely, maintained properly, and stays on the road.",
      card1Title: "Inspection & Mechanics", card1Desc: "Call an emergency mechanic to your location or get a full pre-purchase car inspection using OBD2 Scanners.", card1Btn: "Book Mechanic ➔",
      card2Title: "Genuine Spares & Tools", card2Desc: "We sell and import genuine OEM parts and ECU diagnostic scanners directly from manufacturers.", card2Btn: "Visit Shop ➔",
      card3Title: "Reviews & Insights", card3Desc: "Compare cars before buying. Read technical articles and learn how to interpret Auction Sheets.", card3Btn: "Read Articles ➔",
      card4Title: "Customs Tax Calculator", card4Desc: "Get instant estimates for FOB, Freight, and TRA Customs taxes to know the real on-road price.", card4Btn: "Calculate Now ➔",
      card5Title: "Premium Car Rental", card5Desc: "Rent luxury and standard vehicles for weddings, corporate events, safaris, or personal daily use.", card5Btn: "Rent a Car ➔",
      
      howSubtitle: "Our Transparent Process", howTitle: "How It Works", howDesc: "From importing your dream car, renting a luxury ride, to calling a mechanic. We've simplified every step.",
      hw1Title: "1. Choose Your Service", hw1Desc: "Browse our showroom, request a custom import, call a mechanic, or select a premium vehicle to rent.",
      hw2Title: "2. Quotes & Bookings", hw2Desc: "Get a clear breakdown of taxes (TRA) & freight, or confirm the dispatch of your mechanic.",
      hw3Title: "3. Secure Payments", hw3Desc: "Pay securely via bank. Track your import vessel live or comfortably pay for your mechanical service.",
      hw4Title: "4. Drive & Enjoy", hw4Desc: "Receive your fully cleared car, pick up your rental keys, or get back on the road safely.",

      calcTitle: "Estimate Costs", calcDesc: "Use our transparent calculator to get an estimate of all costs until the car reaches your door.", calcInput: "Enter FOB Price (USD $)", calcResult: "Cost Breakdown", calcTotal: "Grand Total:",
      footerSecure: "100% Secure Payments", footerShipping: "Global Shipping", footerVerified: "Verified Condition",
      footerDesc: "An international platform to import premium vehicles, purchase genuine spare parts, and book professional services right to your doorstep.",
      quickLinks: "Quick Links", ourServices: "Our Services", contactFooter: "Contact Us"
    }
  };

  const currentT = t[lang];

  return (
    <main className="min-h-screen bg-gray-50 pb-0 font-sans text-gray-800 relative">
      
      {/* MODALS SECTION */}
      {showSourcingModal && sourcingPreview && (
        <div className="fixed inset-0 bg-slate-900/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
           <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transform scale-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
             <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 flex justify-between items-center text-white sticky top-0 z-10"><h3 className="font-extrabold text-lg">{currentT.modSourcingTitle}</h3><button onClick={() => setShowSourcingModal(false)} className="text-white hover:text-red-200 font-black text-2xl leading-none">&times;</button></div>
             <div className="p-6">
               <img src={sourcingPreview} className="w-32 h-32 object-cover rounded-2xl shadow-md border-4 border-blue-50 mx-auto mb-6" />
               <form onSubmit={submitSourcingRequest} className="space-y-4">
                 <input type="text" required value={sourcingData.name} onChange={(e) => setSourcingData({...sourcingData, name: e.target.value})} placeholder={currentT.modName} className="w-full border-2 border-gray-100 p-3.5 rounded-xl bg-gray-50 text-[16px] focus:border-blue-500 focus:bg-white transition-colors outline-none" />
                 <input type="text" required value={sourcingData.phone} onChange={(e) => setSourcingData({...sourcingData, phone: e.target.value})} placeholder={currentT.modPhone} className="w-full border-2 border-gray-100 p-3.5 rounded-xl bg-gray-50 text-[16px] focus:border-blue-500 focus:bg-white transition-colors outline-none" />
                 <button type="submit" disabled={sendingSourcing} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all">{sendingSourcing ? 'Sending...' : currentT.modSourcingBtn}</button>
               </form>
             </div>
           </div>
        </div>
      )}

      {showInquiryModal && selectedCar && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
             <div className="p-5 bg-gray-50 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10"><h3 className="font-bold text-gray-900 text-lg">{currentT.modInquiryTitle}</h3><button onClick={() => setShowInquiryModal(false)} className="text-gray-400 hover:text-red-500 font-black text-2xl leading-none">&times;</button></div>
             <div className="p-6">
               <div className="flex gap-4 mb-6 bg-blue-50/50 p-3 rounded-2xl border border-blue-100 items-center"><img src={getSafeImage(selectedCar.img)} className="w-20 h-14 object-cover rounded-xl shadow-sm" /><div><p className="font-bold text-gray-900 text-sm">{selectedCar.title}</p><p className="text-xs text-blue-600 font-bold">{selectedCar.isLocal ? selectedCar.fob : selectedCar.cif}</p></div></div>
               <form onSubmit={submitInquiry} className="space-y-4">
                 <input type="text" required value={inquiryData.name} onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})} placeholder={currentT.modName} className="w-full border-2 border-gray-100 p-3.5 rounded-xl bg-gray-50 text-[16px] focus:border-blue-500 outline-none transition-colors" />
                 <input type="text" required value={inquiryData.phone} onChange={(e) => setInquiryData({...inquiryData, phone: e.target.value})} placeholder={currentT.modPhone} className="w-full border-2 border-gray-100 p-3.5 rounded-xl bg-gray-50 text-[16px] focus:border-blue-500 outline-none transition-colors" />
                 <textarea required value={inquiryData.message} onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})} placeholder={currentT.modMessage} className="w-full border-2 border-gray-100 p-3.5 rounded-xl bg-gray-50 text-[16px] resize-none focus:border-blue-500 outline-none transition-colors" rows={3}></textarea>
                 <button type="submit" disabled={sendingInquiry} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all">{sendingInquiry ? 'Sending...' : currentT.modInquiryBtn}</button>
               </form>
             </div>
           </div>
        </div>
      )}

      {/* SERVICE & FUNDI BOOKING MODAL (UPDATED WITH LOCATION) */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-800 flex justify-between items-center text-white sticky top-0 z-10">
              <h3 className="font-extrabold flex items-center gap-2 text-lg"><span className="text-xl">🛠️</span> {currentT.modServTitle}</h3>
              <button onClick={() => setShowServiceModal(false)} className="text-white hover:text-emerald-200 font-black text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6 bg-emerald-50 p-3 rounded-xl border border-emerald-100">{currentT.modServDesc}</p>
              <form onSubmit={submitServiceBooking} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{currentT.modServType}</label>
                  <select value={serviceData.serviceType} onChange={(e) => setServiceData({...serviceData, serviceType: e.target.value})} className="w-full border-2 border-gray-100 p-3.5 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-[16px] font-bold text-emerald-800 outline-none">
                    <option>{lang === 'sw' ? 'Dharura / Call Mechanic (Emergency)' : 'Emergency Mechanic Call'}</option>
                    <option>{lang === 'sw' ? 'Pre-Purchase Inspection' : 'Pre-Purchase Inspection'}</option>
                    <option>{lang === 'sw' ? 'Computer Diagnostics (OBD2)' : 'Computer Diagnostics (OBD2)'}</option>
                    <option>{lang === 'sw' ? 'General Maintenance (Service)' : 'General Maintenance (Service)'}</option>
                  </select>
                </div>
                
                {/* NEW LOCATION FIELD */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{currentT.modServLocation}</label>
                  <input type="text" required value={serviceData.location} onChange={(e) => setServiceData({...serviceData, location: e.target.value})} placeholder={lang === 'sw' ? "Mfano: Tegeta, Dar es Salaam" : "E.g. Masaki, Dar es Salaam"} className="w-full border-2 border-gray-100 p-3.5 rounded-xl outline-none focus:border-emerald-500 bg-gray-50 text-[16px]" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{currentT.modServCar}</label>
                  <input type="text" required value={serviceData.carModel} onChange={(e) => setServiceData({...serviceData, carModel: e.target.value})} placeholder="E.g. Toyota Crown 2012" className="w-full border-2 border-gray-100 p-3.5 rounded-xl outline-none focus:border-emerald-500 bg-gray-50 text-[16px]" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{currentT.modName}</label><input type="text" required value={serviceData.name} onChange={(e) => setServiceData({...serviceData, name: e.target.value})} placeholder={currentT.modName} className="w-full border-2 border-gray-100 p-3.5 rounded-xl outline-none focus:border-emerald-500 bg-gray-50 text-[16px]" /></div>
                  <div><label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{currentT.modServDate}</label><input type="text" value={serviceData.date} onChange={(e) => setServiceData({...serviceData, date: e.target.value})} placeholder="E.g. Today / Sasa hivi" className="w-full border-2 border-gray-100 p-3.5 rounded-xl outline-none focus:border-emerald-500 bg-gray-50 text-[16px]" /></div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{currentT.modPhone}</label>
                  <input type="text" required value={serviceData.phone} onChange={(e) => setServiceData({...serviceData, phone: e.target.value})} placeholder="07XX XXX XXX" className="w-full border-2 border-gray-100 p-3.5 rounded-xl outline-none focus:border-emerald-500 bg-gray-50 text-[16px] font-bold" />
                </div>
                <div className="pt-3"><button type="submit" disabled={sendingService} className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-emerald-700 hover:shadow-emerald-500/30 transition-all">{sendingService ? 'Sending...' : currentT.modServBtn}</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showCalcModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[120] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transform scale-100">
            <div className="p-5 bg-gradient-to-r from-purple-700 to-purple-900 flex justify-between items-center text-white"><h3 className="font-extrabold text-lg flex items-center gap-2"><span className="text-xl">🧮</span> {currentT.calcTitle}</h3><button onClick={() => setShowCalcModal(false)} className="text-white hover:text-purple-200 font-black text-2xl leading-none">&times;</button></div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6 bg-purple-50 p-3 rounded-xl border border-purple-100">{currentT.calcDesc}</p>
              <div className="mb-6"><label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{currentT.calcInput}</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><span className="text-gray-500 font-bold">$</span></div><input type="number" value={fobPrice} onChange={(e) => setFobPrice(e.target.value ? Number(e.target.value) : '')} className="w-full pl-10 pr-4 py-4 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-lg font-bold text-slate-800 outline-none" placeholder="e.g. 3500" /></div></div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-inner">
                <h3 className="text-slate-800 font-black mb-4 text-xs uppercase tracking-wider border-b border-gray-200 pb-2">{currentT.calcResult}</h3>
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-gray-600"><span>FOB Price:</span><span className="font-bold text-slate-900">TZS {(fobTZS).toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Freight Estimate:</span><span className="font-bold text-slate-900">TZS {(freightTZS).toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-3"><span>TRA Customs (Est):</span><span className="font-bold text-red-500">+ TZS {(estimatedTaxTZS).toLocaleString()}</span></div>
                </div>
                <div className="flex justify-between items-end mt-4"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{currentT.calcTotal}</span><span className="text-2xl font-black text-purple-700 tracking-tight">TZS {typeof fobPrice === 'number' && fobPrice > 0 ? (totalCostTZS).toLocaleString() : '0'}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL TOP BAR */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center z-50 relative gap-3 sm:gap-0 border-b border-slate-800">
        <div className="flex gap-5 font-medium"><span className="flex items-center gap-1.5">📧 info@garihub.co.tz</span><span className="flex items-center gap-1.5">📞 +255 700 000 000</span></div>
        <div className="flex items-center gap-3 bg-slate-800 rounded-full px-4 py-1.5 flex-wrap justify-center shadow-inner w-full sm:w-auto">
          <div className="flex items-center gap-1 pr-3 border-r border-slate-600"><span className="text-slate-400">⚓ Port:</span><select value={port} onChange={(e) => setPort(e.target.value as any)} className="bg-transparent text-blue-400 font-bold outline-none cursor-pointer"><option value="Dar es Salaam" className="bg-slate-800">Dar es Salaam</option><option value="Mombasa" className="bg-slate-800">Mombasa</option></select></div>
          <div className="flex items-center gap-1 px-3 border-r border-slate-600"><span className="text-slate-400">💵 Curr:</span><select value={currency} onChange={(e) => setCurrency(e.target.value as any)} className="bg-transparent text-emerald-400 font-bold outline-none cursor-pointer"><option value="USD" className="bg-slate-800">USD</option><option value="TZS" className="bg-slate-800">TZS</option></select></div>
          <div className="flex items-center gap-3 pl-3">
            <button onClick={() => setLang('en')} className={`font-bold transition-colors ${lang === 'en' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>EN</button>
            <span className="text-slate-600">|</span>
            <button onClick={() => setLang('sw')} className={`font-bold transition-colors ${lang === 'sw' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>SW</button>
          </div>
        </div>
      </div>

      {/* NAVIGATION BAR - PREMIUM STYLE */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm w-full z-40 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center"><Link href="/" className="text-3xl font-black text-slate-900 tracking-tighter">Gari<span className="text-blue-600">Hub</span></Link></div>
            <div className="hidden lg:flex space-x-5 items-center">
              <Link href="/" className="text-slate-900 border-b-2 border-blue-600 px-1 py-2 font-bold text-sm">{currentT.home}</Link>
              <Link href="#magari" className="text-slate-600 hover:text-blue-600 px-1 py-2 font-semibold transition-colors text-sm">{currentT.inventory}</Link>
              <Link href="/rentals" className="text-slate-600 hover:text-red-600 px-1 py-2 font-semibold transition-colors text-sm">{currentT.rentMenu}</Link>
              <Link href="/spares" className="text-slate-600 hover:text-blue-600 px-1 py-2 font-semibold transition-colors text-sm">{currentT.sparesMenu}</Link>
              <button onClick={() => setShowCalcModal(true)} className="text-slate-600 hover:text-purple-600 px-1 py-2 font-semibold transition-colors text-sm">{currentT.calcMenu}</button>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4">
              <button className="hidden md:flex text-slate-600 hover:text-red-500 font-bold text-sm items-center gap-1.5 transition-colors">❤️ <span className="hidden xl:inline">Wishlist ({allFetchedCars.filter(c => c.liked).length})</span></button>
              <div className="flex items-center md:border-l md:pl-4 border-gray-200">
                <Link href="/client" className="bg-slate-900 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-md text-xs md:text-sm">Client Portal</Link>
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
                <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-4">🏆 Premium Dealership</div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl tracking-tight font-black text-white leading-tight">
                  <span className="block xl:inline">{currentT.heroTitle1}</span>{' '}
                  <span className="block text-blue-500 xl:inline mt-1 sm:mt-2">{currentT.heroTitle2}</span>
                </h1>
                <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-300 sm:max-w-xl sm:mx-auto lg:mx-0 leading-relaxed">
                  {currentT.heroDesc}
                </p>
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                  <div className="rounded-xl shadow-lg w-full sm:w-auto">
                    <a href="#magari" className="w-full flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 border border-transparent text-sm sm:text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/40 transition-all">
                      {currentT.btnSearch}
                    </a>
                  </div>
                  <div className="rounded-xl shadow-lg w-full sm:w-auto">
                    <button onClick={() => setShowCalcModal(true)} className="w-full flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 border border-slate-600 text-sm sm:text-base font-bold rounded-xl text-white bg-slate-800/60 backdrop-blur-md hover:bg-slate-700 hover:border-slate-500 transition-all">
                      {currentT.calcMenu}
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
          <div className="w-full lg:w-2/5 px-4 sm:px-6 lg:px-8 pb-10 lg:pb-10 pt-4 flex justify-center lg:justify-end">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 md:p-10 text-center hover:bg-white/10 transition-all duration-500 flex flex-col items-center justify-center shadow-2xl w-full max-w-sm transform lg:rotate-2 hover:rotate-0">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg mb-5 text-white"><span className="text-4xl">📸</span></div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">{currentT.uploadTitle}</h3>
              <p className="text-blue-100/80 mb-6 text-xs sm:text-sm leading-relaxed">{currentT.uploadDesc}</p>
              <div className="flex flex-col items-center w-full">
                <label className="relative overflow-hidden w-full bg-white text-slate-900 px-6 py-3.5 sm:py-4 rounded-xl font-black hover:bg-gray-100 transition-all shadow-lg cursor-pointer flex justify-center items-center gap-3 text-sm">
                  <span className="text-xl">☁️</span> <span>{currentT.uploadBtn}</span>
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handlePhotoUploadSelect} />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADVANCED QUICK SEARCH */}
      <div className="relative w-full md:max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 z-30">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-gray-100">
          <form className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 items-end">
            <div className="col-span-2 sm:col-span-1 lg:col-span-1"><label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">{currentT.searchMake}</label><select value={searchFilters.make} onChange={(e) => setSearchFilters({...searchFilters, make: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer bg-gray-50"><option>All Makes</option><option>Toyota</option><option>Subaru</option><option>Mercedes</option><option>Honda</option><option>Nissan</option><option>BMW</option></select></div>
            <div className="col-span-2 sm:col-span-1 lg:col-span-1"><label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">{currentT.searchModel}</label><select value={searchFilters.model} onChange={(e) => setSearchFilters({...searchFilters, model: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer bg-gray-50"><option>Any Model</option><option>Forester</option><option>Crown</option><option>Harrier</option><option>Land Cruiser</option><option>Vanguard</option></select></div>
            <div className="col-span-2 sm:col-span-1 lg:col-span-1 flex gap-2"><div className="w-1/2"><label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Min Year</label><select value={searchFilters.minYear} onChange={(e) => setSearchFilters({...searchFilters, minYear: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-slate-700 bg-gray-50"><option>Min</option><option>2010</option><option>2015</option><option>2020</option></select></div><div className="w-1/2"><label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Max Year</label><select value={searchFilters.maxYear} onChange={(e) => setSearchFilters({...searchFilters, maxYear: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-slate-700 bg-gray-50"><option>Max</option><option>2015</option><option>2020</option><option>2025</option></select></div></div>
            <div className="col-span-2 sm:col-span-1 lg:col-span-1"><label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">{currentT.searchBody}</label><select value={searchFilters.body} onChange={(e) => setSearchFilters({...searchFilters, body: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-slate-700 bg-gray-50"><option>All Types</option><option>SUV</option><option>Sedan</option><option>Hatchback</option><option>Pickup</option><option>Van</option></select></div>
            <div className="col-span-2 sm:col-span-1 lg:col-span-1"><label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">{currentT.searchBudget}</label><select value={searchFilters.budget} onChange={(e) => setSearchFilters({...searchFilters, budget: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-slate-700 bg-gray-50"><option>No Limit</option><option>$5,000</option><option>$15,000</option><option>$50,000</option></select></div>
            <div className="col-span-2 sm:col-span-3 lg:col-span-1"><button type="button" onClick={handleAdvancedSearch} className="w-full bg-slate-900 text-white p-3 rounded-xl font-black hover:bg-blue-600 transition-colors shadow-lg text-sm flex justify-center items-center gap-2">🔍 {currentT.searchBtn}</button></div>
          </form>
        </div>
      </div>

      {/* MAIN CONTENT AREA: PREMIUM SHOWROOM */}
      <div id="magari" className="max-w-[100%] md:max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 mb-16">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* SIDEBAR */}
          <div className="w-full lg:w-1/5 order-1 lg:order-1">
            <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6 border border-gray-100 lg:sticky lg:top-28">
              <h2 className="text-[11px] font-black text-slate-400 mb-3 lg:mb-4 lg:pb-3 lg:border-b border-gray-100 uppercase tracking-widest">{currentT.shopByStock}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 mb-6 lg:mb-0">
                <div onClick={() => handleFilter('STOCK', 'TANZANIA')} className={`py-2.5 px-3 lg:px-4 rounded-xl border flex items-center justify-between cursor-pointer group transition-all ${activeFilter === 'TANZANIA' ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-white border-gray-100 hover:border-emerald-400'}`}>
                  <div className="flex items-center gap-2 lg:gap-3"><span className="text-base lg:text-lg">🇹🇿</span><span className={`font-bold text-[11px] lg:text-xs ${activeFilter === 'TANZANIA' ? 'text-emerald-700' : 'text-slate-700'}`}>{currentT.stockTz}</span></div>
                  <span className={`text-[10px] font-bold ${activeFilter === 'TANZANIA' ? 'text-emerald-600' : 'text-slate-400'}`}>{countStock('TANZANIA')}</span>
                </div>
                <div onClick={() => handleFilter('STOCK', 'OVERSEAS')} className={`py-2.5 px-3 lg:px-4 rounded-xl border flex items-center justify-between cursor-pointer group transition-all ${activeFilter === 'OVERSEAS' ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-400'}`}>
                  <div className="flex items-center gap-2 lg:gap-3"><span className="text-base lg:text-lg">🚢</span><span className={`font-bold text-[11px] lg:text-xs ${activeFilter === 'OVERSEAS' ? 'text-blue-700' : 'text-slate-700'}`}>{currentT.stockOverseas}</span></div>
                  <span className={`text-[10px] font-bold ${activeFilter === 'OVERSEAS' ? 'text-blue-600' : 'text-slate-400'}`}>{countStock('OVERSEAS')}</span>
                </div>
              </div>

              <h2 className="text-[11px] font-black text-slate-400 mb-3 lg:mt-8 lg:pb-3 lg:border-b border-gray-100 uppercase tracking-widest">{currentT.shopByType}</h2>
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5 mb-6 lg:mb-0">
                <div onClick={() => handleFilter('BODY', 'SUV')} className={`py-2.5 px-2 lg:px-4 rounded-xl border flex justify-center lg:justify-between items-center cursor-pointer group transition-all ${activeFilter === 'SUV' ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-gray-100 hover:border-slate-400 text-slate-700'}`}>
                  <div className="flex items-center gap-1.5 lg:gap-3"><span className="text-sm lg:text-lg">🚙</span><span className="font-bold text-[10px] lg:text-xs">{currentT.typeSUV.split('/')[0]}</span></div>
                </div>
                <div onClick={() => handleFilter('BODY', 'Sedan')} className={`py-2.5 px-2 lg:px-4 rounded-xl border flex justify-center lg:justify-between items-center cursor-pointer group transition-all ${activeFilter === 'Sedan' ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-gray-100 hover:border-slate-400 text-slate-700'}`}>
                  <div className="flex items-center gap-1.5 lg:gap-3"><span className="text-sm lg:text-lg">🚗</span><span className="font-bold text-[10px] lg:text-xs">{currentT.typeSedan.split('/')[0]}</span></div>
                </div>
                <div onClick={() => handleFilter('BODY', 'Hatchback')} className={`py-2.5 px-2 lg:px-4 rounded-xl border flex justify-center lg:justify-between items-center cursor-pointer group transition-all ${activeFilter === 'Hatchback' ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-gray-100 hover:border-slate-400 text-slate-700'}`}>
                  <div className="flex items-center gap-1.5 lg:gap-3"><span className="text-sm lg:text-lg">🚕</span><span className="font-bold text-[10px] lg:text-xs">{currentT.typeHatch.split('/')[0]}</span></div>
                </div>
              </div>

              <h2 className="text-[11px] font-black text-slate-400 mb-3 lg:mt-8 lg:pb-3 lg:border-b border-gray-100 uppercase tracking-widest">{currentT.shopByMake}</h2>
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5">
                {['Toyota', 'Subaru', 'Mercedes'].map(make => (
                  <div key={make} onClick={() => handleFilter('MAKE', make)} className={`py-2.5 px-2 lg:px-4 rounded-xl border flex justify-center lg:justify-between items-center cursor-pointer group transition-all ${activeFilter === make ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-400'}`}>
                    <div className="flex items-center gap-1.5 lg:gap-3"><span className={`hidden lg:inline text-lg ${activeFilter === make ? 'text-blue-500' : 'text-slate-300'}`}>🔹</span><span className={`font-bold text-[10px] lg:text-xs ${activeFilter === make ? 'text-blue-700' : 'text-slate-700'}`}>{make}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GRID YA MAGARI */}
          <div className="w-full lg:w-4/5 order-2 lg:order-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 sm:mb-8 border-b border-gray-200 pb-4 gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{currentT.featTitle}</h2>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-slate-500">{activeFilter !== 'ALL' ? `${currentT.showingText} "${activeFilter}"` : 'Browse our collection of high-quality vehicles.'}</p>
              </div>
              <div className="flex items-center gap-3">
                {activeFilter !== 'ALL' && (<button onClick={() => handleFilter('ALL', 'ALL')} className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors w-full sm:w-auto">{currentT.clearFilter}</button>)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {showroomCars.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                  <span className="text-5xl block mb-4 opacity-50">🚙</span><h3 className="text-slate-900 font-black text-xl mb-2">{currentT.noCars}</h3>
                  <button onClick={() => handleFilter('ALL', 'ALL')} className="mt-4 bg-slate-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-600 shadow-md transition-all">{currentT.showAllCars}</button>
                </div>
              ) : (
                showroomCars.map((car) => (
                  <div key={car.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col relative group transition-all duration-500 hover:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 ${car.tag === 'SOLD' ? 'opacity-70' : ''}`}>
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                      {car.tag && (<span className={`text-white text-[8px] sm:text-[9px] font-black px-2.5 py-1 rounded-md shadow-md uppercase tracking-widest ${car.tag === 'HOT' ? 'bg-gradient-to-r from-amber-500 to-orange-600' : car.tag === 'SOLD' ? 'bg-slate-800' : 'bg-blue-600'}`}>{car.tag === 'SOLD' ? currentT.soldOut : car.tag}</span>)}
                      {car.isLocal && (<span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[8px] sm:text-[9px] font-black px-2.5 py-1 rounded-md shadow-md flex items-center gap-1 uppercase tracking-widest border border-emerald-400/50">🇹🇿 {currentT.inTz}</span>)}
                    </div>
                    <button onClick={() => toggleLike(car.id)} className="absolute top-3 right-3 bg-white/80 backdrop-blur-md p-1.5 sm:p-2 rounded-full z-10 hover:bg-white shadow-sm transition-transform hover:scale-110">
                      {car.liked ? <span className="text-red-500 text-base sm:text-lg leading-none">❤️</span> : <span className="text-slate-400 text-base sm:text-lg leading-none">🤍</span>}
                    </button>
                    <Link href={`/vehicles/${car.id}`} className="relative h-40 sm:h-44 overflow-hidden bg-gray-100 flex items-center justify-center block rounded-t-2xl">
                      <img src={getSafeImage(car.img)} alt={car.title} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </Link>
                    <div className="p-3.5 sm:p-4 flex-grow flex flex-col">
                      <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold mb-1 uppercase tracking-widest">Ref: {car.stockId}</p>
                      <Link href={`/vehicles/${car.id}`} className="hover:text-blue-600 transition-colors"><h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate mb-1" title={car.title}>{car.title}</h3></Link>
                      <p className="text-slate-500 text-[10px] sm:text-[11px] font-medium mb-3">{car.year} • {car.trans} • {car.km}</p>
                      <div className="mt-auto bg-slate-50 rounded-xl p-2.5 sm:p-3 border border-gray-100">
                        <div className="flex justify-between items-end">
                          <span className="text-slate-500 text-[8px] sm:text-[9px] uppercase font-black tracking-widest">{car.isLocal ? currentT.localPrice : 'FOB Price:'}</span>
                          <span className={`font-black text-base sm:text-lg leading-none ${car.isLocal ? 'text-emerald-600' : 'text-slate-900'}`}>{car.fob}</span>
                        </div>
                        {!car.isLocal && (
                          <div className="flex justify-between items-end mt-1.5 border-t border-gray-200/60 pt-1.5">
                            <span className="text-blue-600 text-[8px] sm:text-[9px] uppercase font-black tracking-widest">CIF {port}:</span>
                            <span className="font-bold text-[10px] sm:text-xs text-blue-700 leading-none">{car.cif}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 sm:mt-4">
                        {car.tag === 'SOLD' ? (
                          <button disabled className="w-full py-2.5 bg-slate-100 text-slate-400 text-[10px] sm:text-xs font-black rounded-xl cursor-not-allowed uppercase tracking-wider">{currentT.soldOut}</button>
                        ) : (
                          <div className="flex gap-2">
                            <Link href={`/vehicles/${car.id}`} className="flex-1 flex items-center justify-center py-2.5 bg-white text-slate-700 text-[10px] sm:text-xs font-black rounded-xl hover:bg-slate-100 border-2 border-slate-200 transition-colors uppercase tracking-wider">{currentT.viewBtn}</Link>
                            <button onClick={() => openInquiry(car)} className="flex-1 py-2.5 bg-blue-600 text-white text-[10px] sm:text-xs font-black rounded-xl hover:bg-slate-900 shadow-md transition-colors uppercase tracking-wider">{currentT.inquireBtn}</button>
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

      {/* SERVICES HUB YENYE PARALLAX SCROLLING BACKGROUND (KADI 5) */}
      <div id="services-hub" className="relative py-20 sm:py-24 border-t border-gray-800 overflow-hidden bg-fixed bg-center bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=80')" }}>
        <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-[3px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="bg-white/10 border border-white/20 text-blue-300 text-[9px] sm:text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-3 sm:mb-4 inline-block backdrop-blur-md shadow-lg">{currentT.srvSubtitle}</span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{currentT.srvTitle}</h2>
            <p className="mt-4 text-slate-300 max-w-2xl mx-auto text-sm sm:text-base px-4">{currentT.srvDesc}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6">
            
            <div onClick={() => setShowServiceModal(true)} className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/10 hover:bg-white/10 hover:shadow-2xl hover:border-emerald-400/50 transition-all duration-500 group cursor-pointer flex flex-col h-full transform sm:hover:-translate-y-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-5 shadow-sm group-hover:scale-110 transition-transform duration-500">🛠️</div>
              <h3 className="font-black text-base sm:text-lg text-white mb-2">{currentT.card1Title}</h3>
              <p className="text-slate-300 text-xs sm:text-sm mb-6 flex-grow leading-relaxed">{currentT.card1Desc}</p>
              <div className="mt-auto"><span className="text-emerald-400 font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">{currentT.card1Btn}</span></div>
            </div>

            <Link href="/spares" className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/10 hover:bg-white/10 hover:shadow-2xl hover:border-blue-400/50 transition-all duration-500 group cursor-pointer flex flex-col h-full transform sm:hover:-translate-y-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-5 shadow-sm group-hover:scale-110 transition-transform duration-500">⚙️</div>
              <h3 className="font-black text-base sm:text-lg text-white mb-2">{currentT.card2Title}</h3>
              <p className="text-slate-300 text-xs sm:text-sm mb-6 flex-grow leading-relaxed">{currentT.card2Desc}</p>
              <div className="mt-auto"><span className="text-blue-400 font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">{currentT.card2Btn}</span></div>
            </Link>

            <Link href="/rentals" className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/10 hover:bg-white/10 hover:shadow-2xl hover:border-red-400/50 transition-all duration-500 group cursor-pointer flex flex-col h-full transform sm:hover:-translate-y-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-5 shadow-sm group-hover:scale-110 transition-transform duration-500">🔑</div>
              <h3 className="font-black text-base sm:text-lg text-white mb-2">{currentT.card5Title}</h3>
              <p className="text-slate-300 text-xs sm:text-sm mb-6 flex-grow leading-relaxed">{currentT.card5Desc}</p>
              <div className="mt-auto"><span className="text-red-400 font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">{currentT.card5Btn}</span></div>
            </Link>

            <Link href="#reviews" className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/10 hover:bg-white/10 hover:shadow-2xl hover:border-orange-400/50 transition-all duration-500 group cursor-pointer flex flex-col h-full transform sm:hover:-translate-y-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-5 shadow-sm group-hover:scale-110 transition-transform duration-500">📝</div>
              <h3 className="font-black text-base sm:text-lg text-white mb-2">{currentT.card3Title}</h3>
              <p className="text-slate-300 text-xs sm:text-sm mb-6 flex-grow leading-relaxed">{currentT.card3Desc}</p>
              <div className="mt-auto"><span className="text-orange-400 font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">{currentT.card3Btn}</span></div>
            </Link>

            <button onClick={() => setShowCalcModal(true)} className="text-left bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/10 hover:bg-white/10 hover:shadow-2xl hover:border-purple-400/50 transition-all duration-500 group cursor-pointer flex flex-col h-full transform sm:hover:-translate-y-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-5 shadow-sm group-hover:scale-110 transition-transform duration-500">🧮</div>
              <h3 className="font-black text-base sm:text-lg text-white mb-2">{currentT.card4Title}</h3>
              <p className="text-slate-300 text-xs sm:text-sm mb-6 flex-grow leading-relaxed">{currentT.card4Desc}</p>
              <div className="mt-auto"><span className="text-purple-400 font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">{currentT.card4Btn}</span></div>
            </button>

          </div>
        </div>
      </div>

      {/* HOW IT WORKS / MCHAKATO WA UWAZI (WHITE THEME) */}
      <div className="bg-slate-50 py-20 border-t border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50 -ml-20 -mb-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="bg-white border border-gray-200 text-slate-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block shadow-sm">{currentT.howSubtitle}</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{currentT.howTitle}</h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-sm sm:text-base px-4">{currentT.howDesc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-8 left-[10%] w-[80%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 -z-10 border-t-2 border-dashed border-white"></div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-blue-100 text-blue-600 flex items-center justify-center text-2xl font-black shadow-lg mb-6 group-hover:bg-blue-600 group-hover:border-blue-200 group-hover:text-white transition-all duration-300 transform group-hover:scale-110">1</div>
              <h3 className="font-black text-lg text-slate-900 mb-3">{currentT.hw1Title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{currentT.hw1Desc}</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-blue-100 text-blue-600 flex items-center justify-center text-2xl font-black shadow-lg mb-6 group-hover:bg-blue-600 group-hover:border-blue-200 group-hover:text-white transition-all duration-300 transform group-hover:scale-110">2</div>
              <h3 className="font-black text-lg text-slate-900 mb-3">{currentT.hw2Title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{currentT.hw2Desc}</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black shadow-lg mb-6 group-hover:bg-emerald-600 group-hover:border-emerald-200 group-hover:text-white transition-all duration-300 transform group-hover:scale-110">3</div>
              <h3 className="font-black text-lg text-slate-900 mb-3">{currentT.hw3Title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{currentT.hw3Desc}</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-slate-200 text-white flex items-center justify-center text-2xl font-black shadow-lg mb-6 group-hover:bg-blue-600 group-hover:border-blue-200 transition-all duration-300 transform group-hover:scale-110">4</div>
              <h3 className="font-black text-lg text-slate-900 mb-3">{currentT.hw4Title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{currentT.hw4Desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PREMIUM FOOTER */}
      <footer id="contact" className="bg-slate-900 text-slate-300 pt-16 sm:pt-20 pb-8 sm:pb-10 border-t-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16 text-center md:text-left">
            <div className="col-span-1 lg:col-span-1 md:pr-4 flex flex-col items-center md:items-start">
              <Link href="/" className="text-3xl font-black text-white tracking-tighter mb-4 sm:mb-6 inline-block">Gari<span className="text-blue-500">Hub</span></Link>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-xs">{currentT.footerDesc}</p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 cursor-pointer transition-colors text-white">IG</div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 cursor-pointer transition-colors text-white">FB</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white text-xs sm:text-sm font-black uppercase tracking-widest mb-4 sm:mb-6">{currentT.quickLinks}</h4>
              <ul className="space-y-3 text-xs sm:text-sm font-medium">
                <li><Link href="/#magari" className="hover:text-blue-400 transition-colors">{currentT.inventory}</Link></li>
                <li><Link href="/rentals" className="hover:text-red-400 transition-colors">{currentT.rentMenu}</Link></li>
                <li><Link href="/spares" className="hover:text-blue-400 transition-colors">{currentT.sparesMenu}</Link></li>
                <li><button onClick={() => setShowCalcModal(true)} className="hover:text-blue-400 transition-colors">{currentT.calcMenu}</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white text-xs sm:text-sm font-black uppercase tracking-widest mb-4 sm:mb-6">{currentT.ourServices}</h4>
              <ul className="space-y-3 text-xs sm:text-sm font-medium">
                <li><Link href="/" className="hover:text-blue-400 transition-colors">Vehicle Importation</Link></li>
                <li><Link href="/rentals" className="hover:text-red-400 transition-colors">Premium Car Rentals</Link></li>
                <li><button onClick={() => setShowServiceModal(true)} className="hover:text-blue-400 transition-colors">Pre-Purchase Inspection</button></li>
                <li><Link href="/spares" className="hover:text-blue-400 transition-colors">OBD2 Diagnostics Tools</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white text-xs sm:text-sm font-black uppercase tracking-widest mb-4 sm:mb-6">{currentT.contactFooter}</h4>
              <ul className="space-y-4 text-xs sm:text-sm font-medium flex flex-col items-center md:items-start">
                <li className="flex items-start gap-3"><span className="text-blue-500 text-lg">📍</span><span>Dar es Salaam, Tanzania</span></li>
                <li className="flex items-center gap-3"><span className="text-blue-500 text-lg">📞</span><span>+255 700 000 000</span></li>
                <li className="flex items-center gap-3"><span className="text-blue-500 text-lg">📧</span><span>info@garihub.co.tz</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] sm:text-xs font-medium text-slate-500 text-center md:text-left gap-4">
            <p>&copy; {new Date().getFullYear()} Gari Hub. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6"><Link href="/" className="hover:text-white transition-colors">Terms of Service</Link><Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link></div>
          </div>
        </div>
      </footer>

    </main>
  );
}