"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function SparesPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [inquiryData, setInquiryData] = useState({ name: '', phone: '', message: 'Nahisi kuvutiwa na hiki kifaa/kipuri. Naomba kujua bei na upatikanaji wake.' });

  // MOCK DATA: Bidhaa za Vipuri na Vifaa vya ECU/Diagnostics
  const allProducts = [
    { id: 1, name: "Autel MaxiIM IM608 Pro", category: "ECU & Diagnostics", price: "$2,850", img: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=400&q=80", desc: "Kifaa cha kisasa cha kupogramu funguo na ECU kwa magari yote.", tag: "PRO TOOL" },
    { id: 2, name: "Toyota Genuine Motor Oil 5W-30", category: "Service Kits", price: "$45", img: "https://images.unsplash.com/photo-1622204561331-155e88fc5d1f?auto=format&fit=crop&w=400&q=80", desc: "Oil halisi ya Toyota kwa ajili ya kulinda injini yako (Lita 4).", tag: "HOT" },
    { id: 3, name: "KESS3 ECU & TCU Programmer", category: "ECU & Diagnostics", price: "$1,200", img: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80", desc: "Master tool kwa ajili ya Chiptuning na ECU Remapping.", tag: "NEW" },
    { id: 4, name: "Subaru Forester SJ Front Bumper", category: "Body Parts", price: "$320", img: "https://images.unsplash.com/photo-1605810730811-4ebc3f683e20?auto=format&fit=crop&w=400&q=80", desc: "Bumper original la mbele kwa Subaru Forester (2013-2018).", tag: "" },
    { id: 5, name: "Brembo Ceramic Brake Pads", category: "Brakes & Suspension", price: "$85", img: "https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&w=400&q=80", desc: "Pedi za breki zenye uwezo mkubwa wa kuhimili joto.", tag: "POPULAR" },
    { id: 6, name: "Launch CRP919X OBD2 Scanner", category: "ECU & Diagnostics", price: "$450", img: "https://images.unsplash.com/photo-1503376713356-7871b953b92f?auto=format&fit=crop&w=400&q=80", desc: "Mashine ya kusoma hitilafu zote za gari na kufuta taa za dashboard.", tag: "" },
    { id: 7, name: "Denso Iridium Spark Plugs (Set of 4)", category: "Engine Parts", price: "$60", img: "https://images.unsplash.com/photo-1486262715619-670810a0499b?auto=format&fit=crop&w=400&q=80", desc: "Plug za Iridium kwa mwako bora na kuokoa mafuta.", tag: "" },
    { id: 8, name: "Mercedes W205 LED Headlights", category: "Body Parts", price: "$850", img: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=400&q=80", desc: "Taa za mbele za LED kwa Mercedes C-Class.", tag: "UPGRADE" },
  ];

  const categories = ['ALL', 'ECU & Diagnostics', 'Service Kits', 'Body Parts', 'Engine Parts', 'Brakes & Suspension'];

  const filteredProducts = activeCategory === 'ALL' 
    ? allProducts 
    : allProducts.filter(p => p.category === activeCategory);

  const handleInquire = (product: any) => {
    setSelectedProduct(product);
    setShowInquiryModal(true);
  };

  const submitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Asante ${inquiryData.name}. Ombi lako kuhusu ${selectedProduct.name} limepokelewa. Tutawasiliana nawe hivi punde.`);
    setShowInquiryModal(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-0 font-sans text-gray-800 relative">
      
      {/* INQUIRY MODAL */}
      {showInquiryModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
            <div className="p-4 bg-gray-900 border-b flex justify-between items-center text-white">
              <h3 className="font-bold">Agiza Kipuri / Kifaa</h3>
              <button onClick={() => setShowInquiryModal(false)} className="text-gray-400 hover:text-red-400 font-black text-xl">&times;</button>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-200 items-center">
                <img src={selectedProduct.img} alt={selectedProduct.name} className="w-16 h-16 object-cover rounded shadow-sm border border-gray-300" />
                <div>
                  <p className="font-bold text-gray-900 text-sm leading-tight">{selectedProduct.name}</p>
                  <p className="text-xs text-blue-600 font-black mt-1">Makadirio: {selectedProduct.price}</p>
                </div>
              </div>
              <form onSubmit={submitInquiry} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Jina Lako</label>
                  <input type="text" required value={inquiryData.name} onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Namba ya Simu</label>
                  <input type="text" required value={inquiryData.phone} onChange={(e) => setInquiryData({...inquiryData, phone: e.target.value})} placeholder="07XX XXX XXX" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Maelezo ya Ziada (Mf. Namba ya Chassis)</label>
                  <textarea required value={inquiryData.message} onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm resize-none" rows={3}></textarea>
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-blue-600 text-white font-black py-3.5 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    Tuma Ombi Sasa 🚀
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- TOP BAR & NAVBAR --- */}
      <div className="bg-gray-900 text-white text-xs py-2 px-4 sm:px-6 lg:px-8 flex justify-between items-center z-50 relative">
        <div className="flex gap-4"><span>📧 info@garihub.co.tz</span><span className="hidden sm:inline">📞 +255 700 000 000</span></div>
        <div className="flex items-center gap-3 bg-gray-800 rounded px-3 py-1">
           <span className="text-blue-400 font-bold tracking-wider uppercase">Parts & Diagnostics Hub</span>
        </div>
      </div>

      <nav className="bg-white shadow-sm w-full z-40 sticky top-0 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">Gari<span className="text-gray-900">Hub</span></Link>
            <div className="hidden md:flex space-x-6 items-center">
              <Link href="/" className="text-gray-500 hover:text-blue-600 px-1 py-2 font-medium text-sm">Mwanzo</Link>
              <Link href="/#magari" className="text-gray-500 hover:text-blue-600 px-1 py-2 font-medium text-sm">Magari Yetu</Link>
              <Link href="/spares" className="text-gray-900 border-b-2 border-blue-600 px-1 py-2 font-medium text-sm">Vipuri & Vifaa</Link>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link href="/client" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all text-xs">Client Portal</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="bg-gradient-to-r from-gray-900 to-slate-800 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Vipuri Original & Vifaa Vya ECU</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">Agiza vipuri halisi moja kwa moja viwandani. Pia tunatoa vifaa vya kisasa (Scanners & Programmers) kwa ajili ya mafundi na wataalam wa ECU.</p>
          <div className="max-w-xl mx-auto relative">
            <input type="text" placeholder="Tafuta kwa jina la kipuri, kifaa au chassis number..." className="w-full px-6 py-4 rounded-full text-gray-900 outline-none focus:ring-4 focus:ring-blue-500 shadow-lg" />
            <button className="absolute right-2 top-2 bottom-2 bg-blue-600 px-6 rounded-full font-bold hover:bg-blue-700 transition-colors">Tafuta</button>
          </div>
        </div>
      </div>

      {/* --- MAIN E-COMMERCE LAYOUT --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR CATEGORIES */}
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="font-black text-gray-900 mb-6 uppercase tracking-wider text-sm">Aina za Bidhaa</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex justify-between items-center ${activeCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-blue-600'}`}
                  >
                    {cat}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {cat === 'ALL' ? allProducts.length : allProducts.filter(p => p.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Promo Banner */}
              <div className="mt-8 bg-gradient-to-br from-indigo-900 to-blue-900 rounded-xl p-6 text-white text-center shadow-lg">
                <span className="text-4xl block mb-2">💻</span>
                <h4 className="font-black text-sm mb-2">Kuwa Mtaalam wa ECU</h4>
                <p className="text-xs text-blue-200 mb-4">Pata ushauri wa kitaalam na vifaa vya Programming kama KT200 na KESS3.</p>
                <button className="w-full bg-white text-indigo-900 text-xs font-black py-2 rounded shadow hover:bg-gray-100">Wasiliana Nasi</button>
              </div>
            </div>
          </aside>

          {/* PRODUCTS GRID */}
          <main className="lg:w-3/4">
            <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-3">
              <div>
                <h2 className="text-2xl font-black text-gray-900">{activeCategory === 'ALL' ? 'Bidhaa Zote' : activeCategory}</h2>
                <p className="text-sm text-gray-500 mt-1">Inaonyesha bidhaa {filteredProducts.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all flex flex-col relative group">
                  {product.tag && (
                    <div className={`absolute top-3 left-3 text-[9px] font-black px-2 py-1 rounded z-10 tracking-widest uppercase ${product.tag === 'HOT' ? 'bg-red-500 text-white' : product.tag === 'PRO TOOL' ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'}`}>
                      {product.tag}
                    </div>
                  )}
                  
                  <div className="h-48 overflow-hidden bg-gray-100 p-4 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                      <button onClick={() => handleInquire(product)} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all">Ulizia Bei</button>
                    </div>
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  
                  <div className="p-5 flex-grow flex flex-col">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{product.category}</p>
                    <h3 className="font-black text-gray-900 leading-tight mb-2">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{product.desc}</p>
                    
                    <div className="mt-auto flex justify-between items-center border-t border-gray-100 pt-4">
                      <span className="font-black text-lg text-blue-600">{product.price}</span>
                      <button onClick={() => handleInquire(product)} className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded transition-colors">
                        Inquire
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

    </main>
  );
}