"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [lang, setLang] = useState<'sw' | 'en'>('sw');
  const [currency, setCurrency] = useState<'USD' | 'TZS' | 'KES' | 'UGX'>('TZS');
  const [port, setPort] = useState<'Dar es Salaam' | 'Mombasa' | 'Maputo'>('Dar es Salaam');
  
  const [fobPrice, setFobPrice] = useState<number | ''>('');

  // ==============================================================
  // INQUIRY MODAL STATES (KWA MAGARI YA SHOWROOM)
  // ==============================================================
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [inquiryData, setInquiryData] = useState({ name: '', phone: '', message: 'Nimependa hili gari, naomba kujua utaratibu wa kulilipia.' });
  const [sendingInquiry, setSendingInquiry] = useState(false);

  // ==============================================================
  // PHOTO SOURCING STATES (KUTAFUTA GARI KWA PICHA)
  // ==============================================================
  const [sourcingFile, setSourcingFile] = useState<File | null>(null);
  const [sourcingPreview, setSourcingPreview] = useState<string | null>(null);
  const [showSourcingModal, setShowSourcingModal] = useState(false);
  const [sourcingData, setSourcingData] = useState({ name: '', phone: '' });
  const [sendingSourcing, setSendingSourcing] = useState(false);

  // ==============================================================
  // DATA STATES & FILTERING
  // ==============================================================
  const [allFetchedCars, setAllFetchedCars] = useState<any[]>([]);
  const [showroomCars, setShowroomCars] = useState<any[]>([]); 
  const [activeFilter, setActiveFilter] = useState<string>('ALL'); 
  const [trendingCars, setTrendingCars] = useState<any[]>([]);

  // SEARCH FORM STATES (UCHAWI WA KUTAFUTA)
  const [searchFilters, setSearchFilters] = useState({
    make: 'All Makes',
    model: 'Any Model',
    minYear: 'Min',
    maxYear: 'Max',
    body: 'All Types',
    budget: 'No Limit'
  });

  useEffect(() => {
    fetchLiveCars();
    fetchTrendingCars();
  }, []);

  const fetchLiveCars = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const now = new Date();
        const dbCars = data.map(car => {
          const carDate = new Date(car.created_at);
          const diffDays = Math.floor((now.getTime() - carDate.getTime()) / (1000 * 3600 * 24));
          
          return {
            id: car.id, 
            stockId: car.stock_id,
            make: car.make, 
            model: car.model, 
            title: `${car.make} ${car.model}`,
            year: car.year?.toString() || '2015',
            trans: car.transmission,
            km: car.mileage,
            fob: `$${car.fob_price?.toLocaleString() || 0}`,
            cif: `$${car.cif_price?.toLocaleString() || 0}`,
            img: car.location, 
            tag: car.tag === 'NONE' ? '' : car.tag,
            liked: false,
            isExpired: diffDays > 14
          };
        }).filter(car => !car.isExpired || car.tag === 'SOLD');

        setAllFetchedCars(dbCars); 
        setShowroomCars(dbCars); 
      }
    } catch (err) {
      console.log("Inatumia Local Data.");
    }
  };

  const fetchTrendingCars = async () => {
    try {
      const { data, error } = await supabase.from('trending_cars').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const dbTrending = data.map(car => ({
          id: car.id, title: car.title, price: car.price_text, img: car.image_url
        }));
        setTrendingCars(dbTrending);
      }
    } catch (err) {}
  };

  // ==============================================================
  // SEARCH ENGINE LOGIC
  // ==============================================================
  const handleAdvancedSearch = () => {
    let filtered = [...allFetchedCars];

    if (searchFilters.make !== 'All Makes') {
      filtered = filtered.filter(car => car.make?.toLowerCase() === searchFilters.make.toLowerCase());
    }
    if (searchFilters.model !== 'Any Model') {
      filtered = filtered.filter(car => car.model?.toLowerCase().includes(searchFilters.model.toLowerCase()));
    }
    if (searchFilters.minYear !== 'Min') {
      filtered = filtered.filter(car => parseInt(car.year) >= parseInt(searchFilters.minYear));
    }
    if (searchFilters.maxYear !== 'Max') {
      filtered = filtered.filter(car => parseInt(car.year) <= parseInt(searchFilters.maxYear));
    }
    if (searchFilters.body !== 'All Types') {
      const suvs = ['forester', 'prado', 'x-trail', 'cx-5', 'vanguard', 'harrier', 'rav4', 'cruiser', 'kluger', 'escapade'];
      const sedans = ['crown', 'c200', '3 series', 'premio', 'allion', 'belta', 'camry', 'corolla', 'passat'];
      const hatchbacks = ['ist', 'fit', 'impreza', 'vitz', 'note', 'demio', 'aqua', 'swift', 'march'];
      const pickups = ['hilux', 'ranger', 'navara', 'd-max', 'hardbody', 'amarok'];
      const vans = ['hiace', 'alphard', 'noah', 'voxy', 'caravan', 'vellfire', 'sienta'];

      let matchArray: string[] = [];
      if (searchFilters.body === 'SUV') matchArray = suvs;
      if (searchFilters.body === 'Sedan') matchArray = sedans;
      if (searchFilters.body === 'Hatchback') matchArray = hatchbacks;
      if (searchFilters.body === 'Pickup') matchArray = pickups;
      if (searchFilters.body === 'Van') matchArray = vans;

      if (matchArray.length > 0) {
        filtered = filtered.filter(car => {
          const titleLower = car.title.toLowerCase();
          return matchArray.some(keyword => titleLower.includes(keyword));
        });
      }
    }
    if (searchFilters.budget !== 'No Limit') {
      const maxBudget = parseInt(searchFilters.budget.replace(/[^0-9]/g, ''));
      filtered = filtered.filter(car => {
        const carPrice = parseInt(car.fob.replace(/[^0-9]/g, ''));
        return carPrice <= maxBudget;
      });
    }

    setShowroomCars(filtered);
    setActiveFilter('SEARCH RESULTS'); 
  };

  const handleFilter = (type: 'ALL' | 'MAKE' | 'BODY', value: string) => {
    setActiveFilter(value);
    setSearchFilters({ make: 'All Makes', model: 'Any Model', minYear: 'Min', maxYear: 'Max', body: 'All Types', budget: 'No Limit' });

    if (type === 'ALL') {
      setShowroomCars(allFetchedCars);
    } 
    else if (type === 'MAKE') {
      const filtered = allFetchedCars.filter(car => car.make?.toLowerCase() === value.toLowerCase());
      setShowroomCars(filtered);
    } 
    else if (type === 'BODY') {
      const suvs = ['forester', 'prado', 'x-trail', 'cx-5', 'vanguard', 'harrier', 'rav4', 'cruiser', 'kluger', 'escapade'];
      const sedans = ['crown', 'c200', '3 series', 'premio', 'allion', 'belta', 'camry', 'corolla', 'passat'];
      const hatchbacks = ['ist', 'fit', 'impreza', 'vitz', 'note', 'demio', 'aqua', 'swift', 'march'];
      const pickups = ['hilux', 'ranger', 'navara', 'd-max', 'hardbody', 'amarok'];
      const vans = ['hiace', 'alphard', 'noah', 'voxy', 'caravan', 'vellfire', 'sienta'];

      let matchArray: string[] = [];
      if (value === 'SUV') matchArray = suvs;
      if (value === 'Sedan') matchArray = sedans;
      if (value === 'Hatchback') matchArray = hatchbacks;
      if (value === 'Pickup') matchArray = pickups;
      if (value === 'Van') matchArray = vans;

      const filtered = allFetchedCars.filter(car => {
        const titleLower = car.title.toLowerCase();
        return matchArray.some(keyword => titleLower.includes(keyword));
      });
      setShowroomCars(filtered);
    }
  };

  const countMake = (makeName: string) => allFetchedCars.filter(car => car.make?.toLowerCase() === makeName.toLowerCase()).length;
  
  const countBody = (bodyType: string) => {
    const suvs = ['forester', 'prado', 'x-trail', 'cx-5', 'vanguard', 'harrier', 'rav4', 'cruiser'];
    const sedans = ['crown', 'c200', '3 series', 'premio', 'allion', 'belta'];
    const hatchbacks = ['ist', 'fit', 'impreza', 'vitz', 'note', 'demio'];
    const pickups = ['hilux', 'ranger', 'navara', 'd-max'];
    const vans = ['hiace', 'alphard', 'noah', 'voxy'];

    let matchArray: string[] = [];
    if (bodyType === 'SUV') matchArray = suvs;
    if (bodyType === 'Sedan') matchArray = sedans;
    if (bodyType === 'Hatchback') matchArray = hatchbacks;
    if (bodyType === 'Pickup') matchArray = pickups;
    if (bodyType === 'Van') matchArray = vans;

    return allFetchedCars.filter(car => {
      const titleLower = car.title.toLowerCase();
      return matchArray.some(keyword => titleLower.includes(keyword));
    }).length;
  };

  const getSafeImage = (imgUrl: string) => {
    if (!imgUrl || imgUrl.trim() === '') return 'https://placehold.co/600x400/e2e8f0/64748b?text=Gari+Hub';
    return imgUrl;
  };

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingInquiry(true);
    try {
      const messagePayload = `Jina: ${inquiryData.name}\nUjumbe: ${inquiryData.message}\nGari: ${selectedCar?.title} (${selectedCar?.stockId})`;
      const vehicleId = typeof selectedCar?.id === 'string' ? selectedCar.id : null; 

      const { error } = await supabase.from('inquiries').insert([{
         vehicle_id: vehicleId,
         contact_phone: inquiryData.phone,
         customer_message: messagePayload
      }]);

      if (error) throw error;
      
      alert(lang === 'sw' ? "Ujumbe wako umetumwa kikamilifu! Wakala wetu atawasiliana nawe." : "Inquiry sent successfully! Our agent will contact you soon.");
      setShowInquiryModal(false);
      setInquiryData({ name: '', phone: '', message: 'Nimependa hili gari, naomba kujua utaratibu wa kulilipia.' });
    } catch (err) {
      console.error(err);
      alert("Inquiry imepokelewa kikamilifu.");
      setShowInquiryModal(false);
    } finally {
      setSendingInquiry(false);
    }
  };

  const openInquiry = (car: any) => {
    setSelectedCar(car);
    setShowInquiryModal(true);
  };

  const handlePhotoUploadSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSourcingFile(file);
      setSourcingPreview(URL.createObjectURL(file)); 
      setShowSourcingModal(true); 
    }
  };

  const submitSourcingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourcingFile) return;
    
    setSendingSourcing(true);
    try {
      const fileExt = sourcingFile.name.split('.').pop();
      const uniqueFileName = `sourcing-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('car-images').upload(`public/${uniqueFileName}`, sourcingFile);
      
      let imageUrl = '';
      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(`public/${uniqueFileName}`);
        imageUrl = publicUrl;
      }

      const messagePayload = `SOURCING REQUEST\nJina: ${sourcingData.name}\nAnatafuta Gari Hili (Picha): ${imageUrl || 'Picha haikupanda vizuri'}`;
      
      const { error } = await supabase.from('inquiries').insert([{
         contact_phone: sourcingData.phone,
         customer_message: messagePayload
      }]);

      if (error) throw error;
      
      alert(lang === 'sw' ? "Picha imetumwa kikamilifu! Wakala wetu atakutafutia gari hili na kukupa quotation." : "Photo sent successfully! We will source this car and get back to you with a quote.");
      
      setShowSourcingModal(false);
      setSourcingFile(null);
      setSourcingPreview(null);
      setSourcingData({ name: '', phone: '' });

    } catch (err) {
      console.error(err);
      alert("Kuna shida kidogo ya mtandao, tafadhali jaribu tena.");
    } finally {
      setSendingSourcing(false);
    }
  };

  const toggleLike = (id: string | number) => {
    setShowroomCars(showroomCars.map(car => car.id === id ? { ...car, liked: !car.liked } : car));
  };
  
  const exchangeRate = 2600; 
  const estimatedFreightUSD = 1200; 
  const freightTZS = estimatedFreightUSD * exchangeRate;
  const fobTZS = typeof fobPrice === 'number' ? fobPrice * exchangeRate : 0;
  const cifTZS = fobTZS + freightTZS;
  const estimatedTaxTZS = cifTZS * 0.45; 
  const totalCostTZS = cifTZS + estimatedTaxTZS;

  const t = {
    sw: {
      home: "Mwanzo", inventory: "Magari Yetu", sparesMenu: "Vipuri & Vifaa", calcMenu: "Kikokotozi", contact: "Wasiliana Nasi",
      heroTitle1: "Agiza Gari Ndoto Yako Kutoka", heroTitle2: "Japani, Ulaya, China na Duniani Kote",
      heroDesc: "Gari Hub inakupa mfumo wa wazi, salama, na wa haraka kuagiza magari kutoka masoko ya dunia nzima mpaka mlangoni kwako. Hakuna madalali, hakuna gharama zilizofichwa.",
      btnSearch: "Tafuta Gari Sasa", btnCalc: "Kadiria Ushuru (TRA)",
      uploadTitle: "Una Picha ya Gari Unalotaka?", uploadDesc: "Pakia picha ya gari uliloona mtandaoni au barabarani. Tutalitafuta duniani kote na kukupa quotation!",
      uploadBtn: "Pakia Picha ya Gari", uploadChange: "Badilisha Picha", uploadSuccess: "imepokelewa tayari!",
      searchMake: "Aina (Make)", searchModel: "Toleo (Model)", searchBody: "Umbo (Body Type)", searchYearFrom: "Mwaka Kuanzia", searchYearTo: "Mwaka Mpaka", searchBudget: "Bajeti (Max)", searchBtn: "Tafuta Magari",
      shopByType: "Tafuta Kwa Umbo", shopByMake: "Tafuta Kwa Aina (Make)", shopByPrice: "Tafuta Kwa Bei",
      typeSUV: "SUV / Gari Kubwa", typeSedan: "Sedan / Gari Fupi", typeHatch: "Hatchback / IST", typePickup: "Pick-up / Mizigo", typeVan: "Van / Basi Dogo",
      featTitle: "Showroom: Mapya Yaliyowasili", featDesc: "Magari mapya yanayopatikana kwa ajili ya kuagizwa sasa hivi.",
      trendingTitle: "🔥 Magari Yanayopendwa Zaidi Tanzania", trendingDesc: "Orodha ya magari yanayoagizwa sana na wateja wetu msimu huu.",
      sparesTitle: "Vipuri Original & Vifaa vya Kisasa", sparesDesc: "Tunaagiza vipuri halisi (Genuine Parts) na vifaa vya kiufundi moja kwa moja kutoka viwandani.",
      spare1Title: "Service Kits & Engine Parts", spare1Desc: "Oil filters, spark plugs, na vipuri vyote vya injini kwa magari ya Japan na Ulaya.",
      spare2Title: "ECU Programming & Diagnostics", spare2Desc: "Vifaa vya kisasa vya kusoma hitilafu (OBD2) na ku-program kompyuta za magari (ECU).",
      spare3Title: "Body Kits & Taa (Accessories)", spare3Desc: "Boresha muonekano wa gari lako kwa body kits na taa za kisasa kabisa.",
      calcTitle: "Kadiria Gharama Zako Mapema", calcDesc: "Tumia kikokotozi chetu cha uwazi kujua makadirio ya gharama zote hadi gari kufika mlangoni kwako.", calcInput: "Weka Bei ya Gari Nje (FOB kwa USD $)", calcResult: "Mchanganuo wa Makadirio", calcTotal: "Jumla Kuu (Makadirio):",
      howWorkTitle: "Jinsi Tunavyofanya Kazi", howWorkDesc: "Mchakato mwepesi na salama kuanzia kuchagua gari hadi kukabidhiwa funguo.",
      step1Title: "1. Chagua Gari", step1Desc: "Tafuta gari kwenye website yetu au tutumie picha na maelezo tukutafutie.", step2Title: "2. Pata Nukuu & Lipia", step2Desc: "Utapata mchanganuo wazi wa CIF na kodi. Fanya malipo salama ofisini kwetu au benki.", step3Title: "3. Usafirishaji Kuanza", step3Desc: "Gari lako litapakiwa kwenye meli na utapewa mfumo wa kulifuatilia (Tracking).", step4Title: "4. Kutoa Bandarini", step4Desc: "Tunashughulikia ushuru wa forodha na kukukabidhi gari lako likiwa safi kabisa.",
      testiTitle: "Ushuhuda wa Wateja Wetu", testiDesc: "Sikiliza kile wateja walioagiza magari kupitia Gari Hub wanasema."
    },
    en: {
      home: "Home", inventory: "Our Inventory", sparesMenu: "Parts & Tools", calcMenu: "Calculator", contact: "Contact Us",
      heroTitle1: "Import Your Dream Car From", heroTitle2: "Japan, Europe, China & Worldwide",
      heroDesc: "Gari Hub provides a transparent, secure, and fast system to import cars from global markets right to your doorstep. No middlemen, no hidden fees.",
      btnSearch: "Search Cars Now", btnCalc: "Estimate Tax",
      uploadTitle: "Have a Photo of the Car?", uploadDesc: "Upload a picture of any car you saw online or on the street. We will source it globally and give you a quote!",
      uploadBtn: "Upload Car Photo", uploadChange: "Change Photo", uploadSuccess: "received successfully!",
      searchMake: "Make", searchModel: "Model", searchBody: "Body Type", searchYearFrom: "Year From", searchYearTo: "Year To", searchBudget: "Max Budget", searchBtn: "Search Cars",
      shopByType: "Shop By Body", shopByMake: "Shop By Make", shopByPrice: "Shop By Price",
      typeSUV: "SUV / Off-Road", typeSedan: "Sedan", typeHatch: "Hatchback", typePickup: "Pick-up / Truck", typeVan: "Van / Minibus",
      featTitle: "Showroom: New Arrivals", featDesc: "Newly available cars ready for direct import.",
      trendingTitle: "🔥 Most Popular Imports", trendingDesc: "The top trending cars currently being imported by our clients.",
      sparesTitle: "Genuine Spare Parts & Auto Tools", sparesDesc: "We import genuine OEM parts and advanced diagnostic equipment directly from manufacturers.",
      spare1Title: "Service Kits & Engine Parts", spare1Desc: "Oil filters, spark plugs, and engine components for JDM and European cars.",
      spare2Title: "ECU Programming & Diagnostics", spare2Desc: "Advanced OBD2 scanners, key programmers, and ECU tuning equipment.",
      spare3Title: "Body Kits & Accessories", spare3Desc: "Upgrade your car's look with premium body kits and modern lighting systems.",
      calcTitle: "Estimate Your Costs Early", calcDesc: "Use our transparent calculator to get an estimate of all costs until the car reaches your door.", calcInput: "Enter Car Price Abroad (FOB in USD $)", calcResult: "Cost Breakdown Estimate", calcTotal: "Grand Total (Estimate):",
      howWorkTitle: "How We Work", howWorkDesc: "A seamless and secure process from car selection to key handover.",
      step1Title: "1. Choose a Car", step1Desc: "Find a car on our site or send us a photo and details for custom sourcing.", step2Title: "2. Get Quote & Pay", step2Desc: "Receive a clear CIF and tax breakdown. Make secure payments via bank or our office.", step3Title: "3. Shipping Begins", step3Desc: "Your car is loaded onto a vessel and you receive a portal to track it live.", step4Title: "4. Clearance & Handover", step4Desc: "We handle all customs clearance and hand over your ready-to-drive car.",
      testiTitle: "Customer Testimonials", testiDesc: "Hear from our happy clients who imported their cars through Gari Hub."
    }
  };

  const currentT = t[lang];

  return (
    <main className="min-h-screen bg-gray-50 pb-0 font-sans text-gray-800 relative">
      
      {/* 1. PHOTO SOURCING MODAL */}
      {showSourcingModal && sourcingPreview && (
        <div className="fixed inset-0 bg-black/70 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
            <div className="p-4 bg-blue-600 border-b flex justify-between items-center text-white">
              <h3 className="font-extrabold">Tumepata Picha Yako!</h3>
              <button onClick={() => { setShowSourcingModal(false); setSourcingFile(null); setSourcingPreview(null); }} className="text-white hover:text-red-200 font-black text-xl transition-colors">&times;</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4 text-center">Tafadhali weka namba yako ya WhatsApp ili wakala wetu akishalipata hili gari akutajie bei na utaratibu.</p>
              
              <div className="flex justify-center mb-6">
                <img src={sourcingPreview} alt="Sourcing Request" className="w-32 h-32 object-cover rounded-xl shadow-md border-4 border-blue-50" />
              </div>
              
              <form onSubmit={submitSourcingRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Jina Lako Kamili</label>
                  <input type="text" required value={sourcingData.name} onChange={(e) => setSourcingData({...sourcingData, name: e.target.value})} placeholder="Mf. Juma Ali" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Namba ya WhatsApp</label>
                  <input type="text" required value={sourcingData.phone} onChange={(e) => setSourcingData({...sourcingData, phone: e.target.value})} placeholder="07XX XXX XXX" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm" />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={sendingSourcing} className="w-full bg-blue-600 text-white font-black py-3.5 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    {sendingSourcing ? 'Inatuma...' : 'Tuma Picha & Pata Bei 🚀'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. INQUIRY MODAL (KWA MAGARI YA SHOWROOM) */}
      {showInquiryModal && selectedCar && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Ulizia Hili Gari</h3>
              <button onClick={() => setShowInquiryModal(false)} className="text-gray-400 hover:text-red-500 font-black text-xl transition-colors">&times;</button>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-6 bg-blue-50 p-3 rounded-xl border border-blue-100 items-center">
                <img src={getSafeImage(selectedCar.img)} alt={selectedCar.title} className="w-16 h-12 object-cover rounded shadow-sm border border-gray-200" />
                <div>
                  <p className="font-bold text-gray-900 text-sm leading-tight">{selectedCar.title}</p>
                  <p className="text-xs text-blue-600 font-black mt-1">{selectedCar.cif} (CIF)</p>
                </div>
              </div>
              <form onSubmit={submitInquiry} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Jina Lako Kamili</label>
                  <input type="text" required value={inquiryData.name} onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})} placeholder="Mf. Juma Ali" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Namba ya Simu (WhatsApp)</label>
                  <input type="text" required value={inquiryData.phone} onChange={(e) => setInquiryData({...inquiryData, phone: e.target.value})} placeholder="07XX XXX XXX" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Ujumbe Wako</label>
                  <textarea required value={inquiryData.message} onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm resize-none" rows={3}></textarea>
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={sendingInquiry} className="w-full bg-blue-600 text-white font-black py-3.5 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    {sendingInquiry ? 'Inatuma Ujumbe...' : 'Tuma Ujumbe Sasa 🚀'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL TOP BAR */}
      <div className="bg-gray-900 text-white text-xs py-2 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center z-50 relative gap-2 sm:gap-0">
        <div className="flex gap-4">
          <span>📧 info@garihub.co.tz</span>
          <span className="hidden sm:inline">📞 +255 700 000 000</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 bg-gray-800 rounded px-3 py-1 flex-wrap justify-center">
          <div className="flex items-center gap-1 pr-2 border-r border-gray-600">
            <span className="text-gray-400">⚓ Port:</span>
            <select value={port} onChange={(e) => setPort(e.target.value as any)} className="bg-transparent text-blue-400 font-bold outline-none cursor-pointer">
              <option value="Dar es Salaam" className="bg-gray-800">Dar es Salaam</option>
              <option value="Mombasa" className="bg-gray-800">Mombasa</option>
              <option value="Maputo" className="bg-gray-800">Maputo</option>
            </select>
          </div>
          <div className="flex items-center gap-1 px-2 border-r border-gray-600">
            <span className="text-gray-400">💵 Curr:</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as any)} className="bg-transparent text-green-400 font-bold outline-none cursor-pointer">
              <option value="USD" className="bg-gray-800">USD</option>
              <option value="TZS" className="bg-gray-800">TZS</option>
              <option value="KES" className="bg-gray-800">KES</option>
              <option value="UGX" className="bg-gray-800">UGX</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pl-2">
             <button onClick={() => setLang('sw')} className={`font-bold ${lang === 'sw' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>SW</button>
             <span className="text-gray-600">|</span>
             <button onClick={() => setLang('en')} className={`font-bold ${lang === 'en' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>EN</button>
          </div>
        </div>
      </div>

      {/* NAVIGATION BAR */}
      <nav className="bg-white shadow-sm w-full z-40 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">
                Gari<span className="text-gray-900">Hub</span>
              </Link>
            </div>
            
            <div className="hidden md:flex space-x-6 items-center">
              <Link href="/" className="text-gray-900 border-b-2 border-blue-600 px-1 py-2 font-medium text-sm">{currentT.home}</Link>
              <Link href="#magari" className="text-gray-500 hover:text-blue-600 px-1 py-2 font-medium transition-colors text-sm">{currentT.inventory}</Link>
              <Link href="/spares" className="text-gray-500 hover:text-blue-600 px-1 py-2 font-medium transition-colors text-sm">{currentT.sparesMenu}</Link>
              <Link href="#howitworks" className="text-gray-500 hover:text-blue-600 px-1 py-2 font-medium transition-colors text-sm">{currentT.howWorkTitle}</Link>
              <Link href="#calculator" className="text-gray-500 hover:text-blue-600 px-1 py-2 font-medium transition-colors text-sm">{currentT.calcMenu}</Link>
            </div>
            
            <div className="hidden md:flex items-center gap-3">
              <button className="text-gray-600 hover:text-red-500 font-bold text-sm flex items-center gap-1 transition-colors">
                 ❤️ <span className="hidden lg:inline">Wishlist ({allFetchedCars.filter(c => c.liked).length})</span>
              </button>
              <div className="flex items-center ml-2 border-l pl-3 border-gray-200 space-x-2">
                <Link href="/vendor" className="bg-gray-100 text-gray-800 border border-gray-200 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all shadow-sm text-xs">
                  Dealer Portal
                </Link>
                <Link href="/client" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md text-xs">
                  Client Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION & PHOTO SOURCING UPLOAD */}
      <div className="relative bg-white overflow-hidden border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:w-1/2 lg:pb-28 xl:pb-32 pt-12 px-4 sm:px-6 lg:px-8">
            <main className="mt-6 mx-auto max-w-7xl sm:mt-10 md:mt-12 lg:mt-16">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-5xl lg:text-5xl">
                  <span className="block xl:inline">{currentT.heroTitle1}</span>{' '}
                  <span className="block text-blue-600 xl:inline mt-1">{currentT.heroTitle2}</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  {currentT.heroDesc}
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <a href="#magari" className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all">
                      {currentT.btnSearch}
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
          <div className="w-full lg:w-1/2 px-4 sm:px-6 lg:px-8 pb-12 lg:pb-0 pt-4">
            <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl p-6 md:p-8 text-center hover:bg-blue-100 transition-colors duration-300 flex flex-col items-center justify-center shadow-lg transform lg:rotate-1 hover:rotate-0">
              <div className="bg-white p-3 rounded-full shadow-md mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-blue-900 mb-2">{currentT.uploadTitle}</h3>
              <p className="text-blue-700 mb-4 max-w-sm text-sm">{currentT.uploadDesc}</p>
              
              <div className="flex flex-col items-center w-full">
                <label className="relative overflow-hidden w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md cursor-pointer flex justify-center items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>{currentT.uploadBtn}</span>
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handlePhotoUploadSelect} />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADVANCED QUICK SEARCH */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-8 z-30">
        <div className="bg-white rounded-xl shadow-xl p-4 md:p-6 border-t-4 border-blue-600">
          <form className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">{currentT.searchMake}</label>
              <select value={searchFilters.make} onChange={(e) => setSearchFilters({...searchFilters, make: e.target.value})} className="w-full border border-gray-300 rounded md:p-2.5 p-3 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
                <option>All Makes</option>
                <option>Toyota</option>
                <option>Subaru</option>
                <option>Mercedes</option>
                <option>Honda</option>
                <option>Nissan</option>
                <option>BMW</option>
                <option>Mazda</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">{currentT.searchModel}</label>
              <select value={searchFilters.model} onChange={(e) => setSearchFilters({...searchFilters, model: e.target.value})} className="w-full border border-gray-300 rounded md:p-2.5 p-3 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
                <option>Any Model</option>
                <option>Forester</option>
                <option>Crown</option>
                <option>Harrier</option>
                <option>C200</option>
                <option>Land Cruiser</option>
                <option>X-Trail</option>
                <option>Vanguard</option>
              </select>
            </div>
            <div className="lg:col-span-1 flex gap-2">
              <div className="w-1/2">
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Min Year</label>
                <select value={searchFilters.minYear} onChange={(e) => setSearchFilters({...searchFilters, minYear: e.target.value})} className="w-full border border-gray-300 rounded md:p-2.5 p-3 text-sm focus:ring-blue-500 outline-none cursor-pointer">
                  <option>Min</option><option>2010</option><option>2012</option><option>2014</option><option>2016</option><option>2018</option><option>2020</option>
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Max Year</label>
                <select value={searchFilters.maxYear} onChange={(e) => setSearchFilters({...searchFilters, maxYear: e.target.value})} className="w-full border border-gray-300 rounded md:p-2.5 p-3 text-sm focus:ring-blue-500 outline-none cursor-pointer">
                  <option>Max</option><option>2015</option><option>2017</option><option>2019</option><option>2021</option><option>2023</option><option>2025</option>
                </select>
              </div>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">{currentT.searchBody}</label>
              <select value={searchFilters.body} onChange={(e) => setSearchFilters({...searchFilters, body: e.target.value})} className="w-full border border-gray-300 rounded md:p-2.5 p-3 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
                <option>All Types</option><option>SUV</option><option>Sedan</option><option>Hatchback</option><option>Pickup</option><option>Van</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">{currentT.searchBudget}</label>
              <select value={searchFilters.budget} onChange={(e) => setSearchFilters({...searchFilters, budget: e.target.value})} className="w-full border border-gray-300 rounded md:p-2.5 p-3 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
                <option>No Limit</option><option>$3,000</option><option>$5,000</option><option>$10,000</option><option>$15,000</option><option>$20,000</option><option>$50,000</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <button type="button" onClick={handleAdvancedSearch} className="w-full bg-blue-600 text-white md:p-2.5 p-3 rounded font-bold hover:bg-blue-700 transition-colors shadow-sm flex justify-center items-center gap-2 text-sm">
                🔍 {currentT.searchBtn}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MAIN CONTENT AREA: SIDEBAR & GRID */}
      <div id="magari" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR */}
          <div className="lg:w-1/4 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 sticky top-24 overflow-y-auto max-h-[85vh] custom-scrollbar">
              
              <h2 className="text-lg font-extrabold text-gray-900 mb-4 pb-2 border-b border-gray-200">{currentT.shopByType}</h2>
              <div className="flex flex-col gap-2">
                <div onClick={() => handleFilter('BODY', 'SUV')} className={`py-2.5 px-4 rounded shadow-sm border flex items-center justify-between cursor-pointer group transition-all ${activeFilter === 'SUV' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-100 hover:border-blue-500'}`}>
                  <div className="flex items-center gap-3"><span className="text-xl group-hover:scale-110 transition-transform">🚙</span><span className={`font-bold text-sm group-hover:text-blue-600 ${activeFilter === 'SUV' ? 'text-blue-600' : 'text-gray-700'}`}>{currentT.typeSUV}</span></div>
                  <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">{countBody('SUV')}</span>
                </div>
                <div onClick={() => handleFilter('BODY', 'Sedan')} className={`py-2.5 px-4 rounded shadow-sm border flex items-center justify-between cursor-pointer group transition-all ${activeFilter === 'Sedan' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-100 hover:border-blue-500'}`}>
                  <div className="flex items-center gap-3"><span className="text-xl group-hover:scale-110 transition-transform">🚗</span><span className={`font-bold text-sm group-hover:text-blue-600 ${activeFilter === 'Sedan' ? 'text-blue-600' : 'text-gray-700'}`}>{currentT.typeSedan}</span></div>
                  <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">{countBody('Sedan')}</span>
                </div>
                <div onClick={() => handleFilter('BODY', 'Hatchback')} className={`py-2.5 px-4 rounded shadow-sm border flex items-center justify-between cursor-pointer group transition-all ${activeFilter === 'Hatchback' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-100 hover:border-blue-500'}`}>
                  <div className="flex items-center gap-3"><span className="text-xl group-hover:scale-110 transition-transform">🚕</span><span className={`font-bold text-sm group-hover:text-blue-600 ${activeFilter === 'Hatchback' ? 'text-blue-600' : 'text-gray-700'}`}>{currentT.typeHatch}</span></div>
                  <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">{countBody('Hatchback')}</span>
                </div>
                <div onClick={() => handleFilter('BODY', 'Pickup')} className={`py-2.5 px-4 rounded shadow-sm border flex items-center justify-between cursor-pointer group transition-all ${activeFilter === 'Pickup' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-100 hover:border-blue-500'}`}>
                  <div className="flex items-center gap-3"><span className="text-xl group-hover:scale-110 transition-transform">🛻</span><span className={`font-bold text-sm group-hover:text-blue-600 ${activeFilter === 'Pickup' ? 'text-blue-600' : 'text-gray-700'}`}>{currentT.typePickup}</span></div>
                  <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">{countBody('Pickup')}</span>
                </div>
                <div onClick={() => handleFilter('BODY', 'Van')} className={`py-2.5 px-4 rounded shadow-sm border flex items-center justify-between cursor-pointer group transition-all ${activeFilter === 'Van' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-100 hover:border-blue-500'}`}>
                  <div className="flex items-center gap-3"><span className="text-xl group-hover:scale-110 transition-transform">🚐</span><span className={`font-bold text-sm group-hover:text-blue-600 ${activeFilter === 'Van' ? 'text-blue-600' : 'text-gray-700'}`}>{currentT.typeVan}</span></div>
                  <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">{countBody('Van')}</span>
                </div>
              </div>

              <h2 className="text-lg font-extrabold text-gray-900 mb-4 mt-8 pb-2 border-b border-gray-200">{currentT.shopByMake}</h2>
              <div className="flex flex-col gap-2">
                <div onClick={() => handleFilter('MAKE', 'Toyota')} className={`py-2.5 px-4 rounded shadow-sm border flex items-center justify-between cursor-pointer group transition-all ${activeFilter === 'Toyota' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-100 hover:border-blue-500'}`}>
                  <div className="flex items-center gap-3"><span className="text-lg text-gray-400 group-hover:text-blue-600">🔹</span><span className={`font-bold text-sm group-hover:text-blue-600 ${activeFilter === 'Toyota' ? 'text-blue-600' : 'text-gray-700'}`}>Toyota</span></div>
                  <span className="text-xs text-gray-400">{countMake('Toyota')}</span>
                </div>
                <div onClick={() => handleFilter('MAKE', 'Subaru')} className={`py-2.5 px-4 rounded shadow-sm border flex items-center justify-between cursor-pointer group transition-all ${activeFilter === 'Subaru' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-100 hover:border-blue-500'}`}>
                  <div className="flex items-center gap-3"><span className="text-lg text-gray-400 group-hover:text-blue-600">🔹</span><span className={`font-bold text-sm group-hover:text-blue-600 ${activeFilter === 'Subaru' ? 'text-blue-600' : 'text-gray-700'}`}>Subaru</span></div>
                  <span className="text-xs text-gray-400">{countMake('Subaru')}</span>
                </div>
                <div onClick={() => handleFilter('MAKE', 'Mercedes')} className={`py-2.5 px-4 rounded shadow-sm border flex items-center justify-between cursor-pointer group transition-all ${activeFilter === 'Mercedes' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-100 hover:border-blue-500'}`}>
                  <div className="flex items-center gap-3"><span className="text-lg text-gray-400 group-hover:text-blue-600">🔹</span><span className={`font-bold text-sm group-hover:text-blue-600 ${activeFilter === 'Mercedes' ? 'text-blue-600' : 'text-gray-700'}`}>Mercedes</span></div>
                  <span className="text-xs text-gray-400">{countMake('Mercedes') || countMake('Mercedes-Benz')}</span>
                </div>
                <div onClick={() => handleFilter('MAKE', 'Honda')} className={`py-2.5 px-4 rounded shadow-sm border flex items-center justify-between cursor-pointer group transition-all ${activeFilter === 'Honda' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-100 hover:border-blue-500'}`}>
                  <div className="flex items-center gap-3"><span className="text-lg text-gray-400 group-hover:text-blue-600">🔹</span><span className={`font-bold text-sm group-hover:text-blue-600 ${activeFilter === 'Honda' ? 'text-blue-600' : 'text-gray-700'}`}>Honda</span></div>
                  <span className="text-xs text-gray-400">{countMake('Honda')}</span>
                </div>
                <div onClick={() => handleFilter('MAKE', 'Nissan')} className={`py-2.5 px-4 rounded shadow-sm border flex items-center justify-between cursor-pointer group transition-all ${activeFilter === 'Nissan' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-100 hover:border-blue-500'}`}>
                  <div className="flex items-center gap-3"><span className="text-lg text-gray-400 group-hover:text-blue-600">🔹</span><span className={`font-bold text-sm group-hover:text-blue-600 ${activeFilter === 'Nissan' ? 'text-blue-600' : 'text-gray-700'}`}>Nissan</span></div>
                  <span className="text-xs text-gray-400">{countMake('Nissan')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT AREA: SHOWROOM GRID */}
          <div className="lg:w-3/4 order-1 lg:order-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 border-b pb-2 gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">{currentT.featTitle}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {activeFilter === 'ALL' ? currentT.featDesc : 
                   activeFilter === 'SEARCH RESULTS' ? "Matokeo ya Kanzidata (Search Results)" : 
                   `Inaonyesha magari aina ya "${activeFilter}"`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeFilter !== 'ALL' && (
                  <button onClick={() => handleFilter('ALL', 'ALL')} className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded hover:bg-red-100 transition-colors">
                    &times; Futa Chujio (Clear Filter)
                  </button>
                )}
                <button className="text-xs font-bold bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700 shadow-sm">
                  Sort: Newest
                </button>
              </div>
            </div>

            {/* Dynamic Grid Mapping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {showroomCars.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                  <span className="text-4xl block mb-2">🚙</span>
                  <h3 className="text-gray-900 font-bold text-lg">Hakuna Gari Linalolingana na Utafutaji Hako.</h3>
                  <p className="text-gray-500 text-sm mt-1">Tafadhali futa chujio au badili vigezo vya utafutaji.</p>
                  <button onClick={() => handleFilter('ALL', 'ALL')} className="mt-4 bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 shadow-md transition-colors">Onyesha Magari Yote</button>
                </div>
              ) : (
                showroomCars.map((car) => (
                  <div key={car.id} className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all border border-gray-200 flex flex-col relative group ${car.tag === 'SOLD' ? 'opacity-80' : ''}`}>
                    
                    {car.tag && (
                      <div className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded z-10 ${car.tag === 'HOT' ? 'bg-red-600' : car.tag === 'SOLD' ? 'bg-gray-800 border border-gray-600 shadow-md' : 'bg-green-600'}`}>
                        {car.tag === 'SOLD' ? 'GARI LIMEUZWA' : car.tag}
                      </div>
                    )}

                    <button 
                      onClick={() => toggleLike(car.id)}
                      className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full z-10 hover:bg-white shadow-sm transition-transform hover:scale-110"
                      title="Add to Wishlist"
                    >
                      {car.liked ? <span className="text-red-500 text-lg leading-none">❤️</span> : <span className="text-gray-400 text-lg leading-none">🤍</span>}
                    </button>

                    {/* PICHA NI LINK INAYOPELEKA KWENYE DETAILS PAGE */}
                    <Link href={`/vehicles/${car.id}`} className="relative h-36 overflow-hidden bg-gray-100 flex items-center justify-center block">
                      <img src={getSafeImage(car.img)} alt={car.title} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image'} className={`w-full h-full object-cover transition-transform duration-300 ${car.tag === 'SOLD' ? 'grayscale-[50%]' : 'group-hover:scale-105'}`} />
                    </Link>
                    
                    <div className="p-3 flex-grow flex flex-col">
                      <p className="text-[10px] text-gray-400 font-mono mb-0.5 tracking-wider">Ref: {car.stockId}</p>
                      
                      {/* JINA LA GARI PIA NI LINK INAYOPELEKA KWENYE DETAILS PAGE */}
                      <Link href={`/vehicles/${car.id}`} className="hover:text-blue-600 transition-colors">
                        <h3 className={`text-sm font-bold leading-tight truncate mb-1 ${car.tag === 'SOLD' ? 'text-gray-500 line-through' : 'text-gray-900'}`} title={car.title}>{car.title}</h3>
                      </Link>
                      
                      <p className="text-gray-500 text-[11px] mb-2">{car.year} • {car.trans} • {car.km}</p>
                      <div className={`p-2 rounded border mb-3 mt-auto ${car.tag === 'SOLD' ? 'bg-gray-100 border-gray-200' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex justify-between text-[11px] mb-0.5">
                           <span className="text-gray-500">FOB:</span>
                           <span className="font-bold text-gray-800">{car.fob}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                           <span className={`${car.tag === 'SOLD' ? 'text-gray-500' : 'text-blue-700 font-semibold'}`}>CIF {port}:</span>
                           <span className={`font-bold ${car.tag === 'SOLD' ? 'text-gray-500' : 'text-blue-700'}`}>{car.cif}</span>
                        </div>
                      </div>
                      
                      {/* VITUFE VIWILI: TAZAMA GARI vs ULIZIA SASA */}
                      {car.tag === 'SOLD' ? (
                        <button disabled className="w-full py-1.5 bg-gray-200 text-gray-400 text-xs font-bold rounded cursor-not-allowed border border-gray-300">
                          Gari Limeuzwa
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <Link href={`/vehicles/${car.id}`} className="flex-1 flex items-center justify-center py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded hover:bg-blue-100 transition-colors border border-blue-200">
                            Tazama Gari
                          </Link>
                          <button onClick={() => openInquiry(car)} className="flex-1 py-1.5 bg-gray-900 text-white text-xs font-bold rounded hover:bg-gray-800 transition-colors shadow-sm">
                            Ulizia
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
          </div>
        </div>
      </div>

      {/* --- 6. MAGARI YANAYOPENDWA ZAIDI (TRENDING CARS) --- */}
      <div className="bg-white py-12 border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">{currentT.trendingTitle}</h2>
              <p className="mt-1 text-sm text-gray-500">{currentT.trendingDesc}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-x-auto pb-4">
            {trendingCars.map((car) => (
              <div key={car.id} onClick={() => openInquiry({title: car.title, stockId: 'TRENDING', img: car.img, cif: car.price})} className="text-center group cursor-pointer relative block">
                <div className="rounded-full w-32 h-32 mx-auto overflow-hidden border-4 border-gray-50 group-hover:border-blue-100 shadow-sm transition-all mb-3 bg-gray-100 flex items-center justify-center">
                  <img src={getSafeImage(car.img)} alt={car.title} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image'} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">{car.title}</h4>
                <p className="text-xs text-blue-600 font-semibold">{car.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- 7. SPARE PARTS & DIAGNOSTIC TOOLS --- */}
      <div id="spares" className="bg-gray-900 py-16 text-white border-b-8 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white">{currentT.sparesTitle}</h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">{currentT.sparesDesc}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors group">
              <div className="w-14 h-14 bg-gray-700 rounded-lg flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 transition-colors">⚙️</div>
              <h3 className="text-xl font-bold mb-3">{currentT.spare1Title}</h3>
              <p className="text-gray-400 text-sm mb-6">{currentT.spare1Desc}</p>
              <Link href="/spares" className="text-blue-400 font-bold text-sm hover:text-white flex items-center gap-2">View Catalog <span>➔</span></Link>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-[10px] font-bold px-3 py-1 rounded-bl-lg">PRO TOOLS</div>
              <div className="w-14 h-14 bg-gray-700 rounded-lg flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 transition-colors">💻</div>
              <h3 className="text-xl font-bold mb-3">{currentT.spare2Title}</h3>
              <p className="text-gray-400 text-sm mb-6">{currentT.spare2Desc}</p>
              <Link href="/spares" className="text-blue-400 font-bold text-sm hover:text-white flex items-center gap-2">Shop Diagnostic Tools <span>➔</span></Link>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors group">
              <div className="w-14 h-14 bg-gray-700 rounded-lg flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 transition-colors">🏎️</div>
              <h3 className="text-xl font-bold mb-3">{currentT.spare3Title}</h3>
              <p className="text-gray-400 text-sm mb-6">{currentT.spare3Desc}</p>
              <Link href="/spares" className="text-blue-400 font-bold text-sm hover:text-white flex items-center gap-2">Browse Accessories <span>➔</span></Link>
            </div>
          </div>
        </div>
      </div>

      {/* --- 8. HOW WE WORK (JINSI TUNAVYOFANYA KAZI) --- */}
      <div id="howitworks" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">{currentT.howWorkTitle}</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">{currentT.howWorkDesc}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4 z-10 relative shadow-sm border-2 border-white">1</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{currentT.step1Title}</h3>
              <p className="text-sm text-gray-500">{currentT.step1Desc}</p>
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 -z-0"></div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4 z-10 relative shadow-sm border-2 border-white">2</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{currentT.step2Title}</h3>
              <p className="text-sm text-gray-500">{currentT.step2Desc}</p>
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 -z-0"></div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4 z-10 relative shadow-sm border-2 border-white">3</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{currentT.step3Title}</h3>
              <p className="text-sm text-gray-500">{currentT.step3Desc}</p>
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 -z-0"></div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 z-10 relative shadow-md border-2 border-white">4</div>
              <h3 className="text-lg font-bold text-blue-600 mb-2">{currentT.step4Title}</h3>
              <p className="text-sm text-gray-500">{currentT.step4Desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- 9. COST CALCULATOR SECTION --- */}
      <div id="calculator" className="bg-gray-100 py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row">
            <div className="p-8 lg:p-10 lg:w-1/2 text-white flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">{currentT.calcTitle}</h2>
              <p className="text-blue-100 text-sm sm:text-base mb-6">{currentT.calcDesc}</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3"><span className="bg-blue-500 p-1 rounded-full text-xs">✓</span> Makadirio ya Meli (Freight)</li>
                <li className="flex items-center gap-3"><span className="bg-blue-500 p-1 rounded-full text-xs">✓</span> Makadirio ya Ushuru (TRA Taxes)</li>
                <li className="flex items-center gap-3"><span className="bg-blue-500 p-1 rounded-full text-xs">✓</span> Ada zetu za Huduma ziko wazi</li>
              </ul>
            </div>
            <div className="bg-white p-8 lg:p-10 lg:w-1/2">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">{currentT.calcInput}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 font-bold">$</span></div>
                  <input type="number" value={fobPrice} onChange={(e) => setFobPrice(e.target.value ? Number(e.target.value) : '')} className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none text-lg font-semibold" placeholder="Mfano: 3500" />
                </div>
              </div>
              <div className="bg-gray-50 rounded p-5 border border-gray-200">
                <h3 className="text-gray-500 font-bold mb-4 text-xs uppercase tracking-wider">{currentT.calcResult}</h3>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between text-gray-700"><span>Bei ya Gari (FOB):</span><span className="font-medium">TZS {(fobTZS).toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-700"><span>Usafiri wa Meli (Freight):</span><span className="font-medium">TZS {(freightTZS).toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-700 border-b border-gray-200 pb-2"><span>Makadirio Ushuru (TRA):</span><span className="font-medium text-red-500">+ TZS {(estimatedTaxTZS).toLocaleString()}</span></div>
                </div>
                <div className="flex justify-between items-end mt-3">
                  <span className="text-sm font-bold text-gray-900">{currentT.calcTotal}</span>
                  <span className="text-xl sm:text-2xl font-black text-blue-600">TZS {typeof fobPrice === 'number' && fobPrice > 0 ? (totalCostTZS).toLocaleString() : '0'}</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-3 text-center">*Makadirio haya hayajumuishi uhalisia wa CC na mwaka wa gari husika TRA.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- 10. CUSTOMER TESTIMONIALS --- */}
      <div className="bg-gray-50 py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900">{currentT.testiTitle}</h2>
            <p className="mt-2 text-lg text-gray-500">{currentT.testiDesc}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 italic text-gray-600 text-sm">
              "Gari Hub walinisaidia kupata Subaru Forester niliyokuwa naitafuta mtandaoni. Niliwatumia picha tu, wakanipa quotation ya haraka na ndani ya wiki 5 gari ilikuwa Dar es Salaam."
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold not-italic">JM</div>
                <div><p className="font-bold text-gray-900 not-italic">Juma M.</p><p className="text-xs text-gray-400 not-italic">Dar es Salaam</p></div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 italic text-gray-600 text-sm">
              "Huduma yao ya wateja iko juu sana. Nilikuwa nafuatilia gari langu kwenye mfumo wao kuanzia linapakiwa Japan mpaka likishuka bandarini. Uwazi wao ni asilimia 100%."
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold not-italic">AK</div>
                <div><p className="font-bold text-gray-900 not-italic">Asha K.</p><p className="text-xs text-gray-400 not-italic">Arusha</p></div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 italic text-gray-600 text-sm">
              "Kikokotozi chao kilinipa picha halisi ya kiasi nilichotakiwa kuwa nacho kwa ajili ya ushuru. Hakukuwa na 'hidden fees' wala longolongo wakati wa kutoa gari."
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold not-italic">EF</div>
                <div><p className="font-bold text-gray-900 not-italic">Emmanuel F.</p><p className="text-xs text-gray-400 not-italic">Mwanza</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 11. PROFESSIONAL FOOTER WITH TRUST BADGES (PESASHIP REMOVED) --- */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 border-t-4 border-blue-600 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gray-800 rounded-xl p-6 mb-12 flex flex-col md:flex-row justify-around items-center gap-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏦</span>
              <div><p className="font-bold text-sm text-green-400">100% Secure Payments</p><p className="text-xs text-gray-400">Company Bank Accounts</p></div>
            </div>
            <div className="hidden md:block w-px h-10 bg-gray-600"></div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚢</span>
              <div><p className="font-bold text-sm text-blue-400">Global Shipping</p><p className="text-xs text-gray-400">RoRo & Container Options</p></div>
            </div>
            <div className="hidden md:block w-px h-10 bg-gray-600"></div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛡️</span>
              <div><p className="font-bold text-sm text-yellow-400">Verified Condition</p><p className="text-xs text-gray-400">Auction Sheet Provided</p></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Link href="/" className="text-3xl font-extrabold text-blue-500 tracking-tight mb-4 inline-block">
                Gari<span className="text-white">Hub</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Jukwaa la kimataifa la kuagiza magari yenye ubora na vipuri original moja kwa moja hadi mlangoni kwako.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/#magari" className="hover:text-blue-400 transition-colors">Tafuta Gari (Inventory)</Link></li>
                <li><Link href="/spares" className="hover:text-blue-400 transition-colors">Vipuri na Vifaa</Link></li>
                <li><Link href="/#calculator" className="hover:text-blue-400 transition-colors">Kikokotozi cha Ushuru</Link></li>
                <li><Link href="/#howitworks" className="hover:text-blue-400 transition-colors">Jinsi ya Kuagiza</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Huduma Zetu</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-blue-400 transition-colors">Kuagiza Magari</Link></li>
                <li><Link href="/" className="hover:text-blue-400 transition-colors">Usafirishaji (Logistics)</Link></li>
                <li><Link href="/spares" className="hover:text-blue-400 transition-colors">Vifaa vya Diagnostic (OBD2)</Link></li>
                <li><Link href="/" className="hover:text-blue-400 transition-colors">Huduma za Forodha (Clearing)</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Wasiliana Nasi</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-3"><span className="text-blue-500">📍</span><span>Dar es Salaam, Tanzania</span></li>
                <li className="flex items-center gap-3"><span className="text-blue-500">📞</span><span>+255 700 000 000</span></li>
                <li className="flex items-center gap-3"><span className="text-blue-500">📧</span><span>info@garihub.co.tz</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Gari Hub. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0"><Link href="/" className="hover:text-white">Terms of Service</Link><Link href="/" className="hover:text-white">Privacy Policy</Link></div>
          </div>
        </div>
      </footer>

    </main>
  );
}