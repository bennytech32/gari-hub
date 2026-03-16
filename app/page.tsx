"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [lang, setLang] = useState<'sw' | 'en'>('sw');
  const [currency, setCurrency] = useState<'USD' | 'TZS' | 'KES' | 'UGX'>('TZS');
  const [port, setPort] = useState<'Dar es Salaam' | 'Mombasa' | 'Maputo'>('Dar es Salaam');
  
  const [fobPrice, setFobPrice] = useState<number | ''>('');
  const [fileName, setFileName] = useState<string | null>(null);

  // --- ADMIN SYSTEM STATES ---
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTrendingForm, setShowTrendingForm] = useState(false);
  
  // Dynamic State for Showroom Cars
  const [showroomCars, setShowroomCars] = useState([
    { id: 1, stockId: "GH-10293", title: "Subaru Forester 2.0XT", year: "2016", trans: "Manual", km: "65k km", fob: "$4,500", cif: "$5,700", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=500&q=80", tag: "HOT", liked: false },
    { id: 2, stockId: "GH-88392", title: "Mercedes C200 (UK)", year: "2018", trans: "Auto", km: "42k km", fob: "$18,200", cif: "$19,600", img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=500&q=80", tag: "", liked: true },
    { id: 3, stockId: "GH-44921", title: "Toyota Crown Athlete", year: "2015", trans: "Hybrid", km: "82k km", fob: "$6,200", cif: "$7,400", img: "https://images.unsplash.com/photo-1550427739-cecebea3014a?auto=format&fit=crop&w=500&q=80", tag: "NEW", liked: false },
    { id: 4, stockId: "GH-77210", title: "Toyota Land Cruiser Prado", year: "2017", trans: "Diesel", km: "50k km", fob: "$28,500", cif: "$31,000", img: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=500&q=80", tag: "", liked: false },
    { id: 5, stockId: "GH-33928", title: "Honda Fit Hybrid", year: "2015", trans: "Auto", km: "70k km", fob: "$3,200", cif: "$4,500", img: "https://images.unsplash.com/photo-1605810756708-41270f209635?auto=format&fit=crop&w=500&q=80", tag: "", liked: false },
    { id: 6, stockId: "GH-22910", title: "Mazda CX-5", year: "2016", trans: "Diesel", km: "55k km", fob: "$8,500", cif: "$9,900", img: "https://images.unsplash.com/photo-1552054611-66c306d8a39a?auto=format&fit=crop&w=500&q=80", tag: "", liked: false },
    { id: 7, stockId: "GH-99382", title: "Nissan X-Trail", year: "2015", trans: "Auto", km: "62k km", fob: "$6,800", cif: "$8,100", img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&w=500&q=80", tag: "", liked: false },
    { id: 8, stockId: "GH-55392", title: "Toyota Hilux Double Cab", year: "2018", trans: "Manual", km: "40k km", fob: "$22,000", cif: "$24,500", img: "https://images.unsplash.com/photo-1599818815153-625d970eabac?auto=format&fit=crop&w=500&q=80", tag: "HOT", liked: false }
  ]);

  const [trendingCars, setTrendingCars] = useState([
    { id: 1, title: "Toyota IST", price: "Kuanzia $1,500 FOB", img: "https://images.unsplash.com/photo-1626084478170-058df3531b40?auto=format&fit=crop&w=300&q=80" },
    { id: 2, title: "Toyota Harrier", price: "Kuanzia $12,000 FOB", img: "https://images.unsplash.com/photo-1542316410-b38466133eb6?auto=format&fit=crop&w=300&q=80" },
    { id: 3, title: "BMW 3 Series (UK)", price: "Kuanzia $9,500 FOB", img: "https://images.unsplash.com/photo-1506015391300-415214044018?auto=format&fit=crop&w=300&q=80" },
    { id: 4, title: "Subaru Impreza", price: "Kuanzia $3,000 FOB", img: "https://images.unsplash.com/photo-1549453295-8bd2870195e2?auto=format&fit=crop&w=300&q=80" }
  ]);

  const [newCar, setNewCar] = useState({ stockId: '', title: '', year: '', trans: 'Auto', km: '', fob: '', cif: '', img: '', tag: 'NEW' });
  const [newTrendingCar, setNewTrendingCar] = useState({ title: '', price: '', img: '' });

  const handleAdminPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageUrl = URL.createObjectURL(e.target.files[0]);
      setNewCar({ ...newCar, img: imageUrl });
    }
  };

  const handleTrendingPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageUrl = URL.createObjectURL(e.target.files[0]);
      setNewTrendingCar({ ...newTrendingCar, img: imageUrl });
    }
  };

  const submitNewCar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCar.title || !newCar.img) return alert(lang === 'sw' ? "Tafadhali weka jina la gari na picha!" : "Please add a car title and image!");
    const newCarData = { id: Date.now(), liked: false, ...newCar };
    setShowroomCars([newCarData, ...showroomCars]);
    setNewCar({ stockId: '', title: '', year: '', trans: 'Auto', km: '', fob: '', cif: '', img: '', tag: 'NEW' });
    setShowAddForm(false);
  };

  const submitNewTrendingCar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrendingCar.title || !newTrendingCar.img) return alert(lang === 'sw' ? "Tafadhali weka jina na picha!" : "Please add a title and image!");
    const newCarData = { id: Date.now(), ...newTrendingCar };
    setTrendingCars([newCarData, ...trendingCars]); 
    setNewTrendingCar({ title: '', price: '', img: '' });
    setShowTrendingForm(false);
  };

  const toggleLike = (id: number) => {
    setShowroomCars(showroomCars.map(car => car.id === id ? { ...car, liked: !car.liked } : car));
  };
  // --- END ADMIN SYSTEM STATES ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
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
    <main className="min-h-screen bg-gray-50 pb-0 font-sans text-gray-800">
      
      {/* --- 1. GLOBAL TOP BAR (Currency, Port, Language) --- */}
      <div className="bg-gray-900 text-white text-xs py-2 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center z-50 relative gap-2 sm:gap-0">
        <div className="flex gap-4">
          <span>📧 info@garihub.co.tz</span>
          <span className="hidden sm:inline">📞 +255 700 000 000</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 bg-gray-800 rounded px-2 py-1 flex-wrap justify-center">
          <button onClick={() => setIsAdminMode(!isAdminMode)} className={`mr-2 font-bold px-2 rounded ${isAdminMode ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}>
            {isAdminMode ? 'Admin: ON' : 'Admin: OFF'}
          </button>
          <div className="flex items-center gap-1 border-l border-gray-600 pl-2">
            <span className="text-gray-400">⚓ Port:</span>
            <select value={port} onChange={(e) => setPort(e.target.value as any)} className="bg-transparent text-blue-400 font-bold outline-none cursor-pointer">
              <option value="Dar es Salaam" className="bg-gray-800">Dar es Salaam</option>
              <option value="Mombasa" className="bg-gray-800">Mombasa</option>
              <option value="Maputo" className="bg-gray-800">Maputo</option>
            </select>
          </div>
          <div className="flex items-center gap-1 border-l border-gray-600 pl-2">
            <span className="text-gray-400">💵 Curr:</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as any)} className="bg-transparent text-green-400 font-bold outline-none cursor-pointer">
              <option value="USD" className="bg-gray-800">USD</option>
              <option value="TZS" className="bg-gray-800">TZS</option>
              <option value="KES" className="bg-gray-800">KES</option>
              <option value="UGX" className="bg-gray-800">UGX</option>
            </select>
          </div>
          <div className="flex items-center gap-1 border-l border-gray-600 pl-2">
             <button onClick={() => setLang('sw')} className={`font-bold ${lang === 'sw' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>SW</button>
             <span className="text-gray-600">|</span>
             <button onClick={() => setLang('en')} className={`font-bold ${lang === 'en' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>EN</button>
          </div>
        </div>
      </div>

      {/* --- 2. NAVIGATION BAR --- */}
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
              <Link href="#spares" className="text-gray-500 hover:text-blue-600 px-1 py-2 font-medium transition-colors text-sm">{currentT.sparesMenu}</Link>
              <Link href="#howitworks" className="text-gray-500 hover:text-blue-600 px-1 py-2 font-medium transition-colors text-sm">{currentT.howWorkTitle}</Link>
              <Link href="#calculator" className="text-gray-500 hover:text-blue-600 px-1 py-2 font-medium transition-colors text-sm">{currentT.calcMenu}</Link>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button className="text-gray-600 hover:text-blue-600 font-bold text-sm flex items-center gap-1">
                 ❤️ <span className="hidden lg:inline">Wishlist ({showroomCars.filter(c => c.liked).length})</span>
              </button>
              <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md text-sm">
                Client Portal
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- 3. HERO SECTION & PHOTO UPLOAD --- */}
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
                  <span>{fileName ? currentT.uploadChange : currentT.uploadBtn}</span>
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
                </label>
                {fileName && (
                  <div className="mt-3 flex items-center gap-2 text-green-700 font-medium bg-green-100 px-3 py-1.5 rounded-lg border border-green-300 w-full justify-center text-xs">
                    <span className="truncate max-w-[150px]">{fileName}</span> {currentT.uploadSuccess}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 4. ADVANCED QUICK SEARCH --- */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-8 z-30">
        <div className="bg-white rounded-xl shadow-xl p-4 md:p-6 border-t-4 border-blue-600">
          <form className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">{currentT.searchMake}</label>
              <select className="w-full border border-gray-300 rounded md:p-2.5 p-3 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option>All Makes</option><option>Toyota</option><option>Subaru</option><option>Mercedes</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">{currentT.searchModel}</label>
              <select className="w-full border border-gray-300 rounded md:p-2.5 p-3 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option>Any Model</option><option>Forester</option><option>Crown</option><option>Harrier</option>
              </select>
            </div>
            <div className="lg:col-span-1 flex gap-2">
              <div className="w-1/2">
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Min Year</label>
                <select className="w-full border border-gray-300 rounded md:p-2.5 p-3 text-sm focus:ring-blue-500 outline-none"><option>Min</option><option>2014</option></select>
              </div>
              <div className="w-1/2">
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Max Year</label>
                <select className="w-full border border-gray-300 rounded md:p-2.5 p-3 text-sm focus:ring-blue-500 outline-none"><option>Max</option><option>2024</option></select>
              </div>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">{currentT.searchBody}</label>
              <select className="w-full border border-gray-300 rounded md:p-2.5 p-3 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option>All Types</option><option>SUV</option><option>Sedan</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">{currentT.searchBudget}</label>
              <select className="w-full border border-gray-300 rounded md:p-2.5 p-3 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option>No Limit</option><option>$3,000</option><option>$5,000</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <button type="button" className="w-full bg-blue-600 text-white md:p-2.5 p-3 rounded font-bold hover:bg-blue-700 transition-colors shadow-sm flex justify-center items-center gap-2 text-sm">
                🔍 {currentT.searchBtn}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- 5. MAIN CONTENT AREA: SIDEBAR (LEFT) & SHOWROOM GRID (RIGHT) --- */}
      <div id="magari" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT AREA: COMPREHENSIVE SIDEBAR */}
          <div className="lg:w-1/4 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 sticky top-24 overflow-y-auto max-h-[85vh] custom-scrollbar">
              
              {/* SECTION 1: SHOP BY BODY TYPE */}
              <h2 className="text-lg font-extrabold text-gray-900 mb-4 pb-2 border-b border-gray-200">{currentT.shopByType}</h2>
              <div className="flex flex-col gap-2">
                <div className="bg-gray-50 py-2.5 px-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-500 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3"><span className="text-xl group-hover:scale-110 transition-transform">🚙</span><span className="font-bold text-sm text-gray-700 group-hover:text-blue-600">{currentT.typeSUV}</span></div>
                  <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">240</span>
                </div>
                <div className="bg-gray-50 py-2.5 px-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-500 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3"><span className="text-xl group-hover:scale-110 transition-transform">🚗</span><span className="font-bold text-sm text-gray-700 group-hover:text-blue-600">{currentT.typeSedan}</span></div>
                  <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">185</span>
                </div>
                <div className="bg-gray-50 py-2.5 px-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-500 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3"><span className="text-xl group-hover:scale-110 transition-transform">🚕</span><span className="font-bold text-sm text-gray-700 group-hover:text-blue-600">{currentT.typeHatch}</span></div>
                  <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">320</span>
                </div>
                <div className="bg-gray-50 py-2.5 px-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-500 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3"><span className="text-xl group-hover:scale-110 transition-transform">🛻</span><span className="font-bold text-sm text-gray-700 group-hover:text-blue-600">{currentT.typePickup}</span></div>
                  <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">95</span>
                </div>
                <div className="bg-gray-50 py-2.5 px-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-500 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3"><span className="text-xl group-hover:scale-110 transition-transform">🚐</span><span className="font-bold text-sm text-gray-700 group-hover:text-blue-600">{currentT.typeVan}</span></div>
                  <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">112</span>
                </div>
              </div>

              {/* SECTION 2: SHOP BY MAKE (NEW) */}
              <h2 className="text-lg font-extrabold text-gray-900 mb-4 mt-8 pb-2 border-b border-gray-200">{currentT.shopByMake}</h2>
              <div className="flex flex-col gap-2">
                <div className="bg-gray-50 py-2.5 px-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-500 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3"><span className="text-lg text-gray-400 group-hover:text-blue-600">🔹</span><span className="font-bold text-sm text-gray-700 group-hover:text-blue-600">Toyota</span></div>
                  <span className="text-xs text-gray-400">4,520</span>
                </div>
                <div className="bg-gray-50 py-2.5 px-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-500 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3"><span className="text-lg text-gray-400 group-hover:text-blue-600">🔹</span><span className="font-bold text-sm text-gray-700 group-hover:text-blue-600">Subaru</span></div>
                  <span className="text-xs text-gray-400">850</span>
                </div>
                <div className="bg-gray-50 py-2.5 px-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-500 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3"><span className="text-lg text-gray-400 group-hover:text-blue-600">🔹</span><span className="font-bold text-sm text-gray-700 group-hover:text-blue-600">Mercedes-Benz</span></div>
                  <span className="text-xs text-gray-400">620</span>
                </div>
                <div className="bg-gray-50 py-2.5 px-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-500 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3"><span className="text-lg text-gray-400 group-hover:text-blue-600">🔹</span><span className="font-bold text-sm text-gray-700 group-hover:text-blue-600">Honda</span></div>
                  <span className="text-xs text-gray-400">1,200</span>
                </div>
                <div className="bg-gray-50 py-2.5 px-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-500 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3"><span className="text-lg text-gray-400 group-hover:text-blue-600">🔹</span><span className="font-bold text-sm text-gray-700 group-hover:text-blue-600">Nissan</span></div>
                  <span className="text-xs text-gray-400">940</span>
                </div>
              </div>

              {/* SECTION 3: SHOP BY PRICE (NEW) */}
              <h2 className="text-lg font-extrabold text-gray-900 mb-4 mt-8 pb-2 border-b border-gray-200">{currentT.shopByPrice}</h2>
              <div className="flex flex-col gap-2">
                <div className="bg-gray-50 py-2.5 px-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:border-green-500 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3"><span className="text-lg text-green-500">💵</span><span className="font-bold text-sm text-gray-700 group-hover:text-green-600">Under $2,000</span></div>
                </div>
                <div className="bg-gray-50 py-2.5 px-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:border-green-500 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3"><span className="text-lg text-green-500">💵</span><span className="font-bold text-sm text-gray-700 group-hover:text-green-600">$2,000 - $5,000</span></div>
                </div>
                <div className="bg-gray-50 py-2.5 px-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:border-green-500 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3"><span className="text-lg text-green-500">💵</span><span className="font-bold text-sm text-gray-700 group-hover:text-green-600">$5,000 - $10,000</span></div>
                </div>
                <div className="bg-gray-50 py-2.5 px-4 rounded shadow-sm border border-gray-100 flex items-center justify-between hover:border-green-500 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3"><span className="text-lg text-green-500">💵</span><span className="font-bold text-sm text-gray-700 group-hover:text-green-600">Over $10,000</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT AREA: SHOWROOM GRID */}
          <div className="lg:w-3/4 order-1 lg:order-2">
            
            {/* Admin Post Controls for Showroom */}
            {isAdminMode && (
              <div className="mb-8 p-6 bg-green-50 border-2 border-green-500 rounded-xl shadow-lg relative">
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">ADMIN: SHOWROOM</div>
                <h3 className="text-xl font-bold text-green-900 mb-4">Meneja: Pakia Gari Jipya Showroom</h3>
                
                {!showAddForm ? (
                  <button onClick={() => setShowAddForm(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow flex items-center gap-2">
                    ➕ Ongeza Gari Showroom
                  </button>
                ) : (
                  <form onSubmit={submitNewCar} className="bg-white p-5 rounded-lg border border-green-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Picha ya Gari</label>
                      <input type="file" accept="image/*" onChange={handleAdminPhotoUpload} className="w-full border border-gray-300 p-2 rounded" />
                      {newCar.img && <img src={newCar.img} alt="Preview" className="mt-2 h-20 rounded object-cover border" />}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Jina la Gari (Make & Model)</label>
                      <input type="text" value={newCar.title} onChange={(e) => setNewCar({...newCar, title: e.target.value})} placeholder="Mfano: Toyota Land Cruiser" className="w-full border border-gray-300 p-2 rounded outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Stock ID (Ref No.)</label>
                      <input type="text" value={newCar.stockId} onChange={(e) => setNewCar({...newCar, stockId: e.target.value})} placeholder="GH-1001" className="w-full border border-gray-300 p-2 rounded outline-none font-mono" required />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Mwaka</label>
                        <input type="text" value={newCar.year} onChange={(e) => setNewCar({...newCar, year: e.target.value})} placeholder="2018" className="w-full border border-gray-300 p-2 rounded outline-none" />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Gia (Trans)</label>
                        <select value={newCar.trans} onChange={(e) => setNewCar({...newCar, trans: e.target.value})} className="w-full border border-gray-300 p-2 rounded outline-none">
                          <option>Auto</option><option>Manual</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Mileage (Km)</label>
                      <input type="text" value={newCar.km} onChange={(e) => setNewCar({...newCar, km: e.target.value})} placeholder="45k km" className="w-full border border-gray-300 p-2 rounded outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Label (Tag)</label>
                      <select value={newCar.tag} onChange={(e) => setNewCar({...newCar, tag: e.target.value})} className="w-full border border-gray-300 p-2 rounded outline-none">
                        <option value="NEW">NEW</option><option value="HOT">HOT</option><option value="SOLD">SOLD</option><option value="">None</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Bei ya FOB ($)</label>
                      <input type="text" value={newCar.fob} onChange={(e) => setNewCar({...newCar, fob: e.target.value})} placeholder="$15,000" className="w-full border border-gray-300 p-2 rounded outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Makadirio CIF Dar ($)</label>
                      <input type="text" value={newCar.cif} onChange={(e) => setNewCar({...newCar, cif: e.target.value})} placeholder="$17,500" className="w-full border border-gray-300 p-2 rounded outline-none" />
                    </div>
                    
                    <div className="md:col-span-2 flex gap-3 mt-2">
                      <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 flex-1">Pakia Gari (Post Car)</button>
                      <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-300 text-gray-800 px-6 py-2 rounded font-bold hover:bg-gray-400">Ghairi</button>
                    </div>
                  </form>
                )}
              </div>
            )}
            
            <div className="flex justify-between items-end mb-6 border-b pb-2">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">{currentT.featTitle}</h2>
                <p className="mt-1 text-sm text-gray-500">{currentT.featDesc}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-xs font-bold bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-50 text-gray-700">Sort: Newest</button>
              </div>
            </div>

            {/* Dynamic Grid Mapping over showroomCars State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {showroomCars.map((car) => (
                <div key={car.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200 flex flex-col relative group">
                  
                  {car.tag && (
                    <div className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded z-10 ${car.tag === 'HOT' ? 'bg-red-600' : car.tag === 'SOLD' ? 'bg-gray-800' : 'bg-green-600'}`}>
                      {car.tag}
                    </div>
                  )}

                  <button 
                    onClick={() => toggleLike(car.id)}
                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full z-10 hover:bg-white shadow-sm transition-transform hover:scale-110"
                    title="Add to Wishlist"
                  >
                    {car.liked ? <span className="text-red-500 text-lg leading-none">❤️</span> : <span className="text-gray-400 text-lg leading-none">🤍</span>}
                  </button>

                  <div className="relative h-36 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {car.img ? <img src={car.img} alt={car.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <span className="text-gray-400 text-xs">No Image</span>}
                  </div>
                  <div className="p-3 flex-grow flex flex-col">
                    <p className="text-[10px] text-gray-400 font-mono mb-0.5 tracking-wider">Ref: {car.stockId}</p>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight truncate mb-1" title={car.title}>{car.title}</h3>
                    <p className="text-gray-500 text-[11px] mb-2">{car.year} • {car.trans} • {car.km}</p>
                    <div className="bg-gray-50 p-2 rounded border border-gray-100 mb-3 mt-auto">
                      <div className="flex justify-between text-[11px] mb-0.5">
                         <span className="text-gray-500">FOB:</span>
                         <span className="font-bold text-gray-800">{car.fob}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                         <span className="text-blue-700 font-semibold">CIF {port}:</span>
                         <span className="font-bold text-blue-700">{car.cif}</span>
                      </div>
                    </div>
                    {isAdminMode ? (
                       <button onClick={() => setShowroomCars(showroomCars.filter(c => c.id !== car.id))} className="w-full py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded hover:bg-red-200 transition-colors">Futa Gari (Delete)</button>
                    ) : (
                       <button className="w-full py-1.5 bg-gray-900 text-white text-xs font-bold rounded hover:bg-black transition-colors">Inquire Now</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>

      {/* --- 6. MAGARI YANAYOPENDWA ZAIDI (TRENDING CARS) --- */}
      <div className="bg-white py-12 border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {isAdminMode && (
            <div className="mb-8 p-6 bg-blue-50 border-2 border-blue-400 rounded-xl shadow-lg relative">
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">ADMIN: TRENDING</div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">Meneja: Badilisha Magari Yanayotamba (Trending)</h3>
              
              {!showTrendingForm ? (
                <button onClick={() => setShowTrendingForm(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow flex items-center gap-2">
                  ➕ Ongeza Gari Linayotamba
                </button>
              ) : (
                <form onSubmit={submitNewTrendingCar} className="bg-white p-5 rounded-lg border border-blue-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Picha ya Gari</label>
                    <input type="file" accept="image/*" onChange={handleTrendingPhotoUpload} className="w-full border border-gray-300 p-2 rounded" />
                    {newTrendingCar.img && <img src={newTrendingCar.img} alt="Preview" className="mt-2 h-20 w-20 rounded-full object-cover border-4 border-gray-100" />}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Jina la Gari</label>
                    <input type="text" value={newTrendingCar.title} onChange={(e) => setNewTrendingCar({...newTrendingCar, title: e.target.value})} placeholder="Mfano: Toyota Vanguard" className="w-full border border-gray-300 p-2 rounded outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Bei (Text)</label>
                    <input type="text" value={newTrendingCar.price} onChange={(e) => setNewTrendingCar({...newTrendingCar, price: e.target.value})} placeholder="Kuanzia $5,000 FOB" className="w-full border border-gray-300 p-2 rounded outline-none" required />
                  </div>
                  <div className="md:col-span-2 flex gap-3 mt-2">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 flex-1">Post Trending Car</button>
                    <button type="button" onClick={() => setShowTrendingForm(false)} className="bg-gray-300 text-gray-800 px-6 py-2 rounded font-bold hover:bg-gray-400">Ghairi</button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">{currentT.trendingTitle}</h2>
              <p className="mt-1 text-sm text-gray-500">{currentT.trendingDesc}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-x-auto pb-4">
            {trendingCars.map((car) => (
              <div key={car.id} className="text-center group cursor-pointer relative">
                {isAdminMode && (
                  <button onClick={() => setTrendingCars(trendingCars.filter(c => c.id !== car.id))} className="absolute top-0 right-0 z-20 bg-red-500 text-white w-6 h-6 rounded-full font-bold hover:bg-red-700 flex items-center justify-center text-xs shadow-md">X</button>
                )}
                <div className="rounded-full w-32 h-32 mx-auto overflow-hidden border-4 border-gray-50 group-hover:border-blue-100 shadow-sm transition-all mb-3 bg-gray-100 flex items-center justify-center">
                  {car.img ? <img src={car.img} alt={car.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <span className="text-xs text-gray-400">No Img</span>}
                </div>
                <h4 className="font-bold text-gray-900 text-sm truncate">{car.title}</h4>
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
              <button className="text-blue-400 font-bold text-sm hover:text-white flex items-center gap-2">View Catalog <span>➔</span></button>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-[10px] font-bold px-3 py-1 rounded-bl-lg">PRO TOOLS</div>
              <div className="w-14 h-14 bg-gray-700 rounded-lg flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 transition-colors">💻</div>
              <h3 className="text-xl font-bold mb-3">{currentT.spare2Title}</h3>
              <p className="text-gray-400 text-sm mb-6">{currentT.spare2Desc}</p>
              <button className="text-blue-400 font-bold text-sm hover:text-white flex items-center gap-2">Shop Diagnostic Tools <span>➔</span></button>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors group">
              <div className="w-14 h-14 bg-gray-700 rounded-lg flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 transition-colors">🏎️</div>
              <h3 className="text-xl font-bold mb-3">{currentT.spare3Title}</h3>
              <p className="text-gray-400 text-sm mb-6">{currentT.spare3Desc}</p>
              <button className="text-blue-400 font-bold text-sm hover:text-white flex items-center gap-2">Browse Accessories <span>➔</span></button>
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

      {/* --- 11. PROFESSIONAL FOOTER WITH TRUST BADGES --- */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 border-t-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gray-800 rounded-xl p-6 mb-12 flex flex-col md:flex-row justify-around items-center gap-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔒</span>
              <div><p className="font-bold text-sm text-green-400">100% Secure Payments</p><p className="text-xs text-gray-400">Pesaship Escrow Supported</p></div>
            </div>
            <div className="hidden md:block w-px h-10 bg-gray-600"></div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚢</span>
              <div><p className="font-bold text-sm text-blue-400">Global Shipping</p><p className="text-xs text-gray-400">Japan, UK, China to Africa</p></div>
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
                <li><a href="#magari" className="hover:text-blue-400 transition-colors">Tafuta Gari (Inventory)</a></li>
                <li><a href="#spares" className="hover:text-blue-400 transition-colors">Vipuri na Vifaa vya ECU</a></li>
                <li><a href="#calculator" className="hover:text-blue-400 transition-colors">Kikokotozi cha Ushuru</a></li>
                <li><a href="#howitworks" className="hover:text-blue-400 transition-colors">Jinsi ya Kuagiza</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Huduma Zetu</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Kuagiza Magari</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Usafirishaji (Logistics)</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Vifaa vya Diagnostic (OBD2)</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Huduma za Forodha (Clearing)</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Wasiliana Nasi</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-3"><span className="text-blue-500">📍</span><span>Kariakoo / Posta,<br/>Dar es Salaam, Tanzania</span></li>
                <li className="flex items-center gap-3"><span className="text-blue-500">📞</span><span>+255 700 000 000</span></li>
                <li className="flex items-center gap-3"><span className="text-blue-500">📧</span><span>info@garihub.co.tz</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Gari Hub (Tuagize Project). All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0"><a href="#" className="hover:text-white">Terms of Service</a><a href="#" className="hover:text-white">Privacy Policy</a></div>
          </div>
        </div>
      </footer>

    </main>
  );
}